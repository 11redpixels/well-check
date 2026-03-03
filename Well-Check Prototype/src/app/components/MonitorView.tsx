// Monitor View: Ping family members and view verified pulses
import { Send, MapPin, Users, Activity } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StateVisuals } from './StateVisuals';
import { VerifiedPulseCard } from './VerifiedPulseCard';
import { toast } from 'sonner';

export function MonitorView() {
  const {
    status,
    familyMembers,
    sendPing,
    lastVerifiedPulse,
    clearVerifiedPulse,
    activePings,
    activeWatchMode,
  } = useApp();
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [buttonPulse, setButtonPulse] = useState<string | null>(null);

  const handlePingClick = (memberId: string, memberName: string) => {
    // 0ms visual feedback
    setButtonPulse(memberId);
    setTimeout(() => setButtonPulse(null), 200);

    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }

    sendPing(memberId);
    toast.info(`Safety check sent to ${memberName}`, {
      description: 'Awaiting reply...',
    });
  };

  const getPingStatus = (memberId: string) => {
    const ping = activePings.find((p) => p.toUserId === memberId);
    if (!ping) return null;
    return ping.status;
  };

  return (
    <div className="flex-1 flex flex-col p-6 relative">
      <StateVisuals status={status} />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-white font-bold text-2xl mb-2">Family Safety Monitor</h1>
        <p className="text-[#94A3B8] text-sm">
          {activeWatchMode ? (
            <span className="text-[#3B82F6] font-bold">👁️ Active Watch Mode Enabled</span>
          ) : (
            'Select a family member to send a safety check'
          )}
        </p>
      </div>

      {/* Verified Pulse Display */}
      {lastVerifiedPulse && status === 'verified' && (
        <div className="mb-6">
          <VerifiedPulseCard pulse={lastVerifiedPulse} onDismiss={clearVerifiedPulse} />
        </div>
      )}

      {/* Map Placeholder */}
      <div className="w-full mb-6 bg-[#1E293B] rounded-lg border-2 border-[#334155] overflow-hidden">
        <div className="aspect-video relative bg-gradient-to-br from-[#0F172A] to-[#1E293B] flex items-center justify-center">
          <div className="text-center">
            <Users className="w-16 h-16 text-[#3B82F6] mx-auto mb-3" aria-hidden="true" />
            <p className="text-white font-bold text-lg">Family Location Map</p>
            <p className="text-[#64748B] text-sm mt-1">
              {familyMembers.length} member{familyMembers.length !== 1 ? 's' : ''} in network
            </p>
          </div>

          {/* Mock Family Markers */}
          <div className="absolute inset-0">
            {familyMembers.map((member, idx) => (
              <div
                key={member.id}
                className="absolute"
                style={{
                  left: `${30 + idx * 20}%`,
                  top: `${40 + idx * 10}%`,
                }}
              >
                <div
                  className={`w-4 h-4 rounded-full shadow-lg ${
                    member.isOnline ? 'bg-[#00FF00]' : 'bg-[#64748B]'
                  } ${member.isOnline ? 'animate-pulse' : ''}`}
                  title={member.name}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Family Member Ping Actions */}
      <div className="space-y-4">
        <h2 className="text-white font-bold text-lg">Send Safety Check</h2>

        {familyMembers.length === 0 ? (
          <div className="text-center py-12 bg-[#1E293B] rounded-lg border border-[#334155]">
            <Users className="w-12 h-12 text-[#64748B] mx-auto mb-3" />
            <p className="text-[#94A3B8] text-sm">No family members added yet</p>
            <p className="text-[#64748B] text-xs mt-1">Share your Family Code to add members</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {familyMembers.map((member) => {
              const pingStatus = getPingStatus(member.id);
              const isPending = pingStatus === 'pending';
              const isReplied = pingStatus === 'replied';

              return (
                <div
                  key={member.id}
                  className={`bg-[#1E293B] rounded-lg p-4 border-2 transition-all ${
                    selectedMember === member.id
                      ? 'border-[#3B82F6]'
                      : 'border-[#334155] hover:border-[#475569]'
                  }`}
                >
                  {/* Member Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[#334155] flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-base leading-tight">
                        {member.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            member.isOnline ? 'bg-[#00FF00]' : 'bg-[#64748B]'
                          }`}
                        />
                        <span className="text-[#64748B] text-xs">
                          {member.isOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Ping Status */}
                  {isPending && (
                    <div className="mb-3 bg-[#FBBF24]/10 border border-[#FBBF24] rounded-lg p-2 text-center animate-pulse">
                      <Activity className="w-4 h-4 text-[#FBBF24] inline-block mr-2" />
                      <span className="text-[#FBBF24] text-sm font-bold">Awaiting Reply...</span>
                    </div>
                  )}

                  {isReplied && (
                    <div className="mb-3 bg-[#00FF00]/10 border border-[#00FF00] rounded-lg p-2 text-center">
                      <span className="text-[#00FF00] text-sm font-bold">✓ Replied</span>
                    </div>
                  )}

                  {/* Ping Button */}
                  <button
                    onClick={() => handlePingClick(member.id, member.name)}
                    disabled={isPending}
                    className={`w-full min-h-[48px] rounded-lg font-bold text-sm transition-all transform ${
                      buttonPulse === member.id ? 'scale-95' : 'scale-100'
                    } ${
                      isPending
                        ? 'bg-[#334155] text-[#64748B] cursor-not-allowed'
                        : 'bg-[#3B82F6] text-white hover:bg-[#3B82F6]/90 shadow-lg shadow-[#3B82F6]/25 active:scale-95'
                    }`}
                    aria-label={`Send safety check to ${member.name}`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Send className="w-5 h-5" aria-hidden="true" />
                      <span>Ping {member.name}</span>
                    </div>
                  </button>

                  {/* Last Location */}
                  {member.lastLocation && (
                    <div className="mt-3 pt-3 border-t border-[#334155]">
                      <div className="flex items-center gap-2 text-[#64748B] text-xs">
                        <MapPin className="w-3 h-3" aria-hidden="true" />
                        <span className="font-mono">
                          Last: {member.lastLocation.lat.toFixed(4)},{' '}
                          {member.lastLocation.lng.toFixed(4)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
