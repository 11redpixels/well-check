// Zone 3: Ghost - Ambient System Status (<5% screen real estate)
import { Wifi, WifiOff, Battery, BatteryLow, Navigation, Clock, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function GhostStatus() {
  const { isOffline, isSyncing, batteryLevel, lastSyncTimestamp, gpsAccuracy, currentPanicEvent, syncMode } = useApp();

  const formatTimeSince = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const getGPSColor = () => {
    switch (gpsAccuracy) {
      case 'high':
        return 'text-[#84CC16]'; // Safety Green
      case 'medium':
        return 'text-[#F59E0B]'; // Safety Amber
      case 'low':
        return 'text-[#FF4444]'; // Pulse Red
      default:
        return 'text-[var(--color-text-tertiary)]';
    }
  };

  return (
    <footer 
      className="fixed bottom-0 left-0 right-0 bg-[var(--color-card-bg)]/95 border-t border-[var(--color-border)] px-4 py-2 backdrop-blur-sm"
      role="status"
      aria-label="System status"
    >
      <div className="flex items-center justify-between gap-4 text-xs">
        {/* Sync Status + Mode Indicator */}
        <div className="flex items-center gap-1.5">
          {isOffline ? (
            <>
              <WifiOff className="w-3.5 h-3.5 text-[#FF4444]" aria-hidden="true" />
              <span className="text-[#FF4444] font-mono">Offline</span>
            </>
          ) : syncMode === 'high_frequency' || currentPanicEvent?.status === 'active' ? (
            <>
              <Zap className="w-3.5 h-3.5 text-[#FF4444] animate-pulse" aria-hidden="true" />
              <span className="text-[#FF4444] font-mono font-bold">EMERGENCY MODE</span>
            </>
          ) : isSyncing ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-[#F59E0B] animate-pulse" aria-hidden="true" />
              <span className="text-[#F59E0B] font-mono">Syncing...</span>
            </>
          ) : (
            <>
              <Wifi className="w-3.5 h-3.5 text-[#84CC16]" aria-hidden="true" />
              <span className="text-[var(--color-text-tertiary)] font-mono">✓ Synced</span>
            </>
          )}
        </div>

        {/* GPS Accuracy */}
        <div className="flex items-center gap-1.5">
          <Navigation className={`w-3.5 h-3.5 ${getGPSColor()}`} aria-hidden="true" />
          <span className={`font-mono ${getGPSColor()}`}>
            GPS {gpsAccuracy.toUpperCase()}
          </span>
        </div>

        {/* Battery Level */}
        <div className="flex items-center gap-1.5">
          {batteryLevel < 15 ? (
            <>
              <BatteryLow className="w-3.5 h-3.5 text-[#FF4444] animate-pulse" aria-hidden="true" />
              <span className="text-[#FF4444] font-mono font-bold">{batteryLevel}%</span>
            </>
          ) : (
            <>
              <Battery className="w-3.5 h-3.5 text-[var(--color-text-tertiary)]" aria-hidden="true" />
              <span className="text-[var(--color-text-tertiary)] font-mono">{batteryLevel}%</span>
            </>
          )}
        </div>

        {/* Last Sync Time */}
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[var(--color-text-tertiary)]" aria-hidden="true" />
          <span className="text-[var(--color-text-tertiary)] font-mono">{formatTimeSince(lastSyncTimestamp)}</span>
        </div>
      </div>
    </footer>
  );
}