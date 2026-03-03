// 🛡️ CapabilityToggle - Family Head Module Management
// Mandate: Capability-Based Role Toggles (prd.md #24)
// Reference: ai-chief-architect.md (Single-Source Ledger)
// V13.0: FLUID COMMAND REVOLUTION - Guardian Aura Effect + Soft-Pill Styling

import { useState } from 'react';
import { Pill, Calendar, AlertOctagon, Shield, Activity } from 'lucide-react';
import type { FamilyMember, UserCapabilities } from '../types';

interface CapabilityToggleProps {
  member: FamilyMember;
  capabilities: UserCapabilities;
  onToggle: (
    userId: string,
    capability: 'medication' | 'doctorVisits' | 'panicMode',
    enabled: boolean
  ) => Promise<void>;
  disabled?: boolean;
  isGuardianProtected?: boolean; // V13.0: Flag for Guardian Protected members
}

export function CapabilityToggle({
  member,
  capabilities,
  onToggle,
  disabled = false,
  isGuardianProtected = false,
}: CapabilityToggleProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleToggle = async (
    capability: 'medication' | 'doctorVisits' | 'panicMode',
    currentValue: boolean
  ) => {
    if (disabled) return;

    setLoading(capability);
    try {
      await onToggle(member.id, capability, !currentValue);
    } finally {
      setLoading(null);
    }
  };

  const getRoleColor = () => {
    switch (member.role) {
      case 'family_head':
        return 'from-[#A855F7] to-[#7C3AED]';
      case 'protected':
        return 'from-[#F97316] to-[#EA580C]';
      case 'monitor':
        return 'from-[#3B82F6] to-[#2563EB]';
      case 'minor':
        return 'from-[#10B981] to-[#059669]';
      default:
        return 'from-[#64748B] to-[#475569]';
    }
  };

  const getRoleLabel = () => {
    switch (member.role) {
      case 'family_head':
        return 'Family Head';
      case 'protected':
        return 'Protected';
      case 'monitor':
        return 'Monitor';
      case 'minor':
        return 'Minor';
      default:
        return member.role;
    }
  };

  const modules = [
    {
      key: 'medication' as const,
      enabled: capabilities.medicationEnabled,
      icon: <Pill className="w-5 h-5" />,
      label: 'Meds',
    },
    {
      key: 'doctorVisits' as const,
      enabled: capabilities.doctorVisitsEnabled,
      icon: <Calendar className="w-5 h-5" />,
      label: 'Visits',
    },
    {
      key: 'panicMode' as const,
      enabled: capabilities.panicModeEnabled,
      icon: <AlertOctagon className="w-5 h-5" />,
      label: 'Panic',
    },
  ];

  // V8.9.1: Smart Filter - Hide disabled modules for offline minors
  const isOfflineMinor = member.role === 'minor' && !member.isOnline;
  const visibleModules = isOfflineMinor
    ? modules.filter((m) => m.key === 'panicMode')
    : modules;

  // V13.0: Guardian Aura Effect - Pulsing green animation for protected members
  const guardianAuraAnimation = isGuardianProtected
    ? 'guardian-aura-pulse'
    : '';

  return (
    <div
      className={`
        relative
        bg-[var(--color-card-bg)]
        rounded-3xl
        overflow-hidden
        transition-all duration-300
        ${
          isGuardianProtected
            ? 'shadow-[0_0_30px_rgba(132,204,22,0.15)]'
            : 'shadow-[0_2px_8px_rgba(0,0,0,0.08)]'
        }
        hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)]
        ${guardianAuraAnimation}
      `}
    >
      {/* V13.0: Guardian Shield Badge (Top-Right) */}
      {isGuardianProtected && (
        <div className="absolute top-4 right-4 z-10">
          <div className="relative">
            <Shield className="w-6 h-6 text-[#84CC16] drop-shadow-lg" />
            <div className="absolute inset-0 bg-[#84CC16]/20 blur-md rounded-full animate-pulse" />
          </div>
        </div>
      )}

      {/* V13.0: Soft-Pill Member Header */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Member Avatar Circle */}
            <div
              className={`
                w-14 h-14 rounded-full flex items-center justify-center
                bg-gradient-to-br ${getRoleColor()}
                shadow-lg
              `}
            >
              <span className="text-white font-bold text-xl">
                {member.name.charAt(0)}
              </span>
            </div>

            {/* Member Info */}
            <div>
              <h3 className="text-[var(--color-text-primary)] font-bold text-xl">
                {member.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`
                    bg-gradient-to-r ${getRoleColor()} 
                    text-white text-xs font-bold px-3 py-1 rounded-full
                  `}
                >
                  {getRoleLabel()}
                </span>
                {/* Online Status Indicator */}
                <div className="flex items-center gap-1">
                  <span
                    className={`
                      ${member.isOnline ? 'bg-[#84CC16]' : 'bg-[#64748B]'}
                      w-2.5 h-2.5 rounded-full
                      ${member.isOnline ? 'shadow-[0_0_8px_rgba(132,204,22,0.6)]' : ''}
                    `}
                  />
                  <span className="text-[var(--color-text-tertiary)] text-xs font-medium">
                    {member.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
                {/* Battery Warning (if <20%) */}
                {member.batteryLevel < 20 && (
                  <span className="text-[#FF4444] text-xs font-mono font-bold animate-pulse flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    {member.batteryLevel}%
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* V13.0: Guardian Live Stats (Only for protected members) */}
        {isGuardianProtected && (
          <div className="mb-4 p-3 bg-[#84CC16]/5 rounded-2xl border border-[#84CC16]/20">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-[#84CC16]" />
              <span className="text-[var(--color-text-secondary)] text-xs font-bold uppercase tracking-wide">
                24/7 Guardian Shield Active
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-[var(--color-text-tertiary)] text-xs">Heart Rate</p>
                <p className="text-[var(--color-text-primary)] font-bold text-sm">72 bpm</p>
              </div>
              <div>
                <p className="text-[var(--color-text-tertiary)] text-xs">BP</p>
                <p className="text-[var(--color-text-primary)] font-bold text-sm">120/80</p>
              </div>
              <div>
                <p className="text-[var(--color-text-tertiary)] text-xs">Meds</p>
                <p className="text-[#84CC16] font-bold text-sm">95%</p>
              </div>
            </div>
          </div>
        )}

        {/* V13.0: Soft-Pill Module Buttons */}
        <div className="flex gap-3">
          {visibleModules.map((module) => (
            <button
              key={module.key}
              onClick={() => handleToggle(module.key, module.enabled)}
              disabled={disabled || loading === module.key}
              className={`
                flex-1 p-4 rounded-2xl transition-all duration-300 text-center
                ${
                  module.enabled
                    ? 'bg-gradient-to-br from-[#84CC16] to-[#65A30D] text-white shadow-[0_4px_12px_rgba(132,204,22,0.3)]'
                    : 'bg-[var(--color-bg)] text-[var(--color-text-tertiary)] shadow-[0_2px_6px_rgba(0,0,0,0.05)]'
                }
                ${
                  disabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:scale-105 hover:shadow-[0_6px_16px_rgba(132,204,22,0.4)] cursor-pointer active:scale-95'
                }
                ${loading === module.key ? 'opacity-75' : ''}
              `}
            >
              {/* Icon */}
              <div className="flex items-center justify-center mb-2">
                {module.icon}
              </div>

              {/* Label */}
              <p className="font-bold text-sm">{module.label}</p>

              {/* Loading Indicator */}
              {loading === module.key && (
                <div className="w-3 h-3 mx-auto mt-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
            </button>
          ))}
        </div>

        {/* Minor Warning */}
        {member.role === 'minor' && (
          <div className="mt-3 flex items-center gap-2 justify-center p-2 bg-[#FBBF24]/10 rounded-xl">
            <span className="text-[#FBBF24] text-sm">⚠️</span>
            <p className="text-[#FBBF24] text-xs font-bold">
              Minor account - Limited access
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
