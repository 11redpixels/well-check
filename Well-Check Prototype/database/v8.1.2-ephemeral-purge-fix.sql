-- 📐 V8.1.2 BLOCKER FIX: Ephemeral Asset Hard Delete
-- Chief Architect - Security & Privacy Hardening
-- Date: 2026-02-19
-- Reference: DIRECTIVE V8.1.2 - Blocker Resolution

-- ============================================================================
-- PURGE STATUS LOG (AUDITOR VERIFICATION)
-- ============================================================================

CREATE TABLE ephemeral_purge_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purge_run_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  assets_marked_for_deletion INTEGER NOT NULL DEFAULT 0,
  assets_physically_deleted INTEGER NOT NULL DEFAULT 0,
  storage_files_deleted INTEGER NOT NULL DEFAULT 0,
  storage_deletion_errors JSONB DEFAULT '[]',
  execution_duration_ms INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'partial_failure', 'failure')),
  error_message TEXT,
  
  -- Indexes
  INDEX idx_ephemeral_purge_log_timestamp (purge_run_timestamp DESC),
  INDEX idx_ephemeral_purge_log_status (status)
);

COMMENT ON TABLE ephemeral_purge_log IS 'V8.1.2: Audit log for ephemeral asset purge operations (Auditor verification)';

-- ============================================================================
-- UPDATED EPHEMERAL PURGE FUNCTION (HARD DELETE)
-- ============================================================================

-- This function is called by the hourly cron job
-- It PHYSICALLY DELETES expired ephemeral assets from the database
-- Storage deletion is handled by the application layer (see below)

CREATE OR REPLACE FUNCTION purge_expired_ephemeral_assets()
RETURNS TABLE (
  deleted_count INTEGER,
  assets_to_delete JSONB
) AS $$
DECLARE
  asset RECORD;
  deleted_assets JSONB := '[]'::jsonb;
  deleted_count INTEGER := 0;
  start_time TIMESTAMPTZ;
  end_time TIMESTAMPTZ;
  execution_duration INTEGER;
BEGIN
  start_time := NOW();
  
  -- Find all expired assets (24h + 1h grace period)
  FOR asset IN
    SELECT id, asset_url, asset_type, tenant_id, user_id, created_at, expires_at
    FROM ephemeral_assets
    WHERE expires_at < NOW() - INTERVAL '1 hour' -- Grace period for edge cases
      AND (deleted_at IS NULL OR deleted_at < NOW() - INTERVAL '1 hour') -- Include orphaned soft-deletes
  LOOP
    -- Add to deletion list (for storage API)
    deleted_assets := deleted_assets || jsonb_build_object(
      'id', asset.id,
      'asset_url', asset.asset_url,
      'asset_type', asset.asset_type,
      'tenant_id', asset.tenant_id,
      'created_at', extract(epoch from asset.created_at) * 1000,
      'expires_at', extract(epoch from asset.expires_at) * 1000
    );
    
    deleted_count := deleted_count + 1;
  END LOOP;
  
  -- HARD DELETE: Physically remove rows from database
  -- This is a DESTRUCTIVE operation with NO RECOVERY
  DELETE FROM ephemeral_assets
  WHERE expires_at < NOW() - INTERVAL '1 hour'
    AND (deleted_at IS NULL OR deleted_at < NOW() - INTERVAL '1 hour');
  
  end_time := NOW();
  execution_duration := EXTRACT(MILLISECONDS FROM (end_time - start_time))::INTEGER;
  
  -- Log purge operation (for Auditor)
  INSERT INTO ephemeral_purge_log (
    purge_run_timestamp,
    assets_marked_for_deletion,
    execution_duration_ms,
    status
  ) VALUES (
    start_time,
    deleted_count,
    execution_duration,
    'success' -- Storage deletion handled by app layer
  );
  
  RAISE NOTICE 'Ephemeral purge complete: % assets physically deleted from database', deleted_count;
  
  -- Return assets for storage deletion (consumed by app layer)
  RETURN QUERY SELECT deleted_count, deleted_assets;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION purge_expired_ephemeral_assets() IS 'V8.1.2: Hard delete expired ephemeral assets (24h + 1h grace period). Returns asset URLs for storage deletion.';

-- ============================================================================
-- STORAGE DELETION WRAPPER (APPLICATION LAYER)
-- ============================================================================

-- This function is called by the application layer (Node.js/Deno)
-- It coordinates database deletion + storage deletion

