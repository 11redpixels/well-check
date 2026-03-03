// 🛡️ UniversalPINModal - Stage 3 Alert Dismissal Gate
// Auditor: Stage 3 Alerts cannot be cleared without Universal Family PIN
// Reference: prd.md #38 (Universal Family PIN Resolution)

import { useState, useRef, useEffect } from 'react';
import { Lock, AlertTriangle } from 'lucide-react';

interface UniversalPINModalProps {
  onSuccess: () => void;
  onCancel: () => void;
  context: 'stage3_dismissal' | 'medication_override' | 'emergency_resolve';
  userName?: string;
  medicationName?: string;
}

// Mock PIN for demo (in production: stored in Supabase, hashed)
const UNIVERSAL_FAMILY_PIN = '1234';

export function UniversalPINModal({
  onSuccess,
  onCancel,
  context,
  userName,
  medicationName,
}: UniversalPINModalProps) {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    // Auto-focus first input
    inputRefs[0].current?.focus();
  }, []);

  const handleInput = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError('');

    // Auto-advance to next input
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    // Auto-submit when all 4 digits entered
    if (newPin.every((d) => d !== '') && index === 3) {
      setTimeout(() => verifyPIN(newPin.join('')), 100);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (pin[index] === '' && index > 0) {
        // Move to previous input if current is empty
        inputRefs[index - 1].current?.focus();
      } else {
        // Clear current input
        const newPin = [...pin];
        newPin[index] = '';
        setPin(newPin);
      }
    }
  };

  const verifyPIN = (enteredPIN: string) => {
    if (enteredPIN === UNIVERSAL_FAMILY_PIN) {
      // Success: Log to audit trail
      console.log('✅ Universal Family PIN verified', {
        context,
        timestamp: Date.now(),
        attempts: attempts + 1,
      });
      
      onSuccess();
    } else {
      // Failed: Increment attempts
      setAttempts((prev) => prev + 1);
      setError('Incorrect PIN. Try again.');
      setPin(['', '', '', '']);
      inputRefs[0].current?.focus();

      // Lock out after 3 failed attempts (security measure)
      if (attempts >= 2) {
        setError('Too many failed attempts. Contact Family Head.');
        setTimeout(() => {
          onCancel();
        }, 3000);
      }
    }
  };

  const getContextMessage = () => {
    switch (context) {
      case 'stage3_dismissal':
        return {
          title: 'Critical Alert Dismissal Requires PIN',
          description: `Stage 3 medication alert for ${userName} cannot be dismissed without the Universal Family PIN.`,
          icon: <AlertTriangle className="w-8 h-8 text-[#FF4444]" />,
        };
      case 'medication_override':
        return {
          title: 'Medication Override Requires PIN',
          description: `Overriding medication schedule for "${medicationName}" requires admin authorization.`,
          icon: <Lock className="w-8 h-8 text-[#FBBF24]" />,
        };
      case 'emergency_resolve':
        return {
          title: 'Emergency Resolution Requires PIN',
          description: 'Resolving an emergency event requires the Universal Family PIN for audit trail.',
          icon: <Lock className="w-8 h-8 text-[#FF4444]" />,
        };
      default:
        return {
          title: 'Authorization Required',
          description: 'This action requires the Universal Family PIN.',
          icon: <Lock className="w-8 h-8 text-[#94A3B8]" />,
        };
    }
  };

  const contextData = getContextMessage();

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4">
      <div className="w-full max-w-md bg-[#1E293B] rounded-lg border-2 border-[#FBBF24] overflow-hidden">
        {/* Header */}
        <div className="bg-[#FBBF24] p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              {contextData.icon}
            </div>
            <div className="flex-1">
              <h2 className="text-[#0F172A] font-bold text-xl">{contextData.title}</h2>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-[#94A3B8] text-base mb-6">{contextData.description}</p>

          {/* PIN Input */}
          <div className="mb-6">
            <p className="text-white font-bold text-lg mb-3 text-center">
              Enter Universal Family PIN
            </p>

            {/* 4-Digit PIN Grid */}
            <div className="flex justify-center gap-3 mb-4">
              {[0, 1, 2, 3].map((index) => (
                <input
                  key={index}
                  ref={inputRefs[index]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={pin[index]}
                  onChange={(e) => handleInput(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`
                    w-16 h-20 text-center text-3xl font-bold bg-[#0F172A] rounded-lg
                    border-2 transition-all
                    ${error ? 'border-[#FF4444]' : 'border-[#334155]'}
                    text-white focus:border-[#84CC16] focus:outline-none
                  `}
                  disabled={attempts >= 3}
                />
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-[#FF4444] text-sm text-center font-mono">{error}</p>
            )}

            {/* Attempts Counter */}
            {attempts > 0 && attempts < 3 && (
              <p className="text-[#FBBF24] text-xs text-center mt-2">
                {3 - attempts} attempt{3 - attempts !== 1 ? 's' : ''} remaining
              </p>
            )}
          </div>

          {/* Cancel Button */}
          <button
            onClick={onCancel}
            disabled={attempts >= 3}
            className="w-full h-[56px] bg-[#334155] text-white rounded-lg font-bold text-lg hover:bg-[#475569] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>

          {/* Legal Notice */}
          <p className="text-[#64748B] text-xs mt-4 text-center">
            ⚖️ PIN verification will be logged to the audit trail with timestamp and user ID for
            non-repudiation.
          </p>
        </div>
      </div>
    </div>
  );
}
