-- 📐 V8.1 DATABASE SCHEMA: THE SEVEN PILLARS
-- Chief Architect Implementation
-- Date: 2026-02-19
-- Reference: DIRECTIVE V8.1

-- ============================================================================
-- PILLAR 1: MEDICATION COMMAND CENTER
-- ============================================================================

CREATE TABLE medications_v8 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- Protected user
  name TEXT NOT NULL,
  dosage TEXT NOT NULL, -- e.g., "10mg", "2 pills"
  inventory_remaining INTEGER NOT NULL DEFAULT 30,
  low_inventory_threshold INTEGER NOT NULL DEFAULT 7,
  created_by_user_id UUID NOT NULL, -- Family Head
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_medications_tenant (tenant_id),
  INDEX idx_medications_user (user_id),
  INDEX idx_medications_active (is_active)
);

CREATE TABLE medication_schedules_v8 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id UUID NOT NULL REFERENCES medications_v8(id) ON DELETE CASCADE,
  time TIME NOT NULL, -- e.g., '08:00:00', '14:00:00'
  days TEXT[] NOT NULL, -- e.g., ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_medication_schedules_medication (medication_id),
  INDEX idx_medication_schedules_active (is_active)
);

-- ============================================================================
-- PILLAR 2: 90-DAY NOTIFICATION CENTER (HISTORY VAULT)
-- ============================================================================

CREATE TABLE notification_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'panic',
    'medication_missed',
    'medication_confirmed',
    'geofence_late',
    'geofence_arrived',
    'doctor_visit',
    'ping_sent',
    'ping_received',
    'status_update',
    'asset_moved'
  )),
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  user_id UUID NOT NULL, -- Event originator
  target_user_ids UUID[] NOT NULL, -- Monitors who need to see this
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL, -- NOW() + INTERVAL '90 days'
  
  -- MONITOR LOCK (PILLAR 2)
  requires_acknowledgement BOOLEAN NOT NULL DEFAULT false,
  acknowledged_by JSONB DEFAULT '[]', -- [{ "monitorId": "uuid", "acknowledgedAt": timestamp }]
  is_fully_acknowledged BOOLEAN NOT NULL DEFAULT false, -- Computed: All monitors acknowledged
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_notification_events_tenant (tenant_id),
  INDEX idx_notification_events_severity (severity),
  INDEX idx_notification_events_requires_ack (requires_acknowledgement),
  INDEX idx_notification_events_timestamp (timestamp DESC),
  INDEX idx_notification_events_expires (expires_at)
);

-- Trigger: Auto-expire events after 90 days
CREATE OR REPLACE FUNCTION check_notification_event_expiration()
RETURNS TRIGGER AS $$
BEGIN
  NEW.expires_at := NEW.timestamp + INTERVAL '90 days';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_notification_event_expiration
  BEFORE INSERT ON notification_events
  FOR EACH ROW
  EXECUTE FUNCTION check_notification_event_expiration();

-- ============================================================================
-- PILLAR 3: POST-VISIT PULSE
-- ============================================================================

CREATE TABLE post_visit_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  doctor_visit_id UUID NOT NULL REFERENCES doctor_visits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- Who submitted feedback (Protected or Monitor)
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  photo_url TEXT, -- Reference to ephemeral_assets
  voice_note_url TEXT, -- Reference to ephemeral_assets
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_post_visit_feedback_tenant (tenant_id),
  INDEX idx_post_visit_feedback_doctor_visit (doctor_visit_id)
);

-- ============================================================================
-- PILLAR 4: FAMILY LAB SETTINGS
-- ============================================================================

CREATE TABLE family_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE UNIQUE,
  
  -- Notification Sensitivities
  notification_sensitivity JSONB NOT NULL DEFAULT '{
    "medication": "immediate",
    "geofence": "all",
    "ping": "all",
    "panic": "always"
  }'::jsonb,
  
  -- Geofence Radii (in meters)
  geofence_radii JSONB NOT NULL DEFAULT '{
    "doctorVisit": 804.672,
    "home": 402.336,
    "school": 804.672
  }'::jsonb,
  
  -- UI Settings
  ui_settings JSONB NOT NULL DEFAULT '{
    "contrastMode": "standard",
    "fontSize": "medium",
    "theme": "dark"
  }'::jsonb,
  
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID NOT NULL, -- User who changed settings
  
  -- Indexes
  INDEX idx_family_settings_tenant (tenant_id)
);

-- ============================================================================
-- PILLAR 6: EPHEMERAL ASSETS (24-HOUR TTL)
-- ============================================================================

