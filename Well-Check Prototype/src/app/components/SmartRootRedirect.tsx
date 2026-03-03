// 🛡️ V8.9: Smart Root Redirect
// Mandate: First Launch → Medications (show EmptyState + Wizard)
//          Subsequent Launch → Map (situational awareness)

import { useEffect } from 'react';
import { useNavigate } from 'react-router';

const STORAGE_KEY = 'wellcheck_has_launched';
const FIRST_LAUNCH_ROUTE = '/medications'; // Show EmptyState + Wizard immediately
const RETURNING_USER_ROUTE = '/family-head'; // Full-screen map (The Pulse)

export function SmartRootRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if this is the first launch
    const hasLaunchedBefore = localStorage.getItem(STORAGE_KEY);

    if (!hasLaunchedBefore) {
      // First launch: Go to Medications (EmptyState + Wizard)
      console.log('[V8.9] First launch detected → /medications (EmptyState + Wizard)');
      localStorage.setItem(STORAGE_KEY, 'true');
      navigate(FIRST_LAUNCH_ROUTE, { replace: true });
    } else {
      // Subsequent launch: Go to Map (The Pulse)
      console.log('[V8.9] Returning user detected → /family-head (Full-screen map)');
      navigate(RETURNING_USER_ROUTE, { replace: true });
    }
  }, [navigate]);

  // Show nothing while redirecting (instant)
  return null;
}
