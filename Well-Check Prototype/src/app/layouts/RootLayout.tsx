// 🛡️ Root Layout - Main App Container with 3-Zone HUD
// V7.6: Clean Glass HUD - Header removed for full-screen map
// V9.0: Floating Panic Hub - Fixed bottom-center panic button (all routes)
// V9.3: PanicOverlay - Progressive dimming during panic hold
// V9.4: PerspectiveButton - Fixed bottom-right, role-specific drawer
// V10.0: Headless UI - AppHeader deleted, CommandCenter renamed
// V10.2: HUD Stripping - Only 2 buttons (Panic Red + Command Center Blue)
import { useState } from 'react';
import { Outlet } from 'react-router';
import { Toaster } from 'sonner';
import { GhostStatus } from '../components/GhostStatus';
import { DemoControlsRobust } from '../components/DemoControlsRobust';
import { FloatingPanicButton } from '../components/FloatingPanicButton';
import { PanicOverlay } from '../components/PanicOverlay';
import { CommandCenterButton } from '../components/CommandCenterButton';
import { CommandCenterDrawer } from '../components/CommandCenterDrawer';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';

export function RootLayout() {
  const { currentUser, syncMode, currentPanicEvent, batteryLevel, gpsAccuracy, isOffline, isSyncing } = useApp();
  const { theme } = useTheme();
  const [isCommandCenterDrawerOpen, setIsCommandCenterDrawerOpen] = useState(false);

  const isEmergencyMode = syncMode === 'high_frequency' || currentPanicEvent?.status === 'active';

  return (
    <div className={`min-h-screen bg-[var(--color-bg)] flex flex-col ${isEmergencyMode ? 'emergency-strobe' : ''}`}>
      {/* V10.0: Headless UI - AppHeader deleted, full viewport */}
      {/* V10.2: HUD Stripping - Only 2 buttons (Panic Red + Command Center Blue) */}
      
      {/* Main Content (Full Screen) - No Suspense wrapper needed with direct imports */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      {/* Footer Status (Ghost Zone) */}
      <GhostStatus />

      {/* V9.0: Floating Panic Button - Fixed bottom-center (72px circular, Emergency Red) */}
      {/* V10.1: Vertical shift up 24px for mobile aspect ratio compatibility */}
      <FloatingPanicButton />

      {/* Toast Notifications - V13.0: Theme-aware */}
      <Toaster
        position="top-center"
        theme={theme === 'light' ? 'light' : 'dark'}
        toastOptions={{
          style: theme === 'light' ? {
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            color: '#0F172A',
          } : {
            background: '#1E293B',
            border: '1px solid #334155',
            color: '#FFFFFF',
          },
        }}
      />

      {/* Demo Controls */}
      <DemoControlsRobust />

      {/* V9.3: PanicOverlay - Progressive dimming during panic hold */}
      <PanicOverlay />

      {/* V10.0: CommandCenterButton + Drawer - Fixed bottom-right, Industrial Blue */}
      {/* V10.2: Only 2 buttons (Panic + Command Center) - HUD Stripping complete */}
      <CommandCenterButton 
        onToggle={() => setIsCommandCenterDrawerOpen(!isCommandCenterDrawerOpen)}
        isOpen={isCommandCenterDrawerOpen}
      />
      <CommandCenterDrawer 
        isOpen={isCommandCenterDrawerOpen}
        onClose={() => setIsCommandCenterDrawerOpen(false)}
        userRole={currentUser?.role || 'family_head'}
      />
    </div>
  );
}