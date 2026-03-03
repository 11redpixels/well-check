# Well-Check Database Deployment Guide
## Production-Ready SQL Migration (V1.0)

**Schema Version:** 1.0.0  
**Last Updated:** 2026-02-17  
**Target:** Supabase / PostgreSQL 14+

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### Prerequisites
- [ ] PostgreSQL 14 or higher installed
- [ ] Supabase project created (or self-hosted Postgres)
- [ ] Database connection string obtained
- [ ] Service role key (for Supabase)
- [ ] Backup of existing data (if upgrading)

### Environment Setup
```bash
# Required environment variables
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_KEY="your-service-role-key"
export DATABASE_URL="postgresql://postgres:password@db.your-project.supabase.co:5432/postgres"
```

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Connect to Database

#### Option A: Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Paste contents of `well_check_core_v1.sql`
5. Click **Run**

#### Option B: psql Command Line
```bash
psql $DATABASE_URL -f well_check_core_v1.sql
```

#### Option C: Supabase CLI
```bash
supabase db push
# Or for migration:
supabase migration new well_check_core_v1
# Copy SQL to migrations folder
supabase db push
```

---

### Step 2: Verify Deployment

Run these validation queries in SQL Editor:

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'tenants', 'users', 'family_members', 'ping_requests',
    'verified_pulses', 'emergency_events', 'audit_logs', 'proximity_snapshots'
  )
ORDER BY table_name;
-- Expected: 8 tables

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename LIKE '%'
ORDER BY tablename;
-- Expected: rowsecurity = true for all tables

-- Check audit log immutability
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'audit_logs' 
  AND policyname LIKE '%Prevent%';
-- Expected: 2 policies (UPDATE & DELETE blocked)

-- Test Haversine function
SELECT calculate_proximity_distance(
  37.7749, -122.4194,  -- San Francisco
  37.7849, -122.4094   -- ~0.7 miles away
) AS distance_miles;
-- Expected: ~0.7 miles

-- Test distance zone function
SELECT get_distance_zone(0.5) AS zone;  -- Expected: nearby
SELECT get_distance_zone(3) AS zone;    -- Expected: moderate
SELECT get_distance_zone(10) AS zone;   -- Expected: far
```

---

### Step 3: Set Up Automated Cleanup Jobs

#### Option A: Supabase pg_cron Extension

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily cleanup at 2 AM UTC
SELECT cron.schedule(
  'cleanup-expired-pulses',
  '0 2 * * *',
  'SELECT cleanup_expired_verified_pulses();'
);

SELECT cron.schedule(
  'cleanup-expired-proximity',
  '0 2 * * *',
  'SELECT cleanup_expired_proximity_snapshots();'
);

SELECT cron.schedule(
  'archive-old-audit-logs',
  '0 3 1 * *',  -- 1st of each month at 3 AM
  'SELECT archive_old_audit_logs();'
);

-- Schedule ping timeout check every minute
SELECT cron.schedule(
  'timeout-stale-pings',
  '* * * * *',
  'SELECT timeout_stale_pings();'
);

-- View scheduled jobs
SELECT * FROM cron.job;
```

#### Option B: Supabase Edge Function (Recommended)

Create `/functions/database-maintenance/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    // Run cleanup functions
    const { data: pulses } = await supabase.rpc("cleanup_expired_verified_pulses");
    const { data: proximity } = await supabase.rpc("cleanup_expired_proximity_snapshots");
    const { data: pings } = await supabase.rpc("timeout_stale_pings");

    return new Response(
      JSON.stringify({
        success: true,
        deleted_pulses: pulses,
        deleted_proximity: proximity,
        timed_out_pings: pings,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
});
```

Deploy and schedule via Supabase Dashboard:
- **Functions** → **Create Function** → Upload `database-maintenance`
- **Database** → **Cron Jobs** → Schedule to trigger edge function daily

---

