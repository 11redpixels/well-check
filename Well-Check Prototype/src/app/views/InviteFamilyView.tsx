// 🛡️ Invite Family View - V11.2: Competitor Feature Injection
// Reference: V11.2 Phase 1 (6-digit Sharing Code for family onboarding)
// V11.4: Route Hardening - Always functional (no data dependency)

import { UserPlus, Copy, CheckCircle, Share2, QrCode, Users } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../context/AppContext';

export function InviteFamilyView() {
  const { familyCode, tenantId } = useApp();
  const [copied, setCopied] = useState(false);

  // V11.2: 6-digit Sharing Code (use familyCode from AppContext)
  const sharingCode = familyCode || '000000';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sharingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async () => {
    const shareText = `Join my Well-Check family network!\n\nFamily Code: ${sharingCode}\n\nDownload Well-Check and enter this code to connect.`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join My Well-Check Family',
          text: shareText,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      // Fallback: copy to clipboard
      handleCopy();
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <UserPlus className="w-8 h-8 text-[#3B82F6]" />
            <h1 className="text-[var(--color-text-primary)] font-bold text-3xl">
              Invite Family
            </h1>
          </div>
          <p className="text-[var(--color-text-secondary)] text-base">
            Share your 6-digit Family Code to connect loved ones
          </p>
        </div>

        {/* Sharing Code Card */}
        <div className="bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-2xl p-8 mb-6 text-center">
          <div className="w-20 h-20 bg-[#3B82F6]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-[#3B82F6]" />
          </div>
          
          <h2 className="text-[var(--color-text-primary)] font-bold text-2xl mb-3">
            Your Family Code
          </h2>
          <p className="text-[var(--color-text-secondary)] text-base mb-6 max-w-md mx-auto">
            Share this code with family members to add them to your Well-Check network.
          </p>

          {/* 6-Digit Code Display */}
          <div className="bg-[var(--color-bg)] border-2 border-[var(--color-border)] rounded-2xl p-8 mb-6 inline-block">
            <p className="text-[var(--color-text-primary)] font-bold text-6xl tracking-[0.3em] font-mono">
              {sharingCode}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center mb-6">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-6 py-3 bg-[#3B82F6] text-white font-bold text-base rounded-xl hover:bg-[#2563EB] transition-all active:scale-95"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Copy Code
                </>
              )}
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-6 py-3 bg-[var(--color-card-bg)] border-2 border-[var(--color-border)] text-[var(--color-text-primary)] font-bold text-base rounded-xl hover:border-[#3B82F6] transition-all active:scale-95"
            >
              <Share2 className="w-5 h-5" />
              Share
            </button>
          </div>

          <p className="text-[var(--color-text-tertiary)] text-sm">
            💡 <strong>Tip:</strong> Your family code is unique to your network. Keep it private.
          </p>
        </div>

        {/* How It Works */}
        <div className="bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-2xl p-6">
          <h3 className="text-[var(--color-text-primary)] font-bold text-xl mb-4">
            How to Invite Family Members
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-[#3B82F6] text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h4 className="text-[var(--color-text-primary)] font-bold text-base mb-1">
                  Share Your Code
                </h4>
                <p className="text-[var(--color-text-secondary)] text-sm">
                  Send your 6-digit Family Code via text, email, or in person.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-[#3B82F6] text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h4 className="text-[var(--color-text-primary)] font-bold text-base mb-1">
                  They Download Well-Check
                </h4>
                <p className="text-[var(--color-text-secondary)] text-sm">
                  Family members install the app and create an account.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-[#3B82F6] text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h4 className="text-[var(--color-text-primary)] font-bold text-base mb-1">
                  Enter Code to Connect
                </h4>
                <p className="text-[var(--color-text-secondary)] text-sm">
                  They enter your Family Code during onboarding to join your network.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-[#84CC16] text-[#0F172A] rounded-full flex items-center justify-center font-bold flex-shrink-0">
                ✓
              </div>
              <div>
                <h4 className="text-[var(--color-text-primary)] font-bold text-base mb-1">
                  Connected!
                </h4>
                <p className="text-[var(--color-text-secondary)] text-sm">
                  They'll appear in your Family Network with real-time health and safety monitoring.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code Teaser (Future Enhancement) */}
        <div className="mt-6 p-6 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-center">
          <QrCode className="w-8 h-8 text-[var(--color-text-tertiary)] mx-auto mb-2" />
          <p className="text-[var(--color-text-tertiary)] text-sm">
            <strong>Coming Soon:</strong> QR Code for instant family invites
          </p>
        </div>
      </div>
    </div>
  );
}
