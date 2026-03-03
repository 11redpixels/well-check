// 💊 PILLAR 1: Medication Prompt (V8.1)
// Mandate: INTERRUPTIVE MODAL - Blocks all app functions until "Taken" or "Reason" provided

import { useState } from 'react';
import type { MedicationV8, ReasoningCode } from '../types';

interface MedicationPromptProps {
  medication: MedicationV8;
  scheduledTime: number;
  onConfirm: () => void;
  onReason: (code: ReasoningCode, notes?: string) => void;
}

export function MedicationPrompt({
  medication,
  scheduledTime,
  onConfirm,
  onReason,
}: MedicationPromptProps) {
  const [showReasoningModal, setShowReasoningModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState<ReasoningCode | null>(null);
  const [reasonNotes, setReasonNotes] = useState('');

  const timeStr = new Date(scheduledTime).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const handleReasonSubmit = () => {
    if (selectedReason) {
      onReason(selectedReason, reasonNotes.trim() || undefined);
      setShowReasoningModal(false);
    }
  };

  const reasoningOptions: { code: ReasoningCode; label: string; icon: string; supportiveText: string }[] = [
    { code: 'forgot', label: 'I Forgot', icon: '🤷', supportiveText: 'It happens! We\'ll help you remember next time.' },
    { code: 'sleeping', label: 'I Was Sleeping', icon: '😴', supportiveText: 'Rest is important. We understand.' },
    { code: 'traveling', label: "I'm Traveling", icon: '✈️', supportiveText: 'Travel can disrupt routines. Thanks for letting us know.' },
    { code: 'out_of_pills', label: 'Out of Pills', icon: '💊', supportiveText: 'We\'ll notify your family to help with refills.' },
    { code: 'side_effects', label: 'Side Effects', icon: '😵', supportiveText: 'Your health comes first. Consider talking to your doctor.' },
    { code: 'refused', label: "Didn't Feel Like It", icon: '🤚', supportiveText: 'That\'s okay. Your honesty helps your care team.' },
    { code: 'other', label: 'Other Reason', icon: '📝', supportiveText: 'Share what happened if you\'d like.' },
  ];

  return (
    <>
      {/* INTERRUPTIVE MODAL - Covers entire app, cannot be dismissed */}
      <div className="fixed inset-0 bg-[#0F172A]/95 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-fade-in">
        <div className="w-full max-w-md bg-[#1E293B] rounded-2xl border-2 border-[#FBBF24] shadow-2xl overflow-hidden animate-scale-in">
          {/* Pulsing Alert Header */}
          <div className="bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] px-6 py-4 animate-pulse-slow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">
                💊
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#0F172A]">
                  Medication Reminder
                </h2>
                <p className="text-sm text-[#0F172A]/70">
                  Scheduled for {timeStr}
                </p>
              </div>
            </div>
          </div>

          {/* Medication Details */}
          <div className="px-6 py-8 space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">
                {medication.name}
              </div>
              <div className="text-2xl text-[#94A3B8]">
                {medication.dosage}
              </div>
            </div>

            <div className="bg-[#0F172A] rounded-lg p-4 border border-[#334155]">
              <p className="text-lg text-[#94A3B8] text-center">
                Did you take this medication?
              </p>
            </div>

            {/* Action Buttons - LARGE, UNMISSABLE */}
            <div className="space-y-3">
              {/* CONFIRMED Button */}
              <button
                onClick={onConfirm}
                className="w-full h-[80px] bg-[#84CC16] text-[#0F172A] text-2xl font-bold rounded-lg hover:bg-[#9DE622] active:scale-98 transition-all shadow-lg flex items-center justify-center gap-3"
              >
                <span className="text-3xl">✓</span>
                <span>Yes, I Took It</span>
              </button>

              {/* REASON Button */}
              <button
                onClick={() => setShowReasoningModal(true)}
                className="w-full h-[80px] bg-[#334155] text-white text-2xl font-bold rounded-lg hover:bg-[#475569] active:scale-98 transition-all flex items-center justify-center gap-3"
              >
                <span className="text-3xl">📝</span>
                <span>No, I Didn't</span>
              </button>
            </div>

            {/* Warning Text */}
            <div className="text-center text-sm text-[#64748B]">
              ⚠️ This prompt will not dismiss until you respond
            </div>
          </div>
        </div>
      </div>

      {/* REASONING MODAL - Stacked on top of medication prompt */}
      {showReasoningModal && (
        <div className="fixed inset-0 bg-[#0F172A]/98 backdrop-blur-lg z-[110] flex items-center justify-center p-6 animate-fade-in">
          <div className="w-full max-w-md bg-[#1E293B] rounded-2xl border-2 border-[#FF4444] shadow-2xl overflow-hidden animate-scale-in max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-[#FF4444] px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  Why didn't you take it?
                </h2>
                <button
                  onClick={() => setShowReasoningModal(false)}
                  className="w-12 h-12 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 active:scale-95 transition-all"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Reasoning Options */}
            <div className="px-6 py-6 space-y-3">
              {reasoningOptions.map((option) => (
                <button
                  key={option.code}
                  onClick={() => setSelectedReason(option.code)}
                  className={`w-full h-[72px] rounded-lg px-6 flex items-center gap-4 text-left text-xl font-bold transition-all active:scale-98 ${
                    selectedReason === option.code
                      ? 'bg-[#FF4444] text-white border-2 border-white'
                      : 'bg-[#0F172A] text-white border border-[#334155] hover:border-[#FF4444]'
                  }`}
                >
                  <span className="text-3xl">{option.icon}</span>
                  <span>{option.label}</span>
                </button>
              ))}

              {/* Optional Notes (if "Other" selected) */}
              {selectedReason === 'other' && (
                <div className="pt-4">
                  <label className="block text-sm font-bold text-[#94A3B8] mb-2">
                    Additional Details (Optional)
                  </label>
                  <textarea
                    value={reasonNotes}
                    onChange={(e) => setReasonNotes(e.target.value)}
                    placeholder="Explain why you missed this dose..."
                    rows={4}
                    className="w-full px-4 py-3 bg-[#0F172A] border border-[#334155] rounded-lg text-white text-lg placeholder-[#64748B] focus:border-[#FF4444] focus:outline-none transition-colors resize-none"
                  />
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleReasonSubmit}
                disabled={!selectedReason}
                className="w-full h-[72px] bg-[#FF4444] text-white text-2xl font-bold rounded-lg hover:bg-[#FF5555] active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                Submit Reason
              </button>

              {/* Warning */}
              <div className="text-center text-sm text-[#64748B] mt-4">
                ⚠️ Your response will be logged and visible to your monitors
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Keyframe Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.85;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}