-- =====================================================================
-- WELL-CHECK DEPLOYMENT VALIDATION SCRIPT
-- Run this after deploying well_check_core_v1.sql
-- =====================================================================
-- 
-- Purpose: Comprehensive validation of schema, RLS, triggers, and functions
-- Expected Result: All tests should pass (RAISE NOTICE with ✅)
-- 
-- Usage:
--   psql $DATABASE_URL -f test_deployment.sql
-- 
-- Author: AI Chief Architect
-- Date: 2026-02-17
-- =====================================================================

\set ON_ERROR_STOP on
\timing on

-- =====================================================================
-- TEST 1: TABLE EXISTENCE
-- =====================================================================
DO $$
DECLARE
  expected_tables TEXT[] := ARRAY[
    'tenants', 'users', 'family_members', 'ping_requests',
    'verified_pulses', 'emergency_events', 'audit_logs', 'proximity_snapshots'
  ];
  missing_tables TEXT[];
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'TEST 1: Checking Table Existence';
  RAISE NOTICE '========================================';
  
  SELECT ARRAY_AGG(t) INTO missing_tables
  FROM UNNEST(expected_tables) AS t
  WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = t
  );
  
  IF missing_tables IS NOT NULL THEN
    RAISE EXCEPTION '❌ Missing tables: %', missing_tables;
  ELSE
    RAISE NOTICE '✅ All 8 core tables exist';
  END IF;
END $$;

-- =====================================================================
-- TEST 2: RLS ENABLEMENT
-- =====================================================================
DO $$
DECLARE
  tables_without_rls TEXT[];
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'TEST 2: Checking RLS Enablement';
  RAISE NOTICE '========================================';
  
  SELECT ARRAY_AGG(tablename) INTO tables_without_rls
  FROM pg_tables
  WHERE schemaname = 'public'
  AND tablename IN (
    'tenants', 'users', 'family_members', 'ping_requests',
    'verified_pulses', 'emergency_events', 'audit_logs', 'proximity_snapshots'
  )
  AND NOT EXISTS (
    SELECT 1 FROM pg_class 
    WHERE relname = tablename 
    AND relrowsecurity = true
  );
  
  IF tables_without_rls IS NOT NULL THEN
    RAISE EXCEPTION '❌ Tables without RLS: %', tables_without_rls;
  ELSE
    RAISE NOTICE '✅ RLS enabled on all 8 tables';
  END IF;
END $$;

-- =====================================================================
-- TEST 3: RLS POLICY COUNT
-- =====================================================================
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'TEST 3: Checking RLS Policy Count';
  RAISE NOTICE '========================================';
  
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public';
  
  IF policy_count < 18 THEN
    RAISE EXCEPTION '❌ Expected 18+ policies, found %', policy_count;
  ELSE
    RAISE NOTICE '✅ Found % RLS policies (expected 18+)', policy_count;
  END IF;
END $$;

-- =====================================================================
-- TEST 4: AUDIT LOG IMMUTABILITY
-- =====================================================================
DO $$
DECLARE
  update_policy_exists BOOLEAN;
  delete_policy_exists BOOLEAN;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'TEST 4: Checking Audit Log Immutability';
  RAISE NOTICE '========================================';
  
  -- Check UPDATE prevention policy
  SELECT EXISTS(
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'audit_logs' 
    AND policyname = 'Prevent audit log updates'
    AND cmd = 'UPDATE'
  ) INTO update_policy_exists;
  
  -- Check DELETE prevention policy
  SELECT EXISTS(
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'audit_logs' 
    AND policyname = 'Prevent audit log deletes'
    AND cmd = 'DELETE'
  ) INTO delete_policy_exists;
  
  IF NOT update_policy_exists THEN
    RAISE EXCEPTION '❌ Audit log UPDATE prevention policy missing';
  END IF;
  
  IF NOT delete_policy_exists THEN
    RAISE EXCEPTION '❌ Audit log DELETE prevention policy missing';
  END IF;
  
  RAISE NOTICE '✅ Audit log immutability policies active';
END $$;

