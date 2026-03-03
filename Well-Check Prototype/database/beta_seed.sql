-- 📐 V8.7.1 BETA SEED DATA
-- Chief Architect Implementation
-- Date: 2026-02-22, 8:30 PM
-- Reference: EMERGENCY HOTFIX DIRECTIVE V8.7.1 - Visibility Restoration

-- Purpose: Inject sample data so beta testers see something immediately
-- Use Case: Fresh beta accounts with empty database tables

-- ============================================================================
-- USAGE INSTRUCTIONS
-- ============================================================================

/*
This script injects sample data for a specific tenant (family).

STEP 1: Get the tenant_id and user_id from the beta tester's account
  SELECT id AS tenant_id FROM tenants WHERE family_code = 'FAM-001';
  SELECT id AS user_id FROM users WHERE email = 'tester@example.com';

STEP 2: Update the variables below with the actual IDs

STEP 3: Run this script
  psql $DATABASE_URL < database/beta_seed.sql

IMPORTANT: This script is idempotent (safe to run multiple times).
It checks if data already exists before inserting.
*/

-- ============================================================================
-- CONFIGURATION (UPDATE THESE VALUES)
-- ============================================================================

-- Replace with actual tenant_id and user_id from production database
\set TENANT_ID '00000000-0000-0000-0000-000000000001'
\set USER_ID '00000000-0000-0000-0000-000000000002'

-- ============================================================================
-- VERIFY RLS POLICIES (BEFORE SEEDING)
-- ============================================================================

\echo '═══════════════════════════════════════════'
\echo '  V8.7.1 RLS POLICY VERIFICATION'
\echo '═══════════════════════════════════════════'

-- Check if RLS is enabled on critical tables
\echo '\n[CHECK 1] Verify RLS is enabled...'
SELECT 
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('medications', 'doctor_appointments', 'family_settings', 'users')
ORDER BY tablename;

-- Check if policies exist for Family Head access
\echo '\n[CHECK 2] Verify Family Head policies exist...'
SELECT 
  tablename,
  policyname,
  cmd AS allowed_operation,
  CASE 
    WHEN qual IS NOT NULL THEN 'Has row filter'
    ELSE 'No filter (allows all rows)'
  END AS filter_status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('medications', 'doctor_appointments', 'family_settings')
ORDER BY tablename, policyname;

-- Expected output:
-- | tablename           | policyname                          | allowed_operation | filter_status       |
-- |---------------------|-------------------------------------|-------------------|---------------------|
-- | medications         | Users can view their family's meds  | SELECT            | Has row filter      |
-- | doctor_appointments | Users can view their appointments   | SELECT            | Has row filter      |
-- | family_settings     | Users can view their family settings| SELECT            | Has row filter      |

\echo '\n═══════════════════════════════════════════'

-- ============================================================================
-- FUNCTION: SEED SAMPLE DATA FOR A TENANT
-- ============================================================================

CREATE OR REPLACE FUNCTION seed_beta_data(
  p_tenant_id UUID,
  p_user_id UUID
)
RETURNS TABLE (
  operation TEXT,
  table_name TEXT,
  status TEXT,
  row_id UUID
) AS $$
DECLARE
  v_medication_id UUID;
  v_appointment_id UUID;
  v_settings_id UUID;
