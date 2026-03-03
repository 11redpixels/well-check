-- 📐 V8.8 RLS VALIDATION & CONFLICT DETECTION
-- Chief Architect Implementation
-- Date: 2026-02-22, 9:45 PM
-- Reference: POST-HOTFIX VERIFICATION DIRECTIVE V8.8

-- Purpose: Verify Multi-Tenant RLS isolation and sample data conflict detection

-- ============================================================================
-- PART 1: MULTI-TENANT RLS ISOLATION TEST
-- ============================================================================

\echo '═══════════════════════════════════════════'
\echo '  V8.8 RLS MULTI-TENANT ISOLATION TEST'
\echo '═══════════════════════════════════════════'

-- Test Function: Verify that Family Head only sees their family's data
CREATE OR REPLACE FUNCTION test_rls_isolation(
  p_tenant_id_1 UUID,
  p_user_id_1 UUID,
  p_tenant_id_2 UUID,
  p_user_id_2 UUID
)
RETURNS TABLE (
  test_name TEXT,
  expected_result TEXT,
  actual_result TEXT,
  status TEXT
) AS $$
DECLARE
  v_family_1_med_count INT;
  v_family_2_med_count INT;
  v_user_1_sees_family_2_meds INT;
  v_user_2_sees_family_1_meds INT;
BEGIN
  -- ============================================================================
  -- TEST 1: Each family has their own sample medication
  -- ============================================================================
  
  -- Count medications for Family 1
  SELECT COUNT(*) INTO v_family_1_med_count
  FROM medications
  WHERE tenant_id = p_tenant_id_1;
  
  -- Count medications for Family 2
  SELECT COUNT(*) INTO v_family_2_med_count
  FROM medications
  WHERE tenant_id = p_tenant_id_2;
  
  RETURN QUERY SELECT
    'TEST 1: Sample Data Isolation' AS test_name,
    'Family 1 has ≥1 medication' AS expected_result,
    format('Family 1 has %s medication(s)', v_family_1_med_count) AS actual_result,
    CASE 
      WHEN v_family_1_med_count >= 1 THEN '✅ PASS'
      ELSE '❌ FAIL'
    END AS status;
  
  RETURN QUERY SELECT
    'TEST 1: Sample Data Isolation' AS test_name,
    'Family 2 has ≥1 medication' AS expected_result,
    format('Family 2 has %s medication(s)', v_family_2_med_count) AS actual_result,
    CASE 
      WHEN v_family_2_med_count >= 1 THEN '✅ PASS'
      ELSE '❌ FAIL'
    END AS status;
  
  -- ============================================================================
  -- TEST 2: User 1 (Family 1) CANNOT see Family 2's medications (RLS blocks)
  -- ============================================================================
  
  -- Simulate User 1's session (set auth context)
  -- In production, this is set automatically by Supabase Auth
  PERFORM set_config('request.jwt.claims', json_build_object('sub', p_user_id_1::TEXT)::TEXT, true);
  
  -- Count how many Family 2 medications User 1 can see (should be 0)
  SELECT COUNT(*) INTO v_user_1_sees_family_2_meds
  FROM medications
  WHERE tenant_id = p_tenant_id_2; -- Trying to access Family 2's data
  
  RETURN QUERY SELECT
    'TEST 2: RLS Isolation (User 1 → Family 2)' AS test_name,
    'User 1 sees 0 medications from Family 2' AS expected_result,
    format('User 1 sees %s medication(s) from Family 2', v_user_1_sees_family_2_meds) AS actual_result,
    CASE 
      WHEN v_user_1_sees_family_2_meds = 0 THEN '✅ PASS (RLS working)'
      ELSE '❌ FAIL (RLS BREACH - CRITICAL)'
    END AS status;
  
  -- ============================================================================
  -- TEST 3: User 2 (Family 2) CANNOT see Family 1's medications (RLS blocks)
  -- ============================================================================
  
  -- Simulate User 2's session
  PERFORM set_config('request.jwt.claims', json_build_object('sub', p_user_id_2::TEXT)::TEXT, true);
  
  -- Count how many Family 1 medications User 2 can see (should be 0)
  SELECT COUNT(*) INTO v_user_2_sees_family_1_meds
  FROM medications
  WHERE tenant_id = p_tenant_id_1; -- Trying to access Family 1's data
  
  RETURN QUERY SELECT
    'TEST 3: RLS Isolation (User 2 → Family 1)' AS test_name,
    'User 2 sees 0 medications from Family 1' AS expected_result,
    format('User 2 sees %s medication(s) from Family 1', v_user_2_sees_family_1_meds) AS actual_result,
    CASE 
      WHEN v_user_2_sees_family_1_meds = 0 THEN '✅ PASS (RLS working)'
      ELSE '❌ FAIL (RLS BREACH - CRITICAL)'
    END AS status;
  
  -- Reset auth context
  PERFORM set_config('request.jwt.claims', NULL, true);
  
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION test_rls_isolation IS 'V8.8: Test multi-tenant RLS isolation between families';

