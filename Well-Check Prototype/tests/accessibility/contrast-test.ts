// =====================================================================
// CONTRAST RATIO VALIDATION TEST
// WCAG 2.1 AAA Compliance: 7:1 for Normal Text
// =====================================================================
//
// Purpose: Verify emergency strobe meets 7:1 contrast requirement
// Reference: Guidelines.md - "Minimum 7:1 contrast ratio"
// Standard: WCAG 2.1 Level AAA
//
// =====================================================================

// =====================================================================
// CONTRAST CALCULATION UTILITIES
// =====================================================================

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) throw new Error(`Invalid hex color: ${hex}`);

  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/**
 * Calculate relative luminance (WCAG formula)
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
function getLuminance(r: number, g: number, b: number): number {
  const rsRGB = r / 255;
  const gsRGB = g / 255;
  const bsRGB = b / 255;

  const rLin = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const gLin = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const bLin = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
}

/**
 * Calculate contrast ratio between two colors
 * Formula: (L1 + 0.05) / (L2 + 0.05)
 * Where L1 is luminance of lighter color, L2 is darker
 */
function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Format contrast ratio for display
 */
function formatRatio(ratio: number): string {
  return `${ratio.toFixed(2)}:1`;
}

/**
 * Check if contrast meets WCAG level
 */
function checkWCAGCompliance(ratio: number): {
  aaaNormal: boolean; // 7:1
  aaNormal: boolean; // 4.5:1
  aaLarge: boolean; // 3:1
  level: 'AAA' | 'AA' | 'AA Large' | 'FAIL';
} {
  return {
    aaaNormal: ratio >= 7,
    aaNormal: ratio >= 4.5,
    aaLarge: ratio >= 3,
    level: ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : ratio >= 3 ? 'AA Large' : 'FAIL',
  };
}

// =====================================================================
// TEST SUITE: WELL-CHECK COLOR PALETTE
// =====================================================================

interface ContrastTestResult {
  foreground: string;
  foregroundName: string;
  background: string;
  backgroundName: string;
  ratio: number;
  compliance: ReturnType<typeof checkWCAGCompliance>;
  passed: boolean;
  details: string;
}

/**
 * TEST 1: Emergency Red on Midnight Background
 * 
 * Location: Emergency strobe border (App.tsx with .emergency-strobe)
 * Requirement: 7:1 contrast for AAA compliance
 */
export function testEmergencyStrobeContrast(): ContrastTestResult {
  console.log('\n========================================');
  console.log('TEST 1: Emergency Strobe Contrast');
  console.log('========================================');

  const EMERGENCY_RED = '#FF6B6B'; // From guidelines
  const MIDNIGHT_BG = '#0F172A'; // Deep Slate/Midnight

  console.log(`Foreground: ${EMERGENCY_RED} (Emergency Red)`);
  console.log(`Background: ${MIDNIGHT_BG} (Midnight)`);

  const ratio = getContrastRatio(EMERGENCY_RED, MIDNIGHT_BG);
  const compliance = checkWCAGCompliance(ratio);

  console.log(`\n⚖️  Contrast Ratio: ${formatRatio(ratio)}`);
  console.log(`📊 WCAG Compliance:`);
  console.log(`   AAA (7:1): ${compliance.aaaNormal ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   AA (4.5:1): ${compliance.aaNormal ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   AA Large (3:1): ${compliance.aaLarge ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Level: ${compliance.level}`);

  const passed = compliance.aaaNormal;

  if (passed) {
    console.log('\n✅ PASS: Emergency strobe meets 7:1 requirement');
    console.log('   Safe for users with visual impairments');
  } else {
    console.error('\n❌ FAIL: Emergency strobe does not meet 7:1 requirement');
    console.error(`   Current: ${formatRatio(ratio)}, Required: 7:1`);
    console.error('   WCAG AAA compliance: FAILED');
  }

  return {
    foreground: EMERGENCY_RED,
    foregroundName: 'Emergency Red',
    background: MIDNIGHT_BG,
    backgroundName: 'Midnight Background',
    ratio,
    compliance,
    passed,
    details: passed ? `Exceeds requirement (${formatRatio(ratio)})` : 'Below AAA threshold',
  };
}