CREATE TABLE ephemeral_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- Creator
  related_event_id UUID NOT NULL, -- MedicationLog or DoctorVisit ID
  related_event_type TEXT NOT NULL CHECK (related_event_type IN (
    'medication_confirmation',
    'doctor_arrival',
    'post_visit_feedback'
  )),
  
  asset_type TEXT NOT NULL CHECK (asset_type IN ('photo', 'voice_note')),
  asset_url TEXT NOT NULL, -- Storage URL (S3/Supabase Storage)
  asset_size BIGINT NOT NULL, -- Bytes
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL, -- created_at + INTERVAL '24 hours'
  
  -- Auto-deletion tracking
  deletion_scheduled BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMPTZ,
  
  -- Privacy
  visible_to UUID[] NOT NULL, -- User IDs who can view (Protected + Monitors)
  
  -- Indexes
  INDEX idx_ephemeral_assets_tenant (tenant_id),
  INDEX idx_ephemeral_assets_expires (expires_at),
  INDEX idx_ephemeral_assets_deleted (deleted_at)
);

-- Trigger: Auto-set 24-hour expiration
CREATE OR REPLACE FUNCTION set_ephemeral_asset_expiration()
RETURNS TRIGGER AS $$
BEGIN
  NEW.expires_at := NEW.created_at + INTERVAL '24 hours';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_set_ephemeral_expiration
  BEFORE INSERT ON ephemeral_assets
  FOR EACH ROW
  EXECUTE FUNCTION set_ephemeral_asset_expiration();

-- Row-Level Security: Physical deletion after 24 hours
-- This policy PREVENTS reads of expired assets (database-level enforcement)
ALTER TABLE ephemeral_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY ephemeral_assets_ttl_policy ON ephemeral_assets
  USING (expires_at > NOW() AND deleted_at IS NULL);

-- ============================================================================
-- PILLAR 5: PANIC EVENT V8 (FORCE-SYNC ENHANCEMENTS)
-- ============================================================================

-- Extend existing panic_events table
ALTER TABLE panic_events ADD COLUMN IF NOT EXISTS force_sync_timestamp TIMESTAMPTZ;
ALTER TABLE panic_events ADD COLUMN IF NOT EXISTS connected_monitors JSONB DEFAULT '[]';
ALTER TABLE panic_events ADD COLUMN IF NOT EXISTS high_frequency_gps JSONB DEFAULT '[]';
ALTER TABLE panic_events ADD COLUMN IF NOT EXISTS live_audio_stream_url TEXT;
ALTER TABLE panic_events ADD COLUMN IF NOT EXISTS audio_buffer_url TEXT;
ALTER TABLE panic_events ADD COLUMN IF NOT EXISTS call_911_initiated JSONB;

-- ============================================================================
-- CRON JOB FUNCTIONS (SERVER-SIDE AUTOMATION)
-- ============================================================================

-- CRON 1: Post-Visit Pulse Trigger (Every 5 minutes)
CREATE OR REPLACE FUNCTION trigger_post_visit_pulse()
RETURNS void AS $$
DECLARE
  visit RECORD;
BEGIN
  -- Find visits that:
  -- 1. Have departed (departed_at IS NOT NULL)
  -- 2. Haven't triggered post-visit pulse yet (no post_visit_feedback)
  -- 3. Departed 30+ minutes ago
  FOR visit IN
    SELECT dv.*
    FROM doctor_visits dv
    LEFT JOIN post_visit_feedback pvf ON pvf.doctor_visit_id = dv.id
    WHERE dv.departed_at IS NOT NULL
      AND pvf.id IS NULL
      AND dv.departed_at < NOW() - INTERVAL '30 minutes'
  LOOP
    -- Create notification event (triggers push notification)
    INSERT INTO notification_events (
      tenant_id,
      event_type,
      severity,
      user_id,
      target_user_ids,
      title,
      body,
      metadata,
      requires_acknowledgement
    ) VALUES (
      visit.tenant_id,
      'doctor_visit',
      'medium',
      visit.user_id,
      ARRAY[visit.user_id], -- Send to Protected user
      'How was your doctor visit?',
      'We''d like to hear about your visit. Tap to provide feedback.',
      jsonb_build_object('doctor_visit_id', visit.id, 'trigger_type', 'post_visit_pulse'),
      false
    );
    
    RAISE NOTICE 'Post-visit pulse triggered for visit %', visit.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- CRON 2: Ephemeral Asset Purge (Every hour)
CREATE OR REPLACE FUNCTION purge_expired_ephemeral_assets()
RETURNS void AS $$
DECLARE
  asset RECORD;
  deleted_count INTEGER := 0;
BEGIN
  -- Find expired assets
  FOR asset IN
    SELECT *
    FROM ephemeral_assets
    WHERE expires_at < NOW()
      AND deleted_at IS NULL
  LOOP
    -- Mark as deleted (physical storage deletion handled by app)
    UPDATE ephemeral_assets
    SET deleted_at = NOW(),
        deletion_scheduled = true
    WHERE id = asset.id;
    
    deleted_count := deleted_count + 1;
    
    RAISE NOTICE 'Marked ephemeral asset % for deletion (expired %)',
      asset.id, asset.expires_at;
  END LOOP;
  
  RAISE NOTICE 'Ephemeral asset purge complete: % assets marked for deletion', deleted_count;
