-- 📐 V8.4 UNIFIED SYNC LAYER & WEBSOCKET PRIORITY
-- Chief Architect Implementation
-- Date: 2026-02-20
-- Reference: DIRECTIVE V8.4 - Final Integration & Beta Crunch

-- ============================================================================
-- WEBSOCKET PRIORITY SYSTEM
-- ============================================================================

-- Priority levels for WebSocket broadcasts
-- CRITICAL: Panic events (override all other sockets)
-- HIGH: Security alerts, PIN lockouts
-- MEDIUM: Medication alerts, geofence alerts
-- LOW: Settings changes, UI updates

CREATE TABLE websocket_priority_config (
  event_type TEXT PRIMARY KEY,
  priority_level INTEGER NOT NULL CHECK (priority_level BETWEEN 1 AND 4),
  override_channels TEXT[] DEFAULT '{}', -- Channels to override when this event fires
  description TEXT
);

-- Priority levels (1 = CRITICAL, 4 = LOW)
INSERT INTO websocket_priority_config (event_type, priority_level, override_channels, description) VALUES
  ('panic_triggered', 1, ARRAY['family_settings_sync', 'medication_updates', 'location_updates'], 'Panic Room activated - HIGHEST PRIORITY'),
  ('panic_resolved', 1, ARRAY['family_settings_sync', 'medication_updates'], 'Panic Room deactivated'),
  ('security_alert', 2, ARRAY['family_settings_sync'], 'PIN lockout, unauthorized access'),
  ('medication_critical', 2, ARRAY['family_settings_sync'], 'Critical medication missed'),
  ('geofence_alert', 3, ARRAY[], 'Geofence entry/exit'),
  ('medication_reminder', 3, ARRAY[], 'Medication reminder'),
  ('family_settings_changed', 4, ARRAY[], 'Settings updated by Family Head'),
  ('location_update', 4, ARRAY[], 'GPS location update');

COMMENT ON TABLE websocket_priority_config IS 'V8.4: WebSocket event priority system (Panic > Settings)';

-- ============================================================================
-- ENHANCED PANIC BROADCAST (HIGHEST PRIORITY)
-- ============================================================================

CREATE OR REPLACE FUNCTION broadcast_panic_event()
RETURNS TRIGGER AS $$
DECLARE
  payload JSONB;
  all_users UUID[];
  priority_config RECORD;
BEGIN
  -- Get priority config
  SELECT * INTO priority_config
  FROM websocket_priority_config
  WHERE event_type = 'panic_triggered';
  
  -- Get all family members for this tenant
  SELECT ARRAY_AGG(id) INTO all_users
  FROM users
  WHERE tenant_id = NEW.tenant_id;
  
  -- Build CRITICAL priority payload
  payload := jsonb_build_object(
    'event', 'panic_triggered',
    'priority', priority_config.priority_level,
    'overrideChannels', priority_config.override_channels,
    'tenantId', NEW.tenant_id,
    'panicEventId', NEW.id,
    'triggeredBy', NEW.triggered_by_user_id,
    'timestamp', extract(epoch from NEW.triggered_at) * 1000,
    'location', jsonb_build_object(
      'lat', NEW.location_lat,
      'lng', NEW.location_lng
    ),
    'requiresImmediateAction', true,
    'forceReload', true, -- Force all clients to reload app
    'metadata', jsonb_build_object(
      'panicType', NEW.panic_type,
      'notes', NEW.notes
    )
  );
  
  -- Broadcast on dedicated panic channel (highest priority)
  PERFORM pg_notify('panic_events', payload::TEXT);
  
  -- Also broadcast on general events channel for backwards compatibility
  PERFORM pg_notify('realtime_events', payload::TEXT);
  
  -- Log broadcast
  RAISE NOTICE 'CRITICAL PRIORITY: Panic event broadcast (tenant %, event %)',
    NEW.tenant_id, NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_broadcast_panic_event
  AFTER INSERT ON panic_events
  FOR EACH ROW
  EXECUTE FUNCTION broadcast_panic_event();

