-- 📐 V8.5 BETA LAUNCH & STRESS MONITORING
-- Chief Architect Implementation
-- Date: 2026-02-22
-- Reference: DIRECTIVE V8.5 - Beta Deployment & Zero-Hour Support

-- ============================================================================
-- MONITORING DASHBOARD: DEFERRED EVENTS QUEUE (24-HOUR WATCH)
-- ============================================================================

-- Real-time deferred events status
CREATE OR REPLACE VIEW deferred_events_realtime AS
SELECT
  tenant_id,
  event_type,
  defer_reason,
  COUNT(*) AS pending_count,
  MIN(created_at) AS oldest_deferred,
  MAX(created_at) AS newest_deferred,
  EXTRACT(EPOCH FROM (NOW() - MIN(created_at))) / 60 AS minutes_oldest_deferred,
  ARRAY_AGG(id ORDER BY created_at) AS event_ids
FROM deferred_websocket_broadcasts
WHERE status = 'pending'
GROUP BY tenant_id, event_type, defer_reason
ORDER BY minutes_oldest_deferred DESC;

COMMENT ON VIEW deferred_events_realtime IS 'V8.5: Real-time view of pending deferred events (24-hour monitoring)';

-- Query: Check for lost P4 events during P1 overrides
SELECT * FROM deferred_events_realtime WHERE defer_reason = 'active_panic';

-- Expected: All deferred events should have been broadcasted after panic resolved
-- Alert if any event has been pending for > 30 minutes

-- ============================================================================
-- ALERT: DEFERRED EVENTS STUCK (30-MINUTE THRESHOLD)
-- ============================================================================

CREATE OR REPLACE FUNCTION alert_stuck_deferred_events()
RETURNS TABLE (
  alert_level TEXT,
  tenant_id UUID,
  event_type TEXT,
  minutes_stuck NUMERIC,
  event_count INTEGER,
  recommended_action TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    CASE
      WHEN minutes_oldest_deferred > 60 THEN 'CRITICAL'
      WHEN minutes_oldest_deferred > 30 THEN 'WARNING'
      ELSE 'INFO'
    END AS alert_level,
    der.tenant_id,
    der.event_type,
    der.minutes_oldest_deferred,
    der.pending_count,
    CASE
      WHEN minutes_oldest_deferred > 60 THEN 'Manual intervention required: Force broadcast deferred events'
      WHEN minutes_oldest_deferred > 30 THEN 'Monitor closely: Check if panic is still active'
      ELSE 'Normal: Events will broadcast when panic resolves'
    END AS recommended_action
  FROM deferred_events_realtime der
  WHERE der.minutes_oldest_deferred > 30;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION alert_stuck_deferred_events IS 'V8.5: Alert when deferred events are stuck for >30 minutes';

-- Run every 5 minutes via cron
-- SELECT * FROM alert_stuck_deferred_events();

-- ============================================================================
-- MONITORING: PANIC OVERRIDE EVENTS (P1 vs P4)
-- ============================================================================

CREATE TABLE panic_override_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  panic_event_id UUID NOT NULL REFERENCES panic_events(id),
  overridden_event_type TEXT NOT NULL, -- 'family_settings_changed', 'location_update', etc.
  overridden_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  broadcasted_after_panic BOOLEAN DEFAULT false,
  broadcast_delay_seconds INTEGER, -- Time between panic resolution and broadcast
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_panic_override_log_tenant ON panic_override_log(tenant_id, overridden_at DESC);
CREATE INDEX idx_panic_override_log_panic ON panic_override_log(panic_event_id);

COMMENT ON TABLE panic_override_log IS 'V8.5: Log of P4 events overridden by P1 panic events';

-- Function: Log panic overrides
CREATE OR REPLACE FUNCTION log_panic_override()
RETURNS TRIGGER AS $$
BEGIN
  -- Log each deferred event as a panic override
  INSERT INTO panic_override_log (
    tenant_id,
    panic_event_id,
    overridden_event_type
  )
  SELECT
    NEW.tenant_id,
    (SELECT id FROM panic_events WHERE tenant_id = NEW.tenant_id AND resolved_at IS NULL LIMIT 1),
    NEW.event_type
  WHERE NEW.defer_reason = 'active_panic';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_panic_override
  AFTER INSERT ON deferred_websocket_broadcasts
  FOR EACH ROW
  WHEN (NEW.defer_reason = 'active_panic')
  EXECUTE FUNCTION log_panic_override();

COMMENT ON TRIGGER trigger_log_panic_override ON deferred_websocket_broadcasts IS 'V8.5: Auto-log P4 events overridden by P1 panic';

-- ============================================================================
-- ANALYTICS: P4 EVENT LOSS DETECTION
-- ============================================================================

CREATE OR REPLACE VIEW p4_event_loss_detection AS
SELECT
  pol.tenant_id,
  pol.panic_event_id,
  COUNT(*) AS total_overridden_events,
  COUNT(*) FILTER (WHERE pol.broadcasted_after_panic = true) AS broadcasted_events,
  COUNT(*) FILTER (WHERE pol.broadcasted_after_panic = false) AS lost_events,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE pol.broadcasted_after_panic = true) / COUNT(*),
    2
  ) AS broadcast_success_rate
