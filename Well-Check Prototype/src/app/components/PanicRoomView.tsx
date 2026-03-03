// 🚨 PILLAR 5: Panic Room View (Force-Sync for all family members)
// Mandate: One family, one view. Live map, audio stream, "Time Since Trigger" counter.

import { useEffect, useState } from 'react';
import type { PanicEventV8, Location, FamilyMember } from '../types';
import { UniversalFamilyPinModal } from './UniversalFamilyPinModal';

interface PanicRoomViewProps {
  panicEvent: PanicEventV8;
  currentUser: FamilyMember;
  familyMembers: FamilyMember[];
  onCall911: () => void;
  onResolvePanic: () => void;
}

export function PanicRoomView({
  panicEvent,
  currentUser,
  familyMembers,
  onCall911,
  onResolvePanic,
}: PanicRoomViewProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [showPinModal, setShowPinModal] = useState(false);

  // Update elapsed time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Date.now() - panicEvent.triggeredAt);
    }, 1000);

    return () => clearInterval(interval);
  }, [panicEvent.triggeredAt]);

  // Simulate audio level visualization (replace with real audio stream)
  useEffect(() => {
    const interval = setInterval(() => {
      setAudioLevel(Math.random() * 100);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const formatElapsedTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
    }
    return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
  };

  const isMonitor =
    currentUser.role === 'monitor' || currentUser.role === 'family_head';
  const isPanicUser = currentUser.id === panicEvent.userId;

  const connectedMonitorsCount = panicEvent.connectedMonitors.filter(
    (m) => m.viewingLiveStream
  ).length;

  // Get latest GPS ping
  const latestGPS: Location =
    panicEvent.highFrequencyGPS.length > 0
      ? panicEvent.highFrequencyGPS[panicEvent.highFrequencyGPS.length - 1]
      : panicEvent.location;

  return (
    <div className="fixed inset-0 bg-[#0F172A] z-[200] flex flex-col">
      {/* EMERGENCY HEADER - Pulsing Red */}
      <div className="bg-gradient-to-r from-[#FF4444] to-[#CC0000] px-6 py-4 animate-pulse-fast border-b-4 border-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-3xl animate-spin-slow">
              🚨
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">PANIC MODE ACTIVE</h1>
              <p className="text-sm text-white/80">
                {isPanicUser
                  ? 'Your family has been notified'
                  : `${panicEvent.userName} triggered panic`}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white tabular-nums">
              {formatElapsedTime(elapsedTime)}
            </div>
            <div className="text-xs text-white/70">TIME ELAPSED</div>
          </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto">
        {/* MAP SECTION */}
        <div className="relative h-[40vh] bg-[#1E293B] border-b border-[#334155]">
          {/* Map Placeholder (replace with real map component) */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">📍</div>
              <div className="text-xl font-bold text-white mb-2">
                Live Location Tracking
              </div>
              <div className="text-sm text-[#94A3B8]">
                Lat: {latestGPS.lat.toFixed(6)}, Lng: {latestGPS.lng.toFixed(6)}
              </div>
              <div className="text-xs text-[#64748B] mt-1">
                Accuracy: ±{latestGPS.accuracy.toFixed(1)}m
              </div>
            </div>
          </div>

          {/* GPS Update Indicator */}
          <div className="absolute top-4 left-4 bg-[#84CC16] text-[#0F172A] px-3 py-2 rounded-lg text-sm font-bold shadow-lg">
            🛰️ High-Frequency GPS ({panicEvent.highFrequencyGPS.length} pings)
          </div>

          {/* Connected Monitors Badge */}
          <div className="absolute top-4 right-4 bg-[#FBBF24] text-[#0F172A] px-3 py-2 rounded-lg text-sm font-bold shadow-lg">
            👥 {connectedMonitorsCount} Monitor{connectedMonitorsCount !== 1 ? 's' : ''}{' '}
            Viewing
          </div>
        </div>

        {/* AUDIO STREAM SECTION */}
        <div className="bg-[#1E293B] px-6 py-6 border-b border-[#334155]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🎤</span>
              <span>Live Audio Stream</span>
            </h2>
            {panicEvent.audioBufferUrl && (
              <button className="px-3 py-1.5 bg-[#334155] text-white text-sm rounded hover:bg-[#475569] active:scale-95 transition-all">
                Play 30s Buffer
              </button>
            )}
          </div>

          {/* Audio Visualizer */}
          <div className="h-24 bg-[#0F172A] rounded-lg flex items-end justify-center gap-1 p-4">
            {Array.from({ length: 40 }).map((_, i) => {
              const height = Math.sin(i / 5 + Date.now() / 200) * 40 + 40;
              return (
                <div
                  key={i}
                  className="flex-1 bg-[#84CC16] rounded-sm transition-all duration-100"
                  style={{
                    height: `${(height * audioLevel) / 100}%`,
                    opacity: 0.7 + (audioLevel / 200),
                  }}
                />
              );
            })}
          </div>

          <div className="text-center text-sm text-[#64748B] mt-2">
            🔊 Live audio streaming (encrypted)
          </div>
        </div>

        {/* FAMILY STATUS SECTION */}
        <div className="bg-[#0F172A] px-6 py-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>👨‍👩‍👧‍👦</span>
            <span>Family Status</span>
          </h2>

          <div className="space-y-3">
            {familyMembers.map((member) => {
              const isConnected = panicEvent.connectedMonitors.some(
                (m) => m.monitorId === member.id
              );
              const isPanic = member.id === panicEvent.userId;

              return (
                <div
                  key={member.id}
                  className={`bg-[#1E293B] rounded-lg p-4 border-2 ${
                    isPanic
                      ? 'border-[#FF4444]'
                      : isConnected
                      ? 'border-[#84CC16]'
                      : 'border-[#334155]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                          isPanic
                            ? 'bg-[#FF4444] text-white'
                            : isConnected
                            ? 'bg-[#84CC16] text-[#0F172A]'
                            : 'bg-[#334155] text-white'
                        }`}
                      >
                        {isPanic ? '🚨' : isConnected ? '👁️' : '👤'}
                      </div>
                      <div>
                        <div className="text-lg font-bold text-white">
                          {member.name}
                        </div>
                        <div className="text-sm text-[#94A3B8]">
                          {isPanic
                            ? '🆘 In Panic'
                            : isConnected
                            ? '✓ Viewing Panic Room'
                            : member.isOnline
                            ? 'Online'
                            : 'Offline'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-[#94A3B8]">
                        Battery: {member.batteryLevel}%
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* EMERGENCY ACTION BUTTONS - FIXED AT BOTTOM */}
      <div className="bg-[#1E293B] border-t-4 border-[#FF4444] px-6 py-4 space-y-3">
        {isMonitor && (
          <>
            {/* CALL 911 BUTTON - LARGEST, MOST PROMINENT */}
            <button
              onClick={onCall911}
              className="w-full h-[96px] bg-[#FF4444] text-white text-3xl font-bold rounded-lg hover:bg-[#FF5555] active:scale-98 transition-all shadow-2xl flex items-center justify-center gap-4"
            >
              <span className="text-4xl">📞</span>
              <span>CALL 911</span>
            </button>

            {/* Resolve Panic (Requires PIN) */}
            <button
              onClick={() => setShowPinModal(true)}
              className="w-full h-[72px] bg-[#334155] text-white text-xl font-bold rounded-lg hover:bg-[#475569] active:scale-98 transition-all flex items-center justify-center gap-3"
            >
              <span>🔒</span>
              <span>Resolve Panic (Requires PIN)</span>
            </button>
          </>
        )}

        {/* Info for Protected User */}
        {isPanicUser && (
          <div className="bg-[#FF4444]/20 border-2 border-[#FF4444] rounded-lg p-4">
            <div className="text-center">
              <div className="text-lg font-bold text-white mb-2">
                ✅ Your family has been notified
              </div>
              <div className="text-sm text-[#94A3B8]">
                {connectedMonitorsCount} monitor{connectedMonitorsCount !== 1 ? 's' : ''}{' '}
                are viewing your live location and audio stream
              </div>
              <div className="text-xs text-[#64748B] mt-2">
                Only a Monitor can resolve this panic with the Family PIN
              </div>
            </div>
          </div>
        )}

        {/* Legal Disclaimer */}
        <div className="text-center text-xs text-[#64748B]">
          ⚖️ GPS location, audio, and timestamps are being logged for your safety
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes pulse-fast {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.9;
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-pulse-fast {
          animation: pulse-fast 1s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 4s linear infinite;
        }
      `}</style>

      {/* Universal Family Pin Modal */}
      {showPinModal && (
        <UniversalFamilyPinModal
          tenantId={currentUser.tenantId}
          purpose="panic_resolution"
          onVerified={onResolvePanic}
          allowCancel={false}
        />
      )}
    </div>
  );
}