// Zone 2: Horizon - Squad HUD with Family Members
import { User, BatteryLow, MapPin, WifiOff, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { FamilyMember } from '../types';

export function SquadHUD() {
  const { familyMembers, currentUser, activeWatchMode, toggleActiveWatch } = useApp();

  const formatTimeSince = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const getMemberStatusColor = (member: FamilyMember) => {
    if (!member.isOnline) return 'bg-[#475569]'; // Offline grey
    if (member.batteryLevel < 15) return 'bg-[#FF6B6B]'; // Low battery red
    return 'bg-[#00FF00]'; // Online green
  };

  const isMonitor = currentUser?.role === 'monitor';

  return (
    <div className="w-full lg:w-80 h-full bg-[#1E293B] lg:border-l border-[#334155] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-[#1E293B] border-b border-[#334155] px-4 py-4 z-10">
        <h2 className="text-white font-bold text-lg mb-3">Family Squad</h2>
        
        {/* Active Watch Toggle (Monitor Only) */}
        {isMonitor && (
          <button
            onClick={toggleActiveWatch}
            className={`w-full min-h-[48px] rounded-lg font-bold text-sm transition-all ${
              activeWatchMode
                ? 'bg-[#3B82F6] text-white shadow-lg shadow-[#3B82F6]/25'
                : 'bg-[#334155] text-[#94A3B8] hover:bg-[#475569]'
            }`}
            aria-pressed={activeWatchMode}
            aria-label="Toggle active watch mode"
          >
            {activeWatchMode ? '👁️ Active Watch ON' : 'Active Watch OFF'}
          </button>
        )}
      </div>

      {/* Family Members List */}
      <div className="p-4 space-y-3">
        {familyMembers.length === 0 ? (
          <div className="text-center py-8 text-[#64748B]">
            <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No family members yet</p>
            <p className="text-xs mt-1">Share your Family Code to add members</p>
          </div>
        ) : (
          familyMembers.map((member) => (
            <div
              key={member.id}
              className="bg-[#0F172A] rounded-lg p-4 border border-[#334155] hover:border-[#3B82F6] transition-colors cursor-pointer"
              role="button"
              tabIndex={0}
              aria-label={`View ${member.name}'s location`}
            >
              {/* Member Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {/* Avatar with Status Indicator */}
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-[#334155] flex items-center justify-center">
                      <User className="w-6 h-6 text-[#94A3B8]" aria-hidden="true" />
                    </div>
                    {/* Status Dot */}
                    <div
                      className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#0F172A] ${getMemberStatusColor(
                        member
                      )}`}
                      aria-label={member.isOnline ? 'Online' : 'Offline'}
                    />
                  </div>

                  {/* Name & Role */}
                  <div>
                    <h3 className="text-white font-bold text-base leading-tight">{member.name}</h3>
                    <span className="text-[#64748B] text-xs capitalize">
                      {member.role.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Battery Warning */}
                {member.batteryLevel < 15 && (
                  <div className="flex items-center gap-1 text-[#FF6B6B] animate-pulse">
                    <BatteryLow className="w-4 h-4" aria-hidden="true" />
                    <span className="text-xs font-mono font-bold">{member.batteryLevel}%</span>
                  </div>
                )}
              </div>

              {/* Status Info */}
              <div className="space-y-2 text-xs">
                {/* Last Seen */}
                <div className="flex items-center gap-2 text-[#94A3B8]">
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                  <span className="font-mono">{formatTimeSince(member.lastSeen)}</span>
                </div>

                {/* Location Status */}
                {member.lastLocation ? (
                  <div className="flex items-center gap-2 text-[#94A3B8]">
                    <MapPin className="w-3.5 h-3.5 text-[#3B82F6]" aria-hidden="true" />
                    <span className="font-mono text-xs">
                      {member.lastLocation.lat.toFixed(4)}, {member.lastLocation.lng.toFixed(4)}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-[#64748B]">
                    <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                    <span className="text-xs">No location data</span>
                  </div>
                )}

                {/* Offline Warning */}
                {!member.isOnline && (
                  <div className="flex items-center gap-2 text-[#FF6B6B] mt-2 pt-2 border-t border-[#334155]">
                    <WifiOff className="w-3.5 h-3.5" aria-hidden="true" />
                    <span className="text-xs font-bold">Last Known Location</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}