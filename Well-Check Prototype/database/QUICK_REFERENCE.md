# Well-Check Database Quick Reference
## Developer Cheat Sheet

**Version:** 1.0.0 | **Last Updated:** 2026-02-17

---

## 🗄️ TABLE STRUCTURE

```
tenants (Family Groups)
  ├── users (Auth & RBAC)
  │   └── family_members (Real-time Status View)
  │       ├── ping_requests (Smart Ping Loop)
  │       │   └── verified_pulses (Safety Confirmations)
  │       └── emergency_events (Panic Mode)
  │
  ├── audit_logs (Immutable Event Log)
  └── proximity_snapshots (Distance Calculations)
```

---

## 🔑 KEY CONCEPTS

### Multi-Tenancy
**Every row is scoped to `tenant_id`**
- RLS enforces: `WHERE tenant_id IN (SELECT tenant_id FROM users WHERE auth_user_id = auth.uid())`
- No user can ever see another family's data

### Immutability
**`audit_logs` is append-only**
- RLS blocks UPDATE and DELETE
- Triggers auto-populate from other tables
- Liability protection for safety events

### Offline-First
**`sync_mode` drives behavior**
- `normal`: Every 30s or >50m movement
- `high_frequency`: Every 5s during panic
- `offline_queue`: Store locally, sync when online

---

## 📝 COMMON QUERIES

### Get Family Members (with Battery Status)
```sql
SELECT 
  id,
  name,
  role,
  is_online,
  battery_level,
  CASE 
    WHEN battery_level < 15 THEN 'CRITICAL'
    WHEN battery_level < 30 THEN 'LOW'
    ELSE 'OK'
  END AS battery_status,
  last_seen
FROM family_members
WHERE tenant_id = $1
ORDER BY battery_level ASC;
```

### Get Active Pings
```sql
SELECT 
  pr.*,
  (sent_at + INTERVAL '30 seconds') - NOW() AS time_remaining
FROM ping_requests pr
WHERE tenant_id = $1
  AND status = 'pending'
  AND sent_at > NOW() - INTERVAL '30 seconds'
ORDER BY sent_at DESC;
```

### Get Active Emergencies
```sql
SELECT 
  ee.*,
  EXTRACT(EPOCH FROM (NOW() - triggered_at)) / 60 AS duration_minutes
FROM emergency_events ee
WHERE tenant_id = $1
  AND status = 'active'
ORDER BY triggered_at DESC;
```

### Calculate Proximity Between Users
```sql
SELECT 
  from_user.name AS from_name,
  to_user.name AS to_name,
  calculate_proximity_distance(
    (from_user.last_location->>'lat')::NUMERIC,
    (from_user.last_location->>'lng')::NUMERIC,
    (to_user.last_location->>'lat')::NUMERIC,
    (to_user.last_location->>'lng')::NUMERIC
  ) AS distance_miles,
  get_distance_zone(
    calculate_proximity_distance(...)
  ) AS zone
FROM family_members from_user
CROSS JOIN family_members to_user
WHERE from_user.tenant_id = $1
  AND to_user.tenant_id = $1
  AND from_user.id != to_user.id
  AND from_user.last_location IS NOT NULL
  AND to_user.last_location IS NOT NULL;
```

### Get Audit Trail for User
```sql
SELECT 
  event_type,
  event_data,
  metadata->>'battery_at_time_of_ping' AS battery,
  metadata->>'gps_accuracy' AS gps,
  server_timestamp
FROM audit_logs
WHERE tenant_id = $1
  AND user_id = $2
ORDER BY server_timestamp DESC
LIMIT 50;
```

---

## 🔧 FUNCTIONS

### Distance Calculation
```sql
-- Haversine distance in miles
SELECT calculate_proximity_distance(
  37.7749, -122.4194,  -- San Francisco
  37.7849, -122.4094   -- ~0.7 miles away
);

-- Distance with zone label
SELECT * FROM calculate_proximity_with_zone(
  37.7749, -122.4194,
  37.7849, -122.4094
);
-- Returns: { distance_miles: 0.7, zone: 'nearby' }
```

### User Role Check
```sql
-- Check if user is a monitor
SELECT user_has_role(
  'auth-user-id',
  'monitor'::user_role
);
```

### Cleanup (Manual Trigger)
```sql
-- Delete expired records
SELECT cleanup_expired_verified_pulses();     -- Returns: count deleted
SELECT cleanup_expired_proximity_snapshots(); -- Returns: count deleted
SELECT timeout_stale_pings();                 -- Returns: count timed out
SELECT archive_old_audit_logs();              -- Returns: count archived
```

---

## 🔒 RLS PATTERNS

### Check Current User's Tenant
```sql
-- Get current user's tenant_id
SELECT tenant_id 
FROM users 
WHERE auth_user_id = auth.uid();
```

### Test RLS as Specific User
```sql
-- In Supabase Dashboard, use "Run as" feature
-- Or set JWT token in Authorization header
```

### Bypass RLS (Service Role Only)
```sql
-- Use service_role key (NOT anon key)
-- RLS is disabled for service_role
-- ⚠️ Use only in Edge Functions or backend
```

---

## 📊 ENUMS

```sql
-- User Roles
'primary_user' | 'monitor' | 'super_admin'

-- Ping Status
'pending' | 'replied' | 'timeout'

-- GPS Accuracy
'high' | 'medium' | 'low' | 'none'

-- Emergency Status
'active' | 'resolved' | 'false_alarm'

-- Sync Mode
'normal' | 'high_frequency' | 'offline_queue'

-- Distance Zone
'nearby' | 'moderate' | 'far'

-- Event Type
'ping_sent' | 'ping_replied' | 'ping_timeout' |
'panic_triggered' | 'panic_resolved' | 'panic_cancelled' |
'user_joined' | 'user_left' | 'status_change' |
'location_update' | 'battery_alert'
```