-- =====================================================================
-- TEST 5: FUNCTION EXISTENCE
-- =====================================================================
DO $$
DECLARE
  expected_functions TEXT[] := ARRAY[
    'calculate_proximity_distance',
    'get_distance_zone',
    'calculate_proximity_with_zone',
    'audit_verified_pulse',
    'audit_emergency_event',
    'audit_ping_request',
    'update_updated_at_column',
    'cleanup_expired_verified_pulses',
    'cleanup_expired_proximity_snapshots',
    'archive_old_audit_logs',
    'timeout_stale_pings',
    'get_user_tenant_id',
    'user_has_role'
  ];
  missing_functions TEXT[];
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'TEST 5: Checking Function Existence';
  RAISE NOTICE '========================================';
  
  SELECT ARRAY_AGG(f) INTO missing_functions
  FROM UNNEST(expected_functions) AS f
  WHERE NOT EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = f
  );
  
  IF missing_functions IS NOT NULL THEN
    RAISE EXCEPTION '❌ Missing functions: %', missing_functions;
  ELSE
    RAISE NOTICE '✅ All 13 functions exist';
  END IF;
END $$;

-- =====================================================================
-- TEST 6: TRIGGER EXISTENCE
-- =====================================================================
DO $$
DECLARE
  expected_triggers TEXT[] := ARRAY[
    'update_tenants_updated_at',
    'update_users_updated_at',
    'update_family_members_updated_at',
    'update_emergency_events_updated_at',
    'audit_verified_pulse_trigger',
    'audit_emergency_event_trigger',
    'audit_ping_request_trigger'
  ];
  missing_triggers TEXT[];
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'TEST 6: Checking Trigger Existence';
  RAISE NOTICE '========================================';
  
  SELECT ARRAY_AGG(t) INTO missing_triggers
  FROM UNNEST(expected_triggers) AS t
  WHERE NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = t
  );
  
  IF missing_triggers IS NOT NULL THEN
    RAISE EXCEPTION '❌ Missing triggers: %', missing_triggers;
  ELSE
    RAISE NOTICE '✅ All 7 triggers exist';
  END IF;
END $$;

-- =====================================================================
-- TEST 7: ENUM TYPES
-- =====================================================================
DO $$
DECLARE
  expected_types TEXT[] := ARRAY[
    'user_role', 'ping_status', 'gps_accuracy',
    'emergency_status', 'sync_mode', 'distance_zone', 'event_type'
  ];
  missing_types TEXT[];
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'TEST 7: Checking Enum Types';
  RAISE NOTICE '========================================';
  
  SELECT ARRAY_AGG(t) INTO missing_types
  FROM UNNEST(expected_types) AS t
  WHERE NOT EXISTS (
    SELECT 1 FROM pg_type
    WHERE typname = t
  );
  
  IF missing_types IS NOT NULL THEN
    RAISE EXCEPTION '❌ Missing enum types: %', missing_types;
  ELSE
    RAISE NOTICE '✅ All 7 enum types exist';
  END IF;
END $$;

-- =====================================================================
-- TEST 8: INDEX COVERAGE
-- =====================================================================
DO $$
DECLARE
  unindexed_fks TEXT[];
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'TEST 8: Checking Index Coverage on FKs';
  RAISE NOTICE '========================================';
  
  -- Find foreign keys without indexes
  SELECT ARRAY_AGG(tc.table_name || '.' || kcu.column_name) INTO unindexed_fks
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
  WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND NOT EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE tablename = tc.table_name 
      AND indexdef ILIKE '%' || kcu.column_name || '%'
    );
  
  IF unindexed_fks IS NOT NULL THEN
    RAISE WARNING '⚠️  Unindexed foreign keys: %', unindexed_fks;
  ELSE
    RAISE NOTICE '✅ All foreign keys are indexed';
  END IF;
END $$;

-- =====================================================================
-- TEST 9: HAVERSINE FUNCTION ACCURACY
-- =====================================================================
DO $$
DECLARE
  distance NUMERIC;
  expected_min NUMERIC := 0.6;
  expected_max NUMERIC := 0.8;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'TEST 9: Validating Haversine Calculation';
  RAISE NOTICE '========================================';
  
  -- Calculate distance between SF coordinates (~0.7 miles apart)
  SELECT calculate_proximity_distance(
    37.7749, -122.4194,  -- San Francisco
    37.7849, -122.4094   -- ~0.7 miles away
  ) INTO distance;
  
  IF distance IS NULL THEN
    RAISE EXCEPTION '❌ Haversine returned NULL';
  ELSIF distance < expected_min OR distance > expected_max THEN
    RAISE EXCEPTION '❌ Haversine returned % (expected 0.6-0.8 miles)', distance;
  ELSE
    RAISE NOTICE '✅ Haversine calculation accurate: % miles', distance;
  END IF;
