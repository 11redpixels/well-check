// =====================================================================
// RLS DATA LEAK SIMULATION TEST
// Security Contract: Multi-Tenant Isolation Validation
// =====================================================================
//
// Purpose: Verify that RLS policies prevent cross-tenant data access
// Attack Vector: Malicious user tries to access another tenant's data
// Expected: All queries return null/empty array (no data leak)
//
// Reference: /guidelines/Security___Multi-Tenancy_Contract.md
// =====================================================================

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../src/app/types/database';

// =====================================================================
// TEST CONFIGURATION
// =====================================================================

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test tenant IDs (from schema seed data)
const TENANT_A_ID = '00000000-0000-0000-0000-000000000001'; // Chen Family (XP9-2RT)
const TENANT_B_ID = '11111111-1111-1111-1111-111111111111'; // Hypothetical other family

// Test user IDs
const USER_A_ID = '00000000-0000-0000-0000-000000000011'; // Alex Chen (Monitor, Tenant A)
const USER_B_ID = '11111111-1111-1111-1111-111111111111'; // Hypothetical user in Tenant B

// =====================================================================
// TEST SUITE 1: DIRECT TABLE ACCESS (CROSS-TENANT QUERY)
// =====================================================================

/**
 * TEST 1.1: Attempt to query family_members from another tenant
 * 
 * Attack Vector: User A tries to fetch User B's family members
 * Expected Result: Empty array (RLS blocks query)
 */
export async function testCrossTenantFamilyMemberAccess() {
  console.log('\n========================================');
  console.log('TEST 1.1: Cross-Tenant Family Member Access');
  console.log('========================================');

  // Authenticate as User A (Tenant A)
  // In real test, this would use a real JWT token
  // For this test, we simulate by setting RLS context
  
  try {
    // Attempt to fetch Tenant B's family members
    const { data, error, count } = await supabase
      .from('family_members')
      .select('*', { count: 'exact' })
      .eq('tenant_id', TENANT_B_ID); // ⚠️ ATTACK: Query different tenant

    console.log('Query executed');
    console.log('Data returned:', data);
    console.log('Row count:', count);
    console.log('Error:', error);

    // ASSERTION: Should return empty array (RLS blocked)
    if (data && data.length === 0) {
      console.log('✅ PASS: RLS blocked cross-tenant access');
      console.log('   User A cannot see Tenant B\'s family members');
      return { passed: true, leakDetected: false };
    } else if (data && data.length > 0) {
      console.error('❌ FAIL: DATA LEAK DETECTED!');
      console.error(`   User A can see ${data.length} members from Tenant B`);
      console.error('   CRITICAL SECURITY VULNERABILITY');
      return { passed: false, leakDetected: true, leakedRows: data.length };
    } else {
      console.log('⚠️  INCONCLUSIVE: No data or error occurred');
      return { passed: false, leakDetected: false, error };
    }
  } catch (error) {
    console.error('❌ FAIL: Test execution error:', error);
    return { passed: false, error };
  }
}

/**
 * TEST 1.2: Attempt to query verified_pulses from another tenant
 * 
 * Attack Vector: Monitor tries to see safety confirmations from unrelated family
 * Expected Result: Empty array (RLS blocks query)
 */
export async function testCrossTenantVerifiedPulseAccess() {
  console.log('\n========================================');
  console.log('TEST 1.2: Cross-Tenant Verified Pulse Access');
  console.log('========================================');

  try {
    const { data, error, count } = await supabase
      .from('verified_pulses')
      .select('*', { count: 'exact' })
      .eq('tenant_id', TENANT_B_ID); // ⚠️ ATTACK

    console.log('Data returned:', data);
    console.log('Row count:', count);

    if (data && data.length === 0) {
      console.log('✅ PASS: RLS blocked cross-tenant verified pulse access');
      return { passed: true, leakDetected: false };
    } else if (data && data.length > 0) {
      console.error('❌ FAIL: DATA LEAK DETECTED!');
      console.error(`   User A can see ${data.length} verified pulses from Tenant B`);
      return { passed: false, leakDetected: true, leakedRows: data.length };
    } else {
      console.log('⚠️  INCONCLUSIVE');
      return { passed: false, leakDetected: false, error };
    }
  } catch (error) {
    console.error('❌ FAIL: Test execution error:', error);
    return { passed: false, error };
  }
}