-- ============================================================================
-- PART 2: SAMPLE DATA CONFLICT DETECTION
-- ============================================================================

\echo '\n═══════════════════════════════════════════'
\echo '  V8.8 SAMPLE vs REAL DATA CONFLICT DETECTION'
\echo '═══════════════════════════════════════════\n'

-- Function: Detect conflicts between sample and real data
CREATE OR REPLACE FUNCTION detect_sample_conflicts(
  p_tenant_id UUID
)
RETURNS TABLE (
  conflict_type TEXT,
  sample_data TEXT,
  real_data TEXT,
  recommendation TEXT,
  action TEXT
) AS $$
BEGIN
  -- ============================================================================
  -- CONFLICT 1: User added real "Vitamin D" medication (same name as sample)
  -- ============================================================================
  
  RETURN QUERY
  WITH sample_meds AS (
    SELECT id, medication_name, dosage, notes
    FROM medications
    WHERE tenant_id = p_tenant_id
      AND notes ILIKE '%Sample medication for beta testing%'
  ),
  real_meds AS (
    SELECT id, medication_name, dosage, notes
    FROM medications
    WHERE tenant_id = p_tenant_id
      AND (notes IS NULL OR notes NOT ILIKE '%Sample medication for beta testing%')
  )
  SELECT
    'DUPLICATE_MEDICATION' AS conflict_type,
    format('Sample: %s (%s)', s.medication_name, s.dosage) AS sample_data,
    format('Real: %s (%s)', r.medication_name, r.dosage) AS real_data,
    'User has both sample and real "Vitamin D" - Sample can be deleted' AS recommendation,
    'DELETE_SAMPLE' AS action
  FROM sample_meds s
  JOIN real_meds r ON LOWER(s.medication_name) LIKE '%' || LOWER(SPLIT_PART(r.medication_name, ' ', 1)) || '%'
  WHERE s.medication_name ILIKE '%Vitamin D%' OR r.medication_name ILIKE '%Vitamin D%';
  
  -- ============================================================================
  -- CONFLICT 2: User has real medications, sample data still exists
  -- ============================================================================
  
  RETURN QUERY
  SELECT
    'SAMPLE_DATA_LINGERING' AS conflict_type,
    format('%s sample medication(s) exist', COUNT(*)::TEXT) AS sample_data,
    format('%s real medication(s) exist', (
      SELECT COUNT(*)
      FROM medications
      WHERE tenant_id = p_tenant_id
        AND (notes IS NULL OR notes NOT ILIKE '%Sample medication for beta testing%')
    )::TEXT) AS real_data,
    'User has real data - Sample data can be safely removed' AS recommendation,
    'OFFER_DELETE_SAMPLE' AS action
  FROM medications
  WHERE tenant_id = p_tenant_id
    AND notes ILIKE '%Sample medication for beta testing%'
  HAVING COUNT(*) > 0;
  
  -- ============================================================================
  -- CONFLICT 3: Sample appointment still exists after real appointments added
  -- ============================================================================
  
  RETURN QUERY
  WITH sample_appts AS (
    SELECT COUNT(*) AS sample_count
    FROM doctor_appointments
    WHERE tenant_id = p_tenant_id
      AND notes ILIKE '%Sample appointment for beta testing%'
  ),
  real_appts AS (
    SELECT COUNT(*) AS real_count
    FROM doctor_appointments
    WHERE tenant_id = p_tenant_id
      AND (notes IS NULL OR notes NOT ILIKE '%Sample appointment for beta testing%')
  )
  SELECT
    'SAMPLE_APPOINTMENT_LINGERING' AS conflict_type,
    format('%s sample appointment(s)', s.sample_count::TEXT) AS sample_data,
    format('%s real appointment(s)', r.real_count::TEXT) AS real_data,
    'User has real appointments - Sample appointment can be removed' AS recommendation,
    'OFFER_DELETE_SAMPLE' AS action
  FROM sample_appts s, real_appts r
  WHERE s.sample_count > 0 AND r.real_count > 0;
  
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION detect_sample_conflicts IS 'V8.8: Detect conflicts between sample and real data';

