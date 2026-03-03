-- 📐 V8.3 FAMILY LAB SCHEMA & WEBSOCKET SYNC
-- Chief Architect Implementation
-- Date: 2026-02-19
-- Reference: DIRECTIVE V8.3 - Family Lab & Integration

-- ============================================================================
-- FAMILY SETTINGS TABLE (GRANULAR CONFIGURATION)
-- ============================================================================

CREATE TABLE family_settings (
  tenant_id UUID PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- ========================================
  -- MEDICATION ALERT SENSITIVITY
  -- ========================================
  
  -- How many minutes before med becomes "Amber" (warning state)
  medication_amber_threshold_minutes INTEGER NOT NULL DEFAULT 15
    CHECK (medication_amber_threshold_minutes IN (5, 10, 15, 30, 45, 60)),
  
  -- How many minutes before med becomes "Red" (critical state)
  medication_red_threshold_minutes INTEGER NOT NULL DEFAULT 45
    CHECK (medication_red_threshold_minutes IN (30, 45, 60, 90, 120)),
  
  -- Alert escalation: Send push notification to Monitors
  medication_alert_monitors BOOLEAN NOT NULL DEFAULT true,
  
  -- Alert escalation: Send SMS to Critical Monitors
  medication_alert_critical_monitors BOOLEAN NOT NULL DEFAULT false,
  
  -- ========================================
  -- GEOFENCE CONFIGURATION
  -- ========================================
  
  -- Default geofence radius for doctor visits (meters)
  doctor_visit_geofence_radius_meters NUMERIC(10, 2) NOT NULL DEFAULT 804.672
    CHECK (doctor_visit_geofence_radius_meters >= 160.934 AND 
           doctor_visit_geofence_radius_meters <= 1609.344), -- 0.1 mi to 1.0 mi
  
  -- Home geofence radius (meters)
  home_geofence_radius_meters NUMERIC(10, 2) NOT NULL DEFAULT 402.336
    CHECK (home_geofence_radius_meters >= 160.934 AND 
           home_geofence_radius_meters <= 1609.344), -- 0.1 mi to 1.0 mi
  
  -- Alert when Protected user leaves home geofence
  alert_on_home_exit BOOLEAN NOT NULL DEFAULT true,
  
  -- Alert when Protected user enters doctor visit geofence
  alert_on_doctor_arrival BOOLEAN NOT NULL DEFAULT true,
  
  -- ========================================
  -- SMART PING CONFIGURATION
  -- ========================================
  
  -- How often to send Smart Ping to Protected users (minutes)
  smart_ping_interval_minutes INTEGER NOT NULL DEFAULT 180
    CHECK (smart_ping_interval_minutes IN (60, 120, 180, 240, 360)), -- 1h, 2h, 3h, 4h, 6h
  
  -- Quiet hours: Don't send Smart Pings during this time
  smart_ping_quiet_hours_start TIME,
  smart_ping_quiet_hours_end TIME,
  
  -- Smart Ping timeout: How long to wait before escalating (minutes)
  smart_ping_timeout_minutes INTEGER NOT NULL DEFAULT 15
    CHECK (smart_ping_timeout_minutes IN (5, 10, 15, 30, 60)),
  
  -- ========================================
  -- POST-VISIT PULSE CONFIGURATION
  -- ========================================
  
  -- How many minutes after departure to send Post-Visit Pulse
  post_visit_pulse_delay_minutes INTEGER NOT NULL DEFAULT 30
    CHECK (post_visit_pulse_delay_minutes IN (15, 30, 45, 60)),
  
  -- Require Post-Visit Pulse response (or allow skip)
  post_visit_pulse_required BOOLEAN NOT NULL DEFAULT false,
  
  -- ========================================
  -- PANIC MODE CONFIGURATION
  -- ========================================
  
  -- Auto-call 911 after N minutes in Panic Mode (0 = disabled)
  panic_auto_911_minutes INTEGER NOT NULL DEFAULT 0
    CHECK (panic_auto_911_minutes IN (0, 5, 10, 15)),
  
  -- Record ambient audio during Panic Mode
  panic_record_audio BOOLEAN NOT NULL DEFAULT true,
  
  -- Share location with emergency contacts during Panic Mode
  panic_share_location BOOLEAN NOT NULL DEFAULT true,
  
  -- ========================================
  -- MEMBER PERMISSIONS
  -- ========================================
  
  -- Allow Monitors to view medication history
  monitors_view_medication_history BOOLEAN NOT NULL DEFAULT true,
  
  -- Allow Monitors to view doctor visit history
  monitors_view_doctor_history BOOLEAN NOT NULL DEFAULT true,
  
  -- Allow Monitors to view ephemeral assets (photos/voice)
  monitors_view_ephemeral_assets BOOLEAN NOT NULL DEFAULT true,
  
  -- Allow Minors to trigger Panic Mode
  minors_can_trigger_panic BOOLEAN NOT NULL DEFAULT true,
  
  -- ========================================
  -- DISPLAY & UI PREFERENCES
  -- ========================================
  
  -- UI Theme: 'midnight_slate' (default), 'light_mode', 'high_contrast'
  ui_theme TEXT NOT NULL DEFAULT 'midnight_slate'
    CHECK (ui_theme IN ('midnight_slate', 'light_mode', 'high_contrast')),
  
  -- Font size: 'normal', 'large', 'extra_large'
  ui_font_size TEXT NOT NULL DEFAULT 'normal'
    CHECK (ui_font_size IN ('normal', 'large', 'extra_large')),
  
  -- Show location history on map (visual trail)
  show_location_history BOOLEAN NOT NULL DEFAULT false,
  
  -- ========================================
  -- METADATA
  -- ========================================
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by_user_id UUID NOT NULL REFERENCES users(id), -- Family Head
  
  -- WebSocket sync version (incremented on every change)
  sync_version INTEGER NOT NULL DEFAULT 1
);