/**
 * TEST 2: Safety Green on Midnight Background
 * 
 * Location: Verified pulse card, success states
 * Requirement: 7:1 contrast
 */
export function testSafetyGreenContrast(): ContrastTestResult {
  console.log('\n========================================');
  console.log('TEST 2: Safety Green Contrast');
  console.log('========================================');

  const SAFETY_GREEN = '#00FF00'; // From guidelines
  const MIDNIGHT_BG = '#0F172A';

  console.log(`Foreground: ${SAFETY_GREEN} (Safety Green)`);
  console.log(`Background: ${MIDNIGHT_BG} (Midnight)`);

  const ratio = getContrastRatio(SAFETY_GREEN, MIDNIGHT_BG);
  const compliance = checkWCAGCompliance(ratio);

  console.log(`\n⚖️  Contrast Ratio: ${formatRatio(ratio)}`);
  console.log(`📊 WCAG Level: ${compliance.level}`);

  const passed = compliance.aaaNormal;

  if (passed) {
    console.log('\n✅ PASS: Safety Green meets 7:1 requirement');
  } else {
    console.error('\n❌ FAIL: Safety Green contrast insufficient');
  }

  return {
    foreground: SAFETY_GREEN,
    foregroundName: 'Safety Green',
    background: MIDNIGHT_BG,
    backgroundName: 'Midnight Background',
    ratio,
    compliance,
    passed,
    details: passed ? 'Compliant' : 'Insufficient contrast',
  };
}

/**
 * TEST 3: Amber (Moderate Distance) on Midnight Background
 * 
 * Location: Distance zone badges (1-5 miles)
 * Requirement: 7:1 contrast
 */
export function testAmberContrast(): ContrastTestResult {
  console.log('\n========================================');
  console.log('TEST 3: Amber (Warning) Contrast');
  console.log('========================================');

  const AMBER = '#FBBF24'; // From VerifiedPulseCard
  const MIDNIGHT_BG = '#0F172A';

  console.log(`Foreground: ${AMBER} (Amber Warning)`);
  console.log(`Background: ${MIDNIGHT_BG} (Midnight)`);

  const ratio = getContrastRatio(AMBER, MIDNIGHT_BG);
  const compliance = checkWCAGCompliance(ratio);

  console.log(`\n⚖️  Contrast Ratio: ${formatRatio(ratio)}`);
  console.log(`📊 WCAG Level: ${compliance.level}`);

  const passed = compliance.aaaNormal;

  if (passed) {
    console.log('\n✅ PASS: Amber meets 7:1 requirement');
  } else {
    console.error('\n❌ FAIL: Amber contrast insufficient');
    console.error('   Consider darkening Amber or lightening background');
  }

  return {
    foreground: AMBER,
    foregroundName: 'Amber Warning',
    background: MIDNIGHT_BG,
    backgroundName: 'Midnight Background',
    ratio,
    compliance,
    passed,
    details: passed ? 'Compliant' : 'May need adjustment',
  };
}

/**
 * TEST 4: White Text on Slate Card Background
 * 
 * Location: Card content (family member names, timestamps)
 * Requirement: 7:1 contrast
 */
export function testWhiteTextContrast(): ContrastTestResult {
  console.log('\n========================================');
  console.log('TEST 4: White Text on Slate Card');
  console.log('========================================');

  const WHITE = '#FFFFFF';
  const SLATE_CARD = '#1E293B'; // Card background

  console.log(`Foreground: ${WHITE} (White Text)`);
  console.log(`Background: ${SLATE_CARD} (Slate Card)`);

  const ratio = getContrastRatio(WHITE, SLATE_CARD);
  const compliance = checkWCAGCompliance(ratio);

  console.log(`\n⚖️  Contrast Ratio: ${formatRatio(ratio)}`);
  console.log(`📊 WCAG Level: ${compliance.level}`);

  const passed = compliance.aaaNormal;

  if (passed) {
    console.log('\n✅ PASS: White text highly readable');
  } else {
    console.error('\n❌ FAIL: White text contrast insufficient');
  }

  return {
    foreground: WHITE,
    foregroundName: 'White Text',
    background: SLATE_CARD,
    backgroundName: 'Slate Card',
    ratio,
    compliance,
    passed,
    details: passed ? 'Highly readable' : 'Low readability',
  };
}

