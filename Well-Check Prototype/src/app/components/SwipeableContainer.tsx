// 🛡️ Swipeable Container - 3-Pane Horizontal Carousel
// V7.5: Mobile-First Thumb-Zone Navigation
// Reference: prd.md (Gesture-First UX)

import { useState, useRef, useEffect, ReactNode } from 'react';
import { useApp } from '../context/AppContext';

interface SwipeableContainerProps {
  children: {
    horizon: ReactNode; // Left pane - Family cards
    pulse: ReactNode; // Center pane - Map (DEFAULT)
    ledger: ReactNode; // Right pane - Medical schedule
  };
  isPanicLocked?: boolean; // Disable swipe during panic
}

type PaneType = 'horizon' | 'pulse' | 'ledger';

export function SwipeableContainer({ children, isPanicLocked = false }: SwipeableContainerProps) {
  const [currentPane, setCurrentPane] = useState<PaneType>('pulse'); // Default to center
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const minSwipeDistance = 50; // Minimum distance for swipe to register

  // Haptic feedback (if available)
  const triggerHaptic = (type: 'light' | 'medium' | 'heavy') => {
    if ('vibrate' in navigator) {
      switch (type) {
        case 'light':
          navigator.vibrate(10); // Small click for swipes
          break;
        case 'medium':
          navigator.vibrate(20);
          break;
        case 'heavy':
          navigator.vibrate(50); // Thud for control center
          break;
      }
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (isPanicLocked) return; // Block swipe during panic
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (isPanicLocked || !touchStart) return;
    const currentTouch = e.targetTouches[0].clientX;
    setTouchEnd(currentTouch);
    
    // Calculate drag offset for smooth follow
    const delta = currentTouch - touchStart;
    setDragOffset(delta);
  };

  const onTouchEnd = () => {
    if (isPanicLocked || !touchStart || !touchEnd) {
      setIsDragging(false);
      setDragOffset(0);
      return;
    }

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    // Navigation logic
    if (isLeftSwipe) {
      // Swipe left → Move right
      if (currentPane === 'horizon') {
        setCurrentPane('pulse');
        triggerHaptic('light');
      } else if (currentPane === 'pulse') {
        setCurrentPane('ledger');
        triggerHaptic('light');
      }
    } else if (isRightSwipe) {
      // Swipe right → Move left
      if (currentPane === 'ledger') {
        setCurrentPane('pulse');
        triggerHaptic('light');
      } else if (currentPane === 'pulse') {
        setCurrentPane('horizon');
        triggerHaptic('light');
      }
    }

    // Reset
    setIsDragging(false);
    setDragOffset(0);
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Calculate transform based on current pane + drag offset
  const getTransform = () => {
    const baseOffset = currentPane === 'horizon' ? 0 : currentPane === 'pulse' ? -100 : -200;
    const dragPercentage = isDragging ? (dragOffset / window.innerWidth) * 100 : 0;
    return `translateX(calc(${baseOffset}vw + ${dragPercentage}vw))`;
  };

  // Prevent body scroll when swiping
  useEffect(() => {
    if (isDragging) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDragging]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Panic Lockdown Indicator */}
      {isPanicLocked && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#FF4444] text-white px-4 py-2 rounded-full font-bold text-sm">
          🔒 Navigation Locked - Panic Mode
        </div>
      )}

      {/* Pane Indicators (Bottom dots) */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-40 flex gap-2">
        <button
          onClick={() => !isPanicLocked && setCurrentPane('horizon')}
          className={`w-2 h-2 rounded-full transition-all ${
            currentPane === 'horizon' ? 'bg-[#84CC16] w-6' : 'bg-[#334155]'
          }`}
          aria-label="Family Horizon"
        />
        <button
          onClick={() => !isPanicLocked && setCurrentPane('pulse')}
          className={`w-2 h-2 rounded-full transition-all ${
            currentPane === 'pulse' ? 'bg-[#84CC16] w-6' : 'bg-[#334155]'
          }`}
          aria-label="Map Pulse"
        />
        <button
          onClick={() => !isPanicLocked && setCurrentPane('ledger')}
          className={`w-2 h-2 rounded-full transition-all ${
            currentPane === 'ledger' ? 'bg-[#84CC16] w-6' : 'bg-[#334155]'
          }`}
          aria-label="Medical Ledger"
        />
      </div>

      {/* Swipeable Panes Container */}
      <div
        ref={containerRef}
        className="flex h-full w-[300vw]"
        style={{
          transform: getTransform(),
          transition: isDragging ? 'none' : 'transform 300ms cubic-bezier(0.4, 0.0, 0.2, 1)',
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Pane 1: Horizon (Left) */}
        <div className="w-screen h-full overflow-y-auto overflow-x-hidden">
          {children.horizon}
        </div>

        {/* Pane 2: Pulse (Center - DEFAULT) */}
        <div className="w-screen h-full overflow-hidden">
          {children.pulse}
        </div>

        {/* Pane 3: Ledger (Right) */}
        <div className="w-screen h-full overflow-y-auto overflow-x-hidden">
          {children.ledger}
        </div>
      </div>

      {/* Pane Labels (Top edge hints) */}
      <div className="absolute top-2 left-0 right-0 z-30 flex justify-between px-4 pointer-events-none">
        <div className={`text-xs font-bold transition-opacity ${currentPane === 'horizon' ? 'text-[#84CC16]' : 'text-[#64748B]'}`}>
          ← Family
        </div>
        <div className={`text-xs font-bold transition-opacity ${currentPane === 'pulse' ? 'text-[#84CC16]' : 'text-[#64748B]'}`}>
          Map
        </div>
        <div className={`text-xs font-bold transition-opacity ${currentPane === 'ledger' ? 'text-[#84CC16]' : 'text-[#64748B]'}`}>
          Medical →
        </div>
      </div>
    </div>
  );
}