-- Indexes
CREATE INDEX idx_family_settings_updated_at ON family_settings(updated_at DESC);
CREATE INDEX idx_family_settings_sync_version ON family_settings(sync_version DESC);

COMMENT ON TABLE family_settings IS 'V8.3: Granular family configuration for alerts, geofences, and permissions';
COMMENT ON COLUMN family_settings.medication_amber_threshold_minutes IS 'Minutes before medication becomes "Amber" warning state';
COMMENT ON COLUMN family_settings.doctor_visit_geofence_radius_meters IS 'Default geofence radius for doctor visits (0.1-1.0 miles)';
COMMENT ON COLUMN family_settings.sync_version IS 'Incremented on every change for WebSocket sync conflict resolution';

-- ============================================================================
-- SETTINGS CHANGE LOG (AUDIT TRAIL)
-- ============================================================================

CREATE TABLE family_settings_changelog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  changed_by_user_id UUID NOT NULL REFERENCES users(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Setting name (e.g., 'medication_amber_threshold_minutes')
  setting_name TEXT NOT NULL,
  
  -- Old and new values (stored as JSON for flexibility)
  old_value JSONB,
  new_value JSONB NOT NULL,
  
  -- Change reason (optional, provided by Family Head)
  change_reason TEXT,
  
  -- Sync version at time of change
  sync_version INTEGER NOT NULL,
  
  -- Metadata
  ip_address INET,
  user_agent TEXT
);

CREATE INDEX idx_family_settings_changelog_tenant ON family_settings_changelog(tenant_id, changed_at DESC);
CREATE INDEX idx_family_settings_changelog_user ON family_settings_changelog(changed_by_user_id, changed_at DESC);

COMMENT ON TABLE family_settings_changelog IS 'V8.3: Audit trail for all family settings changes';

-- ============================================================================
-- TRIGGER: AUTO-UPDATE TIMESTAMP & SYNC VERSION
-- ============================================================================

CREATE OR REPLACE FUNCTION update_family_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  NEW.sync_version := OLD.sync_version + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_family_settings_timestamp
  BEFORE UPDATE ON family_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_family_settings_timestamp();

COMMENT ON TRIGGER trigger_update_family_settings_timestamp ON family_settings IS 'V8.3: Auto-update timestamp and increment sync_version on every change';

-- ============================================================================
-- TRIGGER: LOG SETTINGS CHANGES (AUDIT TRAIL)
-- ============================================================================

