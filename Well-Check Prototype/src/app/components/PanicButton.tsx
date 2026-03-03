// 🛡️ Panic Button - 5-Second Hold-to-Activate
// Coder: Panic HUD with haptic feedback and prevent accidental triggers
// Reference: prd.md (Panic Module), PANIC_CONFIG
// ⚠️ CRITICAL: Zero margin for error

import { useState, useRef, useEffect } from 'react';
import { AlertTriangle, Volume2, VolumeX } from 'lucide-react';
import { PANIC_CONFIG } from '../types';

interface PanicButtonProps {
  userName: string;
  onPanicTriggered: (isSilentMode: boolean) => void;
  disabled?: boolean;
}

export function PanicButton({ userName, onPanicTriggered, disabled }: PanicButtonProps) {
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0); // 0-100%
  const [isSilentMode, setIsSilentMode] = useState(false);

  const holdStartTime = useRef<number>(0);
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hapticIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // =====================================================================
  // HOLD-TO-ACTIVATE LOGIC (5 seconds)
  // =====================================================================

  const startHold = () => {
    if (disabled) return;

    setIsHolding(true);
    holdStartTime.current = Date.now();
    setHoldProgress(0);

    console.log('🚨 Panic button hold started');

    // Update progress every 50ms
    holdIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - holdStartTime.current;
      const progress = Math.min((elapsed / PANIC_CONFIG.HOLD_TO_ACTIVATE_MS) * 100, 100);
      setHoldProgress(progress);

      // Trigger panic when 100%
      if (progress >= 100) {
        triggerPanic();
      }
    }, 50);

    // Haptic feedback every 500ms
    startHapticFeedback();
  };

  const endHold = () => {
    if (!isHolding) return;

    console.log('🚨 Panic button hold ended', {
      progress: holdProgress,
      triggered: holdProgress >= 100,
    });

    setIsHolding(false);
    setHoldProgress(0);

    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }

    stopHapticFeedback();
  };

  const triggerPanic = () => {
    console.log('🚨 PANIC TRIGGERED', { isSilentMode });
    
    // Stop intervals
    endHold();

    // Strong haptic feedback on trigger
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 100]);
    }

    // Call parent handler
    onPanicTriggered(isSilentMode);
  };

  // =====================================================================
  // HAPTIC FEEDBACK (500ms pulses)
  // =====================================================================

  const startHapticFeedback = () => {
    if (!navigator.vibrate) return;

    // Immediate pulse
    navigator.vibrate(50);

    // Pulse every 500ms
    hapticIntervalRef.current = setInterval(() => {
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, PANIC_CONFIG.HAPTIC_FEEDBACK_INTERVAL_MS);
  };

  const stopHapticFeedback = () => {
    if (hapticIntervalRef.current) {
      clearInterval(hapticIntervalRef.current);
      hapticIntervalRef.current = null;
    }

    if (navigator.vibrate) {
      navigator.vibrate(0); // Stop vibration
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
      if (hapticIntervalRef.current) clearInterval(hapticIntervalRef.current);
    };
  }, []);

  // =====================================================================
  // RENDER
  // =====================================================================

  return (
    <div className="w-full">
      {/* Silent Mode Toggle */}
      <div className="mb-6">
        <button
          onClick={() => setIsSilentMode(!isSilentMode)}
          disabled={disabled}
          className={`w-full h-[64px] rounded-lg border-2 flex items-center justify-between px-6 transition-colors ${
            isSilentMode
              ? 'bg-[#6366F1]/10 border-[#6366F1]'
              : 'bg-[#0F172A] border-[#334155] hover:border-[#84CC16]'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="flex items-center gap-3">
            {isSilentMode ? (
              <VolumeX className="w-6 h-6 text-[#6366F1]" />
            ) : (
              <Volume2 className="w-6 h-6 text-[#94A3B8]" />
            )}
            <div className="text-left">
              <p className={`font-bold text-base ${isSilentMode ? 'text-[#6366F1]' : 'text-white'}`}>
                {isSilentMode ? 'Silent Panic' : 'Standard Panic'}
              </p>
              <p className="text-[#64748B] text-xs">
                {isSilentMode ? '30-second audio buffer enabled' : 'Immediate family broadcast'}
              </p>
            </div>
          </div>

          {/* Toggle Indicator */}
          <div
            className={`w-14 h-8 rounded-full relative transition-colors ${
              isSilentMode ? 'bg-[#6366F1]' : 'bg-[#334155]'
            }`}
          >
            <div
              className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                isSilentMode ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </div>
        </button>
      </div>

      {/* Panic Button */}
      <div className="relative">
        {/* Hold Progress Background */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#FF4444] transition-all duration-50 ease-linear"
            style={{ width: `${holdProgress}%` }}
          />
        </div>

        {/* Button */}
        <button
          onMouseDown={startHold}
          onMouseUp={endHold}
          onMouseLeave={endHold}
          onTouchStart={startHold}
          onTouchEnd={endHold}
          disabled={disabled}
          className={`relative w-full aspect-square rounded-full border-8 flex flex-col items-center justify-center transition-all ${
            isHolding
              ? 'border-[#FF4444] bg-[#FF4444]/20 scale-95'
              : 'border-[#FF4444]/50 bg-[#FF4444]/10 hover:border-[#FF4444] hover:scale-105'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-90'}`}
        >
          {/* Icon */}
          <div
            className={`w-24 h-24 rounded-full bg-[#FF4444] flex items-center justify-center mb-4 ${
              isHolding ? 'scale-110' : ''
            } transition-transform`}
          >
            <AlertTriangle className="w-16 h-16 text-white" />
          </div>

          {/* Text */}
          <div className="text-center">
            <p className="text-white font-bold text-3xl mb-2">
              {isHolding ? `${Math.ceil((5 - (holdProgress / 20)))}s` : 'PANIC'}
            </p>
            <p className="text-[#94A3B8] text-base font-bold">
              {isHolding ? 'Hold to activate' : 'Hold for 5 seconds'}
            </p>
          </div>

          {/* Progress Ring */}
          {isHolding && (
            <div className="absolute inset-0 rounded-full">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#84CC16"
                  strokeWidth="4"
                  strokeDasharray={`${(holdProgress / 100) * 283} 283`}
                  className="transition-all duration-50 ease-linear"
                />
              </svg>
            </div>
          )}
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-[#0F172A] border border-[#334155] rounded-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#FBBF24] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-white font-bold text-sm mb-1">How to Use:</p>
            <ul className="text-[#94A3B8] text-xs space-y-1">
              <li>• Press and hold the button for 5 seconds</li>
              <li>• You will feel haptic pulses every 0.5 seconds</li>
              <li>• Release before 5 seconds to cancel</li>
              <li>• At 5 seconds, panic will automatically trigger</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Silent Mode Explanation */}
      {isSilentMode && (
        <div className="mt-4 p-4 bg-[#6366F1]/10 border border-[#6366F1] rounded-lg">
          <div className="flex items-start gap-3">
            <VolumeX className="w-5 h-5 text-[#6366F1] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[#6366F1] font-bold text-sm mb-1">Silent Panic Enabled:</p>
              <p className="text-[#94A3B8] text-xs">
                A 30-second audio buffer will be recorded and encrypted. Family will be notified
                discreetly without audible alerts on your device.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
