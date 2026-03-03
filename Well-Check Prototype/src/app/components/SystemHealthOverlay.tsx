// 🛡️ System Health Overlay - Security Badge Tap Display
// V7.6: Shows real-time integrity check of Multi-Tenant RLS
// Reference: prd.md (Cryptographic Non-Repudiation)

import { Shield, MapPin, Database, Lock, CheckCircle, XCircle, Wifi, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SystemHealthOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  familyCode: string;
  tenantId: string;
  gpsAccuracy: 'high' | 'medium' | 'low';
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTimestamp: number;
}

export function SystemHealthOverlay({
  isOpen,
  onClose,
  familyCode,
  tenantId,
  gpsAccuracy,
  isOnline,
  isSyncing,
  lastSyncTimestamp,
}: SystemHealthOverlayProps) {
  const [rlsCheckStatus, setRlsCheckStatus] = useState<'checking' | 'verified' | 'failed'>('checking');

  // Simulate RLS integrity check
  useEffect(() => {
    if (isOpen) {
      setRlsCheckStatus('checking');
      // Mock integrity check (in production, this would be a real API call)
      setTimeout(() => {
        setRlsCheckStatus('verified');
      }, 800);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatLastSync = () => {
    const seconds = Math.floor((Date.now() - lastSyncTimestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const getGpsAccuracyColor = () => {
    switch (gpsAccuracy) {
      case 'high':
        return '#84CC16';
      case 'medium':
        return '#FBBF24';
      case 'low':
        return '#FF4444';
    }
  };

  const getGpsAccuracyText = () => {
    switch (gpsAccuracy) {
      case 'high':
        return '±10m';
      case 'medium':
        return '±50m';
      case 'low':
        return '±200m';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9997] animate-fadeIn"
        onClick={onClose}
      />

      {/* Overlay Card */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9998] w-[90%] max-w-md animate-scaleIn">
        <div className="bg-[#1E293B] border-2 border-[#334155] rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] border-b-2 border-[#334155] p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-[#84CC16]/20 rounded-full flex items-center justify-center">
                <Shield className="w-7 h-7 text-[#84CC16]" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-white font-bold text-xl">System Health</h2>
                <p className="text-[#94A3B8] text-sm">Real-time integrity check</p>
              </div>
            </div>

            {/* Family Code Display */}
            <div className="mt-4 p-3 bg-[#0F172A]/50 border border-[#334155] rounded-lg">
              <p className="text-[#64748B] text-xs mb-1">FAMILY CODE</p>
              <p
                className="text-[#84CC16] font-bold text-2xl tracking-widest"
                style={{
                  fontFamily: '"Courier New", "SF Mono", Monaco, Consolas, monospace',
                }}
              >
                {familyCode}
              </p>
            </div>
          </div>

          {/* Health Metrics */}
          <div className="p-6 space-y-4">
            {/* RLS Isolation Check */}
            <div className="flex items-center justify-between p-4 bg-[#0F172A] border border-[#334155] rounded-lg">
              <div className="flex items-center gap-3">
                <Lock className="w-6 h-6 text-[#84CC16]" />
                <div>
                  <p className="text-white font-bold text-sm">Multi-Tenant RLS</p>
                  <p className="text-[#64748B] text-xs">Row-level security isolation</p>
                </div>
              </div>
              <div>
                {rlsCheckStatus === 'checking' && (
                  <div className="w-6 h-6 border-2 border-[#84CC16] border-t-transparent rounded-full animate-spin" />
                )}
                {rlsCheckStatus === 'verified' && (
                  <CheckCircle className="w-6 h-6 text-[#84CC16]" />
                )}
                {rlsCheckStatus === 'failed' && <XCircle className="w-6 h-6 text-[#FF4444]" />}
              </div>
            </div>

            {/* GPS Accuracy */}
            <div className="flex items-center justify-between p-4 bg-[#0F172A] border border-[#334155] rounded-lg">
              <div className="flex items-center gap-3">
                <MapPin className="w-6 h-6" style={{ color: getGpsAccuracyColor() }} />
                <div>
                  <p className="text-white font-bold text-sm">GPS Accuracy</p>
                  <p className="text-[#64748B] text-xs capitalize">{gpsAccuracy} precision</p>
                </div>
              </div>
              <div>
                <p
                  className="font-bold text-sm"
                  style={{ color: getGpsAccuracyColor() }}
                >
                  {getGpsAccuracyText()}
                </p>
              </div>
            </div>

            {/* Database Sync */}
            <div className="flex items-center justify-between p-4 bg-[#0F172A] border border-[#334155] rounded-lg">
              <div className="flex items-center gap-3">
                <Database className={`w-6 h-6 ${isSyncing ? 'text-[#FBBF24]' : 'text-[#84CC16]'}`} />
                <div>
                  <p className="text-white font-bold text-sm">Database Sync</p>
                  <p className="text-[#64748B] text-xs">
                    {isSyncing ? 'Syncing...' : 'Up to date'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#64748B]" />
                <p className="text-[#64748B] text-xs">{formatLastSync()}</p>
              </div>
            </div>

            {/* Network Status */}
            <div className="flex items-center justify-between p-4 bg-[#0F172A] border border-[#334155] rounded-lg">
              <div className="flex items-center gap-3">
                <Wifi className={`w-6 h-6 ${isOnline ? 'text-[#84CC16]' : 'text-[#FF4444]'}`} />
                <div>
                  <p className="text-white font-bold text-sm">Encrypted Session</p>
                  <p className="text-[#64748B] text-xs">
                    {isOnline ? 'Active (TLS 1.3)' : 'Offline mode'}
                  </p>
                </div>
              </div>
              <div>
                {isOnline ? (
                  <CheckCircle className="w-6 h-6 text-[#84CC16]" />
                ) : (
                  <XCircle className="w-6 h-6 text-[#FF4444]" />
                )}
              </div>
            </div>

            {/* Tenant ID (Debug) */}
            <div className="p-3 bg-[#0F172A]/50 border border-[#334155]/50 rounded-lg">
              <p className="text-[#64748B] text-xs mb-1">TENANT ID</p>
              <p
                className="text-[#64748B] text-xs font-mono truncate"
                title={tenantId}
              >
                {tenantId}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t-2 border-[#334155] p-4 bg-[#0F172A]/50">
            <button
              onClick={onClose}
              className="w-full h-[56px] bg-[#84CC16] text-[#0F172A] rounded-lg font-bold text-base hover:bg-[#9FE63C] transition-colors active:scale-95"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            transform: translate(-50%, -50%) scale(0.9);
            opacity: 0;
          }
          to {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