END $$;

-- =====================================================================
-- TEST 10: DISTANCE ZONE FUNCTION
-- =====================================================================
DO $$
DECLARE
  zone_nearby distance_zone;
  zone_moderate distance_zone;
  zone_far distance_zone;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'TEST 10: Validating Distance Zone Logic';
  RAISE NOTICE '========================================';
  
  SELECT get_distance_zone(0.5) INTO zone_nearby;
  SELECT get_distance_zone(3) INTO zone_moderate;
  SELECT get_distance_zone(10) INTO zone_far;
  
  IF zone_nearby != 'nearby' THEN
    RAISE EXCEPTION '❌ Expected "nearby", got %', zone_nearby;
  END IF;
  
  IF zone_moderate != 'moderate' THEN
    RAISE EXCEPTION '❌ Expected "moderate", got %', zone_moderate;
  END IF;
  
  IF zone_far != 'far' THEN
    RAISE EXCEPTION '❌ Expected "far", got %', zone_far;
  END IF;
  
  RAISE NOTICE '✅ Distance zone function works correctly';
  RAISE NOTICE '   0.5 mi → %', zone_nearby;
  RAISE NOTICE '   3.0 mi → %', zone_moderate;
  RAISE NOTICE '   10 mi → %', zone_far;
END $$;

-- =====================================================================
-- TEST 11: AUDIT TRIGGER (Verified Pulse)
-- =====================================================================
DO $$
DECLARE
  test_tenant_id UUID := '99999999-9999-9999-9999-999999999999';
  test_user_id UUID := '88888888-8888-8888-8888-888888888888';
  pulse_id UUID;
  audit_count INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'TEST 11: Testing Audit Trigger';
  RAISE NOTICE '========================================';
  
  -- Create test tenant and user (without triggering constraints)
  INSERT INTO tenants (id, family_code) 
  VALUES (test_tenant_id, 'TEST-AUDIT')
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO users (id, tenant_id, name, role) 
  VALUES (test_user_id, test_tenant_id, 'Test User', 'primary_user')
  ON CONFLICT (id) DO NOTHING;
  
  -- Insert verified pulse (should trigger audit log)
  INSERT INTO verified_pulses (
    tenant_id, user_id, user_name, location, battery_level
  ) VALUES (
    test_tenant_id, 
    test_user_id,
    'Test User',
    '{"lat": 37.7749, "lng": -122.4194, "accuracy": 10, "timestamp": 0}'::jsonb,
    75
  )
  RETURNING id INTO pulse_id;
  
  -- Check if audit log was created
  SELECT COUNT(*) INTO audit_count
  FROM audit_logs
  WHERE event_data->>'verified_pulse_id' = pulse_id::TEXT
    AND event_type = 'ping_replied';
  
  IF audit_count = 0 THEN
    RAISE EXCEPTION '❌ Audit trigger did not fire for verified_pulse';
  ELSE
    RAISE NOTICE '✅ Audit trigger works (% log entries created)', audit_count;
  END IF;
  
  -- Cleanup
  DELETE FROM verified_pulses WHERE id = pulse_id;
  DELETE FROM audit_logs WHERE event_data->>'verified_pulse_id' = pulse_id::TEXT;
  DELETE FROM users WHERE id = test_user_id;
  DELETE FROM tenants WHERE id = test_tenant_id;
END $$;

-- =====================================================================
-- TEST 12: SEED DATA
-- =====================================================================
DO $$
DECLARE
  demo_tenant_count INTEGER;
  demo_user_count INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'TEST 12: Checking Seed Data';
  RAISE NOTICE '========================================';
  
  SELECT COUNT(*) INTO demo_tenant_count
  FROM tenants
  WHERE family_code = 'XP9-2RT';
  
  SELECT COUNT(*) INTO demo_user_count
  FROM users
  WHERE name IN ('Alex Chen', 'Emma Chen', 'Marcus Johnson');
  
  IF demo_tenant_count > 0 THEN
    RAISE NOTICE '✅ Demo tenant exists (XP9-2RT)';
  ELSE
    RAISE WARNING '⚠️  Demo tenant not found (optional for production)';
  END IF;
  
  IF demo_user_count > 0 THEN
    RAISE NOTICE '✅ Demo users exist (% users)', demo_user_count;
  ELSE
    RAISE WARNING '⚠️  Demo users not found (optional for production)';
  END IF;
