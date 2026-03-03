-- 📐 V8.2 POST-VISIT LOGIC ENGINE
-- Chief Architect Implementation
-- Date: 2026-02-19
-- Reference: DIRECTIVE V8.2 - Doctor & Settings Pivot

-- ============================================================================
-- DOCTOR VISITS TABLE ENHANCEMENTS
-- ============================================================================

-- Extend existing doctor_visits table with geofence tracking
ALTER TABLE doctor_visits ADD COLUMN IF NOT EXISTS geofence_status TEXT CHECK (
  geofence_status IN ('pending', 'arrived', 'departed', 'cancelled')
) DEFAULT 'pending';

ALTER TABLE doctor_visits ADD COLUMN IF NOT EXISTS arrived_at TIMESTAMPTZ;
ALTER TABLE doctor_visits ADD COLUMN IF NOT EXISTS departed_at TIMESTAMPTZ;
ALTER TABLE doctor_visits ADD COLUMN IF NOT EXISTS geofence_lat NUMERIC(10, 7);
ALTER TABLE doctor_visits ADD COLUMN IF NOT EXISTS geofence_lng NUMERIC(10, 7);
ALTER TABLE doctor_visits ADD COLUMN IF NOT EXISTS geofence_radius_meters NUMERIC(10, 2) DEFAULT 804.672; -- 0.5 miles
ALTER TABLE doctor_visits ADD COLUMN IF NOT EXISTS post_visit_pulse_queued_at TIMESTAMPTZ;
ALTER TABLE doctor_visits ADD COLUMN IF NOT EXISTS post_visit_pulse_sent_at TIMESTAMPTZ;
ALTER TABLE doctor_visits ADD COLUMN IF NOT EXISTS post_visit_pulse_completed_at TIMESTAMPTZ;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_doctor_visits_geofence_status ON doctor_visits(geofence_status);
CREATE INDEX IF NOT EXISTS idx_doctor_visits_departed_at ON doctor_visits(departed_at);
CREATE INDEX IF NOT EXISTS idx_doctor_visits_pulse_queued ON doctor_visits(post_visit_pulse_queued_at);

COMMENT ON COLUMN doctor_visits.geofence_status IS 'V8.2: Real-time geofence tracking (pending → arrived → departed)';
COMMENT ON COLUMN doctor_visits.post_visit_pulse_queued_at IS 'V8.2: Timestamp when 30-minute pulse was queued (departed_at + 30min)';

-- ============================================================================
-- GEOFENCE EXIT HOOK (POST-VISIT PULSE TRIGGER)
-- ============================================================================

-- Function: Queue Post-Visit Pulse (called when geofence exit detected)
CREATE OR REPLACE FUNCTION queue_post_visit_pulse(
  p_doctor_visit_id UUID
)
RETURNS void AS $$
DECLARE
  visit RECORD;
  pulse_time TIMESTAMPTZ;
BEGIN
  -- Get visit details
  SELECT * INTO visit
  FROM doctor_visits
  WHERE id = p_doctor_visit_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Doctor visit % not found', p_doctor_visit_id;
  END IF;
  
  -- Verify visit has departed
  IF visit.geofence_status != 'departed' OR visit.departed_at IS NULL THEN
    RAISE EXCEPTION 'Visit % has not departed geofence', p_doctor_visit_id;
  END IF;
  
  -- Calculate pulse time (30 minutes after departure)
  pulse_time := visit.departed_at + INTERVAL '30 minutes';
  
  -- Update visit record
  UPDATE doctor_visits
  SET post_visit_pulse_queued_at = NOW()
  WHERE id = p_doctor_visit_id;
  
  -- Create notification event (scheduled for future delivery)
  INSERT INTO notification_events (
    tenant_id,
    event_type,
    severity,
    user_id,
    target_user_ids,
    title,
    body,
    metadata,
    timestamp,
    requires_acknowledgement
  ) VALUES (
    visit.tenant_id,
    'doctor_visit',
    'medium',
    visit.user_id,
    ARRAY[visit.user_id]::UUID[], -- Send to Protected user
    'How was your doctor visit?',
    format('Your %s appointment ended at %s. We''d like to hear how it went.',
      visit.appointment_type,
      to_char(visit.departed_at, 'HH12:MI AM')
    ),
    jsonb_build_object(
      'doctor_visit_id', visit.id,
      'trigger_type', 'post_visit_pulse',
      'scheduled_delivery', extract(epoch from pulse_time) * 1000,
      'doctor_name', visit.doctor_name,
      'appointment_type', visit.appointment_type
    ),
    pulse_time, -- Scheduled timestamp (not NOW)
    false -- Not critical (user can skip)
  );
  
  RAISE NOTICE 'Post-visit pulse queued for visit % (delivery at %)', 
    p_doctor_visit_id, pulse_time;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION queue_post_visit_pulse IS 'V8.2: Queue Post-Visit Pulse notification 30 minutes after geofence exit';

