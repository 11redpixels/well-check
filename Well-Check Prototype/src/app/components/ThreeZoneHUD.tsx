// 🛡️ Three-Zone HUD - Wrapper Component
// V7.5: Simplified wrapper for compatibility
// Reference: prd.md (3-Zone Architecture)

import { ReactNode } from 'react';

interface ThreeZoneHUDProps {
  currentView: 'map' | 'horizon' | 'ledger';
  onViewChange: (view: 'map' | 'horizon' | 'ledger') => void;
  children: {
    horizon: ReactNode;
    map: ReactNode;
    ledger: ReactNode;
  };
}

export function ThreeZoneHUD({ currentView, onViewChange, children }: ThreeZoneHUDProps) {
  // This is now a simple wrapper for backward compatibility
  // The real swipe logic is in SwipeableContainer
  
  return (
    <div className="w-full h-full">
      {currentView === 'horizon' && children.horizon}
      {currentView === 'map' && children.map}
      {currentView === 'ledger' && children.ledger}
    </div>
  );
}