### Step 4: Configure Realtime Subscriptions

Enable Realtime for tables that need live updates:

```sql
-- Enable Realtime on key tables
ALTER PUBLICATION supabase_realtime ADD TABLE family_members;
ALTER PUBLICATION supabase_realtime ADD TABLE emergency_events;
ALTER PUBLICATION supabase_realtime ADD TABLE ping_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE verified_pulses;
```

In Supabase Dashboard:
1. Go to **Database** → **Replication**
2. Enable Realtime for these tables:
   - ✅ `family_members`
   - ✅ `emergency_events`
   - ✅ `ping_requests`
   - ✅ `verified_pulses`

---

### Step 5: Test RLS Policies

Create test users to verify tenant isolation:

```sql
-- Create test tenants
INSERT INTO tenants (id, family_code, family_name) VALUES
  ('11111111-1111-1111-1111-111111111111', 'TEST-001', 'Test Family A'),
  ('22222222-2222-2222-2222-222222222222', 'TEST-002', 'Test Family B');

-- Create test users (you'll need to create these in Supabase Auth first)
-- Then link them here:
INSERT INTO users (auth_user_id, tenant_id, name, email, role) VALUES
  ('auth-user-1', '11111111-1111-1111-1111-111111111111', 'Alice', 'alice@test.com', 'monitor'),
  ('auth-user-2', '22222222-2222-2222-2222-222222222222', 'Bob', 'bob@test.com', 'monitor');

-- Test: Alice should NOT see Bob's tenant
-- Run this query as Alice (using her auth token):
SELECT * FROM family_members WHERE tenant_id = '22222222-2222-2222-2222-222222222222';
-- Expected: 0 rows (RLS blocks access)

-- Test: Alice CAN see her own tenant
SELECT * FROM family_members WHERE tenant_id = '11111111-1111-1111-1111-111111111111';
-- Expected: Alice's family members only
```

---

## 🔒 SECURITY VALIDATION

### RLS Policy Audit

Run this query to ensure all policies are active:

```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Expected Results:**
- `tenants`: 1 SELECT policy
- `users`: 2 policies (SELECT, UPDATE)
- `family_members`: 2 policies (SELECT, UPDATE)
- `ping_requests`: 3 policies (SELECT, INSERT, UPDATE)
- `verified_pulses`: 2 policies (SELECT, INSERT)
- `emergency_events`: 3 policies (SELECT, INSERT, UPDATE)
- `audit_logs`: 3 policies (SELECT, PREVENT UPDATE, PREVENT DELETE)
- `proximity_snapshots`: 1 SELECT policy

**Total: 18 policies**

---

### Audit Log Immutability Test

```sql
-- Try to update an audit log (should FAIL)
UPDATE audit_logs SET event_type = 'test' WHERE id = (SELECT id FROM audit_logs LIMIT 1);
-- Expected: ERROR: new row violates row-level security policy

-- Try to delete an audit log (should FAIL)
DELETE FROM audit_logs WHERE id = (SELECT id FROM audit_logs LIMIT 1);
-- Expected: ERROR: new row violates row-level security policy

-- Insert should work (from trigger only)
-- Manual inserts blocked by lack of INSERT policy
```

---

## 📊 PERFORMANCE TESTING

### Index Coverage Check

```sql
-- Find missing indexes on foreign keys
SELECT 
  tc.table_name, 
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = tc.table_name 
    AND indexdef LIKE '%' || kcu.column_name || '%'
  );
-- Expected: 0 rows (all foreign keys indexed)
```

### Query Performance Test

```sql
-- Test: Find active pings for a tenant (should be <10ms)
EXPLAIN ANALYZE
SELECT * FROM ping_requests 
WHERE tenant_id = '11111111-1111-1111-1111-111111111111' 
  AND status = 'pending';

