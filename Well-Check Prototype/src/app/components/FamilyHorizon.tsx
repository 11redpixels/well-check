// 🛡️ Family Horizon - Left Pane (Vertical Scroll Cards)
// V7.5: Mobile-first family member cards
// V7.7: Added asset tracker cards (Phase 5)
// V11.2: Guardian Shield badge (top-right) + Health Ribbon (bottom)
// Reference: prd.md (Squad HUD, Passive Asset Archetype)

import { User, Battery, MapPin, Clock, Wifi, WifiOff, Shield, Activity, Pill } from 'lucide-react';
import type { FamilyMember, Asset } from '../types';
import { AssetCard } from './AssetCard';

interface FamilyHorizonProps {
  familyMembers: FamilyMember[];
  assets?: Asset[];
  onSelectMember: (id: string) => void;
  onSelectAsset?: (id: string) => void;
}

export function FamilyHorizon({ familyMembers, assets, onSelectMember, onSelectAsset }: FamilyHorizonProps) {
  const formatLastSeen = (timestamp: number) => {
    const minutes = Math.floor((Date.now() - timestamp) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="h-full bg-[#0F172A] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0F172A]/95 backdrop-blur-sm border-b-2 border-[#334155] p-6">
        <h1 className="text-white font-bold text-3xl mb-2">Family Network</h1>
        <p className="text-[#94A3B8] text-base">
          {familyMembers.filter(m => m.isOnline).length}/{familyMembers.length} online
        </p>
      </div>

      {/* Family Cards - Vertical Scroll */}
      <div className="p-6 space-y-4 pb-32">
        {familyMembers.map((member) => {
          // V11.2: Mock health data (TODO: Replace with real data from member.healthVitals)
          const mockBP = member.age >= 65 ? '128/82' : '120/80';
          const mockHR = member.age >= 65 ? 75 : 72;
          const mockMeds = '5/6';
          const mockHealthRibbon = `BP: ${mockBP} | HR: ${mockHR} | Meds: ${mockMeds}`;
          
          // V11.2: Guardian status (mock - TODO: Replace with member.guardianStatus)
          const isGuardianActive = member.isOnline && member.role !== 'minor';
          
          return (
            <button
              key={member.id}
              onClick={() => onSelectMember(member.id)}
              className="relative w-full bg-[#1E293B] border-2 border-[#334155] rounded-2xl p-6 hover:border-[#84CC16] transition-all active:scale-95"
            >
              {/* V11.2: Guardian Shield Badge (Top-Right) */}
              {isGuardianActive && (
                <div className="absolute top-4 right-4 flex items-center gap-1">
                  <Shield 
                    className="w-6 h-6 text-[#84CC16] animate-pulse" 
                    style={{ filter: 'drop-shadow(0 0 4px rgba(132, 204, 22, 0.6))' }}
                  />
                </div>
              )}

              {/* Member Header */}
              <div className="flex items-start gap-4 mb-4">
                {/* Avatar */}
                <div className="w-16 h-16 bg-gradient-to-br from-[#84CC16] to-[#65A30D] rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-[#0F172A]" />
                </div>

                {/* Name & Role */}
                <div className="flex-1 text-left">
                  <h3 className="text-white font-bold text-xl mb-1">{member.name}</h3>
                  <p className="text-[#84CC16] font-bold text-sm capitalize">
                    {member.role.replace('_', ' ')}
                  </p>
                </div>

                {/* Online Status */}
                <div className="flex items-center gap-2">
                  {member.isOnline ? (
                    <>
                      <div className="w-3 h-3 bg-[#84CC16] rounded-full animate-pulse" />
                      <Wifi className="w-5 h-5 text-[#84CC16]" />
                    </>
                  ) : (
                    <>
                      <div className="w-3 h-3 bg-[#64748B] rounded-full" />
                      <WifiOff className="w-5 h-5 text-[#64748B]" />
                    </>
                  )}
                </div>
              </div>

              {/* Status Grid */}
              <div className="grid grid-cols-3 gap-3 mb-3">
                {/* Battery */}
                <div className="bg-[#0F172A] rounded-lg p-3 flex flex-col items-center">
                  <Battery
                    className={`w-6 h-6 mb-1 ${
                      member.batteryLevel > 20 ? 'text-[#84CC16]' : 'text-[#FF4444]'
                    }`}
                  />
                  <p className="text-white font-bold text-sm">{member.batteryLevel}%</p>
                </div>

                {/* Location */}
                <div className="bg-[#0F172A] rounded-lg p-3 flex flex-col items-center">
                  <MapPin className="w-6 h-6 mb-1 text-[#FBBF24]" />
                  <p className="text-white font-bold text-xs">
                    {member.lastLocation ? `${member.lastLocation.accuracy}m` : 'N/A'}
                  </p>
                </div>

                {/* Last Seen */}
                <div className="bg-[#0F172A] rounded-lg p-3 flex flex-col items-center">
                  <Clock className="w-6 h-6 mb-1 text-[#6366F1]" />
                  <p className="text-white font-bold text-xs">{formatLastSeen(member.lastSeen)}</p>
                </div>
              </div>

              {/* V11.2: Health Ribbon (Bottom) */}
              <div className="bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-2">
                <p className="text-[#94A3B8] font-mono text-xs text-center">
                  {mockHealthRibbon}
                </p>
              </div>

              {/* Battery Warning */}
              {member.batteryLevel <= 20 && (
                <div className="mt-3 p-2 bg-[#FF4444]/20 border border-[#FF4444] rounded-lg">
                  <p className="text-[#FF4444] font-bold text-xs text-center">
                    ⚠️ Low Battery - Check on {member.name.split(' ')[0]}
                  </p>
                </div>
              )}
            </button>
          );
        })}

        {/* Asset Cards */}
        {assets && assets.length > 0 && (
          <>
            {/* Assets Section Header */}
            <div className="pt-4 pb-2">
              <h2 className="text-[#FBBF24] font-bold text-lg">Tracked Assets</h2>
              <p className="text-[#64748B] text-sm">
                {assets.filter(a => a.isOnline).length}/{assets.length} active
              </p>
            </div>

            {assets.map((asset) => (
              <AssetCard 
                key={asset.id} 
                asset={asset} 
                onSelect={onSelectAsset || ((id) => console.log('Asset selected:', id))} 
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}