// 🚨 PILLAR 5: Swipe-Up Gesture Detector (Global Panic Trigger)
// Mandate: From ANY screen, swipe-up → Hold 5s → Panic triggered

import { useEffect, useState, useRef } from 'react';

interface SwipeUpGestureProps {
  onPanicTriggered: () => void;
  isEnabled: boolean; // Disable during panic lockdown
}

export function SwipeUpGesture({ onPanicTriggered, isEnabled }: SwipeUpGestureProps) {
  const [isSwipedUp, setIsSwipedUp] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const SWIPE_THRESHOLD = 100; // pixels
  const HOLD_DURATION = 5000; // 5 seconds
  const HAPTIC_INTERVAL = 500; // ms

  useEffect(() => {
    if (!isEnabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      // Only detect swipe from bottom 20% of screen
      if (touch.clientY > window.innerHeight * 0.8) {
        setTouchStartY(touch.clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartY === null) return;

      const touch = e.touches[0];
      const deltaY = touchStartY - touch.clientY;

      // Check if swiped up enough
      if (deltaY > SWIPE_THRESHOLD && !isSwipedUp) {
        setIsSwipedUp(true);
        startHoldTimer();
        
        // Haptic feedback (initial)
        if (navigator.vibrate) {
          navigator.vibrate(30);
        }
      }
    };

    const handleTouchEnd = () => {
      setTouchStartY(null);
      cancelHoldTimer();
      setIsSwipedUp(false);
      setHoldProgress(0);
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
      cancelHoldTimer();
    };
  }, [isEnabled, touchStartY, isSwipedUp]);

  const startHoldTimer = () => {
    // Progress animation (0-100 over 5 seconds)
    const startTime = Date.now();
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / HOLD_DURATION) * 100, 100);
      setHoldProgress(progress);

      // Haptic feedback every 500ms
      if (elapsed % HAPTIC_INTERVAL === 0 && navigator.vibrate) {
        navigator.vibrate(30);
      }

      if (progress >= 100) {
        triggerPanic();
      }
    }, 50);

    // Safety timeout
    holdTimerRef.current = setTimeout(() => {
      triggerPanic();
    }, HOLD_DURATION);
  };

  const cancelHoldTimer = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const triggerPanic = () => {
    cancelHoldTimer();
    setIsSwipedUp(false);
    setHoldProgress(0);

    // Strong haptic feedback (panic activated)
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 100]);
    }

    onPanicTriggered();
  };

  if (!isEnabled) return null;

  return (
    <>
      {/* Swipe-Up Indicator (Always visible at bottom) */}
      <div className="fixed bottom-0 left-0 right-0 pointer-events-none z-[90]">
        <div className="flex items-center justify-center pb-8">
          <div className="bg-[#FF4444]/20 backdrop-blur-sm border-2 border-[#FF4444] rounded-full px-6 py-3 flex items-center gap-2 animate-pulse-soft">
            <span className="text-2xl">🚨</span>
            <span className="text-sm font-bold text-white">
              Swipe up for Panic
            </span>
            <span className="text-2xl animate-bounce-slow">↑</span>
          </div>
        </div>
      </div>

      {/* Hold Overlay (visible when swiped up) */}
      {isSwipedUp && (
        <div className="fixed inset-0 bg-[#FF4444]/30 backdrop-blur-lg z-[95] flex items-center justify-center animate-fade-in">
          <div className="text-center space-y-6">
            {/* Circular Progress */}
            <div className="relative w-64 h-64 mx-auto">
              {/* Background Circle */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="128"
                  cy="128"
                  r="112"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="16"
                />
                {/* Progress Circle */}
                <circle
                  cx="128"
                  cy="128"
                  r="112"
                  fill="none"
                  stroke="#FF4444"
                  strokeWidth="16"
                  strokeDasharray={`${2 * Math.PI * 112}`}
                  strokeDashoffset={`${2 * Math.PI * 112 * (1 - holdProgress / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-100"
                />
              </svg>

              {/* Center Content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div>
                  <div className="text-8xl mb-4 animate-spin-slow">🚨</div>
                  <div className="text-4xl font-bold text-white tabular-nums">
                    {Math.ceil((5 - (holdProgress / 100) * 5) * 10) / 10}s
                  </div>
                  <div className="text-sm text-white/70 mt-2">Hold to activate</div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-[#0F172A]/80 rounded-lg px-8 py-4 border border-[#FF4444]">
              <p className="text-xl font-bold text-white">
                Hold position to trigger Panic Mode
              </p>
              <p className="text-sm text-white/70 mt-1">
                Release to cancel
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      <style jsx>{`
        @keyframes pulse-soft {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }

        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-pulse-soft {
          animation: pulse-soft 3s ease-in-out infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-spin-slow {
          animation: spin-slow 4s linear infinite;
        }
      `}</style>
    </>
  );
}
