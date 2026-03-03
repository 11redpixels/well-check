// State Debug Panel (Prototype Testing Tool)
import { useState } from 'react';
import { Bug, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function StateDebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { status, isOffline, gpsAccuracy, batteryLevel, activePings, lastVerifiedPulse } =
    useApp();

  const getStatusColor = () => {
    switch (status) {
      case 'idle':
        return 'text-[#94A3B8]';
      case 'ping_sent':
        return 'text-[#FBBF24]';
      case 'verified':
        return 'text-[#00FF00]';
      case 'panic':
        return 'text-[#FF0000]';
      case 'offline':
        return 'text-[#64748B]';
      default:
        return 'text-white';
    }
  };

  return (
    <div className="fixed top-20 right-4 z-40 max-w-xs">
      <div
        className={`bg-[#0F172A]/95 border border-[#334155] rounded-lg shadow-2xl backdrop-blur-sm transition-all duration-300 ${
          isOpen ? 'w-72' : 'w-auto'
        }`}
      >
        {/* Header */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between gap-3 px-4 py-2 text-[#64748B] hover:text-[#94A3B8] transition-colors"
        >
          <div className="flex items-center gap-2">
            <Bug className="w-4 h-4" />
            <span className="font-mono text-xs font-bold">STATE DEBUG</span>
          </div>
          {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
        </button>

        {/* Content */}
        {isOpen && (
          <div className="border-t border-[#334155] p-3 space-y-2 font-mono text-xs">
            {/* Current Status */}
            <div className="flex justify-between">
              <span className="text-[#64748B]">status:</span>
              <span className={`font-bold ${getStatusColor()}`}>{status.toUpperCase()}</span>
            </div>

            {/* Offline Flag */}
            <div className="flex justify-between">
              <span className="text-[#64748B]">isOffline:</span>
              <span className={isOffline ? 'text-[#FF6B6B]' : 'text-[#00FF00]'}>
                {isOffline ? 'TRUE' : 'FALSE'}
              </span>
            </div>

            {/* GPS Accuracy */}
            <div className="flex justify-between">
              <span className="text-[#64748B]">gpsAccuracy:</span>
              <span className="text-white">{gpsAccuracy.toUpperCase()}</span>
            </div>

            {/* Battery */}
            <div className="flex justify-between">
              <span className="text-[#64748B]">batteryLevel:</span>
              <span
                className={batteryLevel < 15 ? 'text-[#FF6B6B] font-bold' : 'text-white'}
              >
                {batteryLevel}%
              </span>
            </div>

            {/* Active Pings */}
            <div className="pt-2 border-t border-[#334155]">
              <div className="text-[#64748B] mb-1">activePings:</div>
              <div className="pl-2">
                {activePings.length === 0 ? (
                  <span className="text-[#475569]">[ ]</span>
                ) : (
                  activePings.map((ping) => (
                    <div key={ping.id} className="text-[#94A3B8] text-[10px] leading-relaxed">
                      • {ping.toUserName}: {ping.status}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Last Verified Pulse */}
            {lastVerifiedPulse && (
              <div className="pt-2 border-t border-[#334155]">
                <div className="text-[#00FF00] mb-1">lastVerifiedPulse:</div>
                <div className="pl-2 text-[#94A3B8] text-[10px] leading-relaxed">
                  • User: {lastVerifiedPulse.userName}
                  <br />
                  • Battery: {lastVerifiedPulse.batteryLevel}%
                  <br />• Accuracy: ±{lastVerifiedPulse.location.accuracy}m
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