-- ============================================================================
-- PART 3: AUTO-CLEANUP FUNCTION (Optional - User Consent Required)
-- ============================================================================

-- Function: Remove sample data once user has real data
CREATE OR REPLACE FUNCTION cleanup_sample_data(
  p_tenant_id UUID,
  p_confirm BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
  action TEXT,
  deleted_count INT,
  status TEXT
) AS $$
DECLARE
  v_real_med_count INT;
  v_real_appt_count INT;
  v_sample_med_deleted INT;
  v_sample_appt_deleted INT;
BEGIN
  -- Safety check: Require explicit confirmation
  IF NOT p_confirm THEN
    RETURN QUERY SELECT
      'ABORTED' AS action,
      0 AS deleted_count,
      'Confirmation required (set p_confirm = TRUE)' AS status;
    RETURN;
  END IF;
  
  -- Count real data
  SELECT COUNT(*) INTO v_real_med_count
  FROM medications
  WHERE tenant_id = p_tenant_id
    AND (notes IS NULL OR notes NOT ILIKE '%Sample medication for beta testing%');
  
  SELECT COUNT(*) INTO v_real_appt_count
  FROM doctor_appointments
  WHERE tenant_id = p_tenant_id
    AND (notes IS NULL OR notes NOT ILIKE '%Sample appointment for beta testing%');
  
  -- Only delete sample data if real data exists (safety)
  IF v_real_med_count > 0 THEN
    DELETE FROM medications
    WHERE tenant_id = p_tenant_id
      AND notes ILIKE '%Sample medication for beta testing%';
    
    GET DIAGNOSTICS v_sample_med_deleted = ROW_COUNT;
    
    RETURN QUERY SELECT
      'DELETE_SAMPLE_MEDICATIONS' AS action,
      v_sample_med_deleted AS deleted_count,
      format('%s sample medication(s) deleted', v_sample_med_deleted) AS status;
  ELSE
    RETURN QUERY SELECT
      'SKIP_MEDICATIONS' AS action,
      0 AS deleted_count,
      'No real medications exist - Sample data retained' AS status;
  END IF;
  
  IF v_real_appt_count > 0 THEN
    DELETE FROM doctor_appointments
    WHERE tenant_id = p_tenant_id
      AND notes ILIKE '%Sample appointment for beta testing%';
    
    GET DIAGNOSTICS v_sample_appt_deleted = ROW_COUNT;
    
    RETURN QUERY SELECT
      'DELETE_SAMPLE_APPOINTMENTS' AS action,
      v_sample_appt_deleted AS deleted_count,
      format('%s sample appointment(s) deleted', v_sample_appt_deleted) AS status;
  ELSE
    RETURN QUERY SELECT
      'SKIP_APPOINTMENTS' AS action,
      0 AS deleted_count,
      'No real appointments exist - Sample data retained' AS status;
  END IF;
  
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_sample_data IS 'V8.8: Remove sample data once user has real data (requires confirmation)';

-- ============================================================================
-- PART 3B: CLEAN SWEEP TRIGGER (V8.9)
-- ============================================================================

\echo '\n═══════════════════════════════════════════'
\echo '  V8.9 CLEAN SWEEP TRIGGER (2nd Medication Rule)'
\echo '═══════════════════════════════════════════\n'

-- Function: Count real medications (non-sample)
CREATE OR REPLACE FUNCTION get_real_medication_count(
  p_tenant_id UUID
)
RETURNS INT AS $$
DECLARE
  v_real_count INT;
BEGIN
  SELECT COUNT(*) INTO v_real_count
  FROM medications
  WHERE tenant_id = p_tenant_id
    AND (notes IS NULL OR notes NOT ILIKE '%SAMPLE DATA%');
  
  RETURN v_real_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_real_medication_count IS 'V8.9: Count real medications (excludes sample data)';