FROM panic_override_log pol
GROUP BY pol.tenant_id, pol.panic_event_id
HAVING COUNT(*) FILTER (WHERE pol.broadcasted_after_panic = false) > 0
ORDER BY lost_events DESC;

COMMENT ON VIEW p4_event_loss_detection IS 'V8.5: Detect P4 events that were not broadcasted after panic resolution';

-- Query: Check for lost events
SELECT * FROM p4_event_loss_detection;

-- Expected: broadcast_success_rate should be 100% (no lost events)
-- Alert if ANY tenant has lost_events > 0

-- ============================================================================
-- MONITORING: PG_NOTIFY LATENCY (MEDICATION REMINDERS)
-- ============================================================================

CREATE TABLE pg_notify_latency_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  event_type TEXT NOT NULL, -- 'medication_reminder', 'family_settings_changed', etc.
  priority_level INTEGER NOT NULL, -- 1=CRITICAL, 4=LOW
  
  -- Timing metrics
  event_created_at TIMESTAMPTZ NOT NULL, -- When event was created in database
  notify_sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- When pg_notify was called
  client_received_at TIMESTAMPTZ, -- When client received notification (populated by client)
  
  -- Latency calculations (milliseconds)
  db_to_notify_latency_ms NUMERIC(10, 2) GENERATED ALWAYS AS (
    EXTRACT(EPOCH FROM (notify_sent_at - event_created_at)) * 1000
  ) STORED,
  notify_to_client_latency_ms NUMERIC(10, 2), -- Populated by client
  total_latency_ms NUMERIC(10, 2), -- Populated by client
  
  -- Network info
  client_ip INET,
  client_user_agent TEXT
);

CREATE INDEX idx_pg_notify_latency_tenant ON pg_notify_latency_log(tenant_id, notify_sent_at DESC);
CREATE INDEX idx_pg_notify_latency_type ON pg_notify_latency_log(event_type, notify_sent_at DESC);
CREATE INDEX idx_pg_notify_latency_priority ON pg_notify_latency_log(priority_level, notify_sent_at DESC);

COMMENT ON TABLE pg_notify_latency_log IS 'V8.5: pg_notify latency metrics for real-time monitoring';

-- ============================================================================
-- ANALYTICS: PG_NOTIFY LATENCY BY HOUR (PEAK DETECTION)
-- ============================================================================

CREATE OR REPLACE VIEW pg_notify_latency_by_hour AS
SELECT
  event_type,
  priority_level,
  EXTRACT(HOUR FROM notify_sent_at) AS hour_of_day,
  COUNT(*) AS notification_count,
  AVG(db_to_notify_latency_ms) AS avg_db_to_notify_ms,
  MAX(db_to_notify_latency_ms) AS max_db_to_notify_ms,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY db_to_notify_latency_ms) AS p95_db_to_notify_ms,
  AVG(notify_to_client_latency_ms) AS avg_notify_to_client_ms,
  MAX(notify_to_client_latency_ms) AS max_notify_to_client_ms,
  AVG(total_latency_ms) AS avg_total_latency_ms,
  MAX(total_latency_ms) AS max_total_latency_ms