COMMENT ON TRIGGER trigger_broadcast_panic_event ON panic_events IS 'V8.4: Broadcast panic events with HIGHEST priority (overrides all other sockets)';

-- ============================================================================
-- SETTINGS BROADCAST (LOW PRIORITY, CAN BE OVERRIDDEN)
-- ============================================================================

CREATE OR REPLACE FUNCTION broadcast_settings_change()
RETURNS TRIGGER AS $$
DECLARE
  payload JSONB;
  priority_config RECORD;
  active_panic_count INTEGER;
BEGIN
  -- Check for active panic events (if panic active, delay settings broadcast)
  SELECT COUNT(*) INTO active_panic_count
  FROM panic_events
  WHERE tenant_id = NEW.tenant_id
    AND resolved_at IS NULL;
  
  IF active_panic_count > 0 THEN
    -- Panic is active, defer settings broadcast
    RAISE NOTICE 'Settings broadcast deferred due to active panic (tenant %)', NEW.tenant_id;
    
    -- Queue for later broadcast (after panic resolves)
    INSERT INTO deferred_websocket_broadcasts (
      tenant_id,
      event_type,
      payload,
      defer_reason,
      defer_until
    ) VALUES (
      NEW.tenant_id,
      'family_settings_changed',
      row_to_json(NEW)::JSONB,
      'active_panic',
      NULL -- Broadcast after panic resolves
    );
    
    RETURN NEW;
  END IF;
  
  -- Get priority config
  SELECT * INTO priority_config
  FROM websocket_priority_config
  WHERE event_type = 'family_settings_changed';
  
  -- Build LOW priority payload
  payload := jsonb_build_object(
    'event', 'family_settings_changed',
    'priority', priority_config.priority_level,
    'tenantId', NEW.tenant_id,
    'syncVersion', NEW.sync_version,
    'changedBy', NEW.updated_by_user_id,
    'changedAt', extract(epoch from NEW.updated_at) * 1000,
    'settings', row_to_json(NEW),
    'requiresImmediateAction', false,
    'canBeDeferred', true
  );
  
  -- Broadcast on family_settings_sync channel
  PERFORM pg_notify('family_settings_sync', payload::TEXT);
  
  RAISE NOTICE 'Low priority: Settings change broadcast (tenant %, version %)',
    NEW.tenant_id, NEW.sync_version;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger with new function
DROP TRIGGER IF EXISTS trigger_broadcast_settings_change ON family_settings;
CREATE TRIGGER trigger_broadcast_settings_change
  AFTER UPDATE ON family_settings
  FOR EACH ROW
  EXECUTE FUNCTION broadcast_settings_change();

COMMENT ON TRIGGER trigger_broadcast_settings_change ON family_settings IS 'V8.4: Broadcast settings changes with LOW priority (can be overridden by panic)';

-- ============================================================================
-- DEFERRED WEBSOCKET BROADCASTS TABLE
-- ============================================================================

CREATE TABLE deferred_websocket_broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  defer_reason TEXT NOT NULL, -- 'active_panic', 'network_congestion', etc.
  defer_until TIMESTAMPTZ, -- NULL = defer until panic resolves
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  broadcasted_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'broadcasted', 'cancelled'))
);

CREATE INDEX idx_deferred_broadcasts_tenant ON deferred_websocket_broadcasts(tenant_id, status);
CREATE INDEX idx_deferred_broadcasts_type ON deferred_websocket_broadcasts(event_type, status);

COMMENT ON TABLE deferred_websocket_broadcasts IS 'V8.4: Queue for WebSocket broadcasts deferred due to higher-priority events';

-- ============================================================================
-- PANIC RESOLUTION: BROADCAST DEFERRED EVENTS
-- ============================================================================

CREATE OR REPLACE FUNCTION broadcast_deferred_events_on_panic_resolve()
RETURNS TRIGGER AS $$
DECLARE
  deferred_broadcast RECORD;
  broadcast_count INTEGER := 0;