/**
 * TEST 5: Emergency Strobe Border Opacity (0.3 → 0.6)
 * 
 * Location: App.tsx emergency-strobe animation
 * Challenge: Opacity affects perceived contrast
 */
export function testEmergencyStrobeOpacityRange(): {
  minOpacity: ContrastTestResult;
  maxOpacity: ContrastTestResult;
  passed: boolean;
} {
  console.log('\n========================================');
  console.log('TEST 5: Emergency Strobe Opacity Range');
  console.log('========================================');

  const EMERGENCY_RED = '#FF6B6B';
  const MIDNIGHT_BG = '#0F172A';

  console.log('Testing opacity range: 0.3 → 0.6 (breathing animation)');

  // Simulate opacity by blending colors
  const minOpacityColor = blendColors(EMERGENCY_RED, MIDNIGHT_BG, 0.3);
  const maxOpacityColor = blendColors(EMERGENCY_RED, MIDNIGHT_BG, 0.6);

  console.log(`\n📉 Min Opacity (0.3): ${minOpacityColor}`);
  const minRatio = getContrastRatio(minOpacityColor, MIDNIGHT_BG);
  const minCompliance = checkWCAGCompliance(minRatio);
  console.log(`   Contrast: ${formatRatio(minRatio)}`);
  console.log(`   Level: ${minCompliance.level}`);

  console.log(`\n📈 Max Opacity (0.6): ${maxOpacityColor}`);
  const maxRatio = getContrastRatio(maxOpacityColor, MIDNIGHT_BG);
  const maxCompliance = checkWCAGCompliance(maxRatio);
  console.log(`   Contrast: ${formatRatio(maxRatio)}`);
  console.log(`   Level: ${maxCompliance.level}`);

  const passed = minCompliance.aaaNormal && maxCompliance.aaaNormal;

  if (passed) {
    console.log('\n✅ PASS: Strobe maintains 7:1 throughout animation');
  } else {
    console.error('\n❌ FAIL: Strobe drops below 7:1 at min opacity');
    console.error('   Recommendation: Increase min opacity or adjust color');
  }

  return {
    minOpacity: {
      foreground: minOpacityColor,
      foregroundName: 'Emergency Red (0.3 opacity)',
      background: MIDNIGHT_BG,
      backgroundName: 'Midnight',
      ratio: minRatio,
      compliance: minCompliance,
      passed: minCompliance.aaaNormal,
      details: `Min animation state`,
    },
    maxOpacity: {
      foreground: maxOpacityColor,
      foregroundName: 'Emergency Red (0.6 opacity)',
      background: MIDNIGHT_BG,
      backgroundName: 'Midnight',
      ratio: maxRatio,
      compliance: maxCompliance,
      passed: maxCompliance.aaaNormal,
      details: `Max animation state`,
    },
    passed,
  };
}

/**
 * Blend two colors with opacity (simulate rgba)
 */