-- Function: Check if user has demonstrated mastery (2+ real medications)
CREATE OR REPLACE FUNCTION should_offer_cleanup(
  p_tenant_id UUID
)
RETURNS TABLE (
  should_offer BOOLEAN,
  real_medication_count INT,
  sample_medication_count INT,
  reason TEXT
) AS $$
DECLARE
  v_real_count INT;
  v_sample_count INT;
BEGIN
  -- Count real medications
  SELECT COUNT(*) INTO v_real_count
  FROM medications
  WHERE tenant_id = p_tenant_id
    AND (notes IS NULL OR notes NOT ILIKE '%SAMPLE DATA%');
  
  -- Count sample medications
  SELECT COUNT(*) INTO v_sample_count
  FROM medications
  WHERE tenant_id = p_tenant_id
    AND notes ILIKE '%SAMPLE DATA%';
  
  -- V8.9: Only offer cleanup after 2nd real medication
  IF v_real_count >= 2 AND v_sample_count > 0 THEN
    RETURN QUERY SELECT
      TRUE AS should_offer,
      v_real_count AS real_medication_count,
      v_sample_count AS sample_medication_count,
      format('User has %s real medications (mastery demonstrated) - Offer to remove %s sample medication(s)', v_real_count, v_sample_count) AS reason;
  ELSIF v_real_count = 1 AND v_sample_count > 0 THEN
    RETURN QUERY SELECT
      FALSE AS should_offer,
      v_real_count AS real_medication_count,
      v_sample_count AS sample_medication_count,
      'User has only 1 real medication - Keep "Getting Started" guide visible until 2nd medication added' AS reason;
  ELSIF v_sample_count = 0 THEN
    RETURN QUERY SELECT
      FALSE AS should_offer,
      v_real_count AS real_medication_count,
      v_sample_count AS sample_medication_count,
      'No sample data exists - Cleanup not needed' AS reason;
  ELSE
    RETURN QUERY SELECT
      FALSE AS should_offer,
      v_real_count AS real_medication_count,
      v_sample_count AS sample_medication_count,
      'User has 0 real medications - Sample data provides guidance' AS reason;
  END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION should_offer_cleanup IS 'V8.9: Check if user has demonstrated mastery (2+ real medications) to offer sample cleanup';

-- ============================================================================
-- PART 4: SESSION VERIFICATION (Testing Guide)
-- ============================================================================

\echo '\n═══════════════════════════════════════════'
\echo '  V8.8 SESSION VERIFICATION GUIDE'
\echo '═══════════════════════════════════════════\n'

/*
SESSION VERIFICATION TEST FLOW:

SCENARIO: User "John" (Family Head) logs in and adds first medication

STEP 1: Initial State (Fresh Account)
--------------------------------------
SELECT * FROM medications WHERE tenant_id = 'JOHNS_TENANT_ID';
-- Expected: 1 row (Vitamin D - Sample)

STEP 2: User Adds Real Medication via Wizard
---------------------------------------------
-- User completes MedicationWizard, saves "Aspirin 100mg"
INSERT INTO medications (tenant_id, user_id, medication_name, dosage, frequency, time_slots, notes)
VALUES (
  'JOHNS_TENANT_ID',
  'JOHNS_USER_ID',
  'Aspirin',
  '100mg',
  'daily',
  ARRAY['08:00'],
  NULL -- No sample data marker
);

SELECT * FROM medications WHERE tenant_id = 'JOHNS_TENANT_ID';
-- Expected: 2 rows (Vitamin D - Sample + Aspirin - Real)

STEP 3: Conflict Detection
---------------------------
SELECT * FROM detect_sample_conflicts('JOHNS_TENANT_ID');
-- Expected: 1 conflict (SAMPLE_DATA_LINGERING)
-- Recommendation: "User has real data - Sample data can be safely removed"

STEP 4: User Opts to Remove Sample Data (Optional)
---------------------------------------------------
SELECT * FROM cleanup_sample_data('JOHNS_TENANT_ID', TRUE);
-- Expected: 1 sample medication deleted (Vitamin D)

SELECT * FROM medications WHERE tenant_id = 'JOHNS_TENANT_ID';
-- Expected: 1 row (Aspirin - Real only)

VERIFICATION CHECKLIST:
✅ Sample data doesn't prevent real data insertion
✅ RLS policies allow both sample and real data to coexist
✅ Conflict detection identifies lingering sample data
✅ Cleanup function requires explicit confirmation
✅ User sees both sample and real data in UI (until cleanup)
*/