-- ============================================================================
-- GEOFENCE STATUS UPDATE TRIGGERS
-- ============================================================================

-- Trigger: Auto-queue pulse on geofence departure
CREATE OR REPLACE FUNCTION auto_queue_post_visit_pulse()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if status changed to 'departed'
  IF NEW.geofence_status = 'departed' AND 
     (OLD.geofence_status IS NULL OR OLD.geofence_status != 'departed') AND
     NEW.departed_at IS NOT NULL AND
     NEW.post_visit_pulse_queued_at IS NULL THEN
    
    -- Queue the post-visit pulse
    PERFORM queue_post_visit_pulse(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_queue_post_visit_pulse
  AFTER UPDATE OF geofence_status, departed_at ON doctor_visits
  FOR EACH ROW
  EXECUTE FUNCTION auto_queue_post_visit_pulse();

COMMENT ON TRIGGER trigger_auto_queue_post_visit_pulse ON doctor_visits IS 'V8.2: Auto-queue Post-Visit Pulse when geofence exit detected';

-- ============================================================================
-- REAL-TIME GEOFENCE MONITORING (APPLICATION LAYER)
-- ============================================================================

/*
TYPESCRIPT IMPLEMENTATION (app layer - GPS listener):

// GPS Update Handler (called every 3 seconds for Protected users)
async function handleGPSUpdate(userId: string, lat: number, lng: number) {
  // Get active doctor visits for user
  const { data: activeVisits } = await supabase
    .from('doctor_visits')
    .select('*')
    .eq('user_id', userId)
    .in('geofence_status', ['pending', 'arrived'])
    .gte('scheduled_time', new Date(Date.now() - 3600000).toISOString()) // Within 1 hour
    .lte('scheduled_time', new Date(Date.now() + 3600000).toISOString()); // Within 1 hour
  
  for (const visit of activeVisits || []) {
    const distance = calculateDistance(
      lat, lng,
      visit.geofence_lat, visit.geofence_lng
    );
    
    // Check if entered geofence
    if (visit.geofence_status === 'pending' && distance <= visit.geofence_radius_meters) {
      await supabase
        .from('doctor_visits')
        .update({
          geofence_status: 'arrived',
          arrived_at: new Date().toISOString()
        })
        .eq('id', visit.id);
      
      // Send "Arrived" notification to monitors
      await sendNotification({
        tenantId: visit.tenant_id,
        eventType: 'geofence_arrived',
        severity: 'low',
        userId: userId,
        targetUserIds: await getMonitorIds(visit.tenant_id),
        title: 'Doctor Visit Check-In',
        body: `${getUserName(userId)} has arrived at their ${visit.appointment_type} appointment.`
      });
    }
    
    // Check if exited geofence (after arrival)
    if (visit.geofence_status === 'arrived' && distance > visit.geofence_radius_meters) {
      await supabase
        .from('doctor_visits')
        .update({
          geofence_status: 'departed',
          departed_at: new Date().toISOString()
        })
        .eq('id', visit.id);
      
      // Trigger auto-queues Post-Visit Pulse (via database trigger)
      
      // Send "Departed" notification to monitors
      await sendNotification({
        tenantId: visit.tenant_id,
        eventType: 'geofence_arrived',
        severity: 'low',
        userId: userId,
        targetUserIds: await getMonitorIds(visit.tenant_id),
        title: 'Doctor Visit Complete',
        body: `${getUserName(userId)} has left their ${visit.appointment_type} appointment. Post-visit feedback will be requested in 30 minutes.`
      });
    }
  }
}

// Helper: Calculate distance between two points (Haversine formula)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;
  
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c; // Distance in meters
}
*/

-- ============================================================================
-- PET/ASSET TRACKING OPTIMIZATION
-- ============================================================================

-- Create materialized view for low-latency asset queries
CREATE MATERIALIZED VIEW IF NOT EXISTS active_tracked_assets AS
SELECT
  ta.id,
  ta.tenant_id,
  ta.asset_type,
  ta.name,
  ta.last_known_lat,
  ta.last_known_lng,
  ta.last_updated_at,
  ta.battery_level,
  ta.is_moving,
  ta.assigned_to_user_id,
  u.name AS assigned_to_user_name,
  -- Calculate age of last update
  EXTRACT(EPOCH FROM (NOW() - ta.last_updated_at)) AS seconds_since_update,
  -- Status indicator
  CASE
    WHEN ta.last_updated_at > NOW() - INTERVAL '5 minutes' THEN 'active'
    WHEN ta.last_updated_at > NOW() - INTERVAL '1 hour' THEN 'stale'
    ELSE 'offline'
  END AS status
FROM tracked_assets ta
LEFT JOIN users u ON u.id = ta.assigned_to_user_id
WHERE ta.is_active = true;

-- Create unique index for concurrent refresh
CREATE UNIQUE INDEX IF NOT EXISTS idx_active_tracked_assets_id ON active_tracked_assets(id);

-- Refresh materialized view every 10 seconds (via cron)
CREATE OR REPLACE FUNCTION refresh_active_tracked_assets()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY active_tracked_assets;
  RAISE NOTICE 'Active tracked assets view refreshed';
END;
$$ LANGUAGE plpgsql;

COMMENT ON MATERIALIZED VIEW active_tracked_assets IS 'V8.2: Low-latency view of active pet/asset locations for Map center-pane';

-- ============================================================================
-- ASSET MOVEMENT DETECTION
-- ============================================================================

-- Function: Detect significant asset movement
CREATE OR REPLACE FUNCTION detect_asset_movement(
  p_asset_id UUID,
  p_new_lat NUMERIC,
  p_new_lng NUMERIC
)
RETURNS TABLE (
  moved BOOLEAN,
  distance_meters NUMERIC,
  velocity_mph NUMERIC
) AS $$
DECLARE
  asset RECORD;
  distance NUMERIC;
  time_diff NUMERIC;
  velocity NUMERIC;
BEGIN
  -- Get current asset state
  SELECT * INTO asset
  FROM tracked_assets
  WHERE id = p_asset_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 0::NUMERIC, 0::NUMERIC;
    RETURN;
  END IF;
  
  -- Calculate distance moved (Haversine)
  distance := (
    6371000 * acos(
      cos(radians(asset.last_known_lat)) * 
      cos(radians(p_new_lat)) * 
      cos(radians(p_new_lng) - radians(asset.last_known_lng)) + 
      sin(radians(asset.last_known_lat)) * 
      sin(radians(p_new_lat))
    )
  );
  
  -- Calculate time difference (seconds)
  time_diff := EXTRACT(EPOCH FROM (NOW() - asset.last_updated_at));
  
  -- Calculate velocity (meters/second → mph)
  IF time_diff > 0 THEN
    velocity := (distance / time_diff) * 2.23694; -- Convert m/s to mph
  ELSE
    velocity := 0;
  END IF;
  
  -- Consider "moved" if distance > 50 meters (prevents GPS jitter false positives)
  RETURN QUERY SELECT 
    (distance > 50)::BOOLEAN,
    distance,
    velocity;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION detect_asset_movement IS 'V8.2: Detect significant pet/asset movement (>50m threshold)';

-- ============================================================================
-- ASSET MOVEMENT NOTIFICATION TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION notify_asset_movement()
RETURNS TRIGGER AS $$
DECLARE
  movement RECORD;
  alert_threshold NUMERIC := 0.5; -- 0.5 miles (804 meters)
  distance_miles NUMERIC;
BEGIN
  -- Check for significant movement
  SELECT * INTO movement
  FROM detect_asset_movement(
    NEW.id,
    NEW.last_known_lat,
    NEW.last_known_lng
  );
  
  IF movement.moved THEN
    distance_miles := movement.distance_meters * 0.000621371; -- Convert to miles
    
    -- Alert if moved more than threshold
    IF movement.distance_meters > 804 THEN
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
        NEW.tenant_id,
        'asset_moved',
        CASE 
          WHEN movement.velocity_mph > 25 THEN 'high'
          WHEN movement.velocity_mph > 10 THEN 'medium'
          ELSE 'low'
        END,
        NEW.assigned_to_user_id,
        (SELECT ARRAY_AGG(id) FROM users WHERE tenant_id = NEW.tenant_id AND role IN ('family_head', 'monitor')),
        format('%s has moved', NEW.name),
        format('%s has moved %.2f miles (%s mph)',
          NEW.name,
          distance_miles,
          ROUND(movement.velocity_mph::NUMERIC, 1)
        ),
        jsonb_build_object(
          'asset_id', NEW.id,
          'asset_type', NEW.asset_type,
          'distance_meters', movement.distance_meters,
          'velocity_mph', movement.velocity_mph,
          'old_location', jsonb_build_object('lat', OLD.last_known_lat, 'lng', OLD.last_known_lng),
          'new_location', jsonb_build_object('lat', NEW.last_known_lat, 'lng', NEW.last_known_lng)
        ),
        false
      );
      
      RAISE NOTICE 'Asset % moved %.2f miles (%.1f mph)', NEW.name, distance_miles, movement.velocity_mph;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_asset_movement
  AFTER UPDATE OF last_known_lat, last_known_lng ON tracked_assets
  FOR EACH ROW
  WHEN (OLD.last_known_lat IS DISTINCT FROM NEW.last_known_lat OR
        OLD.last_known_lng IS DISTINCT FROM NEW.last_known_lng)
  EXECUTE FUNCTION notify_asset_movement();