BEGIN
  -- ============================================================================
  -- SEED 1: Sample Medication (Vitamin D - 10:00 AM Daily)
  -- ============================================================================
  
  -- Check if sample medication already exists
  SELECT id INTO v_medication_id
  FROM medications
  WHERE tenant_id = p_tenant_id
    AND medication_name = 'Vitamin D (Sample)'
  LIMIT 1;
  
  IF v_medication_id IS NULL THEN
    -- Insert sample medication
    INSERT INTO medications (
      tenant_id,
      user_id,
      medication_name,
      dosage,
      frequency,
      time_slots,
      start_date,
      end_date,
      notes,
      color,
      icon,
      created_at
    ) VALUES (
      p_tenant_id,
      p_user_id,
      '💊 Vitamin D (Getting Started)',  -- V8.8: Visual label added
      '1000 IU',
      'daily',
      ARRAY['10:00'],
      CURRENT_DATE,
      NULL, -- No end date (ongoing)
      '🎓 SAMPLE DATA: This is example data to help you get started. Feel free to edit or delete this and add your real medications.', -- V8.8: Enhanced sample marker
      '#FFA500', -- Orange (sample data color)
      '💊',
      NOW()
    )
    RETURNING id INTO v_medication_id;
    
    RETURN QUERY SELECT 
      'INSERT' AS operation,
      'medications' AS table_name,
      'Created sample Vitamin D medication' AS status,
      v_medication_id AS row_id;
  ELSE
    RETURN QUERY SELECT 
      'SKIP' AS operation,
      'medications' AS table_name,
      'Sample medication already exists' AS status,
      v_medication_id AS row_id;
  END IF;
  
  -- ============================================================================
  -- SEED 2: Sample Doctor Appointment (Annual Checkup - Next Week)
  -- ============================================================================
  
  -- Check if sample appointment already exists
  SELECT id INTO v_appointment_id
  FROM doctor_appointments
  WHERE tenant_id = p_tenant_id
    AND appointment_type = 'Sample Annual Checkup'
  LIMIT 1;
  
  IF v_appointment_id IS NULL THEN
    -- Insert sample appointment (1 week from today at 2:00 PM)
    INSERT INTO doctor_appointments (
      tenant_id,
      user_id,
      appointment_type,
      doctor_name,
      specialty,
      appointment_datetime,
      location,
      notes,
      status,
      created_at
    ) VALUES (
      p_tenant_id,
      p_user_id,
      '🏥 Annual Checkup (Getting Started)',  -- V8.8: Visual label added
      'Dr. Sample (Example)',
      'Primary Care',
      (CURRENT_DATE + INTERVAL '7 days')::DATE + TIME '14:00:00',
      '123 Medical Center Drive',
      '🎓 SAMPLE DATA: This is example data to help you get started. Feel free to edit or delete this and schedule your real appointments.', -- V8.8: Enhanced sample marker
      'scheduled',
      NOW()
    )
    RETURNING id INTO v_appointment_id;
    
    RETURN QUERY SELECT 
      'INSERT' AS operation,
      'doctor_appointments' AS table_name,
      'Created sample appointment (7 days from now)' AS status,
      v_appointment_id AS row_id;
  ELSE
    RETURN QUERY SELECT 
      'SKIP' AS operation,
      'doctor_appointments' AS table_name,
      'Sample appointment already exists' AS status,
      v_appointment_id AS row_id;
  END IF;
  
  -- ============================================================================
  -- SEED 3: Verify Family Settings Exist (Critical)
  -- ============================================================================
  
  -- Check if family_settings exists for this tenant
  SELECT id INTO v_settings_id
  FROM family_settings
  WHERE tenant_id = p_tenant_id
  LIMIT 1;
  
  IF v_settings_id IS NULL THEN
    -- Insert default family_settings (CRITICAL - app cannot function without this)
    INSERT INTO family_settings (
      tenant_id,
      notification_sensitivity,
      geofence_radius,
      medication_reminders,
      geofence_alerts,
      ping_alerts,
      panic_alert_contacts,
      created_at,
      updated_at
    ) VALUES (
      p_tenant_id,
      jsonb_build_object(
        'medication', '5min',
        'geofence', 'late_only',
        'ping', 'all'
      ),
      0.5, -- 0.5 miles
      true,
      true,
      true,
      ARRAY[]::TEXT[], -- Empty contacts initially
      NOW(),
      NOW()
    )
    RETURNING id INTO v_settings_id;
    
    RETURN QUERY SELECT 
      'INSERT' AS operation,
      'family_settings' AS table_name,
      'Created default family settings (CRITICAL)' AS status,
      v_settings_id AS row_id;
  ELSE
    RETURN QUERY SELECT 
      'SKIP' AS operation,
      'family_settings' AS table_name,
      'Family settings already exist' AS status,
      v_settings_id AS row_id;
  END IF;
  
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION seed_beta_data IS 'V8.7.1: Inject sample data for beta testers (idempotent)';

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT EXECUTE ON FUNCTION seed_beta_data TO authenticated;

-- ============================================================================
-- EXECUTE SEEDING (COMMENTED OUT - REQUIRES MANUAL TENANT/USER IDs)
-- ============================================================================

/*
-- STEP 1: Get tenant_id and user_id for the beta tester
-- Run these queries manually:

SELECT 
  t.id AS tenant_id,
  t.family_code,
  u.id AS user_id,
  u.email,
  u.role
FROM tenants t
JOIN users u ON u.tenant_id = t.id
WHERE u.email = 'tester@example.com' -- Replace with actual beta tester email
LIMIT 1;

-- STEP 2: Copy the tenant_id and user_id from the result above

-- STEP 3: Run the seeding function
SELECT * FROM seed_beta_data(
  'PASTE_TENANT_ID_HERE'::UUID,
  'PASTE_USER_ID_HERE'::UUID
);

-- Expected output:
-- | operation | table_name          | status                                    | row_id      |
-- |-----------|---------------------|-------------------------------------------|-------------|
-- | INSERT    | medications         | Created sample Vitamin D medication       | uuid-med-1  |
-- | INSERT    | doctor_appointments | Created sample appointment (7 days)       | uuid-appt-1 |
-- | INSERT    | family_settings     | Created default family settings (CRITICAL)| uuid-set-1  |

-- OR (if data already exists):
-- | operation | table_name          | status                          | row_id      |
-- |-----------|---------------------|---------------------------------|-------------|
-- | SKIP      | medications         | Sample medication already exists| uuid-med-1  |
-- | SKIP      | doctor_appointments | Sample appointment already exists| uuid-appt-1|
-- | SKIP      | family_settings     | Family settings already exist   | uuid-set-1  |
*/

-- ============================================================================
-- BULK SEEDING (FOR ALL BETA TESTERS)
-- ============================================================================

