// 🛡️ PerspectiveButton - V9.4: The "My Perspective" Hub
// Mandate: Fixed-Position Bottom-Right, Blue/Industrial, Opens Role-Specific Drawer
// Reference: V9.4 Directive - "Two-Button HUD" (Emergency + Perspective)

import { useState } from 'react';
import { Settings, User } from 'lucide-react';

interface PerspectiveButtonProps {
  onToggle: () => void;
  isOpen: boolean;
}

export function PerspectiveButton({ onToggle, isOpen }: PerspectiveButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handlePress = () => {
    setIsPressed(true);
    onToggle();
    setTimeout(() => setIsPressed(false), 200);
  };

  return (
    <div
      className="fixed bottom-6 right-6 z-50"
      style={{
        width: '72px',
        height: '72px',
      }}
    >
      {/* V9.4: Perspective Button - 72px circular, Industrial Blue #3B82F6 glow */}
      <button
        onClick={handlePress}
        className="relative w-full h-full rounded-full bg-[#3B82F6] shadow-lg transition-all duration-200 flex items-center justify-center"
        style={{
          boxShadow: isOpen
            ? '0 0 30px rgba(59, 130, 246, 0.8), 0 0 60px rgba(59, 130, 246, 0.4)'
            : '0 0 20px rgba(59, 130, 246, 0.6), 0 0 40px rgba(59, 130, 246, 0.3)',
          transform: isPressed ? 'scale(0.95)' : 'scale(1)',
        }}
        aria-label="My Perspective - Role-specific menu"
      >
        {/* Icon: Settings (gear) or User based on preference */}
        <Settings className="w-8 h-8 text-white relative z-10" />
      </button>

      {/* Label (optional, shown below button) */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 whitespace-nowrap">
        <p className="text-white text-xs font-bold bg-[#0F172A] px-2 py-1 rounded border border-[#334155]">
          {isOpen ? 'Close' : 'My Perspective'}
        </p>
      </div>
    </div>
  );
}