COMMENT ON TRIGGER trigger_notify_asset_movement ON tracked_assets IS 'V8.2: Auto-notify monitors when pet/asset moves >0.5 miles';

-- ============================================================================
-- CRON JOB: SCHEDULED POST-VISIT PULSE DELIVERY
-- ============================================================================

-- Updated: Send queued post-visit pulses
CREATE OR REPLACE FUNCTION send_queued_post_visit_pulses()
RETURNS void AS $$
DECLARE
  notification RECORD;
  sent_count INTEGER := 0;
BEGIN
  -- Find notification events scheduled for delivery (timestamp <= NOW)
  FOR notification IN
    SELECT ne.*, dv.id AS visit_id
    FROM notification_events ne
    JOIN doctor_visits dv ON (ne.metadata->>'doctor_visit_id')::UUID = dv.id
    WHERE ne.event_type = 'doctor_visit'
      AND ne.metadata->>'trigger_type' = 'post_visit_pulse'
      AND ne.timestamp <= NOW()
      AND dv.post_visit_pulse_sent_at IS NULL
  LOOP
    -- Update visit record
    UPDATE doctor_visits
    SET post_visit_pulse_sent_at = NOW()
    WHERE id = notification.visit_id;
    
    -- Send push notification (via app layer)
    -- The notification_event already exists in the database,
    -- so the app will pick it up via real-time subscription
    
    sent_count := sent_count + 1;
    
    RAISE NOTICE 'Post-visit pulse sent for visit %', notification.visit_id;
  END LOOP;
  
  RAISE NOTICE 'Post-visit pulse delivery: % pulses sent', sent_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION send_queued_post_visit_pulses IS 'V8.2: Send queued post-visit pulses when scheduled time arrives';

