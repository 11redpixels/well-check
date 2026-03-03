import { Users } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function FamilyCodeBadge() {
  const { familyCode, currentUser } = useApp();

  if (!familyCode) return null;

  return (
    <div className="flex items-center gap-2 bg-[#1E293B] rounded-lg px-3 py-2 border border-[#334155]">
      <Users className="w-4 h-4 text-[#3B82F6]" aria-hidden="true" />
      <div className="flex flex-col gap-0.5">
        <span className="text-[#64748B] text-xs leading-none">Family Code</span>
        <span className="text-white font-mono font-bold text-sm leading-none tracking-wider">
          {familyCode}
        </span>
      </div>
      {currentUser && (
        <div className="ml-2 px-2 py-1 bg-[#334155] rounded text-xs text-[#94A3B8] capitalize">
          {currentUser.role.replace('_', ' ')}
        </div>
      )}
    </div>
  );
}
