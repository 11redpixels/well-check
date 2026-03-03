// Zone 2: Header with branding and Family Code
import { Settings, Menu } from 'lucide-react';
import { FamilyCodeBadge } from './FamilyCodeBadge';
import { useApp } from '../context/AppContext';

export function Header() {
  const { currentUser } = useApp();

  return (
    <header className="sticky top-0 z-50 bg-[#0F172A]/95 border-b border-[#1E293B] backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        {/* Branding */}
        <div className="flex items-center gap-4">
          <button
            className="lg:hidden min-h-[48px] min-w-[48px] flex items-center justify-center text-[#94A3B8] hover:text-white transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-white font-bold text-xl leading-tight tracking-tight">
              Well-Check
            </h1>
            <p className="text-[#64748B] text-xs leading-tight">Family Safety Network</p>
          </div>
        </div>

        {/* Center: Family Code Badge */}
        <div className="hidden md:block">
          <FamilyCodeBadge />
        </div>

        {/* Right: User Info & Settings */}
        <div className="flex items-center gap-3">
          {currentUser && (
            <div className="hidden sm:block text-right">
              <div className="text-white text-sm font-bold leading-tight">{currentUser.name}</div>
              <div className="text-[#64748B] text-xs capitalize leading-tight">
                {currentUser.role.replace('_', ' ')}
              </div>
            </div>
          )}
          <button
            className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-lg bg-[#1E293B] border border-[#334155] text-[#94A3B8] hover:text-white hover:border-[#3B82F6] transition-colors"
            aria-label="Open settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Family Code */}
      <div className="md:hidden px-4 pb-3">
        <FamilyCodeBadge />
      </div>
    </header>
  );
}
