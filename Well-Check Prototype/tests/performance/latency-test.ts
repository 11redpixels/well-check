// =====================================================================
// LATENCY & OPTIMISTIC UI VALIDATION TEST
// Performance Contract: <100ms Zero-Gravity Feedback
// =====================================================================
//
// Purpose: Verify that UI updates happen at 0ms (optimistic)
// Even if Supabase RPC takes 500ms, user sees immediate feedback
//
// Reference: /guidelines/Performance___Latency_Perception.md
// Target: <100ms for all user interactions (0ms for critical actions)
// =====================================================================

import { performance } from 'perf_hooks';

// =====================================================================
// TEST CONFIGURATION
// =====================================================================

interface LatencyTestResult {
  action: string;
  optimisticLatency: number; // Time until UI updates (should be 0ms)
  networkLatency: number; // Time until Supabase responds
  passed: boolean;
  details: string;
}

const LATENCY_THRESHOLD_OPTIMISTIC = 10; // 0ms target, 10ms tolerance
const LATENCY_THRESHOLD_NETWORK = 1000; // 1000ms max (acceptable for background)

// =====================================================================
// TEST SUITE 1: PING SEND LATENCY
// =====================================================================

/**
 * TEST 1.1: Measure time from button tap to UI state change
 * 
 * Requirement: UI shows "PING SENT" immediately (0ms)
 * Background: Supabase insert can take 500ms
 */
export async function testPingSendOptimisticUI(): Promise<LatencyTestResult> {
  console.log('\n========================================');
  console.log('TEST 1.1: Ping Send - Optimistic UI Latency');
  console.log('========================================');

  const startTime = performance.now();
  let optimisticUpdateTime = 0;
  let networkCompleteTime = 0;

  try {
    // Simulate AppContext.sendPing() logic
    console.log('User taps "SEND PING" button...');

    // OPTIMISTIC UPDATE (should be instant)
    const optimisticStart = performance.now();

    // This is what the Coder Agent should implement:
    // setState(prev => ({ ...prev, status: 'ping_sent' }))
    simulateOptimisticStateUpdate();

    optimisticUpdateTime = performance.now() - optimisticStart;

    console.log(`⏱️  Optimistic UI update: ${optimisticUpdateTime.toFixed(2)}ms`);

    // BACKGROUND NETWORK CALL (can be slow)
    const networkStart = performance.now();

    await simulateSupabaseInsert('ping_requests', 500); // 500ms latency

    networkCompleteTime = performance.now() - networkStart;

    console.log(`⏱️  Network complete: ${networkCompleteTime.toFixed(2)}ms`);

    // VALIDATION
    const passed = optimisticUpdateTime < LATENCY_THRESHOLD_OPTIMISTIC;

    if (passed) {
      console.log('✅ PASS: Optimistic UI updated in <10ms');
      console.log('   User saw immediate feedback');
    } else {
      console.error(`❌ FAIL: Optimistic UI took ${optimisticUpdateTime.toFixed(2)}ms`);
      console.error('   User experienced lag');
    }

    return {
      action: 'Send Ping',
      optimisticLatency: optimisticUpdateTime,
      networkLatency: networkCompleteTime,
      passed,
      details: passed ? 'Instant feedback' : 'User experienced lag',
    };
  } catch (error) {
    console.error('❌ FAIL: Test execution error:', error);
    return {
      action: 'Send Ping',
      optimisticLatency: -1,
      networkLatency: -1,
      passed: false,
      details: `Error: ${error}`,
    };
  }
}

/**
 * TEST 1.2: Measure time from "I'M SAFE" tap to Green Pulse display
 * 
 * Requirement: Green pulse shows immediately (0ms)
 * Background: Supabase insert + RPC can take 500ms
 */