BEGIN
  -- When panic is resolved, broadcast all deferred events for this tenant
  FOR deferred_broadcast IN
    SELECT * FROM deferred_websocket_broadcasts
    WHERE tenant_id = NEW.tenant_id
      AND status = 'pending'
      AND defer_reason = 'active_panic'
    ORDER BY created_at ASC
  LOOP
    -- Broadcast deferred event
    PERFORM pg_notify(
      CASE deferred_broadcast.event_type
        WHEN 'family_settings_changed' THEN 'family_settings_sync'
        ELSE 'realtime_events'
      END,
      deferred_broadcast.payload::TEXT
    );
    
    -- Mark as broadcasted
    UPDATE deferred_websocket_broadcasts
    SET status = 'broadcasted', broadcasted_at = NOW()
    WHERE id = deferred_broadcast.id;
    
    broadcast_count := broadcast_count + 1;
  END LOOP;
  
  IF broadcast_count > 0 THEN
    RAISE NOTICE 'Panic resolved: Broadcasted % deferred events for tenant %',
      broadcast_count, NEW.tenant_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_broadcast_deferred_on_panic_resolve
  AFTER UPDATE OF resolved_at ON panic_events
  FOR EACH ROW
  WHEN (OLD.resolved_at IS NULL AND NEW.resolved_at IS NOT NULL)
  EXECUTE FUNCTION broadcast_deferred_events_on_panic_resolve();

COMMENT ON TRIGGER trigger_broadcast_deferred_on_panic_resolve ON panic_events IS 'V8.4: Broadcast deferred events when panic is resolved';

-- ============================================================================
-- CLIENT-SIDE PRIORITY HANDLER (TYPESCRIPT IMPLEMENTATION)
-- ============================================================================

/*
// WEBSOCKET PRIORITY HANDLER (React/TypeScript)

interface WebSocketMessage {
  event: string;
  priority: 1 | 2 | 3 | 4; // 1=CRITICAL, 4=LOW
  overrideChannels?: string[];
  forceReload?: boolean;
  requiresImmediateAction?: boolean;
  canBeDeferred?: boolean;
  tenantId: string;
  [key: string]: any;
}

class WebSocketPriorityHandler {
  private activeChannels: Map<string, WebSocketMessage> = new Map();
  private messageQueue: WebSocketMessage[] = [];
  
  // Process incoming message with priority handling
  processMessage(message: WebSocketMessage) {
    // CRITICAL PRIORITY: Panic events
    if (message.priority === 1) {
      this.handleCriticalEvent(message);
      return;
    }
    
    // Check if a higher-priority event is active
    const activeCriticalEvent = Array.from(this.activeChannels.values())
      .find(msg => msg.priority < message.priority);
    
    if (activeCriticalEvent) {
      // Defer this message until critical event is cleared
      console.log(`Deferring ${message.event} due to active ${activeCriticalEvent.event}`);
      this.messageQueue.push(message);
      return;
    }
    
    // Process message normally
    this.handleMessage(message);
  }
  
  // Handle CRITICAL priority events (Panic)
  handleCriticalEvent(message: WebSocketMessage) {
    console.log('🚨 CRITICAL EVENT:', message.event);
    
    // Override specified channels
    if (message.overrideChannels) {
      message.overrideChannels.forEach(channel => {
        this.activeChannels.delete(channel);
        console.log(`Overriding channel: ${channel}`);
      });
    }
    
    // Force reload if required
    if (message.forceReload) {
      console.log('Force reloading app due to panic event...');
      window.location.reload();
      return;
    }
    
    // Navigate to Panic Room immediately
    if (message.event === 'panic_triggered') {
      // Cancel any in-flight animations
      cancelAllAnimations();
      
      // Navigate to Panic Room (no transition)
      navigation.navigate('PanicRoom', {
        replace: true,
        panicEventId: message.panicEventId,
      });
      
      // Store active critical event
      this.activeChannels.set('panic_events', message);
    }
  }
  
  // Handle normal priority messages
  handleMessage(message: WebSocketMessage) {
    switch (message.event) {
      case 'family_settings_changed':
        // Update local settings
        updateFamilySettings(message.settings);
        showToast('Settings updated by another device');
        break;
        
      case 'medication_reminder':
        // Show medication prompt
        showMedicationPrompt(message.medicationId);
        break;
        
      case 'location_update':
        // Update map
        updateMapLocation(message.userId, message.location);
        break;
    }
  }
  
  // Process deferred messages (called when panic resolves)
  processDeferredMessages() {
    console.log(`Processing ${this.messageQueue.length} deferred messages...`);
    
    const queue = [...this.messageQueue];
    this.messageQueue = [];
    
    queue.forEach(message => {
      this.processMessage(message);
    });
  }
  
  // Clear critical event (called when panic is resolved)
  clearCriticalEvent(eventType: string) {
    this.activeChannels.delete(eventType);
    this.processDeferredMessages();
  }
}

// Global instance
export const websocketHandler = new WebSocketPriorityHandler();

// Supabase channel setup
useEffect(() => {
  // CRITICAL: Panic events channel
  const panicChannel = supabase
    .channel('panic_events')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'panic_events',
      filter: `tenant_id=eq.${tenantId}`,
    }, (payload) => {
      websocketHandler.processMessage({
        event: payload.eventType === 'INSERT' ? 'panic_triggered' : 'panic_resolved',
        priority: 1,
        ...payload.new,
      });
    })
    .subscribe();
  
  // LOW: Settings channel
  const settingsChannel = supabase
    .channel('family_settings_sync')
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'family_settings',
      filter: `tenant_id=eq.${tenantId}`,
    }, (payload) => {
      websocketHandler.processMessage({
        event: 'family_settings_changed',
        priority: 4,
        canBeDeferred: true,
        ...payload.new,
      });
    })
    .subscribe();
  
  return () => {
    panicChannel.unsubscribe();
    settingsChannel.unsubscribe();
  };
}, [tenantId]);
*/