-- ============================================================================
-- ANALYTICS: POST-VISIT PULSE METRICS
-- ============================================================================

CREATE OR REPLACE VIEW post_visit_pulse_analytics AS
SELECT
  dv.tenant_id,
  COUNT(*) AS total_visits,
  COUNT(dv.post_visit_pulse_queued_at) AS pulses_queued,
  COUNT(dv.post_visit_pulse_sent_at) AS pulses_sent,
  COUNT(pvf.id) AS feedback_received,
  ROUND(
    100.0 * COUNT(pvf.id) / NULLIF(COUNT(dv.post_visit_pulse_sent_at), 0),
    1
  ) AS response_rate_percent,
  AVG(pvf.rating) AS avg_rating,
  COUNT(pvf.photo_url) AS photos_submitted,
  COUNT(pvf.voice_note_url) AS voice_notes_submitted
FROM doctor_visits dv
LEFT JOIN post_visit_feedback pvf ON pvf.doctor_visit_id = dv.id
WHERE dv.scheduled_time > NOW() - INTERVAL '90 days'
GROUP BY dv.tenant_id;

COMMENT ON VIEW post_visit_pulse_analytics IS 'V8.2: Post-Visit Pulse engagement metrics (90-day window)';

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_doctor_visits_user_scheduled 
  ON doctor_visits(user_id, scheduled_time DESC);

CREATE INDEX IF NOT EXISTS idx_tracked_assets_tenant_active 
  ON tracked_assets(tenant_id, is_active) 
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_notification_events_scheduled 
  ON notification_events(timestamp) 
  WHERE metadata->>'trigger_type' = 'post_visit_pulse';

-- ============================================================================
-- MIGRATION COMPLETION
-- ============================================================================

COMMENT ON TABLE doctor_visits IS 'V8.2: Doctor appointments with geofence tracking + Post-Visit Pulse automation';
COMMENT ON TABLE tracked_assets IS 'V8.2: Pet/asset tracking with real-time movement detection';

-- End of V8.2 Post-Visit Logic Engine
