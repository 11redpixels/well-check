// Primary User View: "I'm Safe" and Panic buttons
import { Shield, AlertTriangle, MapPin, Activity } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StateVisuals } from './StateVisuals';
import { toast } from 'sonner';

export function PrimaryUserView() {
  const { status, replySafe, triggerPanic, currentUser, batteryLevel, gpsAccuracy, activePings, requestLocationPermission } =
    useApp();
  const [buttonPulse, setButtonPulse] = useState<'safe' | 'panic' | null>(null);

  const hasPendingPing = activePings.some(
    (p) => p.toUserId === currentUser?.id && p.status === 'pending'
  );

  const handleSafeClick = async () => {
    // ✅ FIX: Check GPS permission before sending safety pulse
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      return; // GPS permission denied - error message already shown by requestLocationPermission()
    }

    // 0ms visual feedback
    setButtonPulse('safe');
    setTimeout(() => setButtonPulse(null), 200);

    // Haptic feedback (iOS Safari only, gracefully degrades)
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }

    replySafe();
    toast.success('I\'m Safe message sent', {
      description: 'Your family can see you\'re okay',
    });
  };

  const handlePanicClick = async () => {
    // ✅ FIX: Check GPS permission before triggering panic
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      toast.error('Cannot trigger emergency mode without location access', {
        description: 'Please enable GPS to use emergency features',
        duration: 10000,
      });
      return;
    }

    // 0ms visual feedback
    setButtonPulse('panic');
    setTimeout(() => setButtonPulse(null), 200);

    // Haptic feedback (stronger for panic)
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }

    triggerPanic();
    toast.error('EMERGENCY ALERT SENT', {
      description: 'All family members notified',
    });
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
      <StateVisuals status={status} />

      {/* Map Placeholder */}
      <div className="w-full max-w-2xl mb-8 bg-[#1E293B] rounded-lg border-2 border-[#334155] overflow-hidden">
        <div className="aspect-video relative bg-gradient-to-br from-[#0F172A] to-[#1E293B] flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-16 h-16 text-[#3B82F6] mx-auto mb-3" aria-hidden="true" />
            <p className="text-white font-bold text-lg">Live Location Map</p>
            <p className="text-[#64748B] text-sm mt-1">
              GPS: {gpsAccuracy.toUpperCase()} • Battery: {batteryLevel}%
            </p>
          </div>

          {/* Mock Location Marker */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="w-4 h-4 bg-[#3B82F6] rounded-full animate-pulse shadow-lg shadow-[#3B82F6]/50" />
              <div className="absolute inset-0 w-4 h-4 bg-[#3B82F6] rounded-full animate-ping" />
            </div>
          </div>
        </div>
      </div>

      {/* Status Message */}
      {status === 'ping_sent' && hasPendingPing && (
        <div className="w-full max-w-2xl mb-6 bg-[#FBBF24]/10 border-2 border-[#FBBF24] rounded-lg p-4 animate-pulse">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-[#FBBF24]" aria-hidden="true" />
            <div>
              <p className="text-white font-bold">Safety Check Requested</p>
              <p className="text-[#FBBF24] text-sm">
                {activePings.find((p) => p.toUserId === currentUser?.id)?.fromUserName} is checking
                on you
              </p>
            </div>
          </div>
        </div>
      )}

      {status === 'verified' && (
        <div className="w-full max-w-2xl mb-6 bg-[#00FF00]/10 border-2 border-[#00FF00] rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-[#00FF00]" aria-hidden="true" />
            <div>
              <p className="text-white font-bold">✓ Safety Confirmed</p>
              <p className="text-[#00FF00] text-sm">Your family has been notified</p>
            </div>
          </div>
        </div>
      )}

      {status === 'panic' && (
        <div className="w-full max-w-2xl mb-6 bg-[#FF0000]/20 border-2 border-[#FF0000] rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-[#FF0000] animate-pulse" aria-hidden="true" />
            <div>
              <p className="text-white font-bold">⚠ EMERGENCY MODE ACTIVE</p>
              <p className="text-[#FF6B6B] text-sm">Broadcasting to all family members</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* I'm Safe Button */}
        <button
          onClick={handleSafeClick}
          disabled={status === 'panic'}
          className={`min-h-[80px] rounded-lg font-bold text-xl transition-all transform ${
            buttonPulse === 'safe' ? 'scale-95' : 'scale-100'
          } ${
            status === 'panic'
              ? 'bg-[#334155] text-[#64748B] cursor-not-allowed'
              : 'bg-[#00FF00] text-[#0F172A] hover:bg-[#00FF00]/90 shadow-lg shadow-[#00FF00]/25 active:scale-95'
          }`}
          aria-label="Send I'm Safe pulse"
        >
          <div className="flex items-center justify-center gap-3">
            <Shield className="w-8 h-8" aria-hidden="true" />
            <span>I'M SAFE</span>
          </div>
        </button>

        {/* Panic Button */}
        <button
          onClick={handlePanicClick}
          disabled={status === 'panic'}
          className={`min-h-[80px] rounded-lg font-bold text-xl transition-all transform ${
            buttonPulse === 'panic' ? 'scale-95' : 'scale-100'
          } ${
            status === 'panic'
              ? 'bg-[#FF0000]/50 text-white cursor-not-allowed'
              : 'bg-[#FF0000] text-white hover:bg-[#FF0000]/90 shadow-lg shadow-[#FF0000]/25 active:scale-95'
          }`}
          aria-label="Trigger emergency panic alert"
        >
          <div className="flex items-center justify-center gap-3">
            <AlertTriangle className="w-8 h-8" aria-hidden="true" />
            <span>PANIC</span>
          </div>
        </button>
      </div>

      {/* Helper Text */}
      <p className="text-[#64748B] text-sm mt-6 text-center max-w-md">
        {status === 'panic'
          ? 'Emergency mode active. Your location is being shared with all family members.'
          : 'Tap "I\'m Safe" to share your location and battery status with your family.'}
      </p>
    </div>
  );
}