-- If you need to seed data for ALL beta testers at once:
/*
DO $$
DECLARE
  beta_tester RECORD;
  seed_result RECORD;
BEGIN
  -- Loop through all beta testers
  FOR beta_tester IN 
    SELECT 
      t.id AS tenant_id,
      u.id AS user_id,
      u.email,
      t.family_code
    FROM tenants t
    JOIN users u ON u.tenant_id = t.id
    WHERE u.email LIKE '%@example.com' -- Beta tester email pattern
      AND u.role = 'family_head' -- Only Family Head accounts
    ORDER BY u.created_at DESC
  LOOP
    RAISE NOTICE 'Seeding data for: % (tenant: %)', beta_tester.email, beta_tester.family_code;
    
    -- Seed data for this tester
    FOR seed_result IN 
      SELECT * FROM seed_beta_data(beta_tester.tenant_id, beta_tester.user_id)
    LOOP
      RAISE NOTICE '  → % % (status: %)', seed_result.operation, seed_result.table_name, seed_result.status;
    END LOOP;
  END LOOP;
  
  RAISE NOTICE 'Bulk seeding complete!';
END;
$$;
*/

-- ============================================================================
-- RLS POLICY FIXES (IF BLOCKING ACCESS)
-- ============================================================================

-- If RLS is blocking Family Head from seeing their own data, run these fixes:

-- Fix 1: Ensure medications are visible to the owning family
DROP POLICY IF EXISTS "Users can view their family's medications" ON medications;
CREATE POLICY "Users can view their family's medications"
  ON medications
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- Fix 2: Ensure medications can be inserted by authenticated users
DROP POLICY IF EXISTS "Users can insert medications for their family" ON medications;
CREATE POLICY "Users can insert medications for their family"
  ON medications
  FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- Fix 3: Ensure doctor_appointments are visible to the owning family
DROP POLICY IF EXISTS "Users can view their family's appointments" ON doctor_appointments;
CREATE POLICY "Users can view their family's appointments"
  ON doctor_appointments
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- Fix 4: Ensure doctor_appointments can be inserted by authenticated users
DROP POLICY IF EXISTS "Users can insert appointments for their family" ON doctor_appointments;
CREATE POLICY "Users can insert appointments for their family"
  ON doctor_appointments
  FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- Fix 5: Ensure family_settings are visible to the owning family
DROP POLICY IF EXISTS "Users can view their family settings" ON family_settings;
CREATE POLICY "Users can view their family settings"
  ON family_settings
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- Fix 6: Ensure family_settings can be updated by Family Head
DROP POLICY IF EXISTS "Family Head can update settings" ON family_settings;
CREATE POLICY "Family Head can update settings"
  ON family_settings
  FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid() AND role = 'family_head'
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid() AND role = 'family_head'
    )
  );

-- ============================================================================
-- VERIFICATION QUERY (RUN AFTER SEEDING)
-- ============================================================================

-- Verify that Family Head can see the seeded data
/*
-- Set the current user context (simulate being logged in as beta tester)
SET LOCAL auth.uid = 'PASTE_USER_ID_HERE';

-- Test SELECT on medications (should return 1 row - Vitamin D)
SELECT 
  medication_name,
  dosage,
  frequency,
  time_slots,
  notes
FROM medications
WHERE tenant_id = 'PASTE_TENANT_ID_HERE';

-- Expected: 1 row returned (Vitamin D)
-- If returns 0 rows → RLS is blocking access (run RLS fixes above)

-- Test SELECT on doctor_appointments (should return 1 row - Annual Checkup)
SELECT 
  appointment_type,
  doctor_name,
  appointment_datetime,
  status,
  notes
FROM doctor_appointments
WHERE tenant_id = 'PASTE_TENANT_ID_HERE';

-- Expected: 1 row returned (Sample Annual Checkup)
-- If returns 0 rows → RLS is blocking access (run RLS fixes above)

-- Test SELECT on family_settings (should return 1 row)
SELECT 
  notification_sensitivity,
  geofence_radius,
  medication_reminders,
  geofence_alerts
FROM family_settings
WHERE tenant_id = 'PASTE_TENANT_ID_HERE';

-- Expected: 1 row returned (default settings)
-- If returns 0 rows → RLS is blocking access OR settings not created (CRITICAL)
*/

-- ============================================================================
-- ROLLBACK (IF NEEDED)
-- ============================================================================

-- To remove all sample data:
/*
DELETE FROM medications 
WHERE medication_name = 'Vitamin D (Sample)' 
  AND tenant_id = 'PASTE_TENANT_ID_HERE';

DELETE FROM doctor_appointments 
WHERE appointment_type = 'Sample Annual Checkup' 
  AND tenant_id = 'PASTE_TENANT_ID_HERE';

-- NOTE: DO NOT delete family_settings (app requires it)
*/

-- End of V8.7.1 Beta Seed Data Script

\echo '\n═══════════════════════════════════════════'
\echo '  V8.7.1 BETA SEED SCRIPT LOADED'
\echo '  Run: SELECT * FROM seed_beta_data(tenant_id, user_id);'
\echo '═══════════════════════════════════════════\n'