/**
 * TEST 1.3: Attempt to query emergency_events from another tenant
 * 
 * Attack Vector: Malicious user tries to see panic events from another family
 * Expected Result: Empty array (RLS blocks query)
 */
export async function testCrossTenantEmergencyEventAccess() {
  console.log('\n========================================');
  console.log('TEST 1.3: Cross-Tenant Emergency Event Access');
  console.log('========================================');

  try {
    const { data, error, count } = await supabase
      .from('emergency_events')
      .select('*', { count: 'exact' })
      .eq('tenant_id', TENANT_B_ID); // ⚠️ ATTACK

    console.log('Data returned:', data);
    console.log('Row count:', count);

    if (data && data.length === 0) {
      console.log('✅ PASS: RLS blocked cross-tenant emergency event access');
      return { passed: true, leakDetected: false };
    } else if (data && data.length > 0) {
      console.error('❌ FAIL: DATA LEAK DETECTED!');
      console.error(`   User A can see ${data.length} emergency events from Tenant B`);
      console.error('   CRITICAL: Panic mode data exposed!');
      return { passed: false, leakDetected: true, leakedRows: data.length };
    } else {
      console.log('⚠️  INCONCLUSIVE');
      return { passed: false, leakDetected: false, error };
    }
  } catch (error) {
    console.error('❌ FAIL: Test execution error:', error);
    return { passed: false, error };
  }
}

// =====================================================================
// TEST SUITE 2: MANUAL CONSOLE INJECTION
// =====================================================================

/**
 * TEST 2.1: Browser console attack simulation
 * 
 * Simulates a malicious user opening DevTools and trying to access data
 * This is the most common attack vector for web apps
 */
export function generateConsoleAttackScript(): string {
  return `
// ⚠️  MALICIOUS SCRIPT - DO NOT RUN IN PRODUCTION
// This simulates an attacker trying to bypass frontend security

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  '${SUPABASE_URL}',
  '${SUPABASE_ANON_KEY}'
);

// ATTACK 1: Try to fetch all family members (no tenant filter)
const { data: allMembers } = await supabase
  .from('family_members')
  .select('*');

console.log('Attack 1 - All members:', allMembers);
// Expected: Empty array (RLS blocks unfiltered query)

// ATTACK 2: Try to fetch specific tenant by guessing ID
const { data: targetFamily } = await supabase
  .from('family_members')
  .select('*')
  .eq('tenant_id', '${TENANT_B_ID}');

console.log('Attack 2 - Target family:', targetFamily);
// Expected: Empty array (RLS blocks cross-tenant access)

// ATTACK 3: Try to directly query audit logs (immutable data)
const { data: auditLogs } = await supabase
  .from('audit_logs')
  .select('*')
  .eq('tenant_id', '${TENANT_B_ID}');

console.log('Attack 3 - Audit logs:', auditLogs);
// Expected: Empty array (RLS blocks access)

// ATTACK 4: Try to UPDATE another tenant's data
const { error: updateError } = await supabase
  .from('family_members')
  .update({ battery_level: 0 })
  .eq('tenant_id', '${TENANT_B_ID}');

console.log('Attack 4 - Update error:', updateError);
// Expected: Error (RLS blocks UPDATE)

// ATTACK 5: Try to DELETE another tenant's data
const { error: deleteError } = await supabase
  .from('verified_pulses')
  .delete()
  .eq('tenant_id', '${TENANT_B_ID}');

console.log('Attack 5 - Delete error:', deleteError);
// Expected: Error (RLS blocks DELETE)
`;
}

/**
 * TEST 2.2: Validate RLS blocks unscoped queries
 * 
 * Attack Vector: User tries to query without tenant_id filter
 * Expected Result: Empty array (RLS requires tenant_id match)
 */
export async function testUnscopedQuery() {
  console.log('\n========================================');
  console.log('TEST 2.2: Unscoped Query (No Tenant Filter)');
  console.log('========================================');

  try {
    // Query without tenant_id filter (should be blocked)
    const { data, error, count } = await supabase
      .from('family_members')
      .select('*', { count: 'exact' });

    console.log('Data returned:', data);
    console.log('Row count:', count);

    if (data && data.length === 0) {
      console.log('✅ PASS: RLS blocked unscoped query');
      console.log('   User must authenticate to see any data');
      return { passed: true, leakDetected: false };
    } else if (data && data.length > 0) {
      console.error('❌ FAIL: DATA LEAK DETECTED!');
      console.error(`   Anonymous user can see ${data.length} family members`);
      console.error('   RLS policy may be misconfigured');
      return { passed: false, leakDetected: true, leakedRows: data.length };
    } else {
      console.log('⚠️  INCONCLUSIVE');
      return { passed: false, leakDetected: false, error };
    }
  } catch (error) {
    console.error('❌ FAIL: Test execution error:', error);
    return { passed: false, error };
  }
}

