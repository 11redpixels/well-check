// Demo Controls for testing different states and roles
import { useState } from 'react';
import { Settings2, User, Monitor, ChevronDown, ChevronUp } from 'lucide-react';

interface DemoControlsProps {
  onRoleChange: (role: 'primary_user' | 'monitor') => void;
  currentRole: string;
}

export function DemoControls({ onRoleChange, currentRole }: DemoControlsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-16 right-4 z-50 lg:bottom-14">
      <div
        className={`bg-[#1E293B] border-2 border-[#3B82F6] rounded-lg shadow-2xl transition-all duration-300 ${
          isOpen ? 'w-72' : 'w-auto'
        }`}
      >
        {/* Header */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 text-[#3B82F6] hover:bg-[#334155] transition-colors"
        >
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5" />
            <span className="font-bold text-sm">Demo Controls</span>
          </div>
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>

        {/* Controls */}
        {isOpen && (
          <div className="p-4 border-t border-[#334155] space-y-3">
            <div>
              <label className="text-[#94A3B8] text-xs font-bold uppercase mb-2 block">
                View As
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onRoleChange('primary_user')}
                  className={`min-h-[48px] rounded-lg font-bold text-sm transition-all ${
                    currentRole === 'primary_user'
                      ? 'bg-[#3B82F6] text-white'
                      : 'bg-[#334155] text-[#94A3B8] hover:bg-[#475569]'
                  }`}
                >
                  <User className="w-4 h-4 inline-block mr-1" />
                  Primary
                </button>
                <button
                  onClick={() => onRoleChange('monitor')}
                  className={`min-h-[48px] rounded-lg font-bold text-sm transition-all ${
                    currentRole === 'monitor'
                      ? 'bg-[#3B82F6] text-white'
                      : 'bg-[#334155] text-[#94A3B8] hover:bg-[#475569]'
                  }`}
                >
                  <Monitor className="w-4 h-4 inline-block mr-1" />
                  Monitor
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-[#334155]">
              <p className="text-[#64748B] text-xs leading-relaxed">
                <strong>Primary User:</strong> Can send "I'm Safe" and Panic alerts.
                <br />
                <strong>Monitor:</strong> Can send safety checks (pings) to family members.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
