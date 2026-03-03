// 🛡️ PanicOverlay - V9.3: The "Panic Dimmer"
// Mandate: Progressive UI dimming (40% opacity + desaturate) during panic hold
// Visual Logic: 0-3s (40% dim + grayscale), At 3s (full blackout 500ms), Then navigate
// Reference: V9.3 Directive - "High-Standard Signal" for System Override

import { useState, useEffect } from 'react';

export function PanicOverlay() {
  const [progress, setProgress] = useState(0);
  const [isBlackout, setIsBlackout] = useState(false);

  useEffect(() => {
    // V9.3: Listen to panic-progress events
    const handlePanicProgress = (e: Event) => {
      const customEvent = e as CustomEvent;
      const newProgress = customEvent.detail.progress;
      setProgress(newProgress);
    };

    // V9.3: Listen to panic-blackout events (full blackout 500ms)
    const handlePanicBlackout = () => {
      setIsBlackout(true);
      
      // Reset blackout after 500ms (navigation happens)
      setTimeout(() => {
        setIsBlackout(false);
        setProgress(0);
      }, 500);
    };

    window.addEventListener('panic-progress', handlePanicProgress);
    window.addEventListener('panic-blackout', handlePanicBlackout);

    return () => {
      window.removeEventListener('panic-progress', handlePanicProgress);
      window.removeEventListener('panic-blackout', handlePanicBlackout);
    };
  }, []);

  // V9.3: Calculate dimmer values based on progress
  // 0% progress = 0% dim (fully visible)
  // 100% progress = 40% dim (60% opacity + grayscale)
  const dimOpacity = isBlackout ? 1.0 : progress / 100 * 0.4; // 0 → 0.4 (40% dim)
  const grayscaleAmount = isBlackout ? 1.0 : progress / 100 * 1.0; // 0 → 1.0 (full grayscale)

  // Don't render if no progress (performance optimization)
  if (progress === 0 && !isBlackout) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none transition-all duration-100"
      style={{
        backgroundColor: isBlackout ? 'black' : 'rgba(0, 0, 0, 0)',
        opacity: isBlackout ? 1 : 1,
        zIndex: 45, // Below Panic Button (z-50), above everything else
      }}
    >
      {/* V9.3: Dimmer layer (opacity + grayscale filter) */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: `rgba(0, 0, 0, ${dimOpacity})`,
          backdropFilter: `grayscale(${grayscaleAmount * 100}%)`,
          WebkitBackdropFilter: `grayscale(${grayscaleAmount * 100}%)`, // Safari support
          transition: 'all 100ms linear',
        }}
      />

      {/* V9.3: Full blackout overlay (at 3s) */}
      {isBlackout && (
        <div
          className="absolute inset-0 bg-black"
          style={{
            opacity: 1,
            animation: 'fadeIn 200ms ease-out',
          }}
        />
      )}
    </div>
  );
}