END;
$$ LANGUAGE plpgsql;

-- CRON 3: 90-Day Vault Expiration (Daily)
CREATE OR REPLACE FUNCTION purge_expired_notification_events()
RETURNS void AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM notification_events
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RAISE NOTICE '90-Day Vault purge complete: % events deleted', deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- MONITOR LOCK HELPER FUNCTIONS
-- ============================================================================

-- Function: Acknowledge notification event
CREATE OR REPLACE FUNCTION acknowledge_notification_event(
  p_event_id UUID,
  p_monitor_id UUID
)
RETURNS void AS $$
DECLARE
  current_acks JSONB;
  target_count INTEGER;
  ack_count INTEGER;
BEGIN
  -- Get current acknowledgments
  SELECT acknowledged_by, array_length(target_user_ids, 1)
  INTO current_acks, target_count
  FROM notification_events
  WHERE id = p_event_id;
  
  -- Add new acknowledgment
  UPDATE notification_events
  SET acknowledged_by = acknowledged_by || jsonb_build_object(
    'monitorId', p_monitor_id,
    'acknowledgedAt', extract(epoch from NOW()) * 1000
  )::jsonb,
  is_fully_acknowledged = (
    jsonb_array_length(acknowledged_by) + 1 >= target_count
  )
  WHERE id = p_event_id;
  
  RAISE NOTICE 'Monitor % acknowledged event %', p_monitor_id, p_event_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Composite indexes for common queries
CREATE INDEX idx_notification_events_tenant_severity_timestamp 
  ON notification_events(tenant_id, severity, timestamp DESC);

CREATE INDEX idx_ephemeral_assets_tenant_expires 
  ON ephemeral_assets(tenant_id, expires_at);

CREATE INDEX idx_medications_tenant_user_active 
  ON medications_v8(tenant_id, user_id, is_active);

-- ============================================================================
-- ROW-LEVEL SECURITY POLICIES
-- ============================================================================

-- Medications (only Family Head can create/edit)
ALTER TABLE medications_v8 ENABLE ROW LEVEL SECURITY;

CREATE POLICY medications_v8_select_policy ON medications_v8
  FOR SELECT
  USING (
    tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY medications_v8_insert_policy ON medications_v8
  FOR INSERT
  WITH CHECK (
    created_by_user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
        AND role IN ('family_head')
    )
  );

-- Notification Events (all family members can view)
ALTER TABLE notification_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY notification_events_select_policy ON notification_events
  FOR SELECT
  USING (
    tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

-- Ephemeral Assets (only visible_to users can view, TTL enforced)
CREATE POLICY ephemeral_assets_select_policy ON ephemeral_assets
  FOR SELECT
  USING (
    auth.uid() = ANY(visible_to) AND
    expires_at > NOW() AND
    deleted_at IS NULL
  );

-- Family Settings (only Family Head can edit)
ALTER TABLE family_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY family_settings_select_policy ON family_settings
  FOR SELECT
  USING (
    tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY family_settings_update_policy ON family_settings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
        AND role = 'family_head'
        AND tenant_id = family_settings.tenant_id
    )
  );

-- ============================================================================
-- INITIAL DATA SEEDING
-- ============================================================================

-- Create default family_settings for existing tenants
INSERT INTO family_settings (tenant_id, updated_by)
SELECT id, id FROM tenants
ON CONFLICT (tenant_id) DO NOTHING;

-- ============================================================================
-- AUDIT LOG TRIGGERS (NON-REPUDIATION)
-- ============================================================================

CREATE OR REPLACE FUNCTION log_medication_action()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    tenant_id,
    user_id,
    event_type,
    event_data,
    metadata
  ) VALUES (
    NEW.tenant_id,
    NEW.created_by_user_id,
    'medication_created',
    jsonb_build_object(
      'medication_id', NEW.id,
      'name', NEW.name,
      'dosage', NEW.dosage
    ),
    jsonb_build_object(
      'timestamp', extract(epoch from NOW()) * 1000
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_medication_creation
  AFTER INSERT ON medications_v8
  FOR EACH ROW
  EXECUTE FUNCTION log_medication_action();

-- ============================================================================
-- MIGRATION COMPLETION
-- ============================================================================

COMMENT ON TABLE ephemeral_assets IS 'V8.1 PILLAR 6: Ephemeral assets with 24-hour TTL enforced at database level via RLS policy';
COMMENT ON TABLE notification_events IS 'V8.1 PILLAR 2: 90-Day History Vault with Monitor Lock enforcement';
COMMENT ON TABLE medications_v8 IS 'V8.1 PILLAR 1: Medication Command Center data model';
COMMENT ON TABLE family_settings IS 'V8.1 PILLAR 4: Family Lab customization settings';
COMMENT ON TABLE post_visit_feedback IS 'V8.1 PILLAR 3: Post-Visit Pulse feedback collection';

-- End of V8.1 Schema Migration