-- ============================================================================
-- PART 5: GRANT PERMISSIONS
-- ============================================================================

GRANT EXECUTE ON FUNCTION test_rls_isolation TO authenticated;
GRANT EXECUTE ON FUNCTION detect_sample_conflicts TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_sample_data TO authenticated;

-- ============================================================================
-- USAGE EXAMPLES
-- ============================================================================

\echo '\n═════════════════════════════════════════���═'
\echo '  V8.8 USAGE EXAMPLES'
\echo '═══════════════════════════════════════════\n'

/*
EXAMPLE 1: Test RLS Isolation Between Two Families
---------------------------------------------------
-- Get tenant/user IDs for two beta testers
SELECT 
  t1.id AS tenant_1_id,
  u1.id AS user_1_id,
  u1.email AS user_1_email,
  t2.id AS tenant_2_id,
  u2.id AS user_2_id,
  u2.email AS user_2_email
FROM tenants t1
JOIN users u1 ON u1.tenant_id = t1.id
CROSS JOIN tenants t2
JOIN users u2 ON u2.tenant_id = t2.id
WHERE u1.email = 'tester1@example.com'
  AND u2.email = 'tester2@example.com'
LIMIT 1;

-- Run RLS isolation test
SELECT * FROM test_rls_isolation(
  'TENANT_1_ID'::UUID,
  'USER_1_ID'::UUID,
  'TENANT_2_ID'::UUID,
  'USER_2_ID'::UUID
);

-- Expected output (all tests pass):
| test_name                           | expected_result                      | actual_result                        | status              |
|-------------------------------------|--------------------------------------|--------------------------------------|---------------------|
| TEST 1: Sample Data Isolation       | Family 1 has ≥1 medication           | Family 1 has 1 medication(s)         | ✅ PASS             |
| TEST 1: Sample Data Isolation       | Family 2 has ≥1 medication           | Family 2 has 1 medication(s)         | ✅ PASS             |
| TEST 2: RLS Isolation (User 1 → 2) | User 1 sees 0 meds from Family 2     | User 1 sees 0 medication(s)          | ✅ PASS (RLS working)|
| TEST 3: RLS Isolation (User 2 → 1) | User 2 sees 0 meds from Family 1     | User 2 sees 0 medication(s)          | ✅ PASS (RLS working)|


EXAMPLE 2: Detect Conflicts After User Adds Real Data
------------------------------------------------------
-- User adds real medication
INSERT INTO medications (tenant_id, user_id, medication_name, dosage, frequency, time_slots)
VALUES ('TENANT_ID', 'USER_ID', 'Aspirin', '100mg', 'daily', ARRAY['08:00']);

-- Check for conflicts
SELECT * FROM detect_sample_conflicts('TENANT_ID');

-- Expected output:
| conflict_type            | sample_data                     | real_data                  | recommendation                                          | action             |
|--------------------------|---------------------------------|----------------------------|---------------------------------------------------------|--------------------|
| SAMPLE_DATA_LINGERING    | 1 sample medication(s) exist    | 1 real medication(s) exist | User has real data - Sample data can be safely removed  | OFFER_DELETE_SAMPLE|


EXAMPLE 3: Clean Up Sample Data (User Consent)
-----------------------------------------------
-- User opts to remove sample data (via UI button)
SELECT * FROM cleanup_sample_data('TENANT_ID', TRUE);

-- Expected output:
| action                      | deleted_count | status                            |
|-----------------------------|---------------|-----------------------------------|
| DELETE_SAMPLE_MEDICATIONS   | 1             | 1 sample medication(s) deleted    |
| SKIP_APPOINTMENTS           | 0             | No real appointments exist - ...  |
*/

-- End of V8.8 RLS Validation Script

\echo '\n═══════════════════════════════════════════'
\echo '  V8.8 RLS VALIDATION SCRIPT LOADED'
\echo '  Run test functions above to verify RLS'
\echo '═══════════════════════════════════════════\n'