CREATE OR REPLACE FUNCTION log_family_settings_change()
RETURNS TRIGGER AS $$
DECLARE
  setting_col TEXT;
  old_val JSONB;
  new_val JSONB;
BEGIN
  -- Loop through all columns that changed
  FOR setting_col IN
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'family_settings'
      AND column_name NOT IN ('tenant_id', 'created_at', 'updated_at', 'updated_by_user_id', 'sync_version')
  LOOP
    -- Check if this column changed
    EXECUTE format('SELECT to_jsonb($1.%I) != to_jsonb($2.%I)', setting_col, setting_col)
      INTO STRICT old_val
      USING OLD, NEW;
    
    IF old_val THEN
      -- Get old and new values
      EXECUTE format('SELECT to_jsonb($1.%I)', setting_col)
        INTO old_val
        USING OLD;
      EXECUTE format('SELECT to_jsonb($1.%I)', setting_col)
        INTO new_val
        USING NEW;
      
      -- Insert changelog entry
      INSERT INTO family_settings_changelog (
        tenant_id,
        changed_by_user_id,
        setting_name,
        old_value,
        new_value,
        sync_version
      ) VALUES (
        NEW.tenant_id,
        NEW.updated_by_user_id,
        setting_col,
        old_val,
        new_val,
        NEW.sync_version
      );
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_family_settings_change
  AFTER UPDATE ON family_settings
  FOR EACH ROW
  EXECUTE FUNCTION log_family_settings_change();

COMMENT ON TRIGGER trigger_log_family_settings_change ON family_settings IS 'V8.3: Log every settings change to changelog table';

-- ============================================================================
-- FUNCTION: GET CURRENT SETTINGS (WITH DEFAULTS)
-- ============================================================================

CREATE OR REPLACE FUNCTION get_family_settings(p_tenant_id UUID)
RETURNS family_settings AS $$
DECLARE
  settings family_settings;
BEGIN
  SELECT * INTO settings
  FROM family_settings
  WHERE tenant_id = p_tenant_id;
  
  IF NOT FOUND THEN
    -- Return default settings if none exist
    INSERT INTO family_settings (tenant_id, updated_by_user_id)
    VALUES (
      p_tenant_id,
      (SELECT id FROM users WHERE tenant_id = p_tenant_id AND role = 'family_head' LIMIT 1)
    )
    RETURNING * INTO settings;
  END IF;
  
  RETURN settings;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_family_settings IS 'V8.3: Get current settings for tenant (creates defaults if none exist)';

-- ============================================================================
-- FUNCTION: UPDATE SETTINGS (WITH VALIDATION)
-- ============================================================================

CREATE OR REPLACE FUNCTION update_family_setting(
  p_tenant_id UUID,
  p_user_id UUID,
  p_setting_name TEXT,
  p_new_value JSONB,
  p_change_reason TEXT DEFAULT NULL
)
RETURNS family_settings AS $$
DECLARE
  updated_settings family_settings;
  user_role TEXT;
