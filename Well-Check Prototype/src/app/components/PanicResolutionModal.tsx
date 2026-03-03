// 🛡️ Panic Resolution Modal - Universal Family PIN Required
// Coder: Resolution flow with PIN verification and reasoning codes
// Reference: prd.md (Panic Module), PANIC_CONFIG
// ⚠️ CRITICAL: App locked until valid PIN entered

import { useState } from 'react';
import { Shield, Lock, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { resolvePanic } from '../services/panicService';
import type { PanicEvent, EmergencyResolutionCode } from '../types';
import { toast } from 'sonner';

interface PanicResolutionModalProps {
  panicEvent: PanicEvent;
  resolvedByUserId: string;
  resolvedByUserName: string;
  onResolved: () => void;
  onCancel?: () => void;
}

const RESOLUTION_CODES: Array<{
  code: EmergencyResolutionCode;
  label: string;
  description: string;
  color: string;
}> = [
  {
    code: 'false_alarm',
    label: 'False Alarm',
    description: 'Accidental trigger, no assistance needed',
    color: '#64748B',
  },
  {
    code: 'resolved_safely',
    label: 'Resolved Safely',
    description: 'Situation resolved, user is safe',
    color: '#84CC16',
  },
  {
    code: 'family_assisted',
    label: 'Family Assisted',
    description: 'Family member provided help',
    color: '#84CC16',
  },
  {
    code: 'medical_help',
    label: 'Medical Help Provided',
    description: 'Medical assistance was given',
    color: '#3B82F6',
  },
  {
    code: '911_called',
    label: '911 Called',
    description: 'Emergency services contacted',
    color: '#FF4444',
  },
  {
    code: 'police_called',
    label: 'Police Called',
    description: 'Law enforcement contacted',
    color: '#FF4444',
  },
  {
    code: 'fire_called',
    label: 'Fire Department Called',
    description: 'Fire department contacted',
    color: '#FF4444',
  },
  {
    code: 'other',
    label: 'Other',
    description: 'Custom resolution',
    color: '#94A3B8',
  },
];

export function PanicResolutionModal({
  panicEvent,
  resolvedByUserId,
  resolvedByUserName,
  onResolved,
  onCancel,
}: PanicResolutionModalProps) {
  const [step, setStep] = useState<'pin' | 'resolution'>('pin');
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [selectedCode, setSelectedCode] = useState<EmergencyResolutionCode | null>(null);
  const [notes, setNotes] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  // =====================================================================
  // PIN VERIFICATION (Step 1)
  // =====================================================================

  const handlePINSubmit = () => {
    if (pin.length < 4) {
      setPinError('PIN must be at least 4 digits');
      return;
    }

    // In production: Verify PIN via API
    // For demo: Accept "1234" as valid PIN
    if (pin === '1234') {
      setPinError(null);
      setStep('resolution');
      toast.success('PIN Verified', {
        description: 'Select resolution reason',
        duration: 2000,
      });
    } else {
      setPinError('Invalid PIN. Please try again.');
      setPin('');

      // Haptic feedback on error
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    }
  };

  const handlePINKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePINSubmit();
    }
  };

  // =====================================================================
  // RESOLUTION SUBMISSION (Step 2)
  // =====================================================================

  const handleResolve = async () => {
    if (!selectedCode) {
      toast.error('Please select a resolution reason');
      return;
    }

    if (selectedCode === 'other' && !notes.trim()) {
      toast.error('Please provide details for "Other"');
      return;
    }

    setIsResolving(true);

    try {
      const result = resolvePanic(panicEvent.id, {
        resolvedByUserId,
        resolvedByUserName,
        resolutionCode: selectedCode,
        resolutionNotes: notes.trim() || undefined,
        pin, // Use verified PIN
        tenantId: panicEvent.tenantId,
      });

      if (result.success) {
        toast.success('Emergency Resolved', {
          description: 'Lockdown released',
          duration: 3000,
        });
        onResolved();
      } else {
        toast.error(result.reason || 'Failed to resolve panic');
      }
    } catch (error) {
      toast.error('Resolution failed');
      console.error(error);
    } finally {
      setIsResolving(false);
    }
  };

  // =====================================================================
  // RENDER
  // =====================================================================

  const elapsedTime = () => {
    const elapsed = Date.now() - panicEvent.triggeredAt;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/95 p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#1E293B] rounded-lg border-4 border-[#FF4444] my-8">
        {/* Header */}
        <div className="bg-[#FF4444] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold text-3xl">Resolve Emergency</h1>
                <p className="text-white/80 text-base">
                  {panicEvent.userName} • {elapsedTime()} elapsed
                </p>
              </div>
            </div>

            {onCancel && step === 'pin' && (
              <button
                onClick={onCancel}
                className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                aria-label="Cancel"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            )}
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-2">
            <div
              className={`flex-1 h-2 rounded-full ${
                step === 'pin' ? 'bg-white' : 'bg-white/30'
              }`}
            />
            <div
              className={`flex-1 h-2 rounded-full ${
                step === 'resolution' ? 'bg-white' : 'bg-white/30'
              }`}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* STEP 1: PIN Verification */}
          {step === 'pin' && (
            <div>
              <div className="mb-6 p-4 bg-[#FBBF24]/10 border border-[#FBBF24] rounded-lg">
                <div className="flex items-start gap-3">
                  <Lock className="w-6 h-6 text-[#FBBF24] flex-shrink-0" />
                  <div>
                    <p className="text-[#FBBF24] font-bold text-base mb-1">
                      Universal Family PIN Required
                    </p>
                    <p className="text-[#94A3B8] text-sm">
                      Enter the Family PIN to unlock the app and resolve this emergency. Only Family Head
                      can set the PIN.
                    </p>
                  </div>
                </div>
              </div>

              {/* PIN Input */}
              <div className="mb-6">
                <label htmlFor="pin" className="block text-white font-bold text-lg mb-3">
                  Enter Family PIN
                </label>
                <input
                  id="pin"
                  type="password"
                  inputMode="numeric"
                  maxLength={8}
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value.replace(/\D/g, ''));
                    setPinError(null);
                  }}
                  onKeyPress={handlePINKeyPress}
                  placeholder="••••"
                  autoFocus
                  className={`w-full h-[80px] px-6 bg-[#0F172A] border-4 rounded-lg text-white text-center text-4xl font-mono tracking-widest focus:outline-none ${
                    pinError
                      ? 'border-[#FF4444]'
                      : 'border-[#334155] focus:border-[#84CC16]'
                  }`}
                />
                {pinError && (
                  <div className="flex items-center gap-2 mt-2">
                    <AlertTriangle className="w-4 h-4 text-[#FF4444]" />
                    <p className="text-[#FF4444] text-sm">{pinError}</p>
                  </div>
                )}
              </div>

              {/* Demo Helper */}
              <div className="mb-6 p-3 bg-[#6366F1]/10 border border-[#6366F1] rounded-lg">
                <p className="text-[#6366F1] text-xs text-center">
                  💡 Demo PIN: <span className="font-mono font-bold">1234</span>
                </p>
              </div>

              <button
                onClick={handlePINSubmit}
                disabled={pin.length < 4}
                className="w-full h-[72px] bg-[#84CC16] text-[#0F172A] rounded-lg font-bold text-2xl hover:bg-[#9FE63C] transition-colors disabled:bg-[#334155] disabled:text-[#64748B] disabled:cursor-not-allowed"
              >
                Verify PIN
              </button>
            </div>
          )}

          {/* STEP 2: Resolution Code Selection */}
          {step === 'resolution' && (
            <div>
              <div className="mb-6">
                <h2 className="text-white font-bold text-xl mb-3">
                  How was the emergency resolved?
                </h2>
                <p className="text-[#94A3B8] text-sm">
                  Select the resolution outcome for audit trail
                </p>
              </div>

              {/* Resolution Codes */}
              <div className="space-y-3 mb-6">
                {RESOLUTION_CODES.map((option) => (
                  <button
                    key={option.code}
                    onClick={() => setSelectedCode(option.code)}
                    className={`w-full p-4 rounded-lg border-2 flex items-start gap-3 transition-colors text-left ${
                      selectedCode === option.code
                        ? 'border-[#84CC16] bg-[#84CC16]/10'
                        : 'border-[#334155] bg-[#0F172A] hover:border-[#84CC16]'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        selectedCode === option.code
                          ? 'border-[#84CC16] bg-[#84CC16]'
                          : 'border-[#334155]'
                      }`}
                    >
                      {selectedCode === option.code && (
                        <CheckCircle2 className="w-4 h-4 text-[#0F172A]" />
                      )}
                    </div>

                    <div className="flex-1">
                      <p
                        className={`font-bold text-base mb-1 ${
                          selectedCode === option.code ? 'text-[#84CC16]' : 'text-white'
                        }`}
                      >
                        {option.label}
                      </p>
                      <p className="text-[#94A3B8] text-sm">{option.description}</p>
                    </div>

                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0 mt-2"
                      style={{ backgroundColor: option.color }}
                    />
                  </button>
                ))}
              </div>

              {/* Notes (required for "Other") */}
              <div className="mb-6">
                <label htmlFor="notes" className="block text-white font-bold text-base mb-2">
                  Additional Notes {selectedCode === 'other' && <span className="text-[#FF4444]">*</span>}
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe what happened and how it was resolved..."
                  rows={4}
                  className="w-full px-4 py-3 bg-[#0F172A] border-2 border-[#334155] rounded-lg text-white text-base focus:border-[#84CC16] focus:outline-none resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setStep('pin')}
                  className="h-[72px] bg-[#334155] text-white rounded-lg font-bold text-lg hover:bg-[#475569] transition-colors"
                >
                  Back to PIN
                </button>

                <button
                  onClick={handleResolve}
                  disabled={!selectedCode || isResolving || (selectedCode === 'other' && !notes.trim())}
                  className="h-[72px] bg-[#84CC16] text-[#0F172A] rounded-lg font-bold text-xl hover:bg-[#9FE63C] transition-colors disabled:bg-[#334155] disabled:text-[#64748B] disabled:cursor-not-allowed"
                >
                  {isResolving ? 'Resolving...' : 'Resolve Emergency'}
                </button>
              </div>

              {/* Legal Notice */}
              <p className="text-[#64748B] text-xs text-center mt-4">
                Resolution will be logged with timestamp, GPS data, and PIN verification for audit compliance.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
