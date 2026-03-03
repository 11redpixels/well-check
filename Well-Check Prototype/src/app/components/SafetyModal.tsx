// =====================================================================
// SAFETY TERMS MODAL
// Legal Compliance: One-time modal shown on first app launch
// 
// Purpose: Inform users that Well-Check is NOT a replacement for 911
// Reference: DOMAIN_EXPERT_FINAL_SIGN_OFF.md (Section 3.5)
// =====================================================================

import { useState, useEffect } from 'react';
import { AlertTriangle, Shield, Phone, CheckCircle } from 'lucide-react';

interface SafetyModalProps {
  onAccept: () => void;
}

export function SafetyModal({ onAccept }: SafetyModalProps) {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);

  // Track if user has scrolled through terms (good UX practice)
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const scrolledToBottom =
      element.scrollHeight - element.scrollTop <= element.clientHeight + 50;
    if (scrolledToBottom) {
      setHasScrolled(true);
    }
  };

  const handleAccept = () => {
    if (!isAccepted) return;

    // Log acceptance timestamp
    const acceptanceData = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      version: '1.0.0',
    };
    localStorage.setItem('well-check-safety-terms-accepted', JSON.stringify(acceptanceData));

    // Haptic feedback (if supported)
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }

    onAccept();
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="safety-modal-title"
    >
      <div className="w-full max-w-2xl bg-[#0F172A] rounded-lg shadow-2xl border-2 border-[#334155] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FF0000]/20 to-[#FF6B6B]/20 border-b-2 border-[#FF6B6B] p-6">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Shield className="w-10 h-10 text-[#00FF00]" aria-hidden="true" />
            <h1 id="safety-modal-title" className="text-white font-bold text-3xl">
              Well-Check Safety Terms
            </h1>
          </div>
          <p className="text-[#94A3B8] text-center text-lg">
            Please read these important safety guidelines before using the app
          </p>
        </div>

        {/* Scrollable Content */}
        <div
          className="p-6 max-h-[60vh] overflow-y-auto space-y-6"
          onScroll={handleScroll}
          style={{ scrollbarColor: '#00FF00 #1E293B' }}
        >
          {/* CRITICAL WARNING - 911 Clause */}
          <div className="bg-[#FF9999]/20 border-4 border-[#FF9999] rounded-lg p-6">
            <div className="flex items-start gap-4">
              <Phone className="w-12 h-12 text-[#FF9999] flex-shrink-0 animate-pulse" aria-hidden="true" />
              <div>
                <h2 className="text-[#FF9999] font-bold text-2xl mb-2 flex items-center gap-2">
                  ⚠️ IN AN EMERGENCY, ALWAYS CALL 911
                </h2>
                <p className="text-white text-lg leading-relaxed">
                  Well-Check is <span className="font-bold underline">NOT</span> a replacement for professional emergency services.
                </p>
              </div>
            </div>
          </div>

          {/* What Well-Check Is NOT */}
          <div className="space-y-3">
            <h3 className="text-white font-bold text-xl flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-[#FBBF24]" aria-hidden="true" />
              What Well-Check Is NOT:
            </h3>
            <ul className="space-y-2 text-[#94A3B8] text-base">
              <li className="flex items-start gap-2">
                <span className="text-[#FF9999] font-bold">✗</span>
                <span>A replacement for 911 emergency services</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF9999] font-bold">✗</span>
                <span>A guarantee of safety or protection</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF9999] font-bold">✗</span>
                <span>A professional monitoring service</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF9999] font-bold">✗</span>
                <span>A medical alert system</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF9999] font-bold">✗</span>
                <span>A substitute for emergency contacts or personal safety training</span>
              </li>
            </ul>
          </div>

          {/* What Well-Check IS */}
          <div className="space-y-3">
            <h3 className="text-white font-bold text-xl flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-[#00FF00]" aria-hidden="true" />
              What Well-Check IS:
            </h3>
            <ul className="space-y-2 text-[#94A3B8] text-base">
              <li className="flex items-start gap-2">
                <span className="text-[#00FF00] font-bold">✓</span>
                <span>A communication tool to help families stay connected</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00FF00] font-bold">✓</span>
                <span>A way to share your location and battery status with family members</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00FF00] font-bold">✓</span>
                <span>A tool for routine safety check-ins (e.g., "Did you get home safely?")</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00FF00] font-bold">✓</span>
                <span>A way to alert family members that you need assistance</span>
              </li>
            </ul>
          </div>

          {/* Important Limitations */}
          <div className="bg-[#1E293B] border-2 border-[#334155] rounded-lg p-4 space-y-2">
            <h3 className="text-white font-bold text-lg">Important Limitations:</h3>
            <ul className="space-y-1 text-[#94A3B8] text-sm">
              <li className="flex items-start gap-2">
                <span className="text-[#FBBF24]">•</span>
                <span>Location data may be inaccurate or unavailable</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FBBF24]">•</span>
                <span>Internet connectivity is required for real-time updates</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FBBF24]">•</span>
                <span>Low battery may prevent responses</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FBBF24]">•</span>
                <span>Network outages are beyond our control</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FBBF24]">•</span>
                <span>This app is provided "as-is" without warranty</span>
              </li>
            </ul>
          </div>

          {/* Your Responsibilities */}
          <div className="space-y-2">
            <h3 className="text-white font-bold text-lg">Your Responsibilities:</h3>
            <p className="text-[#94A3B8] text-base">
              By using Well-Check, you acknowledge that:
            </p>
            <ul className="space-y-1 text-[#94A3B8] text-sm">
              <li className="flex items-start gap-2">
                <span className="text-[#00FF00]">✓</span>
                <span>You will call 911 in any actual emergency</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00FF00]">✓</span>
                <span>You understand this is a communication tool, not an emergency service</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00FF00]">✓</span>
                <span>You will keep your device charged when possible</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00FF00]">✓</span>
                <span>You will not rely solely on this app for your safety</span>
              </li>
            </ul>
          </div>

          {/* Scroll indicator (only show if not scrolled) */}
          {!hasScrolled && (
            <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A] to-transparent pt-4 pb-2 text-center">
              <p className="text-[#FBBF24] text-sm animate-pulse">
                ↓ Scroll down to continue ↓
              </p>
            </div>
          )}
        </div>

        {/* Footer - Acceptance Checkbox and Button */}
        <div className="bg-[#1E293B] border-t-2 border-[#334155] p-6 space-y-4">
          {/* Acceptance Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isAccepted}
              onChange={(e) => setIsAccepted(e.target.checked)}
              className="mt-1 w-6 h-6 accent-[#00FF00] cursor-pointer"
              aria-label="I understand and agree to the safety terms"
            />
            <span className="text-white text-base flex-1">
              I understand that Well-Check is NOT a replacement for 911 emergency services. 
              I will call 911 in any actual emergency.
            </span>
          </label>

          {/* Accept Button */}
          <button
            onClick={handleAccept}
            disabled={!isAccepted}
            className={`w-full min-h-[60px] rounded-lg font-bold text-xl transition-all transform active:scale-95 ${
              isAccepted
                ? 'bg-[#00FF00] text-[#0F172A] hover:bg-[#00FF00]/90 shadow-lg shadow-[#00FF00]/25'
                : 'bg-[#334155] text-[#64748B] cursor-not-allowed'
            }`}
            aria-label="Accept safety terms and continue to app"
          >
            <div className="flex items-center justify-center gap-3">
              <CheckCircle className="w-7 h-7" aria-hidden="true" />
              <span>I Understand - Continue to Well-Check</span>
            </div>
          </button>

          {/* Footer Note */}
          <p className="text-[#64748B] text-xs text-center">
            By continuing, you confirm you are 13 years or older
          </p>
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// USAGE EXAMPLE
// =====================================================================
// In App.tsx:
//
// const [hasAcceptedTerms, setHasAcceptedTerms] = useState(() => {
//   const saved = localStorage.getItem('well-check-safety-terms-accepted');
//   return saved !== null;
// });
//
// if (!hasAcceptedTerms) {
//   return <SafetyModal onAccept={() => setHasAcceptedTerms(true)} />;
// }
//
// return <AppContent />;
// =====================================================================