function blendColors(foreground: string, background: string, opacity: number): string {
  const fg = hexToRgb(foreground);
  const bg = hexToRgb(background);

  const r = Math.round(fg.r * opacity + bg.r * (1 - opacity));
  const g = Math.round(fg.g * opacity + bg.g * (1 - opacity));
  const b = Math.round(fg.b * opacity + bg.b * (1 - opacity));

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b
    .toString(16)
    .padStart(2, '0')}`;
}

// =====================================================================
// TEST SUITE 6: BATTERY ALERT COLORS
// =====================================================================

/**
 * TEST 6: Battery Alert Red (<15%)
 * 
 * Location: GhostStatus battery icon, FamilyMemberCard
 * Requirement: Must stand out against background
 */
export function testBatteryAlertContrast(): ContrastTestResult {
  console.log('\n========================================');
  console.log('TEST 6: Battery Alert Red Contrast');
  console.log('========================================');

  const BATTERY_RED = '#FF6B6B'; // Same as emergency red
  const GHOST_BG = '#1E293B'; // GhostStatus background

  console.log(`Foreground: ${BATTERY_RED} (Battery Alert)`);
  console.log(`Background: ${GHOST_BG} (Ghost Status BG)`);

  const ratio = getContrastRatio(BATTERY_RED, GHOST_BG);
  const compliance = checkWCAGCompliance(ratio);

  console.log(`\n⚖️  Contrast Ratio: ${formatRatio(ratio)}`);
  console.log(`📊 WCAG Level: ${compliance.level}`);

  const passed = compliance.aaaNormal;

  if (passed) {
    console.log('\n✅ PASS: Battery alert highly visible');
  } else {
    console.error('\n❌ FAIL: Battery alert may be missed');
  }

  return {
    foreground: BATTERY_RED,
    foregroundName: 'Battery Alert Red',
    background: GHOST_BG,
    backgroundName: 'Ghost Status Background',
    ratio,
    compliance,
    passed,
    details: passed ? 'Highly visible' : 'Insufficient visibility',
  };
}

// =====================================================================
// MASTER TEST RUNNER
// =====================================================================

export function runFullContrastAudit() {
  console.log('\n========================================');
  console.log('🎨 WELL-CHECK CONTRAST AUDIT');
  console.log('WCAG 2.1 AAA Compliance (7:1)');
  console.log('========================================\n');

  const results: ContrastTestResult[] = [];

  // Core color tests
  results.push(testEmergencyStrobeContrast());
  results.push(testSafetyGreenContrast());
  results.push(testAmberContrast());
  results.push(testWhiteTextContrast());
  results.push(testBatteryAlertContrast());

  // Opacity test
  const opacityTest = testEmergencyStrobeOpacityRange();
  results.push(opacityTest.minOpacity);
  results.push(opacityTest.maxOpacity);

  // Summary
  console.log('\n========================================');
  console.log('📊 CONTRAST AUDIT SUMMARY');
  console.log('========================================');

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const criticalFailed = results.filter(
    (r) => !r.passed && r.foregroundName.includes('Emergency')
  ).length;

  console.log(`Tests Run: ${results.length}`);
  console.log(`Tests Passed (7:1): ${passed}`);
  console.log(`Tests Failed: ${failed}`);
  console.log(`Critical Failures: ${criticalFailed}`);

  console.log('\n📋 DETAILED RESULTS:');
  results.forEach((result, i) => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`\n${i + 1}. ${icon} ${result.foregroundName} on ${result.backgroundName}`);
    console.log(`   Ratio: ${formatRatio(result.ratio)}`);
    console.log(`   Level: ${result.compliance.level}`);
    console.log(`   ${result.details}`);
  });

  console.log('\n========================================');
  console.log('🔍 RECOMMENDATIONS');
  console.log('========================================');

  const failedTests = results.filter((r) => !r.passed);

  if (failedTests.length === 0) {
    console.log('✅ ALL COLORS MEET WCAG AAA (7:1)');
    console.log('   No changes required');
  } else {
    console.error('⚠️  CONTRAST ISSUES DETECTED:');
    failedTests.forEach((test) => {
      console.error(`\n• ${test.foregroundName} on ${test.backgroundName}`);
      console.error(`  Current: ${formatRatio(test.ratio)}, Required: 7:1`);

      // Calculate required adjustment
      const currentLum = getLuminance(
        hexToRgb(test.foreground).r,
        hexToRgb(test.foreground).g,
        hexToRgb(test.foreground).b
      );
      const bgLum = getLuminance(
        hexToRgb(test.background).r,
        hexToRgb(test.background).g,
        hexToRgb(test.background).b
      );

      if (currentLum > bgLum) {
        console.error('  Fix: Lighten foreground color');
      } else {
        console.error('  Fix: Darken foreground color or lighten background');
      }
    });
  }

  console.log('\n========================================\n');

  return {
    totalTests: results.length,
    passed,
    failed,
    criticalFailed,
    results,
    overallPassed: failed === 0,
  };
}

// =====================================================================
// USAGE
// =====================================================================

// Run: tsx tests/accessibility/contrast-test.ts
