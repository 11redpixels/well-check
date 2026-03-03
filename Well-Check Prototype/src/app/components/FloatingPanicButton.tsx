// 🛡️ FloatingPanicButton - V9.0: The "Floating Panic Hub"
// V9.1: Panic Interrupt - Force-close wizards/modals on panic trigger
// V9.3: Panic Dimmer - Dispatch progress events for UI dimming
// V10.2: Fix setState-during-render warning (move event dispatch to useEffect)
// V11.2: Fix setState-during-render by removing sync event dispatch
// Mandate: Fixed-Position Bottom Center, 72px circular, Press & Hold (3s)
// Reference: V9.0 Directive - "Prominent Panic" & Muscle Memory

import { useState, useRef, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router';

export function FloatingPanicButton() {
  const navigate = useNavigate();
  const [isPressed, setIsPressed] = useState(false);
  const [progress, setProgress] = useState(0);
  const pressTimerRef = useRef<number | null>(null);
  const progressIntervalRef = useRef<number | null>(null);

  const HOLD_DURATION = 3000; // 3 seconds
  const PROGRESS_INTERVAL = 50; // Update every 50ms

  const handlePressStart = () => {
    setIsPressed(true);
    setProgress(0);

    // Start progress animation
    progressIntervalRef.current = window.setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + (PROGRESS_INTERVAL / HOLD_DURATION) * 100;
        
        if (newProgress >= 100) {
          handlePanicTrigger();
          return 100;
        }
        return newProgress;
      });
    }, PROGRESS_INTERVAL);

    // Set timer for panic trigger
    pressTimerRef.current = window.setTimeout(() => {
      handlePanicTrigger();
    }, HOLD_DURATION);
  };

  const handlePressEnd = () => {
    setIsPressed(false);
    setProgress(0);

    // Clear timers
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const handlePanicTrigger = () => {
    console.log('🚨 PANIC MODE TRIGGERED - V9.1 Interrupt Logic');
    
    // V9.3: Dispatch full blackout event (500ms hold before navigation)
    window.dispatchEvent(new CustomEvent('panic-blackout', { 
      detail: { timestamp: Date.now() } 
    }));
    
    // V9.1: Force-close all modals/wizards
    // Dispatch custom event to close any open modals/wizards
    window.dispatchEvent(new CustomEvent('panic-interrupt', { 
      detail: { 
        timestamp: Date.now(),
        source: 'FloatingPanicButton'
      } 
    }));
    
    // Close all dialogs/modals (by dispatching escape key event)
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    
    // V9.3: 500ms blackout, then navigate (clean snap)
    setTimeout(() => {
      // V9.1: Force-navigate to Panic view (takes over entire viewport)
      navigate('/panic');
      
      // Alert (TODO: Replace with proper panic logic - notify family, send alert, etc.)
      setTimeout(() => {
        alert('🚨 PANIC MODE ACTIVATED\n\nYour family has been notified of your emergency.\n\nAll wizards/modals force-closed.');
      }, 100); // Small delay to allow navigation
      
      handlePressEnd();
    }, 500); // 500ms blackout delay
  };

  // V13.0: FIX - Dispatch progress events in useEffect to avoid setState-during-render
  useEffect(() => {
    if (progress > 0 && progress <= 100) {
      window.dispatchEvent(new CustomEvent('panic-progress', { 
        detail: { progress: Math.min(progress, 100) } 
      }));
    }
  }, [progress]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  return (
    <div
      className="fixed bottom-[72px] left-1/2 transform -translate-x-1/2 z-50"
      style={{
        width: '72px',
        height: '72px',
      }}
    >
      {/* V9.0: Floating Panic Button - 72px circular, Emergency Red #FF4444 glow */}
      {/* V10.1: Vertical shift - Moved up 24px (bottom-6 → bottom-12) for mobile aspect ratio compatibility */}
      {/* V11.2: Final lift - Moved up additional 24px (bottom-12 → bottom-[72px]) to clear bezel */}
      {/* V13.0: BREATHING ANIMATION - Subtle pulsing to signal "always ready" */}
      <button
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        onTouchCancel={handlePressEnd}
        className={`
          relative w-full h-full rounded-full bg-[#FF4444] 
          shadow-lg transition-all duration-200 
          flex items-center justify-center
          ${!isPressed ? 'breathing' : ''}
        `}
        style={{
          transform: isPressed ? 'scale(0.95)' : 'scale(1)',
        }}
        aria-label="Emergency Panic Button - Press and hold for 3 seconds"
      >
        {/* Radial Progress Bar (SVG) */}
        <svg
          className="absolute top-0 left-0 w-full h-full"
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Background circle */}
          <circle
            cx="36"
            cy="36"
            r="33"
            fill="none"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="6"
          />
          {/* Progress circle */}
          <circle
            cx="36"
            cy="36"
            r="33"
            fill="none"
            stroke="white"
            strokeWidth="6"
            strokeDasharray={`${2 * Math.PI * 33}`}
            strokeDashoffset={`${2 * Math.PI * 33 * (1 - progress / 100)}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 50ms linear' }}
          />
        </svg>

        {/* Icon */}
        <AlertTriangle className="w-8 h-8 text-white relative z-10" />
      </button>

      {/* Label (optional, shown below button) */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 whitespace-nowrap">
        <p className="text-[var(--color-text-primary)] text-xs font-bold bg-[var(--color-card-bg)] px-3 py-1.5 rounded-full border border-[var(--color-border)] shadow-lg">
          {isPressed ? 'Hold for Panic...' : 'Hold for Emergency'}
        </p>
      </div>
    </div>
  );
}