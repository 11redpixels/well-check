// 🔒 V8.1.2 BLOCKER FIX: Universal Family PIN Modal
// Coder - Security Hardening
// Date: 2026-02-19

import { useState, useEffect } from 'react';

interface UniversalFamilyPinModalProps {
  tenantId: string;
  purpose: 'panic_resolution' | 'settings_edit' | 'role_change' | 'account_deletion';
  onVerified: () => void;
  onCancel?: () => void; // Optional for non-critical operations
  allowCancel?: boolean; // False for panic resolution
}

export function UniversalFamilyPinModal({
  tenantId,
  purpose,
  onVerified,
  onCancel,
  allowCancel = false,
}: UniversalFamilyPinModalProps) {
  const [pin, setPin] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);
  const [lockoutSeconds, setLockoutSeconds] = useState<number | null>(null);

  // Countdown for lockout
  useEffect(() => {
    if (lockoutSeconds !== null && lockoutSeconds > 0) {
      const timer = setTimeout(() => {
        setLockoutSeconds(lockoutSeconds - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (lockoutSeconds === 0) {
      setLockoutSeconds(null);
      setError(null);
      setAttemptsRemaining(3);
    }
  }, [lockoutSeconds]);

  const handlePinChange = (value: string) => {
    // Only allow digits
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 6) {
      setPin(cleaned);
      setError(null);
    }
  };

  const handleVerify = async () => {
    if (pin.length < 4) {
      setError('PIN must be at least 4 digits');
      return;
    }

    if (lockoutSeconds !== null && lockoutSeconds > 0) {
      return; // Still locked out
    }

    setIsVerifying(true);
    setError(null);

    try {
      // Call API to verify PIN
      const response = await fetch('/api/family-pin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          pin,
          purpose,
        }),
      });

      const data = await response.json();

      if (response.ok && data.isValid) {
        // PIN verified successfully
        onVerified();
      } else {
        // PIN incorrect or locked out
        if (data.lockoutRemainingSeconds > 0) {
          setLockoutSeconds(data.lockoutRemainingSeconds);
          setError(data.errorMessage || 'Account locked due to failed attempts');
        } else {
          setError(data.errorMessage || 'Incorrect PIN');
          setAttemptsRemaining(Math.max(0, attemptsRemaining - 1));
        }
        setPin(''); // Clear PIN input
      }
    } catch (err) {
      console.error('PIN verification error:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && pin.length >= 4 && !isVerifying) {
      handleVerify();
    }
  };

  const getPurposeText = () => {
    switch (purpose) {
      case 'panic_resolution':
        return 'Resolve Panic Mode';
      case 'settings_edit':
        return 'Edit Family Settings';
      case 'role_change':
        return 'Change Family Roles';
      case 'account_deletion':
        return 'Delete Account';
      default:
        return 'Verify Identity';
    }
  };

  const formatLockoutTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-[#0F172A]/98 backdrop-blur-lg z-[150] flex items-center justify-center p-6 animate-fade-in">
      <div className="w-full max-w-md bg-[#1E293B] rounded-2xl border-2 border-[#FBBF24] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#0F172A]">🔒 Family PIN Required</h2>
              <p className="text-sm text-[#0F172A]/70">{getPurposeText()}</p>
            </div>
            {allowCancel && onCancel && (
              <button
                onClick={onCancel}
                className="w-12 h-12 rounded-full bg-white/20 text-[#0F172A] flex items-center justify-center hover:bg-white/30 active:scale-95 transition-all"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-8 space-y-6">
          {/* Lockout Warning */}
          {lockoutSeconds !== null && lockoutSeconds > 0 ? (
            <div className="bg-[#FF4444]/20 border-2 border-[#FF4444] rounded-lg p-6 text-center">
              <div className="text-6xl mb-4">🔒</div>
              <div className="text-xl font-bold text-white mb-2">Account Locked</div>
              <div className="text-3xl font-bold text-[#FF4444] tabular-nums mb-2">
                {formatLockoutTime(lockoutSeconds)}
              </div>
              <div className="text-sm text-[#94A3B8]">
                Too many failed attempts. Try again after the timer expires.
              </div>
            </div>
          ) : (
            <>
              {/* Instructions */}
              <div className="text-center">
                <div className="text-4xl mb-4">🔑</div>
                <p className="text-lg text-[#94A3B8]">
                  Enter your 4-6 digit Universal Family PIN
                </p>
                {!allowCancel && purpose === 'panic_resolution' && (
                  <p className="text-sm text-[#FF4444] mt-2">
                    ⚠️ This action cannot be cancelled
                  </p>
                )}
              </div>

              {/* PIN Input */}
              <div>
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={pin}
                  onChange={(e) => handlePinChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="••••••"
                  disabled={isVerifying}
                  autoFocus
                  className="w-full h-[80px] px-6 bg-[#0F172A] border-2 border-[#334155] rounded-lg text-white text-4xl text-center tracking-widest placeholder-[#64748B] focus:border-[#FBBF24] focus:outline-none transition-colors disabled:opacity-50"
                  style={{ letterSpacing: '0.5em' }}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-[#FF4444]/20 border border-[#FF4444] rounded-lg px-4 py-3 text-sm text-[#FF4444] text-center">
                  {error}
                </div>
              )}

              {/* Attempts Remaining */}
              {attemptsRemaining < 3 && !error?.includes('locked') && (
                <div className="text-center text-sm text-[#FBBF24]">
                  ⚠️ {attemptsRemaining} attempt{attemptsRemaining !== 1 ? 's' : ''} remaining
                  before 15-minute lockout
                </div>
              )}

              {/* Verify Button */}
              <button
                onClick={handleVerify}
                disabled={pin.length < 4 || isVerifying}
                className="w-full h-[72px] bg-[#84CC16] text-[#0F172A] text-2xl font-bold rounded-lg hover:bg-[#9DE622] active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isVerifying ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>✓</span>
                    <span>Verify PIN</span>
                  </>
                )}
              </button>

              {/* Help Text */}
              <div className="bg-[#334155] rounded-lg px-4 py-3 text-sm text-[#94A3B8]">
                <div className="font-bold mb-1">🆘 Forgot your PIN?</div>
                <div>
                  Only the Family Head can reset the PIN. Contact them or use emergency
                  contacts if this is a panic situation.
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer (Panic Resolution Only) */}
        {!allowCancel && purpose === 'panic_resolution' && (
          <div className="bg-[#FF4444]/20 border-t-2 border-[#FF4444] px-6 py-4">
            <div className="text-center text-sm text-white">
              🚨 Panic Mode cannot be dismissed without the correct Family PIN
            </div>
          </div>
        )}
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
