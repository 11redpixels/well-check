// 🛡️ 911 Legal Gate - Mandatory Disclaimer (First Interaction)
// Coder: 911 Legal Gate UI with Grandparent Law compliance
// Reference: prd.md (911 Legal Gate), ai-domain-expert.md
// ⚠️ CRITICAL: Must be accepted before panic functionality is enabled

import { useState } from 'react';
import { AlertTriangle, Phone, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { acceptSafetyTerms } from '../services/panicService';
import { toast } from 'sonner';

interface NineOneOneLegalGateProps {
  userId: string;
  userName: string;
  tenantId: string;
  onAccept: () => void;
  onDecline: () => void;
}

export function NineOneOneLegalGate({
  userId,
  userName,
  tenantId,
  onAccept,
  onDecline,
}: NineOneOneLegalGateProps) {
  const [hasReadDisclaimer, setHasReadDisclaimer] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  const handleAccept = async () => {
    if (!hasReadDisclaimer) {
      toast.error('Please read the entire disclaimer');
      return;
    }

    setIsAccepting(true);

    try {
      // Record acceptance with metadata
      acceptSafetyTerms(userId, tenantId, {
        deviceModel: navigator.userAgent,
        appVersion: '7.4.0',
      });

      toast.success('Safety Terms Accepted', {
        description: 'Panic button is now enabled',
        duration: 3000,
      });

      onAccept();
    } catch (error) {
      toast.error('Failed to accept terms');
      console.error(error);
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#1E293B] rounded-lg border-4 border-[#FF4444] my-8">
        {/* Header */}
        <div className="bg-[#FF4444] p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <ShieldAlert className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-3xl mb-1">
                Important Safety Notice
              </h1>
              <p className="text-white/80 text-base">Required reading before using panic button</p>
            </div>
          </div>

          {/* 911 Icon */}
          <div className="flex items-center justify-center gap-3 p-4 bg-white/10 rounded-lg">
            <Phone className="w-8 h-8 text-white" />
            <p className="text-white font-bold text-2xl">9-1-1</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Main Disclaimer */}
          <div className="mb-6 p-6 bg-[#FF4444]/10 border-2 border-[#FF4444] rounded-lg">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-8 h-8 text-[#FF4444] flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-[#FF4444] font-bold text-2xl mb-2">
                  Well-Check is NOT a 911 Replacement
                </h2>
                <p className="text-white text-lg leading-relaxed">
                  In a <span className="font-bold text-[#FF4444]">true life-threatening emergency</span>,{' '}
                  <span className="font-bold text-[#FF4444]">ALWAYS CALL 911 FIRST</span>.
                </p>
              </div>
            </div>

            <div className="pl-11 space-y-3 text-[#94A3B8] text-base">
              <p>
                Well-Check notifies your family members but{' '}
                <span className="text-white font-bold">does NOT contact emergency services</span>.
              </p>
              <p>
                The panic button is designed for situations where you need{' '}
                <span className="text-white font-bold">family awareness and coordination</span>, not
                immediate police/fire/medical dispatch.
              </p>
            </div>
          </div>

          {/* When to Use Well-Check Panic */}
          <div className="mb-6">
            <h3 className="text-[#84CC16] font-bold text-xl mb-3">
              ✅ When to Use Well-Check Panic:
            </h3>
            <ul className="space-y-2 text-[#94A3B8] text-base">
              <li className="flex items-start gap-2">
                <span className="text-[#84CC16] mt-1">•</span>
                <span>
                  You feel unwell and need family to check on you
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#84CC16] mt-1">•</span>
                <span>
                  You're in an uncomfortable situation and need family support
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#84CC16] mt-1">•</span>
                <span>
                  You've fallen and need assistance (but are not critically injured)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#84CC16] mt-1">•</span>
                <span>
                  You need immediate family coordination for a developing situation
                </span>
              </li>
            </ul>
          </div>

          {/* When to Call 911 */}
          <div className="mb-6 p-4 bg-[#FF4444]/20 border border-[#FF4444] rounded-lg">
            <h3 className="text-[#FF4444] font-bold text-xl mb-3">
              🚨 When to Call 911 (Not Well-Check):
            </h3>
            <ul className="space-y-2 text-white text-base">
              <li className="flex items-start gap-2">
                <span className="text-[#FF4444] mt-1">•</span>
                <span>
                  <span className="font-bold">Chest pain, stroke symptoms, severe bleeding</span>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF4444] mt-1">•</span>
                <span>
                  <span className="font-bold">Active threat</span> (break-in, assault, violence)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF4444] mt-1">•</span>
                <span>
                  <span className="font-bold">Fire, gas leak, or other immediate danger</span>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF4444] mt-1">•</span>
                <span>
                  <span className="font-bold">Any situation requiring police/fire/EMS</span>
                </span>
              </li>
            </ul>
          </div>

          {/* Data Collection Notice */}
          <div className="mb-6 p-4 bg-[#0F172A] border border-[#334155] rounded-lg">
            <h3 className="text-white font-bold text-lg mb-2">📍 What Happens When You Trigger Panic:</h3>
            <ul className="space-y-2 text-[#94A3B8] text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#84CC16] flex-shrink-0 mt-0.5" />
                <span>
                  Your <span className="text-white font-bold">GPS location</span> is captured and sent to
                  all family monitors
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#84CC16] flex-shrink-0 mt-0.5" />
                <span>
                  <span className="text-white font-bold">10-second GPS pings</span> track your location
                  in real-time
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#84CC16] flex-shrink-0 mt-0.5" />
                <span>
                  <span className="text-white font-bold">30-second audio buffer</span> may be recorded
                  (silent panic only)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#84CC16] flex-shrink-0 mt-0.5" />
                <span>
                  App enters <span className="text-white font-bold">lockdown mode</span> until resolved
                  with Family PIN
                </span>
              </li>
            </ul>
          </div>

          {/* Figma Make Notice */}
          <div className="mb-6 p-4 bg-[#FBBF24]/10 border border-[#FBBF24] rounded-lg">
            <p className="text-[#FBBF24] text-sm">
              ⚠️ <span className="font-bold">Figma Make Notice:</span> Well-Check is a demo application and
              is not intended for collecting PII or securing sensitive data. Do not use this for actual
              emergencies.
            </p>
          </div>

          {/* Read Confirmation */}
          <div className="mb-6">
            <button
              onClick={() => setHasReadDisclaimer(!hasReadDisclaimer)}
              className={`w-full h-[72px] rounded-lg border-2 flex items-center gap-4 px-6 transition-colors ${
                hasReadDisclaimer
                  ? 'bg-[#84CC16]/10 border-[#84CC16]'
                  : 'bg-[#0F172A] border-[#334155] hover:border-[#84CC16]'
              }`}
            >
              <div
                className={`w-10 h-10 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                  hasReadDisclaimer ? 'border-[#84CC16] bg-[#84CC16]' : 'border-[#334155]'
                }`}
              >
                {hasReadDisclaimer && <CheckCircle2 className="w-6 h-6 text-[#0F172A]" />}
              </div>
              <div className="flex-1 text-left">
                <p className={`font-bold text-lg ${hasReadDisclaimer ? 'text-[#84CC16]' : 'text-white'}`}>
                  I have read and understand this disclaimer
                </p>
                <p className="text-[#94A3B8] text-sm">
                  Required before panic button is enabled
                </p>
              </div>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={onDecline}
              className="h-[72px] bg-[#334155] text-white rounded-lg font-bold text-xl hover:bg-[#475569] transition-colors"
            >
              Decline
            </button>

            <button
              onClick={handleAccept}
              disabled={!hasReadDisclaimer || isAccepting}
              className="h-[72px] bg-[#84CC16] text-[#0F172A] rounded-lg font-bold text-xl hover:bg-[#9FE63C] transition-colors disabled:bg-[#334155] disabled:text-[#64748B] disabled:cursor-not-allowed"
            >
              {isAccepting ? 'Accepting...' : 'Accept & Enable Panic Button'}
            </button>
          </div>

          {/* Legal Notice */}
          <p className="text-[#64748B] text-xs text-center mt-4">
            By accepting, you acknowledge that Well-Check is a family coordination tool and not a
            replacement for 911 emergency services. Acceptance logged with timestamp for compliance.
          </p>
        </div>
      </div>
    </div>
  );
}
