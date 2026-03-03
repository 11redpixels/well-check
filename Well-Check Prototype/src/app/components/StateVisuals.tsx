// State-Driven Visual Effects (Amber Pulse, Green Glow, Red Strobe)
import { useEffect, useState } from 'react';
import type { AppStatus } from '../types';

interface StateVisualsProps {
  status: AppStatus;
}

export function StateVisuals({ status }: StateVisualsProps) {
  const [strobeOn, setStrobeOn] = useState(true);

  // Panic strobe effect
  useEffect(() => {
    if (status === 'panic') {
      const interval = setInterval(() => {
        setStrobeOn((prev) => !prev);
      }, 400); // 400ms strobe
      return () => clearInterval(interval);
    }
  }, [status]);

  if (status === 'idle' || status === 'offline') return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {/* Ping Sent: Amber Pulse */}
      {status === 'ping_sent' && (
        <div className="absolute inset-0 bg-[#FBBF24]/10 animate-pulse border-4 border-[#FBBF24]" />
      )}

      {/* Verified: Green Glow */}
      {status === 'verified' && (
        <div className="absolute inset-0 bg-[#00FF00]/5 animate-pulse border-4 border-[#00FF00] shadow-[inset_0_0_50px_rgba(0,255,0,0.3)]" />
      )}

      {/* Panic: Red Strobe */}
      {status === 'panic' && (
        <div
          className={`absolute inset-0 border-8 transition-all duration-100 ${
            strobeOn
              ? 'bg-[#FF0000]/20 border-[#FF0000]'
              : 'bg-transparent border-transparent'
          }`}
        />
      )}
    </div>
  );
}
