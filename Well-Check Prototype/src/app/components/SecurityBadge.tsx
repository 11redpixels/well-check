// 🛡️ Security Badge - Minimal Connection String Display
// V7.6: "Clean Glass" HUD - Replaces Family Code box
// Reference: prd.md (Multi-Tenant RLS Isolation)

import { Shield } from 'lucide-react';
import { useState } from 'react';

interface SecurityBadgeProps {
  familyCode: string;
  tenantId: string;
  isPanicMode?: boolean;
  onTap: () => void;
}

export function SecurityBadge({ familyCode, tenantId, isPanicMode = false, onTap }: SecurityBadgeProps) {
  const [isPressing, setIsPressing] = useState(false);

  // Haptic pulse on tap
  const handleTap = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(30); // Medium pulse
    }
    onTap();
  };

  return (
    <button
      onClick={handleTap}
      onTouchStart={() => setIsPressing(true)}
      onTouchEnd={() => setIsPressing(false)}
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-md
        font-mono text-xs font-bold
        transition-all duration-200
        ${isPressing ? 'scale-95' : 'scale-100'}
        ${
          isPanicMode
            ? 'bg-[#FF4444] text-white animate-pulse border-2 border-white shadow-lg shadow-[#FF4444]/50'
            : 'bg-[#0F172A]/70 backdrop-blur-sm text-[#84CC16] border border-[#334155]/50'
        }
      `}
      aria-label="Security Badge"
      style={{
        // Industrial-chiseled monospace font
        fontFamily: '"Courier New", "SF Mono", Monaco, Consolas, monospace',
        letterSpacing: '0.1em',
        textShadow: isPanicMode ? '0 0 8px rgba(255, 68, 68, 0.8)' : 'none',
      }}
    >
      {/* Icon */}
      <Shield
        className={`w-3.5 h-3.5 ${isPanicMode ? 'text-white' : 'text-[#84CC16]'}`}
        strokeWidth={2.5}
      />

      {/* Family Code */}
      <span className="tracking-wider">
        {isPanicMode ? '🚨 EMERGENCY' : familyCode}
      </span>

      {/* Pulse indicator (panic mode only) */}
      {isPanicMode && (
        <div className="absolute inset-0 -z-10 rounded-md bg-[#FF4444] animate-ping opacity-50" />
      )}
    </button>
  );
}