-- Test: Find low battery members (should be <10ms)
EXPLAIN ANALYZE
SELECT * FROM family_members 
WHERE tenant_id = '11111111-1111-1111-1111-111111111111' 
  AND battery_level < 15;

-- Test: Calculate proximity (should be <5ms)
EXPLAIN ANALYZE
SELECT calculate_proximity_distance(37.7749, -122.4194, 37.7849, -122.4094);
```

**Performance Targets:**
- Tenant-scoped queries: <50ms (indexed on tenant_id)
- Proximity calculation: <5ms (pure math, immutable)
- Audit log writes: <10ms (async triggers)

---

## 🔄 ROLLBACK PROCEDURE

If deployment fails or issues arise:

```sql
-- Step 1: Disable RLS (to regain access)
ALTER TABLE tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE family_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE ping_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE verified_pulses DISABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE proximity_snapshots DISABLE ROW LEVEL SECURITY;

-- Step 2: Export critical data
\copy audit_logs TO '/tmp/audit_logs_backup.csv' CSV HEADER;
\copy emergency_events TO '/tmp/emergency_events_backup.csv' CSV HEADER;

-- Step 3: Drop schema (DANGER!)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- Step 4: Restore from backup
-- (Re-run previous schema version or restore from dump)
```

---

## 📈 MONITORING SETUP

### Supabase Dashboard Metrics

Monitor these metrics in **Database** → **Observability**:

1. **Query Performance**
   - Slow queries (>100ms)
   - Most frequent queries
   - Query errors

2. **Table Size**
   - `audit_logs` (should grow linearly)
   - `proximity_snapshots` (should stay stable ~7 days)
   - `verified_pulses` (should stay stable ~24 hours)

3. **Connection Pool**
   - Active connections
   - Connection errors

### Custom Monitoring Queries

```sql
-- Table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Recent audit log growth
SELECT 
  DATE(server_timestamp) AS date,
  event_type,
  COUNT(*) AS event_count
FROM audit_logs
WHERE server_timestamp > NOW() - INTERVAL '7 days'
GROUP BY DATE(server_timestamp), event_type
ORDER BY date DESC, event_count DESC;

-- Active emergencies
SELECT 
  COUNT(*) AS active_count,
  AVG(EXTRACT(EPOCH FROM (NOW() - triggered_at))) / 60 AS avg_duration_minutes
FROM emergency_events
WHERE status = 'active';

-- Battery health distribution
SELECT 
  CASE 
    WHEN battery_level < 15 THEN 'Critical (<15%)'
    WHEN battery_level < 30 THEN 'Low (15-30%)'
    WHEN battery_level < 60 THEN 'Medium (30-60%)'
    ELSE 'Good (60%+)'
  END AS battery_status,
  COUNT(*) AS member_count
FROM family_members
GROUP BY battery_status
ORDER BY MIN(battery_level);
```

---

## 🧪 INTEGRATION TESTING

### Frontend Connection Test

```typescript
// /src/app/lib/supabase-test.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Test 1: Haversine function
async function testProximityCalculation() {
  const { data, error } = await supabase.rpc('calculate_proximity_distance', {
    lat1: 37.7749,
    lon1: -122.4194,
    lat2: 37.7849,
    lon2: -122.4094,
  });
  
  console.assert(data > 0.6 && data < 0.8, 'Distance should be ~0.7 miles');
  console.log('✅ Proximity calculation works:', data);
}

// Test 2: RLS enforcement
async function testRLSIsolation() {
  // Should return 0 rows if not authenticated
  const { data, error } = await supabase
    .from('family_members')
    .select('*');
  
  console.assert(data?.length === 0 || error, 'RLS should block unauthenticated access');
  console.log('✅ RLS isolation works');
}