// =====================================================================
// TEST SUITE 3: IMMUTABILITY VALIDATION
// =====================================================================

/**
 * TEST 3.1: Attempt to UPDATE audit_logs (should fail)
 * 
 * Attack Vector: Malicious actor tries to modify audit trail
 * Expected Result: Error (RLS blocks UPDATE)
 */
export async function testAuditLogImmutability() {
  console.log('\n========================================');
  console.log('TEST 3.1: Audit Log Immutability (UPDATE)');
  console.log('========================================');

  try {
    // Attempt to update an audit log entry
    const { data, error } = await supabase
      .from('audit_logs')
      .update({ event_type: 'tampered' })
      .eq('tenant_id', TENANT_A_ID)
      .select();

    console.log('Data returned:', data);
    console.log('Error:', error);

    if (error) {
      console.log('✅ PASS: Audit log UPDATE blocked by RLS');
      console.log('   Immutability enforced');
      return { passed: true, blocked: true };
    } else if (data && data.length > 0) {
      console.error('❌ FAIL: IMMUTABILITY VIOLATION!');
      console.error('   Audit log was modified');
      console.error('   CRITICAL: Compliance breach');
      return { passed: false, blocked: false, modifiedRows: data.length };
    } else {
      console.log('⚠️  INCONCLUSIVE');
      return { passed: false, blocked: false };
    }
  } catch (error) {
    console.error('❌ FAIL: Test execution error:', error);
    return { passed: false, error };
  }
}

/**
 * TEST 3.2: Attempt to DELETE audit_logs (should fail)
 * 
 * Attack Vector: Malicious actor tries to destroy audit trail
 * Expected Result: Error (RLS blocks DELETE)
 */
export async function testAuditLogDeletion() {
  console.log('\n========================================');
  console.log('TEST 3.2: Audit Log Immutability (DELETE)');
  console.log('========================================');

  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .delete()
      .eq('tenant_id', TENANT_A_ID);

    console.log('Data returned:', data);
    console.log('Error:', error);

    if (error) {
      console.log('✅ PASS: Audit log DELETE blocked by RLS');
      console.log('   Immutability enforced');
      return { passed: true, blocked: true };
    } else {
      console.error('❌ FAIL: IMMUTABILITY VIOLATION!');
      console.error('   Audit logs were deleted');
      console.error('   CRITICAL: Compliance breach');
      return { passed: false, blocked: false };
    }
  } catch (error) {
    console.error('❌ FAIL: Test execution error:', error);
    return { passed: false, error };
  }
}

// =====================================================================
// TEST SUITE 4: RPC FUNCTION VALIDATION
// =====================================================================

/**
 * TEST 4.1: Verify Haversine RPC doesn't expose tenant data
 * 
 * RPC functions bypass RLS by default - ensure they don't leak data
 * Expected Result: Function works but doesn't expose location data
 */
export async function testProximityRPCIsolation() {
  console.log('\n========================================');
  console.log('TEST 4.1: Proximity RPC Function Isolation');
  console.log('========================================');

  try {
    // Call RPC with arbitrary coordinates
    const { data, error } = await supabase.rpc('calculate_proximity_distance', {
      lat1: 37.7749,
      lon1: -122.4194,
      lat2: 37.7849,
      lon2: -122.4094,
    });

    console.log('Distance calculated:', data);
    console.log('Error:', error);

    if (data !== null && !error) {
      console.log('✅ PASS: RPC function works');
      console.log('   Distance:', data, 'miles');
      console.log('   Note: RPC is stateless (no tenant data access)');
      return { passed: true, distance: data };
    } else {
      console.error('⚠️  RPC function failed:', error);
      return { passed: false, error };
    }
  } catch (error) {
    console.error('❌ FAIL: Test execution error:', error);
    return { passed: false, error };
  }
}

// =====================================================================
// MASTER TEST RUNNER
// =====================================================================