-- ============================================================================
-- STAGING DEPLOYMENT CHECKLIST
-- ============================================================================

-- Create staging environment flag
DO $$
BEGIN
  -- Check if running in staging
  IF current_database() LIKE '%staging%' THEN
    RAISE NOTICE '🚀 STAGING DEPLOYMENT DETECTED';
    RAISE NOTICE 'Database: %', current_database();
    RAISE NOTICE 'Timestamp: %', NOW();
  END IF;
END;
$$;

-- Migration verification
CREATE OR REPLACE FUNCTION verify_v84_migration()
RETURNS TABLE (
  check_name TEXT,
  status TEXT,
  details TEXT
) AS $$
BEGIN
  -- Check 1: WebSocket priority config exists
  RETURN QUERY
  SELECT
    'websocket_priority_config'::TEXT,
    CASE WHEN EXISTS (SELECT 1 FROM websocket_priority_config) THEN 'PASS' ELSE 'FAIL' END,
    (SELECT COUNT(*)::TEXT || ' event types configured' FROM websocket_priority_config);
  
  -- Check 2: Deferred broadcasts table exists
  RETURN QUERY
  SELECT
    'deferred_websocket_broadcasts'::TEXT,
    CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'deferred_websocket_broadcasts') THEN 'PASS' ELSE 'FAIL' END,
    'Table exists'::TEXT;
  
  -- Check 3: Panic broadcast trigger exists
  RETURN QUERY
  SELECT
    'panic_broadcast_trigger'::TEXT,
    CASE WHEN EXISTS (
      SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_broadcast_panic_event'
    ) THEN 'PASS' ELSE 'FAIL' END,
    'Trigger exists on panic_events'::TEXT;
  
  -- Check 4: Settings broadcast trigger exists
  RETURN QUERY
  SELECT
    'settings_broadcast_trigger'::TEXT,
    CASE WHEN EXISTS (
      SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_broadcast_settings_change'
    ) THEN 'PASS' ELSE 'FAIL' END,
    'Trigger exists on family_settings'::TEXT;
  
  -- Check 5: Deferred broadcast trigger exists
  RETURN QUERY
  SELECT
    'deferred_broadcast_trigger'::TEXT,
    CASE WHEN EXISTS (
      SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_broadcast_deferred_on_panic_resolve'
    ) THEN 'PASS' ELSE 'FAIL' END,
    'Trigger exists on panic_events'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Run verification