// Test 3: Audit log trigger
async function testAuditLogTrigger() {
  const { data: pulse, error } = await supabase
    .from('verified_pulses')
    .insert({
      tenant_id: 'test-tenant',
      user_id: 'test-user',
      user_name: 'Test',
      location: { lat: 37.7749, lng: -122.4194, accuracy: 10, timestamp: Date.now() },
      battery_level: 75,
    })
    .select()
    .single();
  
  // Check audit log was created
  const { data: auditLog } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('event_type', 'ping_replied')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  console.assert(auditLog?.metadata?.battery_at_time_of_ping === 75, 'Audit log should capture battery');
  console.log('✅ Audit log trigger works');
}

// Run all tests
testProximityCalculation();
testRLSIsolation();
testAuditLogTrigger();
```

---

## 📚 REFERENCE DOCUMENTS

- **Full Schema Documentation:** `/guidelines/LEVEL_2_SYSTEM_BLUEPRINT_V2.md`
- **State Transitions:** `/STATE_TRANSITION_MATRIX.md`
- **Migration Guide:** `/SCHEMA_MIGRATION_V5.md`
- **Type Definitions:** `/src/app/types/index.ts`

---

## 🆘 TROUBLESHOOTING

### Common Issues

#### Issue: RLS blocks all queries
**Symptom:** `SELECT * FROM family_members` returns 0 rows even with data  
**Cause:** User not authenticated or `auth.uid()` not set  
**Fix:**
```sql
-- Check if auth context is set
SELECT auth.uid();

-- If NULL, ensure JWT token is passed in Authorization header:
-- Authorization: Bearer YOUR_SUPABASE_JWT_TOKEN
```

#### Issue: Haversine function returns NULL
**Symptom:** `calculate_proximity_distance()` returns NULL  
**Cause:** NULL latitude/longitude inputs  
**Fix:**
```sql
-- Check for NULL values
SELECT * FROM family_members WHERE last_location IS NULL;

-- Update with default location
UPDATE family_members 
SET last_location = '{"lat": 0, "lng": 0, "accuracy": 999, "timestamp": 0}'::jsonb
WHERE last_location IS NULL;
```

#### Issue: Audit logs not populating
**Symptom:** No rows in `audit_logs` after creating records  
**Cause:** Triggers not firing  
**Fix:**
```sql
-- Check triggers exist
SELECT tgname, tgenabled FROM pg_trigger WHERE tgrelid = 'verified_pulses'::regclass;

-- Re-create trigger if missing
CREATE TRIGGER audit_verified_pulse_trigger
  AFTER INSERT ON verified_pulses
  FOR EACH ROW
  EXECUTE FUNCTION audit_verified_pulse();
```

#### Issue: Cleanup jobs not running
**Symptom:** Old records not being deleted  
**Cause:** pg_cron not scheduled or edge function not deployed  
**Fix:**
```sql
-- Check pg_cron jobs
SELECT * FROM cron.job;

-- Manually run cleanup
SELECT cleanup_expired_verified_pulses();
SELECT cleanup_expired_proximity_snapshots();
```

---

## ✅ POST-DEPLOYMENT CHECKLIST

- [ ] All 8 tables created successfully
- [ ] RLS enabled on all tables (18 policies active)
- [ ] Haversine function works (test with known coordinates)
- [ ] Audit triggers fire on INSERT (test with verified_pulses)
- [ ] Cleanup jobs scheduled (pg_cron or edge function)
- [ ] Realtime enabled on key tables
- [ ] Performance tests pass (<100ms queries)
- [ ] Tenant isolation verified (RLS test)
- [ ] Monitoring dashboards configured
- [ ] Backup strategy in place

---

## 📞 SUPPORT

**Schema Issues:** Refer to `/guidelines/LEVEL_2_SYSTEM_BLUEPRINT_V2.md`  
**Supabase Support:** https://supabase.com/docs  
**PostgreSQL Docs:** https://www.postgresql.org/docs/14/

---

**Deployment Status:** Ready for Production ✅  
**Schema Version:** 1.0.0  
**Last Validated:** 2026-02-17
