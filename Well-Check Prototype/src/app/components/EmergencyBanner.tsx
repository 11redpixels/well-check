// 🛡️ Emergency Banner - Red Breathing Strobe (Lockdown Mode)
// Coder: Persistent, non-swipeable emergency banner with strobe effect
// Reference: prd.md (Panic Module), PANIC_CONFIG
// ⚠️ CRITICAL: Must be visible at all times during active panic

import { useEffect, useState } from 'react';
import { AlertTriangle, MapPin, Clock, Shield } from 'lucide-react';
import type { PanicEvent } from '../types';

interface EmergencyBannerProps {
  panicEvent: PanicEvent;
  onResolve: () => void;
}

export function EmergencyBanner({ panicEvent, onResolve }: EmergencyBannerProps) {
  const [elapsedTime, setElapsedTime] = useState<string>('00:00');

  // Calculate elapsed time
  useEffect(() => {
    const updateElapsedTime = () => {
      const elapsed = Date.now() - panicEvent.triggeredAt;
      const minutes = Math.floor(elapsed / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);
      setElapsedTime(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
    };

    updateElapsedTime();
    const interval = setInterval(updateElapsedTime, 1000);

    return () => clearInterval(interval);
  }, [panicEvent.triggeredAt]);

  const formatLocation = () => {
    const { lat, lng } = panicEvent.location;
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  };

  return (
    <>
      {/* Strobe Animation Keyframes */}
      <style>{`
        @keyframes emergency-breathe {
          0%, 100% {
            opacity: 1;
            background-color: rgb(239 68 68);
          }
          50% {
            opacity: 0.7;
            background-color: rgb(220 38 38);
          }
        }

        .emergency-strobe {
          animation: emergency-breathe 2s ease-in-out infinite;
        }
      `}</style>

      {/* Fixed Banner - Non-Swipeable */}
      <div className="fixed top-0 left-0 right-0 z-[9999] emergency-strobe">
        {/* Main Banner */}
        <div className="p-4 border-b-4 border-white/30">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-10 h-10 text-white animate-pulse" />
              <div className="flex-1">
                <h1 className="text-white font-bold text-2xl">
                  🚨 EMERGENCY ACTIVE
                </h1>
                <p className="text-white/90 text-sm">
                  {panicEvent.userName} has triggered panic mode
                </p>
              </div>
              <div className="text-right">
                <p className="text-white font-mono text-2xl font-bold">{elapsedTime}</p>
                <p className="text-white/80 text-xs">Elapsed</p>
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              {/* Location */}
              <div className="flex items-center gap-2 p-2 bg-black/20 rounded">
                <MapPin className="w-5 h-5 text-white flex-shrink-0" />
                <div>
                  <p className="text-white/70 text-xs">GPS Location</p>
                  <p className="text-white font-mono text-xs">{formatLocation()}</p>
                </div>
              </div>

              {/* Triggered Time */}
              <div className="flex items-center gap-2 p-2 bg-black/20 rounded">
                <Clock className="w-5 h-5 text-white flex-shrink-0" />
                <div>
                  <p className="text-white/70 text-xs">Triggered At</p>
                  <p className="text-white text-xs">
                    {new Date(panicEvent.triggeredAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              {/* Mode */}
              <div className="flex items-center gap-2 p-2 bg-black/20 rounded">
                <Shield className="w-5 h-5 text-white flex-shrink-0" />
                <div>
                  <p className="text-white/70 text-xs">Mode</p>
                  <p className="text-white text-xs font-bold">
                    {panicEvent.isSilentMode ? 'Silent Panic' : 'Standard Panic'}
                  </p>
                </div>
              </div>
            </div>

            {/* Resolve Button */}
            <button
              onClick={onResolve}
              className="w-full h-[60px] bg-white text-[#FF4444] rounded-lg font-bold text-xl hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
            >
              <Shield className="w-6 h-6" />
              Resolve Emergency (Requires PIN)
            </button>
          </div>
        </div>

        {/* Secondary Info Bar */}
        <div className="bg-black/30 py-2 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between text-white/80 text-xs">
              <p>
                🔒 App in Lockdown Mode • Navigation Disabled
              </p>
              <p>
                GPS Pings: {panicEvent.gpsPings?.length || 0} • Accuracy:{' '}
                ±{panicEvent.location.accuracy.toFixed(0)}m
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