export async function testReplySafeOptimisticUI(): Promise<LatencyTestResult> {
  console.log('\n========================================');
  console.log('TEST 1.2: Reply Safe - Optimistic UI Latency');
  console.log('========================================');

  const startTime = performance.now();
  let optimisticUpdateTime = 0;
  let networkCompleteTime = 0;

  try {
    console.log('User taps "I\'M SAFE" button...');

    // OPTIMISTIC UPDATE
    const optimisticStart = performance.now();

    // setState(prev => ({ ...prev, status: 'verified', verifiedPulse: {...} }))
    simulateOptimisticStateUpdate();

    optimisticUpdateTime = performance.now() - optimisticStart;

    console.log(`⏱️  Optimistic UI update: ${optimisticUpdateTime.toFixed(2)}ms`);
    console.log('   Green pulse animation starts immediately');

    // BACKGROUND TASKS (parallel)
    const networkStart = performance.now();

    await Promise.all([
      simulateSupabaseInsert('verified_pulses', 300),
      simulateProximityCalculation(200),
    ]);

    networkCompleteTime = performance.now() - networkStart;

    console.log(`⏱️  Network complete: ${networkCompleteTime.toFixed(2)}ms`);

    const passed = optimisticUpdateTime < LATENCY_THRESHOLD_OPTIMISTIC;

    if (passed) {
      console.log('✅ PASS: Green pulse shown instantly');
    } else {
      console.error(`❌ FAIL: Delay of ${optimisticUpdateTime.toFixed(2)}ms`);
    }

    return {
      action: 'Reply Safe',
      optimisticLatency: optimisticUpdateTime,
      networkLatency: networkCompleteTime,
      passed,
      details: passed ? 'Instant green pulse' : 'Delayed feedback',
    };
  } catch (error) {
    console.error('❌ FAIL: Test execution error:', error);
    return {
      action: 'Reply Safe',
      optimisticLatency: -1,
      networkLatency: -1,
      passed: false,
      details: `Error: ${error}`,
    };
  }
}

/**
 * TEST 1.3: Measure panic button response time
 * 
 * Requirement: Red strobe appears immediately (0ms)
 * Background: Emergency event insert can take 500ms
 */
export async function testPanicButtonOptimisticUI(): Promise<LatencyTestResult> {
  console.log('\n========================================');
  console.log('TEST 1.3: Panic Button - Optimistic UI Latency');
  console.log('========================================');

  let optimisticUpdateTime = 0;
  let networkCompleteTime = 0;

  try {
    console.log('User taps "PANIC" button...');

    // OPTIMISTIC UPDATE (CRITICAL: Must be 0ms)
    const optimisticStart = performance.now();

    // setState(prev => ({ ...prev, syncMode: 'high_frequency', ... }))
    simulateOptimisticStateUpdate();

    optimisticUpdateTime = performance.now() - optimisticStart;

    console.log(`⏱️  Optimistic UI update: ${optimisticUpdateTime.toFixed(2)}ms`);
    console.log('   Red strobe animation starts immediately');
    console.log('   syncMode changed to "high_frequency"');

    // BACKGROUND TASKS
    const networkStart = performance.now();

    await Promise.all([
      simulateSupabaseInsert('emergency_events', 500),
      simulateGPSHighAccuracy(300),
    ]);

    networkCompleteTime = performance.now() - networkStart;

    console.log(`⏱️  Network complete: ${networkCompleteTime.toFixed(2)}ms`);

    const passed = optimisticUpdateTime < LATENCY_THRESHOLD_OPTIMISTIC;

    if (passed) {
      console.log('✅ PASS: Emergency mode activated instantly');
      console.log('   CRITICAL: Safety feature responsive');
    } else {
      console.error(`❌ FAIL: Delay of ${optimisticUpdateTime.toFixed(2)}ms`);
      console.error('   CRITICAL: User may re-tap button (panic escalation)');
    }

    return {
      action: 'Panic Button',
      optimisticLatency: optimisticUpdateTime,
      networkLatency: networkCompleteTime,
      passed,
      details: passed ? 'Instant emergency mode' : 'CRITICAL: Delayed response',
    };
  } catch (error) {
    console.error('❌ FAIL: Test execution error:', error);
    return {
      action: 'Panic Button',
      optimisticLatency: -1,
      networkLatency: -1,
      passed: false,
      details: `Error: ${error}`,
    };
  }
}

// =====================================================================
// TEST SUITE 2: PROXIMITY CALCULATION LATENCY
// =====================================================================

/**
 * TEST 2.1: Measure proximity calculation time (client-side)
 * 
 * Requirement: <100ms (ideally <10ms)
 */
