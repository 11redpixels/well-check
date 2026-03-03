// 🛡️ ReasoningLogModal - Missed Dose Reasoning Capture
// Mandate: Grandparent Law (48px+ touch targets, 7:1 contrast)
// Reference: prd.md #42, ai-domain-expert.md #20

import { useState } from 'react';
import { X } from 'lucide-react';
import type { ReasoningCode, Medication } from '../types';

interface ReasoningLogModalProps {
  medication: Medication;
  scheduledTime: number;
  onSubmit: (code: ReasoningCode, notes?: string) => void;
  onCancel?: () => void;
}

const REASONING_OPTIONS: { code: ReasoningCode; label: string }[] = [
  { code: 'refused', label: 'Refused medication' },
  { code: 'sleeping', label: 'Sleeping / Resting' },
  { code: 'traveling', label: 'Traveling / Away from home' },
  { code: 'out_of_pills', label: 'Ran out of pills' },
  { code: 'side_effects', label: 'Side effects / Feeling unwell' },
  { code: 'forgot', label: 'Forgot / Lost track of time' },
  { code: 'other', label: 'Other (enter notes below)' },
];

export function ReasoningLogModal({
  medication,
  scheduledTime,
  onSubmit,
  onCancel,
}: ReasoningLogModalProps) {
  const [selectedCode, setSelectedCode] = useState<ReasoningCode | null>(null);
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    if (!selectedCode) return;
    onSubmit(selectedCode, notes.trim() || undefined);
  };

  const scheduledDate = new Date(scheduledTime);
  const formattedTime = scheduledDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
  const formattedDate = scheduledDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      {/* Modal Container - Full Screen on Mobile, Max Width on Desktop */}
      <div className="w-full max-w-2xl bg-[#1E293B] rounded-lg border-2 border-[#FF4444] overflow-hidden">
        {/* Header - Red Alert Stripe */}
        <div className="bg-[#FF4444] p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-bold text-2xl">Medication Missed</h2>
            {onCancel && (
              <button
                onClick={onCancel}
                className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                aria-label="Close"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Medication Info */}
          <div className="mb-6 p-4 bg-[#0F172A] rounded-lg border border-[#334155]">
            <p className="text-[#94A3B8] text-sm mb-1">Medication</p>
            <p className="text-white font-bold text-xl mb-2">{medication.name}</p>
            <p className="text-[#94A3B8] text-base">
              Dosage: <span className="text-white">{medication.dosage}</span>
            </p>
            <p className="text-[#94A3B8] text-base">
              Scheduled: <span className="text-white">{formattedTime}</span> on{' '}
              <span className="text-white">{formattedDate}</span>
            </p>
          </div>

          {/* Reason Selection */}
          <div className="mb-6">
            <p className="text-white font-bold text-lg mb-3">
              Why was this dose missed? <span className="text-[#FF4444]">*</span>
            </p>
            <p className="text-[#94A3B8] text-sm mb-4">
              Select a reason to close this alert and maintain the medical audit trail.
            </p>

            {/* Reason Options - Industrial Design with Large Touch Targets */}
            <div className="space-y-2">
              {REASONING_OPTIONS.map((option) => (
                <button
                  key={option.code}
                  onClick={() => setSelectedCode(option.code)}
                  className={`
                    w-full min-h-[60px] px-6 py-3 rounded-lg text-left
                    font-mono text-base
                    border-2 transition-all
                    ${
                      selectedCode === option.code
                        ? 'bg-[#84CC16] border-[#84CC16] text-[#0F172A]'
                        : 'bg-[#0F172A] border-[#334155] text-white hover:border-[#84CC16]'
                    }
                  `}
                >
                  <span className="flex items-center">
                    <span
                      className={`
                      w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center
                      ${
                        selectedCode === option.code
                          ? 'border-[#0F172A] bg-[#0F172A]'
                          : 'border-[#64748B]'
                      }
                    `}
                    >
                      {selectedCode === option.code && (
                        <div className="w-3 h-3 rounded-full bg-[#84CC16]" />
                      )}
                    </span>
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Optional Notes */}
          <div className="mb-6">
            <label htmlFor="reasoning-notes" className="block text-white font-bold text-lg mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              id="reasoning-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter any additional details..."
              className="w-full min-h-[120px] px-4 py-3 bg-[#0F172A] border-2 border-[#334155] rounded-lg text-white font-mono text-base focus:border-[#84CC16] focus:outline-none resize-none"
              maxLength={500}
            />
            <p className="text-[#64748B] text-sm mt-1">{notes.length}/500 characters</p>
          </div>

          {/* Submit Button - 60px height (Grandparent Law) */}
          <button
            onClick={handleSubmit}
            disabled={!selectedCode}
            className={`
              w-full h-[60px] rounded-lg font-bold text-xl transition-all
              ${
                selectedCode
                  ? 'bg-[#84CC16] text-[#0F172A] hover:bg-[#9FE63C] cursor-pointer'
                  : 'bg-[#334155] text-[#64748B] cursor-not-allowed'
              }
            `}
          >
            Submit Reason & Close Alert
          </button>

          {/* Legal Note */}
          <p className="text-[#64748B] text-xs mt-4 text-center">
            This entry will be logged in the medical audit trail with your user ID and timestamp for
            non-repudiation.
          </p>
        </div>
      </div>
    </div>
  );
}