/*
TYPESCRIPT IMPLEMENTATION (app layer):

import { createClient } from '@supabase/supabase-js';

export async function purgeExpiredEphemeralAssets() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  // 1. Get list of expired assets + delete from database
  const { data, error } = await supabase.rpc('purge_expired_ephemeral_assets');
  
  if (error) {
    console.error('Database purge failed:', error);
    await logPurgeFailure(error);
    return;
  }
  
  const { deleted_count, assets_to_delete } = data[0];
  const assetsArray = JSON.parse(assets_to_delete);
  
  if (assetsArray.length === 0) {
    console.log('No expired assets to purge');
    return;
  }
  
  // 2. Delete from Supabase Storage (or S3)
  const storageDeleteErrors = [];
  let storageFilesDeleted = 0;
  
  for (const asset of assetsArray) {
    try {
      // Extract storage path from URL
      // Example URL: https://abc123.supabase.co/storage/v1/object/public/ephemeral-assets/tenant-uuid/asset-uuid.jpg
      const url = new URL(asset.asset_url);
      const pathParts = url.pathname.split('/');
      const bucket = pathParts[5]; // 'ephemeral-assets'
      const filePath = pathParts.slice(6).join('/'); // 'tenant-uuid/asset-uuid.jpg'
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(bucket)
        .remove([filePath]);
      
      if (storageError) {
        storageDeleteErrors.push({
          asset_id: asset.id,
          asset_url: asset.asset_url,
          error: storageError.message
        });
      } else {
        storageFilesDeleted++;
      }
      
      // Verify deletion (HTTP HEAD request)
      const response = await fetch(asset.asset_url, { method: 'HEAD' });
      if (response.ok) {
        // File still exists - CRITICAL ERROR
        storageDeleteErrors.push({
          asset_id: asset.id,
          asset_url: asset.asset_url,
          error: 'File still accessible after deletion (VERIFICATION FAILED)'
        });
      }
      
    } catch (err) {
      storageDeleteErrors.push({
        asset_id: asset.id,
        asset_url: asset.asset_url,
        error: err.message
      });
    }
  }
  
  // 3. Update purge log with storage results
  const status = storageDeleteErrors.length === 0 
    ? 'success' 
    : storageDeleteErrors.length < assetsArray.length 
      ? 'partial_failure' 
      : 'failure';
  
  await supabase.from('ephemeral_purge_log')
    .update({
      assets_physically_deleted: deleted_count,
      storage_files_deleted: storageFilesDeleted,
      storage_deletion_errors: storageDeleteErrors,
      status: status
    })
    .order('purge_run_timestamp', { ascending: false })
    .limit(1);
  
  // 4. Alert if failures
  if (storageDeleteErrors.length > 0) {
    console.error('CRITICAL: Storage deletion failed for some assets:', storageDeleteErrors);
    await sendAlertToAdmins({
      severity: 'critical',
      message: `Ephemeral asset purge: ${storageDeleteErrors.length} files not deleted from storage`,
      errors: storageDeleteErrors
    });
  }
  
  console.log(`Ephemeral purge complete:
    - Database: ${deleted_count} assets deleted
    - Storage: ${storageFilesDeleted} files deleted
    - Errors: ${storageDeleteErrors.length}
    - Status: ${status}
  `);
  
  return {
    deleted_count,
    storageFilesDeleted,
    errors: storageDeleteErrors,
    status
  };
}

// Cron job (runs every hour)
Deno.cron('ephemeral-purge', '0 * * * *', async () => {
  console.log('[CRON] Running ephemeral asset purge...');
  await purgeExpiredEphemeralAssets();
});
*/

-- ============================================================================
-- AUDITOR VERIFICATION QUERIES
-- ============================================================================

-- Query 1: Check for "ghost data" (assets older than 25 hours)
-- Expected result: 0 rows
CREATE OR REPLACE FUNCTION audit_check_ghost_data()
RETURNS TABLE (
  ghost_count INTEGER,
  oldest_asset TIMESTAMPTZ,
  ghost_assets JSONB
) AS $$
DECLARE
  ghost_count INTEGER;
  oldest_asset TIMESTAMPTZ;
  ghost_assets JSONB;