FROM pg_notify_latency_log
WHERE notify_sent_at > NOW() - INTERVAL '7 days'
GROUP BY event_type, priority_level, EXTRACT(HOUR FROM notify_sent_at)
ORDER BY hour_of_day, priority_level;

COMMENT ON VIEW pg_notify_latency_by_hour IS 'V8.5: pg_notify latency grouped by hour (detect peak hours)';

-- Query: Find peak hours with high latency
SELECT * FROM pg_notify_latency_by_hour WHERE avg_total_latency_ms > 500 ORDER BY avg_total_latency_ms DESC;

-- Expected: Medication reminders (evening hours 6-9 PM) may show higher latency
-- Alert if max_total_latency_ms > 2000ms (2 seconds)

-- ============================================================================
-- FUNCTION: LOG PG_NOTIFY LATENCY (CALLED BY TRIGGERS)
-- ============================================================================

CREATE OR REPLACE FUNCTION log_pg_notify_latency(
  p_tenant_id UUID,
  p_event_type TEXT,
  p_priority_level INTEGER,
  p_event_created_at TIMESTAMPTZ
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO pg_notify_latency_log (
    tenant_id,
    event_type,
    priority_level,
    event_created_at
  ) VALUES (
    p_tenant_id,
    p_event_type,
    p_priority_level,
    p_event_created_at
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION log_pg_notify_latency IS 'V8.5: Log pg_notify latency for monitoring (called by broadcast triggers)';

-- ============================================================================
-- ENHANCED PANIC BROADCAST (WITH LATENCY LOGGING)
-- ============================================================================

CREATE OR REPLACE FUNCTION broadcast_panic_event()
RETURNS TRIGGER AS $$
DECLARE
  payload JSONB;
  all_users UUID[];
  priority_config RECORD;
  latency_log_id UUID;
BEGIN
  -- Log latency
  latency_log_id := log_pg_notify_latency(
    NEW.tenant_id,
    'panic_triggered',
    1, -- CRITICAL priority
    NEW.triggered_at
  );
  
  -- Get priority config
  SELECT * INTO priority_config
  FROM websocket_priority_config
  WHERE event_type = 'panic_triggered';
  
  -- Build CRITICAL priority payload
  payload := jsonb_build_object(
    'event', 'panic_triggered',
    'priority', priority_config.priority_level,
    'overrideChannels', priority_config.override_channels,
    'tenantId', NEW.tenant_id,
    'panicEventId', NEW.id,
    'timestamp', extract(epoch from NEW.triggered_at) * 1000,
    'latencyLogId', latency_log_id, -- Include for client-side latency tracking
    'location', jsonb_build_object(
      'lat', NEW.location_lat,
      'lng', NEW.location_lng
    ),
    'requiresImmediateAction', true,
    'forceReload', true
  );
  
  -- Broadcast on dedicated panic channel
  PERFORM pg_notify('panic_events', payload::TEXT);
  
  RAISE NOTICE 'CRITICAL PRIORITY: Panic event broadcast (tenant %, event %, latency_log %)',
    NEW.tenant_id, NEW.id, latency_log_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
DROP TRIGGER IF EXISTS trigger_broadcast_panic_event ON panic_events;
CREATE TRIGGER trigger_broadcast_panic_event
  AFTER INSERT ON panic_events
  FOR EACH ROW
  EXECUTE FUNCTION broadcast_panic_event();

COMMENT ON TRIGGER trigger_broadcast_panic_event ON panic_events IS 'V8.5: Broadcast panic events with latency logging';

-- ============================================================================
-- CLIENT-SIDE LATENCY REPORTING (TYPESCRIPT)
-- ============================================================================

/*
// CLIENT-SIDE LATENCY TRACKING (React/TypeScript)

interface WebSocketMessage {
  event: string;
  timestamp: number; // Server timestamp (milliseconds since epoch)
  latencyLogId: string; // UUID from pg_notify_latency_log
  [key: string]: any;
}

async function reportClientLatency(message: WebSocketMessage) {
  const clientReceivedAt = Date.now(); // Client timestamp (ms)
  const serverSentAt = message.timestamp; // Server timestamp (ms)
  
  const notifyToClientLatency = clientReceivedAt - serverSentAt;
  
  // Report back to server
  await supabase.rpc('update_pg_notify_latency', {
    p_log_id: message.latencyLogId,
    p_client_received_at: new Date(clientReceivedAt).toISOString(),
    p_notify_to_client_latency_ms: notifyToClientLatency,
  });
  
  console.log(`WebSocket latency: ${notifyToClientLatency}ms`);
  
  // Alert if latency > 1 second
  if (notifyToClientLatency > 1000) {
    console.warn(`High WebSocket latency detected: ${notifyToClientLatency}ms`);
  }
}

// Supabase channel setup with latency tracking
useEffect(() => {
  const panicChannel = supabase
    .channel('panic_events')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'panic_events',
      filter: `tenant_id=eq.${tenantId}`,
    }, (payload) => {
      const message = payload.new as WebSocketMessage;
      
      // Report latency
      reportClientLatency(message);
      
      // Handle message
      websocketHandler.processMessage(message);
    })
    .subscribe();
  
  return () => panicChannel.unsubscribe();
}, [tenantId]);
*/

-- Function: Update client latency (called by client)
CREATE OR REPLACE FUNCTION update_pg_notify_latency(
  p_log_id UUID,
  p_client_received_at TIMESTAMPTZ,
  p_notify_to_client_latency_ms NUMERIC
)
RETURNS void AS $$
BEGIN
  UPDATE pg_notify_latency_log
  SET
    client_received_at = p_client_received_at,
    notify_to_client_latency_ms = p_notify_to_client_latency_ms,
    total_latency_ms = db_to_notify_latency_ms + p_notify_to_client_latency_ms
  WHERE id = p_log_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_pg_notify_latency IS 'V8.5: Update latency log with client-side metrics';

-- ============================================================================
-- ALERT: HIGH LATENCY SPIKE DETECTION
-- ============================================================================

CREATE OR REPLACE FUNCTION alert_high_latency_spike()
RETURNS TABLE (
  alert_level TEXT,
  event_type TEXT,
  hour_of_day NUMERIC,
  avg_latency_ms NUMERIC,
  max_latency_ms NUMERIC,
  notification_count INTEGER,
  recommended_action TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    CASE
      WHEN max_total_latency_ms > 2000 THEN 'CRITICAL'
      WHEN avg_total_latency_ms > 1000 THEN 'WARNING'
      WHEN avg_total_latency_ms > 500 THEN 'INFO'
      ELSE 'NORMAL'
    END AS alert_level,
    pnl.event_type,
    pnl.hour_of_day,
    pnl.avg_total_latency_ms,
    pnl.max_total_latency_ms,
    pnl.notification_count,
    CASE
      WHEN max_total_latency_ms > 2000 THEN 'CRITICAL: Scale database connections, check network'
      WHEN avg_total_latency_ms > 1000 THEN 'WARNING: Monitor closely, consider caching'
      WHEN avg_total_latency_ms > 500 THEN 'INFO: Normal peak hour load'
      ELSE 'NORMAL: No action needed'
    END AS recommended_action
  FROM pg_notify_latency_by_hour pnl
  WHERE pnl.avg_total_latency_ms > 500;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION alert_high_latency_spike IS 'V8.5: Alert when pg_notify latency spikes above thresholds';

-- Run every 10 minutes via cron
-- SELECT * FROM alert_high_latency_spike();

-- ============================================================================
-- DATABASE SCALING: CONNECTION POOL MONITORING
-- ============================================================================

CREATE OR REPLACE VIEW database_connection_stats AS
SELECT
  datname AS database_name,
  COUNT(*) AS total_connections,
  COUNT(*) FILTER (WHERE state = 'active') AS active_connections,
  COUNT(*) FILTER (WHERE state = 'idle') AS idle_connections,
  COUNT(*) FILTER (WHERE state = 'idle in transaction') AS idle_in_transaction,
  MAX(EXTRACT(EPOCH FROM (NOW() - state_change))) AS max_connection_age_seconds
FROM pg_stat_activity
WHERE datname = current_database()
GROUP BY datname;

COMMENT ON VIEW database_connection_stats IS 'V8.5: Real-time database connection pool statistics';

-- Query: Check connection pool health
SELECT * FROM database_connection_stats;

-- Alert if:
-- - total_connections > 80% of max_connections (default 100)
-- - idle_in_transaction > 10 (potential blocking queries)
-- - max_connection_age_seconds > 3600 (1 hour - potential leak)

-- ============================================================================
-- MONITORING DASHBOARD SUMMARY (24-HOUR WATCH)
-- ============================================================================

CREATE OR REPLACE VIEW beta_monitoring_dashboard AS
SELECT
  'Deferred Events' AS metric_category,
  COUNT(*) AS value,
  'pending events' AS unit,
  CASE
    WHEN COUNT(*) = 0 THEN 'HEALTHY'
    WHEN COUNT(*) < 10 THEN 'NORMAL'
    WHEN COUNT(*) < 50 THEN 'WARNING'
    ELSE 'CRITICAL'
  END AS status
FROM deferred_websocket_broadcasts
WHERE status = 'pending'

UNION ALL

SELECT
  'Panic Overrides',
  COUNT(*),
  'overridden events',
  CASE
    WHEN COUNT(*) FILTER (WHERE broadcasted_after_panic = false) = 0 THEN 'HEALTHY'
    WHEN COUNT(*) FILTER (WHERE broadcasted_after_panic = false) < 5 THEN 'WARNING'
    ELSE 'CRITICAL'
  END
FROM panic_override_log
WHERE overridden_at > NOW() - INTERVAL '24 hours'

UNION ALL

SELECT
  'WebSocket Latency (Avg)',
  COALESCE(AVG(total_latency_ms), 0),
  'milliseconds',
  CASE
    WHEN AVG(total_latency_ms) IS NULL THEN 'NO_DATA'
    WHEN AVG(total_latency_ms) < 500 THEN 'HEALTHY'
    WHEN AVG(total_latency_ms) < 1000 THEN 'NORMAL'
    WHEN AVG(total_latency_ms) < 2000 THEN 'WARNING'
    ELSE 'CRITICAL'
  END
FROM pg_notify_latency_log
WHERE notify_sent_at > NOW() - INTERVAL '1 hour'

UNION ALL

SELECT
  'Database Connections',
  total_connections,
  'connections',
  CASE
    WHEN total_connections < 50 THEN 'HEALTHY'
    WHEN total_connections < 80 THEN 'NORMAL'
    WHEN total_connections < 100 THEN 'WARNING'
    ELSE 'CRITICAL'
  END
FROM database_connection_stats;

COMMENT ON VIEW beta_monitoring_dashboard IS 'V8.5: Real-time beta monitoring dashboard (refresh every 30 seconds)';

-- Query: Real-time dashboard
SELECT * FROM beta_monitoring_dashboard ORDER BY metric_category;

-- Expected output:
-- | metric_category           | value | unit                 | status   |
-- |---------------------------|-------|----------------------|----------|
-- | Database Connections      | 45    | connections          | HEALTHY  |
-- | Deferred Events           | 0     | pending events       | HEALTHY  |
-- | Panic Overrides           | 3     | overridden events    | HEALTHY  |
-- | WebSocket Latency (Avg)   | 320   | milliseconds         | HEALTHY  |

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT ON deferred_events_realtime TO authenticated;
GRANT SELECT ON p4_event_loss_detection TO authenticated;
GRANT SELECT ON pg_notify_latency_by_hour TO authenticated;
GRANT SELECT ON database_connection_stats TO authenticated;
GRANT SELECT ON beta_monitoring_dashboard TO authenticated;
GRANT EXECUTE ON FUNCTION alert_stuck_deferred_events TO authenticated;
GRANT EXECUTE ON FUNCTION alert_high_latency_spike TO authenticated;
GRANT EXECUTE ON FUNCTION update_pg_notify_latency TO authenticated;

-- End of V8.5 Beta Monitoring Queries
