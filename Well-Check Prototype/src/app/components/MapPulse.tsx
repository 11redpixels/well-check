// 🛡️ Map Pulse - Center Pane (Map with Locked Pan)
// V7.5: Primary map view with gesture isolation
// V7.6: Clean Glass HUD with Security Badge
// Reference: prd.md (Pulse Zone)

import { MapPin, Users, Navigation, AlertTriangle } from 'lucide-react';
import type { FamilyMember, VerifiedPulse, Asset } from '../types';
import { useState } from 'react';
import { SecurityBadge } from './SecurityBadge';
import { SystemHealthOverlay } from './SystemHealthOverlay';

interface MapPulseProps {
  familyMembers: FamilyMember[];
  assets?: Asset[];
  lastVerifiedPulse: VerifiedPulse | null;
  onSendPing: () => void;
  onTriggerPanic: () => void;
  familyCode?: string;
  tenantId?: string;
  isPanicMode?: boolean;
  gpsAccuracy?: 'high' | 'medium' | 'low';
  isOnline?: boolean;
  isSyncing?: boolean;
  lastSyncTimestamp?: number;
}

export function MapPulse({ 
  familyMembers, 
  assets,
  lastVerifiedPulse, 
  onSendPing, 
  onTriggerPanic,
  familyCode = 'XP9-2RT',
  tenantId = 'tenant-demo-001',
  isPanicMode = false,
  gpsAccuracy = 'high',
  isOnline = true,
  isSyncing = false,
  lastSyncTimestamp = Date.now(),
}: MapPulseProps) {
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [showSystemHealth, setShowSystemHealth] = useState(false);

  // Mock map center (San Francisco)
  const mapCenter = { lat: 37.7749, lng: -122.4194 };

  return (
    <div className="relative w-full h-full bg-[#0F172A]">
      {/* Map Container (Full Screen) */}
      <div className="absolute inset-0">
        {/* Mock Map Background */}
        <div
          className="w-full h-full bg-gradient-to-br from-[#1E293B] to-[#0F172A]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(148, 163, 184, 0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(148, 163, 184, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        >
          {/* Security Badge (Top Center) */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40">
            <SecurityBadge
              familyCode={familyCode}
              tenantId={tenantId}
              isPanicMode={isPanicMode}
              onTap={() => setShowSystemHealth(true)}
            />
          </div>

          {/* Center Marker (User location) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              {/* Pulse rings */}
              <div className="absolute inset-0 w-32 h-32 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                <div className="absolute inset-0 bg-[#84CC16] rounded-full opacity-20 animate-ping" />
                <div className="absolute inset-4 bg-[#84CC16] rounded-full opacity-30 animate-ping" style={{ animationDelay: '0.5s' }} />
              </div>
              
              {/* Center dot */}
              <div className="relative w-8 h-8 bg-[#84CC16] rounded-full border-4 border-white shadow-xl flex items-center justify-center">
                <Navigation className="w-4 h-4 text-[#0F172A]" />
              </div>
            </div>
          </div>

          {/* Family Member Markers */}
          {familyMembers.map((member, index) => {
            const angle = (index / familyMembers.length) * 2 * Math.PI;
            const radius = 120;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            return (
              <button
                key={member.id}
                onClick={() => setSelectedMember(member.id)}
                className="absolute top-1/2 left-1/2 transition-transform hover:scale-110 active:scale-95"
                style={{
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                  width: '48px',
                  height: '48px',
                  minWidth: '48px',
                  minHeight: '48px',
                }}
                aria-label={`View ${member.name}`}
              >
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Pulse for online members */}
                  {member.isOnline && (
                    <div className="absolute inset-0 w-12 h-12 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 bg-[#FBBF24] rounded-full opacity-30 animate-ping" />
                  )}
                  
                  {/* Marker (centered in 48x48px tap area) */}
                  <div
                    className={`relative w-6 h-6 rounded-full border-2 border-white shadow-lg ${
                      member.isOnline ? 'bg-[#FBBF24]' : 'bg-[#64748B]'
                    }`}
                  />

                  {/* Name label */}
                  <div className="absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#1E293B]/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-white border border-[#334155] pointer-events-none">
                    {member.name.split(' ')[0]}
                  </div>
                </div>
              </button>
            );
          })}

          {/* Asset Markers (Distinct from people) */}
          {assets && assets.map((asset, index) => {
            const totalItems = familyMembers.length + assets.length;
            const angle = ((familyMembers.length + index) / totalItems) * 2 * Math.PI;
            const radius = 80; // Closer to center than people
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            const getAssetIcon = (iconType: Asset['iconType']) => {
              const iconMap = {
                paw: '🐾',
                tag: '🏷️',
                key: '🔑',
                car: '🚗',
                purse: '👜',
                bike: '🚲',
                backpack: '🎒',
                other: '📍',
              };
              return iconMap[iconType] || '📍';
            };

            return (
              <button
                key={asset.id}
                onClick={() => setSelectedMember(asset.id)} // Reuse selected state
                className="absolute top-1/2 left-1/2 transition-transform hover:scale-110 active:scale-95"
                style={{
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                  width: '48px',
                  height: '48px',
                  minWidth: '48px',
                  minHeight: '48px',
                }}
                aria-label={`View ${asset.name}`}
              >
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Pulse for active assets */}
                  {asset.isOnline && (
                    <div 
                      className="absolute inset-0 w-10 h-10 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 rounded-full opacity-20 animate-ping" 
                      style={{ backgroundColor: asset.iconColor || '#FBBF24' }}
                    />
                  )}
                  
                  {/* Asset Marker (Square to distinguish from round people) */}
                  <div
                    className="relative w-7 h-7 rounded border-2 border-white shadow-lg flex items-center justify-center text-xs"
                    style={{
                      backgroundColor: asset.isOnline ? (asset.iconColor || '#FBBF24') : '#64748B',
                    }}
                  >
                    {getAssetIcon(asset.iconType)}
                  </div>

                  {/* Name label */}
                  <div className="absolute top-9 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#1E293B]/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold border border-[#334155] pointer-events-none"
                    style={{ color: asset.iconColor || '#FBBF24' }}
                  >
                    {asset.name.length > 10 ? asset.name.substring(0, 10) + '...' : asset.name}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Top Status Bar (Below Badge) */}
      <div className="absolute top-16 left-0 right-0 z-20 px-4">
        <div className="bg-[#1E293B]/70 backdrop-blur-sm border border-[#334155]/50 rounded-xl p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-[#84CC16]" />
              <div>
                <p className="text-white font-bold text-xs">Your Location</p>
                <p className="text-[#94A3B8] text-xs">San Francisco, CA</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#FBBF24]" />
              <p className="text-white font-bold text-xs">
                {familyMembers.filter(m => m.isOnline).length}/{familyMembers.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Zone (Thumb-friendly) */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-6 pb-32">
        {lastVerifiedPulse && (
          <div className="mb-4 bg-[#84CC16]/20 border-2 border-[#84CC16] rounded-xl p-4">
            <p className="text-[#84CC16] font-bold text-sm text-center">
              ✓ All Safe - Last verified {Math.floor((Date.now() - lastVerifiedPulse.timestamp) / 60000)}m ago
            </p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onSendPing}
            className="h-[72px] bg-[#1E293B]/70 backdrop-blur-sm border-2 border-[#84CC16] rounded-xl flex items-center justify-center gap-3 hover:bg-[#84CC16] hover:text-[#0F172A] transition-all active:scale-95"
          >
            <MapPin className="w-6 h-6" />
            <span className="font-bold text-lg">Send Ping</span>
          </button>

          <button
            onClick={onTriggerPanic}
            className="h-[72px] bg-[#FF4444] border-2 border-[#FF4444] rounded-xl flex items-center justify-center gap-3 hover:bg-[#DC2626] transition-all active:scale-95"
          >
            <AlertTriangle className="w-6 h-6 text-white" />
            <span className="font-bold text-lg text-white">Panic</span>
          </button>
        </div>
      </div>

      {/* Selected Member Details */}
      {selectedMember && (
        <div className="absolute top-32 left-4 right-4 z-30 bg-[#1E293B]/95 backdrop-blur-sm border-2 border-[#84CC16] rounded-xl p-4">
          {(() => {
            const member = familyMembers.find(m => m.id === selectedMember);
            if (!member) return null;

            return (
              <>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-bold text-lg">{member.name}</h3>
                  <button
                    onClick={() => setSelectedMember(null)}
                    className="text-[#64748B] hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-[#84CC16] text-sm capitalize">{member.role.replace('_', ' ')}</p>
                <div className="mt-3 flex items-center gap-4 text-sm">
                  <span className="text-[#94A3B8]">Battery: {member.batteryLevel}%</span>
                  <span className="text-[#94A3B8]">
                    {member.lastLocation ? `GPS: ${member.lastLocation.accuracy}m` : 'No GPS'}
                  </span>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* System Health Overlay */}
      <SystemHealthOverlay
        isOpen={showSystemHealth}
        onClose={() => setShowSystemHealth(false)}
        familyCode={familyCode}
        tenantId={tenantId}
        gpsAccuracy={gpsAccuracy}
        isOnline={isOnline}
        isSyncing={isSyncing}
        lastSyncTimestamp={lastSyncTimestamp}
      />
    </div>
  );
}