BEGIN
  SELECT 
    COUNT(*)::INTEGER,
    MIN(created_at),
    jsonb_agg(jsonb_build_object(
      'id', id,
      'created_at', created_at,
      'expires_at', expires_at,
      'hours_overdue', EXTRACT(EPOCH FROM (NOW() - expires_at)) / 3600
    ))
  INTO ghost_count, oldest_asset, ghost_assets
  FROM ephemeral_assets
  WHERE created_at < NOW() - INTERVAL '25 hours';
  
  IF ghost_count > 0 THEN
    RAISE WARNING 'AUDIT FAILURE: % ghost assets found (should be 0)', ghost_count;
  ELSE
    RAISE NOTICE 'AUDIT PASS: No ghost data found';
  END IF;
  
  RETURN QUERY SELECT ghost_count, oldest_asset, COALESCE(ghost_assets, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION audit_check_ghost_data() IS 'V8.1.2 AUDITOR: Verify no ephemeral assets exist past 25-hour threshold';

-- Query 2: Purge log verification (last 24 hours)
-- Expected: All recent purges have status='success'
CREATE OR REPLACE VIEW ephemeral_purge_audit_report AS
SELECT
  purge_run_timestamp,
  assets_marked_for_deletion,
  assets_physically_deleted,
  storage_files_deleted,
  CASE 
    WHEN assets_marked_for_deletion != assets_physically_deleted THEN 'MISMATCH: DB deletion incomplete'
    WHEN assets_physically_deleted != storage_files_deleted THEN 'MISMATCH: Storage deletion incomplete'
    ELSE 'OK'
  END AS consistency_check,
  status,
  storage_deletion_errors,
  execution_duration_ms
FROM ephemeral_purge_log
WHERE purge_run_timestamp > NOW() - INTERVAL '24 hours'
ORDER BY purge_run_timestamp DESC;

COMMENT ON VIEW ephemeral_purge_audit_report IS 'V8.1.2 AUDITOR: 24-hour purge log with consistency checks';

-- ============================================================================
-- PANIC ROOM PIN VERIFICATION
-- ============================================================================

-- Table for Universal Family PIN (if not already exists)
CREATE TABLE IF NOT EXISTS universal_family_pin (
  tenant_id UUID PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
  pin_hash TEXT NOT NULL, -- bcrypt hash
  created_by UUID NOT NULL, -- Family Head
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Security
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  lockout_until TIMESTAMPTZ,
  last_successful_verification TIMESTAMPTZ
);

-- Function: Verify Family PIN
CREATE OR REPLACE FUNCTION verify_universal_family_pin(
  p_tenant_id UUID,
  p_pin_plain TEXT
)
RETURNS TABLE (
  is_valid BOOLEAN,
  lockout_remaining_seconds INTEGER,
  error_message TEXT
) AS $$
DECLARE
  stored_pin_hash TEXT;
  failed_attempts INTEGER;
  lockout_until TIMESTAMPTZ;
  is_locked_out BOOLEAN;
  lockout_remaining INTEGER;
BEGIN
  -- Get PIN data
  SELECT pin_hash, failed_attempts, lockout_until
  INTO stored_pin_hash, failed_attempts, lockout_until
  FROM universal_family_pin
  WHERE tenant_id = p_tenant_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 0, 'Family PIN not configured'::TEXT;
    RETURN;
  END IF;
  
  -- Check lockout
  is_locked_out := lockout_until IS NOT NULL AND lockout_until > NOW();
  IF is_locked_out THEN
    lockout_remaining := EXTRACT(EPOCH FROM (lockout_until - NOW()))::INTEGER;
    RETURN QUERY SELECT FALSE, lockout_remaining, 'Account locked due to failed attempts'::TEXT;
    RETURN;
  END IF;
  
  -- Verify PIN (using pgcrypto extension)
  -- NOTE: In production, hash verification should be done in app layer for security
  -- This is a simplified version for demonstration
  IF stored_pin_hash = crypt(p_pin_plain, stored_pin_hash) THEN
    -- PIN correct
    UPDATE universal_family_pin
    SET failed_attempts = 0,
        lockout_until = NULL,
        last_successful_verification = NOW()
    WHERE tenant_id = p_tenant_id;
    
    RETURN QUERY SELECT TRUE, 0, NULL::TEXT;
  ELSE
    -- PIN incorrect
    failed_attempts := failed_attempts + 1;
    
    -- Lockout after 3 failed attempts (15 minutes)
    IF failed_attempts >= 3 THEN
      UPDATE universal_family_pin
      SET failed_attempts = failed_attempts,
          lockout_until = NOW() + INTERVAL '15 minutes'
      WHERE tenant_id = p_tenant_id;
      
      RETURN QUERY SELECT FALSE, 900, 'Too many failed attempts. Locked for 15 minutes.'::TEXT;
    ELSE
      UPDATE universal_family_pin
      SET failed_attempts = failed_attempts
      WHERE tenant_id = p_tenant_id;
      
      RETURN QUERY SELECT FALSE, 0, format('Incorrect PIN. %s attempts remaining.', 3 - failed_attempts)::TEXT;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION verify_universal_family_pin IS 'V8.1.2: Verify Universal Family PIN with 3-attempt lockout';

-- Enable pgcrypto extension (for crypt function)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- MIGRATION COMPLETION
-- ============================================================================

-- Create initial purge log entry
INSERT INTO ephemeral_purge_log (
  purge_run_timestamp,
  assets_marked_for_deletion,
  assets_physically_deleted,
  storage_files_deleted,
  execution_duration_ms,
  status
) VALUES (
  NOW(),
  0,
  0,
  0,
  0,
  'success'
);

COMMENT ON TABLE ephemeral_purge_log IS 'V8.1.2 BLOCKER FIX: Hard delete purge log with storage verification';

-- Grant access to auditor role
GRANT SELECT ON ephemeral_purge_log TO auditor_role;
GRANT SELECT ON ephemeral_purge_audit_report TO auditor_role;
GRANT EXECUTE ON FUNCTION audit_check_ghost_data() TO auditor_role;

-- End of V8.1.2 Blocker Fix: Ephemeral Purge
