// 🛡️ CommandCenterButton - V10.0: The "Command Center" Hub
// Mandate: Fixed-Position Bottom-Right, Industrial Blue, Opens Command Center Drawer
// Reference: V10.0 Directive - "Two-Button Mandate" (Emergency Red + Command Center Blue)
// V10.0: Renamed from PerspectiveButton for absolute HUD purity

import { useState } from 'react';
import { Command, Settings } from 'lucide-react';

interface CommandCenterButtonProps {
  onToggle: () => void;
  isOpen: boolean;
}

export function CommandCenterButton({ onToggle, isOpen }: CommandCenterButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handlePress = () => {
    setIsPressed(true);
    onToggle();
    setTimeout(() => setIsPressed(false), 200);
  };

  return (
    <div
      className="fixed bottom-[72px] right-6 z-50"
      style={{
        width: '72px',
        height: '72px',
      }}
    >
      {/* V10.0: Command Center Button - 72px circular, Industrial Blue #3B82F6 glow */}
      {/* V10.1: Vertical shift - Moved up 24px (bottom-6 → bottom-12) for mobile aspect ratio compatibility */}
      {/* V11.2: Final lift - Moved up additional 24px (bottom-12 → bottom-[72px]) to clear bezel */}
      {/* V13.0: FLOATING ORB AESTHETIC - Soft glow, no square feeling */}
      <button
        onClick={handlePress}
        className="relative w-full h-full rounded-full bg-gradient-to-br from-[#3B82F6] to-[#2563EB] shadow-lg transition-all duration-300 flex items-center justify-center hover:scale-105 active:scale-95"
        style={{
          boxShadow: isOpen
            ? '0 0 35px rgba(59, 130, 246, 0.9), 0 0 70px rgba(59, 130, 246, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.2)'
            : '0 0 25px rgba(59, 130, 246, 0.7), 0 0 50px rgba(59, 130, 246, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.15)',
          transform: isPressed ? 'scale(0.95)' : 'scale(1)',
        }}
        aria-label="Command Center - Management hub"
      >
        {/* Icon: Command (⌘ symbol) or Settings */}
        <Command className="w-8 h-8 text-white relative z-10 drop-shadow-lg" />
      </button>

      {/* V13.0: SOFT-PILL LABEL - More rounded, softer shadow */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 whitespace-nowrap">
        <p className="text-[var(--color-text-primary)] text-xs font-bold bg-[var(--color-card-bg)] px-3 py-1.5 rounded-full border border-[var(--color-border)] shadow-lg">
          {isOpen ? 'Close' : 'Command Center'}
        </p>
      </div>
    </div>
  );
}