---

## 🎯 FRONTEND INTEGRATION

### Supabase Client Setup
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

### Query Family Members
```typescript
const { data: members, error } = await supabase
  .from('family_members')
  .select('*')
  .order('name');
```

### Send Ping (with Battery Metadata)
```typescript
const { data, error } = await supabase
  .from('ping_requests')
  .insert({
    tenant_id: currentUser.tenantId,
    from_user_id: currentUser.id,
    from_user_name: currentUser.name,
    to_user_id: targetUser.id,
    to_user_name: targetUser.name,
    metadata: {
      battery_at_time_of_ping: batteryLevel,
      gps_accuracy: 'high',
      network_latency_ms: 45,
    },
  })
  .select()
  .single();
```

### Trigger Panic
```typescript
const { data, error } = await supabase
  .from('emergency_events')
  .insert({
    tenant_id: currentUser.tenantId,
    triggered_by_user_id: currentUser.id,
    triggered_by_user_name: currentUser.name,
    location: {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: Date.now(),
    },
    force_high_accuracy: true,
  })
  .select()
  .single();
```

### Calculate Proximity (RPC Call)
```typescript
const { data: distance, error } = await supabase.rpc(
  'calculate_proximity_distance',
  {
    lat1: userA.location.lat,
    lon1: userA.location.lng,
    lat2: userB.location.lat,
    lon2: userB.location.lng,
  }
);

console.log(`Distance: ${distance} miles`);
```

### Subscribe to Realtime Updates
```typescript
// Emergency events
const channel = supabase
  .channel('emergency-updates')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'emergency_events',
      filter: `tenant_id=eq.${currentUser.tenantId}`,
    },
    (payload) => {
      console.log('Emergency update:', payload.new);
    }
  )
  .subscribe();

// Family member status
supabase
  .channel('family-status')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'family_members',
      filter: `tenant_id=eq.${currentUser.tenantId}`,
    },
    (payload) => {
      console.log('Status update:', payload.new);
    }
  )
  .subscribe();
```

---

## 🔍 DEBUGGING

### Check RLS Policies
```sql
-- List all policies for a table
\dRp+ family_members

-- Or query system catalog
SELECT * FROM pg_policies WHERE tablename = 'family_members';
```

### Check Triggers
```sql
-- List triggers for a table
SELECT 
  tgname AS trigger_name,
  tgtype AS trigger_type,
  tgenabled AS enabled
FROM pg_trigger
WHERE tgrelid = 'verified_pulses'::regclass;
```

### Check Index Usage
```sql
-- Find unused indexes
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan ASC;
```

### Explain Query Performance
```sql
EXPLAIN ANALYZE
SELECT * FROM family_members 
WHERE tenant_id = '00000000-0000-0000-0000-000000000001';
```

---

## 📈 PERFORMANCE TIPS

### Use Specific Columns
```sql
-- ❌ Bad: SELECT *
SELECT * FROM family_members WHERE tenant_id = $1;

-- ✅ Good: SELECT only needed columns
SELECT id, name, battery_level FROM family_members WHERE tenant_id = $1;
```

### Leverage Indexes
```sql
-- ✅ Indexed: tenant_id + status
SELECT * FROM ping_requests 
WHERE tenant_id = $1 AND status = 'pending';

-- ❌ Not indexed: ORDER BY random()
SELECT * FROM family_members ORDER BY random();
```

### Batch Proximity Calculations
```sql
-- ✅ Calculate all distances in one query
SELECT 
  from_user_id,
  to_user_id,
  calculate_proximity_distance(...) AS distance
FROM (
  SELECT 
    a.id AS from_user_id,
    b.id AS to_user_id,
    (a.last_location->>'lat')::NUMERIC AS from_lat,
    (a.last_location->>'lng')::NUMERIC AS from_lng,
    (b.last_location->>'lat')::NUMERIC AS to_lat,
    (b.last_location->>'lng')::NUMERIC AS to_lng
  FROM family_members a
  CROSS JOIN family_members b
  WHERE a.tenant_id = $1 AND b.tenant_id = $1 AND a.id < b.id
) pairs;
```

---

## 🚨 EMERGENCY OVERRIDES

### Manually Resolve Stuck Panic
```sql
UPDATE emergency_events
SET 
  status = 'resolved',
  resolved_by_user_id = $1,
  resolved_at = NOW(),
  resolution_notes = 'Manually resolved by admin'
WHERE id = $2;
```

### Force Timeout All Pending Pings
```sql
UPDATE ping_requests
SET 
  status = 'timeout',
  timeout_at = NOW()
WHERE status = 'pending';
```

### Clear Old Proximity Snapshots (Manual)
```sql
DELETE FROM proximity_snapshots
WHERE expires_at < NOW();
```

---

## 🔗 QUICK LINKS

- **Full Schema:** `/database/well_check_core_v1.sql`
- **Deployment Guide:** `/database/DEPLOYMENT_GUIDE.md`
- **System Blueprint:** `/guidelines/LEVEL_2_SYSTEM_BLUEPRINT_V2.md`
- **State Machine:** `/STATE_TRANSITION_MATRIX.md`
- **Type Definitions:** `/src/app/types/index.ts`

---

## 📋 SCHEMA VERSION HISTORY

| Version | Date | Changes |
|:--------|:-----|:--------|
| 1.0.0 | 2026-02-17 | Initial production schema |
| | | - 8 core tables |
| | | - 18 RLS policies |
| | | - 13 functions |
| | | - Battery-aware audit logs |
| | | - Emergency event system |
| | | - Proximity calculations |

---

**Keep this reference handy when building Well-Check features!**