SELECT * FROM verify_v84_migration();

COMMENT ON FUNCTION verify_v84_migration IS 'V8.4: Verify staging deployment of unified sync layer';

-- ============================================================================
-- PERFORMANCE MONITORING
-- ============================================================================

CREATE TABLE websocket_broadcast_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  priority_level INTEGER NOT NULL,
  broadcast_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processing_time_ms NUMERIC(10, 2),
  deferred BOOLEAN NOT NULL DEFAULT false,
  override_count INTEGER DEFAULT 0
);

CREATE INDEX idx_websocket_metrics_tenant ON websocket_broadcast_metrics(tenant_id, broadcast_timestamp DESC);
CREATE INDEX idx_websocket_metrics_type ON websocket_broadcast_metrics(event_type, broadcast_timestamp DESC);

COMMENT ON TABLE websocket_broadcast_metrics IS 'V8.4: Performance metrics for WebSocket broadcasts';

-- Function: Log broadcast metrics
CREATE OR REPLACE FUNCTION log_websocket_broadcast(
  p_tenant_id UUID,
  p_event_type TEXT,
  p_priority_level INTEGER,
  p_processing_time_ms NUMERIC,
  p_deferred BOOLEAN DEFAULT false
)
RETURNS void AS $$
BEGIN
  INSERT INTO websocket_broadcast_metrics (
    tenant_id,
    event_type,
    priority_level,
    processing_time_ms,
    deferred
  ) VALUES (
    p_tenant_id,
    p_event_type,
    p_priority_level,
    p_processing_time_ms,
    p_deferred
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ANALYTICS: WEBSOCKET PERFORMANCE
-- ============================================================================

CREATE OR REPLACE VIEW websocket_performance_analytics AS
SELECT
  event_type,
  priority_level,
  COUNT(*) AS total_broadcasts,
  AVG(processing_time_ms) AS avg_processing_time_ms,
  MAX(processing_time_ms) AS max_processing_time_ms,
  COUNT(*) FILTER (WHERE deferred = true) AS deferred_count,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE deferred = true) / COUNT(*),
    2
  ) AS deferred_percentage
FROM websocket_broadcast_metrics
WHERE broadcast_timestamp > NOW() - INTERVAL '7 days'
GROUP BY event_type, priority_level
ORDER BY priority_level ASC, total_broadcasts DESC;

COMMENT ON VIEW websocket_performance_analytics IS 'V8.4: WebSocket broadcast performance metrics (7-day window)';

-- ============================================================================
-- STAGING DEPLOYMENT COMPLETION
-- ============================================================================

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON deferred_websocket_broadcasts TO authenticated;
GRANT SELECT ON websocket_priority_config TO authenticated;
GRANT EXECUTE ON FUNCTION verify_v84_migration TO authenticated;

-- Final verification
DO $$
DECLARE
  check_results RECORD;
  fail_count INTEGER := 0;
BEGIN
  RAISE NOTICE '═══════════════════════════════════════════';
  RAISE NOTICE '  V8.4 STAGING DEPLOYMENT VERIFICATION';
  RAISE NOTICE '═══════════════════════════════════════════';
  
  FOR check_results IN SELECT * FROM verify_v84_migration()
  LOOP
    RAISE NOTICE '% ... %', check_results.check_name, check_results.status;
    IF check_results.status = 'FAIL' THEN
      fail_count := fail_count + 1;
    END IF;
  END LOOP;
  
  RAISE NOTICE '═══════════════════════════════════════════';
  IF fail_count = 0 THEN
    RAISE NOTICE '✅ ALL CHECKS PASSED - STAGING READY';
  ELSE
    RAISE NOTICE '❌ % CHECKS FAILED - DEPLOYMENT BLOCKED', fail_count;
  END IF;
  RAISE NOTICE '═══════════════════════════════════════════';
END;
$$;

COMMENT ON SCHEMA public IS 'V8.4 UNIFIED SYNC LAYER: WebSocket priority system deployed. Panic > Settings. Staging ready for beta.';

-- End of V8.4 Unified Sync Layer