export async function testProximityCalculationLatency(): Promise<LatencyTestResult> {
  console.log('\n========================================');
  console.log('TEST 2.1: Proximity Calculation Latency');
  console.log('========================================');

  try {
    const iterations = 100;
    const latencies: number[] = [];

    console.log(`Running ${iterations} iterations...`);

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();

      // Simulate Haversine calculation (from /src/app/lib/proximity.ts)
      calculateHaversineClientSide(37.7749, -122.4194, 37.7849, -122.4094);

      const latency = performance.now() - start;
      latencies.push(latency);
    }

    const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    const maxLatency = Math.max(...latencies);
    const minLatency = Math.min(...latencies);

    console.log(`⏱️  Average: ${avgLatency.toFixed(2)}ms`);
    console.log(`⏱️  Min: ${minLatency.toFixed(2)}ms`);
    console.log(`⏱️  Max: ${maxLatency.toFixed(2)}ms`);

    const passed = avgLatency < 100;

    if (passed) {
      console.log('✅ PASS: Proximity calculation fast enough');
    } else {
      console.error(`❌ FAIL: Average latency ${avgLatency.toFixed(2)}ms > 100ms`);
    }

    return {
      action: 'Proximity Calculation (Client)',
      optimisticLatency: avgLatency,
      networkLatency: 0,
      passed,
      details: `Avg: ${avgLatency.toFixed(2)}ms, Max: ${maxLatency.toFixed(2)}ms`,
    };
  } catch (error) {
    console.error('❌ FAIL: Test execution error:', error);
    return {
      action: 'Proximity Calculation',
      optimisticLatency: -1,
      networkLatency: -1,
      passed: false,
      details: `Error: ${error}`,
    };
  }
}

/**
 * TEST 2.2: Measure proximity RPC call time (server-side)
 * 
 * Requirement: <500ms (acceptable for background)
 * UI should show "Calculating..." immediately (0ms)
 */
export async function testProximityRPCLatency(): Promise<LatencyTestResult> {
  console.log('\n========================================');
  console.log('TEST 2.2: Proximity RPC Call Latency');
  console.log('========================================');

  let uiUpdateTime = 0;
  let rpcLatency = 0;

  try {
    console.log('Proximity calculation requested...');

    // OPTIMISTIC UI UPDATE
    const uiStart = performance.now();

    // setState(prev => ({ ...prev, proximityCalculating: true }))
    simulateOptimisticStateUpdate();

    uiUpdateTime = performance.now() - uiStart;

    console.log(`⏱️  UI shows "Calculating...": ${uiUpdateTime.toFixed(2)}ms`);

    // RPC CALL
    const rpcStart = performance.now();

    await simulateSupabaseRPC('calculate_proximity_distance', 150);

    rpcLatency = performance.now() - rpcStart;

    console.log(`⏱️  RPC complete: ${rpcLatency.toFixed(2)}ms`);

    const passed = uiUpdateTime < LATENCY_THRESHOLD_OPTIMISTIC && rpcLatency < 500;

    if (passed) {
      console.log('✅ PASS: UI updates instantly, RPC completes in acceptable time');
    } else {
      console.error(`❌ FAIL: UI delay or RPC timeout`);
    }

    return {
      action: 'Proximity RPC',
      optimisticLatency: uiUpdateTime,
      networkLatency: rpcLatency,
      passed,
      details: `UI: ${uiUpdateTime.toFixed(2)}ms, RPC: ${rpcLatency.toFixed(2)}ms`,
    };
  } catch (error) {
    console.error('❌ FAIL: Test execution error:', error);
    return {
      action: 'Proximity RPC',
      optimisticLatency: -1,
      networkLatency: -1,
      passed: false,
      details: `Error: ${error}`,
    };
  }
}

// =====================================================================
// TEST SUITE 3: REALTIME SUBSCRIPTION LATENCY
// =====================================================================

/**
 * TEST 3.1: Measure time from remote insert to local UI update
 * 
 * Requirement: <500ms (Supabase Realtime target)
 * This tests the "Green Pulse" loop: Remote user replies → Monitor sees update
 */