BEGIN
  -- Verify user is Family Head
  SELECT role INTO user_role
  FROM users
  WHERE id = p_user_id AND tenant_id = p_tenant_id;
  
  IF user_role != 'family_head' THEN
    RAISE EXCEPTION 'Only Family Head can change settings. Current role: %', user_role;
  END IF;
  
  -- Update setting (dynamic SQL)
  EXECUTE format(
    'UPDATE family_settings SET %I = $1, updated_by_user_id = $2 WHERE tenant_id = $3 RETURNING *',
    p_setting_name
  )
  INTO updated_settings
  USING p_new_value, p_user_id, p_tenant_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Settings not found for tenant %', p_tenant_id;
  END IF;
  
  -- Update changelog with reason (if trigger didn't capture it)
  UPDATE family_settings_changelog
  SET change_reason = p_change_reason
  WHERE tenant_id = p_tenant_id
    AND setting_name = p_setting_name
    AND sync_version = updated_settings.sync_version
    AND change_reason IS NULL;
  
  RETURN updated_settings;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION update_family_setting IS 'V8.3: Update a single family setting (Family Head only)';

-- ============================================================================
-- WEBSOCKET SYNC LOGIC
-- ============================================================================

-- Function: Broadcast settings change via WebSocket
CREATE OR REPLACE FUNCTION broadcast_settings_change()
RETURNS TRIGGER AS $$
DECLARE
  payload JSONB;
BEGIN
  -- Build WebSocket payload
  payload := jsonb_build_object(
    'event', 'family_settings_changed',
    'tenantId', NEW.tenant_id,
    'syncVersion', NEW.sync_version,
    'changedBy', NEW.updated_by_user_id,
    'changedAt', extract(epoch from NEW.updated_at) * 1000,
    'settings', row_to_json(NEW)
  );
  
  -- Broadcast to all connected clients for this tenant
  PERFORM pg_notify(
    'family_settings_sync',
    payload::TEXT
  );
  
  RAISE NOTICE 'WebSocket broadcast: family_settings_changed (tenant %, version %)',
    NEW.tenant_id, NEW.sync_version;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_broadcast_settings_change
  AFTER UPDATE ON family_settings
  FOR EACH ROW
  EXECUTE FUNCTION broadcast_settings_change();

COMMENT ON TRIGGER trigger_broadcast_settings_change ON family_settings IS 'V8.3: Broadcast settings changes via WebSocket (pg_notify)';

-- ============================================================================
-- WEBSOCKET CLIENT-SIDE IMPLEMENTATION (TYPESCRIPT)
-- ============================================================================

/*
// CLIENT-SIDE WEBSOCKET LISTENER (React/TypeScript)

import { useEffect, useState } from 'react';
import { supabase } from './supabase-client';

export function useFamilySettings(tenantId: string) {
  const [settings, setSettings] = useState<FamilySettings | null>(null);
  const [syncVersion, setSyncVersion] = useState(0);

  // Initial fetch
  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase
        .from('family_settings')
        .select('*')
        .eq('tenant_id', tenantId)
        .single();
      
      if (data) {
        setSettings(data);
        setSyncVersion(data.sync_version);
      }
    }
    
    fetchSettings();
  }, [tenantId]);

  // WebSocket listener
  useEffect(() => {
    const channel = supabase
      .channel('family_settings_sync')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'family_settings',
        filter: `tenant_id=eq.${tenantId}`,
      }, (payload) => {
        const newSettings = payload.new as FamilySettings;
        
        // Sync version conflict detection
        if (newSettings.sync_version > syncVersion) {
          console.log('Settings updated remotely, syncing...', newSettings.sync_version);
          setSettings(newSettings);
          setSyncVersion(newSettings.sync_version);
          
          // Show toast notification
          showToast({
            title: 'Settings Updated',
            message: 'Family settings were changed by another device.',
            duration: 3000,
          });
        } else {
          console.warn('Sync version conflict detected:', {
            local: syncVersion,
            remote: newSettings.sync_version,
          });
        }
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [tenantId, syncVersion]);

  // Update settings function (optimistic update)
  const updateSetting = async (settingName: string, newValue: any, reason?: string) => {
    // Optimistic update
    const optimisticSettings = {
      ...settings!,
      [settingName]: newValue,
      updated_at: new Date().toISOString(),
      sync_version: syncVersion + 1,
    };
    setSettings(optimisticSettings);
    setSyncVersion(syncVersion + 1);

    try {
      const { error } = await supabase.rpc('update_family_setting', {
        p_tenant_id: tenantId,
        p_user_id: supabase.auth.user()!.id,
        p_setting_name: settingName,
        p_new_value: newValue,
        p_change_reason: reason,
      });

      if (error) {
        throw error;
      }

      console.log('Setting updated successfully:', settingName);
    } catch (error) {
      console.error('Failed to update setting:', error);
      
      // Rollback optimistic update
      setSettings(settings);
      setSyncVersion(syncVersion);
      
      showToast({
        title: 'Update Failed',
        message: 'Could not update settings. Please try again.',
        severity: 'error',
      });
    }
  };

  return { settings, updateSetting, syncVersion };
}
*/

-- ============================================================================
-- SETTINGS VALIDATION CONSTRAINTS
-- ============================================================================

-- Constraint: Red threshold must be greater than Amber threshold
ALTER TABLE family_settings ADD CONSTRAINT check_medication_thresholds
  CHECK (medication_red_threshold_minutes > medication_amber_threshold_minutes);

-- Constraint: Quiet hours must be valid (start < end, or wrap around midnight)
-- (Note: This is validated in application layer for midnight wrap)

-- ============================================================================
-- DEFAULT SETTINGS INITIALIZATION
-- ============================================================================

-- Function: Initialize default settings for new tenants
CREATE OR REPLACE FUNCTION initialize_family_settings()
RETURNS TRIGGER AS $$
DECLARE
  family_head_id UUID;
BEGIN
  -- Get Family Head user ID
  SELECT id INTO family_head_id
  FROM users
  WHERE tenant_id = NEW.id AND role = 'family_head'
  LIMIT 1;
  
  -- Create default settings
  INSERT INTO family_settings (tenant_id, updated_by_user_id)
  VALUES (NEW.id, family_head_id)
  ON CONFLICT (tenant_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_initialize_family_settings
  AFTER INSERT ON tenants
  FOR EACH ROW
  EXECUTE FUNCTION initialize_family_settings();

COMMENT ON TRIGGER trigger_initialize_family_settings ON tenants IS 'V8.3: Auto-create default family settings for new tenants';

-- ============================================================================
-- ANALYTICS: SETTINGS USAGE
-- ============================================================================

CREATE OR REPLACE VIEW family_settings_analytics AS
SELECT
  COUNT(DISTINCT tenant_id) AS total_families,
  
  -- Medication Alert Sensitivity
  AVG(medication_amber_threshold_minutes) AS avg_amber_threshold_minutes,
  AVG(medication_red_threshold_minutes) AS avg_red_threshold_minutes,
  COUNT(*) FILTER (WHERE medication_alert_monitors = true) AS families_with_monitor_alerts,
  
  -- Geofence Configuration
  AVG(doctor_visit_geofence_radius_meters) AS avg_doctor_geofence_meters,
  AVG(home_geofence_radius_meters) AS avg_home_geofence_meters,
  
  -- Smart Ping
  AVG(smart_ping_interval_minutes) AS avg_smart_ping_interval,
  COUNT(*) FILTER (WHERE smart_ping_quiet_hours_start IS NOT NULL) AS families_with_quiet_hours,
  
  -- Panic Mode
  COUNT(*) FILTER (WHERE panic_auto_911_minutes > 0) AS families_with_auto_911,
  
  -- UI Preferences
  COUNT(*) FILTER (WHERE ui_theme = 'high_contrast') AS families_with_high_contrast,
  COUNT(*) FILTER (WHERE ui_font_size = 'extra_large') AS families_with_large_fonts
FROM family_settings;

COMMENT ON VIEW family_settings_analytics IS 'V8.3: Analytics on family settings usage patterns';

-- ============================================================================
-- MIGRATION COMPLETION
-- ============================================================================

-- Grant permissions
GRANT SELECT, UPDATE ON family_settings TO authenticated;
GRANT SELECT ON family_settings_changelog TO authenticated;
GRANT EXECUTE ON FUNCTION get_family_settings TO authenticated;
GRANT EXECUTE ON FUNCTION update_family_setting TO authenticated;

-- Create initial settings for existing tenants (migration)
DO $$
DECLARE
  tenant RECORD;
  family_head_id UUID;
BEGIN
  FOR tenant IN SELECT id FROM tenants WHERE NOT EXISTS (
    SELECT 1 FROM family_settings WHERE tenant_id = tenants.id
  )
  LOOP
    -- Get Family Head
    SELECT id INTO family_head_id
    FROM users
    WHERE tenant_id = tenant.id AND role = 'family_head'
    LIMIT 1;
    
    -- Create default settings
    IF family_head_id IS NOT NULL THEN
      INSERT INTO family_settings (tenant_id, updated_by_user_id)
      VALUES (tenant.id, family_head_id);
      
      RAISE NOTICE 'Initialized settings for tenant %', tenant.id;
    END IF;
  END LOOP;
END;
$$;

COMMENT ON TABLE family_settings IS 'V8.3 FAMILY LAB: Granular family configuration with WebSocket sync';

-- End of V8.3 Family Lab Schema
