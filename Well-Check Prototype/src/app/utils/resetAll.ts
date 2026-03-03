// 🔧 Emergency Reset Utility
// Clears ALL localStorage data and resets app to initial state

export function resetAllData() {
  console.log('🔄 RESETTING ALL DATA...');
  
  // Clear all Well-Check localStorage keys
  const keysToRemove = [
    'well-check-state',
    'well-check-capabilities',
    'well-check-safety-terms-accepted',
    'well-check-panic-events',
    'well-check-safety-terms',
    'well-check-family-pins',
    'well-check-medications',
    'well-check-medication-logs',
    'well-check-doctor-visits',
  ];
  
  keysToRemove.forEach((key) => {
    localStorage.removeItem(key);
    console.log(`✅ Cleared: ${key}`);
  });
  
  console.log('✅ ALL DATA RESET COMPLETE');
  
  // Force reload to reinitialize app
  window.location.reload();
}

export function resetSpecificModule(module: 'panic' | 'medications' | 'doctorVisits' | 'all') {
  console.log(`🔄 Resetting module: ${module}`);
  
  switch (module) {
    case 'panic':
      localStorage.removeItem('well-check-panic-events');
      localStorage.removeItem('well-check-safety-terms');
      localStorage.removeItem('well-check-family-pins');
      break;
    case 'medications':
      localStorage.removeItem('well-check-medications');
      localStorage.removeItem('well-check-medication-logs');
      break;
    case 'doctorVisits':
      localStorage.removeItem('well-check-doctor-visits');
      break;
    case 'all':
      resetAllData();
      return;
  }
  
  console.log(`✅ ${module} reset complete`);
  window.location.reload();
}