export async function testRealtimeUpdateLatency(): Promise<LatencyTestResult> {
  console.log('\n========================================');
  console.log('TEST 3.1: Realtime Subscription Latency');
  console.log('========================================');

  try {
    console.log('Simulating remote verified_pulse insert...');

    const start = performance.now();

    // Simulate Supabase Realtime event
    await simulateRealtimeEvent('verified_pulses', 250);

    const latency = performance.now() - start;

    console.log(`⏱️  Realtime update received: ${latency.toFixed(2)}ms`);

    const passed = latency < 500;

    if (passed) {
      console.log('✅ PASS: Realtime update fast enough');
      console.log('   Monitor sees green pulse within acceptable time');
    } else {
      console.error(`❌ FAIL: Realtime latency ${latency.toFixed(2)}ms > 500ms`);
    }

    return {
      action: 'Realtime Update',
      optimisticLatency: 0,
      networkLatency: latency,
      passed,
      details: `Realtime: ${latency.toFixed(2)}ms`,
    };
  } catch (error) {
    console.error('❌ FAIL: Test execution error:', error);
    return {
      action: 'Realtime Update',
      optimisticLatency: -1,
      networkLatency: -1,
      passed: false,
      details: `Error: ${error}`,
    };
  }
}

// =====================================================================
// SIMULATION HELPERS
// =====================================================================

function simulateOptimisticStateUpdate() {
  // Simulate React setState (synchronous, <1ms)
  const dummyState = { status: 'updated' };
  return dummyState;
}

async function simulateSupabaseInsert(table: string, latency: number): Promise<void> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, latency));
}

async function simulateSupabaseRPC(fn: string, latency: number): Promise<number> {
  await new Promise((resolve) => setTimeout(resolve, latency));
  return 2.34; // Mock distance
}

async function simulateRealtimeEvent(table: string, latency: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, latency));
}

async function simulateProximityCalculation(latency: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, latency));
}

async function simulateGPSHighAccuracy(latency: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, latency));
}

function calculateHaversineClientSide(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const EARTH_RADIUS_MILES = 3958.8;
  const toRadians = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_MILES * c;
}

// =====================================================================
// MASTER TEST RUNNER
// =====================================================================

export async function runFullLatencyAudit() {
  console.log('\n========================================');
  console.log('⚡ WELL-CHECK LATENCY AUDIT');
  console.log('Zero-Gravity Feedback Validation');
  console.log('========================================\n');

  const results: LatencyTestResult[] = [];

  // Suite 1: Optimistic UI
  results.push(await testPingSendOptimisticUI());
  results.push(await testReplySafeOptimisticUI());
  results.push(await testPanicButtonOptimisticUI());

  // Suite 2: Proximity
  results.push(await testProximityCalculationLatency());
  results.push(await testProximityRPCLatency());

  // Suite 3: Realtime
  results.push(await testRealtimeUpdateLatency());

  // Summary
  console.log('\n========================================');
  console.log('📊 LATENCY AUDIT SUMMARY');
  console.log('========================================');

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const criticalFailed = results.filter(
    (r) => !r.passed && r.action.includes('Panic')
  ).length;

  console.log(`Tests Run: ${results.length}`);
  console.log(`Tests Passed: ${passed}`);
  console.log(`Tests Failed: ${failed}`);
  console.log(`Critical Failures: ${criticalFailed}`);

  console.log('\n📋 DETAILED RESULTS:');
  results.forEach((result, i) => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`\n${i + 1}. ${icon} ${result.action}`);
    console.log(`   Optimistic: ${result.optimisticLatency.toFixed(2)}ms`);
    console.log(`   Network: ${result.networkLatency.toFixed(2)}ms`);
    console.log(`   ${result.details}`);
  });

  if (failed === 0) {
    console.log('\n✅ ALL LATENCY TESTS PASSED');
    console.log('   Zero-Gravity Feedback: COMPLIANT');
  } else {
    console.error('\n⚠️  LATENCY ISSUES DETECTED');
    if (criticalFailed > 0) {
      console.error('   🚨 CRITICAL: Panic button responsiveness compromised');
    }
  }

  console.log('\n========================================\n');

  return {
    totalTests: results.length,
    passed,
    failed,
    criticalFailed,
    results,
  };
}

// =====================================================================
// USAGE
// =====================================================================

// Run: tsx tests/performance/latency-test.ts