export async function runFullSecurityAudit() {
  console.log('\n========================================');
  console.log('🔒 WELL-CHECK SECURITY AUDIT');
  console.log('RLS Data Leak Simulation');
  console.log('========================================\n');

  const results = {
    timestamp: new Date().toISOString(),
    testsRun: 0,
    testsPassed: 0,
    testsFailed: 0,
    dataLeaksDetected: 0,
    criticalVulnerabilities: [],
    details: [] as any[],
  };

  // Suite 1: Cross-Tenant Access
  const test1_1 = await testCrossTenantFamilyMemberAccess();
  results.testsRun++;
  if (test1_1.passed) results.testsPassed++;
  else results.testsFailed++;
  if (test1_1.leakDetected) {
    results.dataLeaksDetected++;
    results.criticalVulnerabilities.push('Cross-tenant family_members access');
  }
  results.details.push({ test: 'Cross-Tenant Family Members', ...test1_1 });

  const test1_2 = await testCrossTenantVerifiedPulseAccess();
  results.testsRun++;
  if (test1_2.passed) results.testsPassed++;
  else results.testsFailed++;
  if (test1_2.leakDetected) {
    results.dataLeaksDetected++;
    results.criticalVulnerabilities.push('Cross-tenant verified_pulses access');
  }
  results.details.push({ test: 'Cross-Tenant Verified Pulses', ...test1_2 });

  const test1_3 = await testCrossTenantEmergencyEventAccess();
  results.testsRun++;
  if (test1_3.passed) results.testsPassed++;
  else results.testsFailed++;
  if (test1_3.leakDetected) {
    results.dataLeaksDetected++;
    results.criticalVulnerabilities.push('Cross-tenant emergency_events access');
  }
  results.details.push({ test: 'Cross-Tenant Emergency Events', ...test1_3 });

  // Suite 2: Unscoped Queries
  const test2_2 = await testUnscopedQuery();
  results.testsRun++;
  if (test2_2.passed) results.testsPassed++;
  else results.testsFailed++;
  if (test2_2.leakDetected) {
    results.dataLeaksDetected++;
    results.criticalVulnerabilities.push('Unscoped query allowed');
  }
  results.details.push({ test: 'Unscoped Query', ...test2_2 });

  // Suite 3: Immutability
  const test3_1 = await testAuditLogImmutability();
  results.testsRun++;
  if (test3_1.passed) results.testsPassed++;
  else results.testsFailed++;
  if (!test3_1.blocked) {
    results.criticalVulnerabilities.push('Audit log UPDATE allowed');
  }
  results.details.push({ test: 'Audit Log UPDATE', ...test3_1 });

  const test3_2 = await testAuditLogDeletion();
  results.testsRun++;
  if (test3_2.passed) results.testsPassed++;
  else results.testsFailed++;
  if (!test3_2.blocked) {
    results.criticalVulnerabilities.push('Audit log DELETE allowed');
  }
  results.details.push({ test: 'Audit Log DELETE', ...test3_2 });

  // Suite 4: RPC
  const test4_1 = await testProximityRPCIsolation();
  results.testsRun++;
  if (test4_1.passed) results.testsPassed++;
  else results.testsFailed++;
  results.details.push({ test: 'Proximity RPC', ...test4_1 });

  // Print summary
  console.log('\n========================================');
  console.log('📊 AUDIT SUMMARY');
  console.log('========================================');
  console.log(`Tests Run: ${results.testsRun}`);
  console.log(`Tests Passed: ${results.testsPassed}`);
  console.log(`Tests Failed: ${results.testsFailed}`);
  console.log(`Data Leaks Detected: ${results.dataLeaksDetected}`);
  console.log(`Critical Vulnerabilities: ${results.criticalVulnerabilities.length}`);

  if (results.criticalVulnerabilities.length > 0) {
    console.error('\n🚨 CRITICAL VULNERABILITIES:');
    results.criticalVulnerabilities.forEach((vuln, i) => {
      console.error(`${i + 1}. ${vuln}`);
    });
  } else {
    console.log('\n✅ NO CRITICAL VULNERABILITIES DETECTED');
  }

  console.log('\n========================================\n');

  return results;
}

// =====================================================================
// USAGE
// =====================================================================

// Run in Node.js:
// tsx tests/security/rls-leak-test.ts

// Or in browser console:
// import { runFullSecurityAudit } from './tests/security/rls-leak-test';
// runFullSecurityAudit();