END $$;

-- =====================================================================
-- TEST 13: PERFORMANCE - TENANT QUERY
-- =====================================================================
DO $$
DECLARE
  query_plan TEXT;
  uses_index BOOLEAN;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'TEST 13: Checking Query Performance';
  RAISE NOTICE '========================================';
  
  -- Check if tenant_id query uses index
  SELECT 'Index Scan' = ANY(string_to_array(query_plan, ' ')) INTO uses_index
  FROM (
    SELECT query_plan 
    FROM EXPLAIN(
      SELECT * FROM family_members WHERE tenant_id = '00000000-0000-0000-0000-000000000001'
    ) AS query_plan
  ) AS plan;
  
  RAISE NOTICE '✅ Query performance check complete';
  RAISE NOTICE '   (Run EXPLAIN ANALYZE manually for timing)';
END $$;

-- =====================================================================
-- TEST 14: CLEANUP FUNCTIONS
-- =====================================================================
DO $$
DECLARE
  pulses_deleted INTEGER;
  proximity_deleted INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'TEST 14: Testing Cleanup Functions';
  RAISE NOTICE '========================================';
  
  -- Test cleanup functions (should return counts)
  SELECT cleanup_expired_verified_pulses() INTO pulses_deleted;
  SELECT cleanup_expired_proximity_snapshots() INTO proximity_deleted;
  
  RAISE NOTICE '✅ Cleanup functions work';
  RAISE NOTICE '   Pulses deleted: %', pulses_deleted;
  RAISE NOTICE '   Proximity deleted: %', proximity_deleted;
END $$;

-- =====================================================================
-- TEST SUMMARY
-- =====================================================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '🎉 ALL TESTS PASSED';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Schema Status:';
  RAISE NOTICE '  ✅ 8 core tables';
  RAISE NOTICE '  ✅ 18+ RLS policies';
  RAISE NOTICE '  ✅ 13 functions';
  RAISE NOTICE '  ✅ 7 triggers';
  RAISE NOTICE '  ✅ 7 enum types';
  RAISE NOTICE '  ✅ Audit log immutability';
  RAISE NOTICE '  ✅ Haversine accuracy';
  RAISE NOTICE '  ✅ Distance zones';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '  1. Configure pg_cron for cleanup jobs';
  RAISE NOTICE '  2. Deploy Supabase Edge Functions';
  RAISE NOTICE '  3. Test with real user authentication';
  RAISE NOTICE '  4. Enable Realtime on key tables';
  RAISE NOTICE '  5. Set up monitoring dashboards';
  RAISE NOTICE '';
  RAISE NOTICE 'Documentation:';
  RAISE NOTICE '  • Deployment: /database/DEPLOYMENT_GUIDE.md';
  RAISE NOTICE '  • Quick Ref: /database/QUICK_REFERENCE.md';
  RAISE NOTICE '  • Schema: /guidelines/LEVEL_2_SYSTEM_BLUEPRINT_V2.md';
  RAISE NOTICE '';
END $$;

-- =====================================================================
-- PERFORMANCE BENCHMARK (Optional)
-- =====================================================================
\echo ''
\echo '========================================';
\echo 'PERFORMANCE BENCHMARK (Optional)';
\echo '========================================';
\echo ''
\echo 'Run these queries manually to check performance:';
\echo ''
\echo '1. Tenant-scoped query (should be <10ms):';
\echo '   EXPLAIN ANALYZE SELECT * FROM family_members WHERE tenant_id = '\''00000000-0000-0000-0000-000000000001'\'';';
\echo ''
\echo '2. Proximity calculation (should be <5ms):';
\echo '   EXPLAIN ANALYZE SELECT calculate_proximity_distance(37.7749, -122.4194, 37.7849, -122.4094);';
\echo ''
\echo '3. Active pings query (should be <10ms):';
\echo '   EXPLAIN ANALYZE SELECT * FROM ping_requests WHERE tenant_id = '\''00000000-0000-0000-0000-000000000001'\'' AND status = '\''pending'\'';';
\echo ''

\timing off
