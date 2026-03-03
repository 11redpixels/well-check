// 🏥 PILLAR 3: Post-Visit Pulse (V8.2)
// Coder - Interactive feedback modal ("How was the visit?")

import { useState } from 'react';
import type { DoctorVisit } from '../types';
import { EphemeralCapture } from './EphemeralCapture';

interface PostVisitPulseProps {
  visit: DoctorVisit;
  userId: string;
  onSubmit: (feedback: {
    rating: number;
    notes?: string;
    photoUrl?: string;
    voiceNoteUrl?: string;
  }) => void;
  onSkip: () => void;
}

export function PostVisitPulse({ visit, userId, onSubmit, onSkip }: PostVisitPulseProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [showEphemeralCapture, setShowEphemeralCapture] = useState(false);
  const [ephemeralAssets, setEphemeralAssets] = useState<{
    photoUrl?: string;
    voiceNoteUrl?: string;
  }>({});

  const handleRatingSelect = (value: number) => {
    setRating(value);
  };

  const handleSubmit = () => {
    if (rating === null) {
      alert('Please select a rating (1-5 stars)');
      return;
    }

    onSubmit({
      rating,
      notes: notes.trim() || undefined,
      photoUrl: ephemeralAssets.photoUrl,
      voiceNoteUrl: ephemeralAssets.voiceNoteUrl,
    });
  };

  const handleEphemeralCaptureComplete = (photoUrl?: string, voiceNoteUrl?: string) => {
    setEphemeralAssets({ photoUrl, voiceNoteUrl });
    setShowEphemeralCapture(false);
  };

  const ratingLabels = [
    { value: 1, label: 'Very Bad', emoji: '😞', color: '#FF4444' },
    { value: 2, label: 'Bad', emoji: '😟', color: '#FF8844' },
    { value: 3, label: 'Okay', emoji: '😐', color: '#FBBF24' },
    { value: 4, label: 'Good', emoji: '🙂', color: '#A3E635' },
    { value: 5, label: 'Very Good', emoji: '😊', color: '#84CC16' },
  ];

  const departedTime = visit.departedAt
    ? new Date(visit.departedAt).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : 'Unknown';

  return (
    <>
      {!showEphemeralCapture ? (
        <div className="fixed inset-0 bg-[#0F172A]/98 backdrop-blur-lg z-50 flex items-center justify-center p-6">
          <div className="w-full max-w-lg bg-[#1E293B] rounded-2xl border-2 border-[#84CC16] shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#84CC16] to-[#A3E635] px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[#0F172A]">
                    🏥 How was your visit?
                  </h2>
                  <p className="text-sm text-[#0F172A]/70">
                    {visit.appointmentType} with {visit.doctorName}
                  </p>
                </div>
                <button
                  onClick={onSkip}
                  className="w-12 h-12 rounded-full bg-white/20 text-[#0F172A] flex items-center justify-center hover:bg-white/30 active:scale-95 transition-all"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-8 space-y-6">
              {/* Visit Summary */}
              <div className="bg-[#0F172A] rounded-lg p-4 border border-[#334155]">
                <div className="text-sm text-[#94A3B8] mb-2">
                  You left at {departedTime}
                </div>
                <div className="text-lg text-white">{visit.location}</div>
              </div>

              {/* Rating Scale (1-5 Stars) */}
              <div>
                <label className="block text-lg font-bold text-white mb-4 text-center">
                  How do you feel about this visit?
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {ratingLabels.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleRatingSelect(option.value)}
                      className={`aspect-square rounded-lg text-center transition-all active:scale-95 flex flex-col items-center justify-center gap-2 p-3 ${
                        rating === option.value
                          ? 'border-4 border-white'
                          : 'border-2 border-[#334155] hover:border-[#84CC16]'
                      }`}
                      style={{
                        backgroundColor:
                          rating === option.value ? option.color : '#1E293B',
                      }}
                    >
                      <div className="text-4xl">{option.emoji}</div>
                      <div
                        className={`text-xs font-bold ${
                          rating === option.value ? 'text-[#0F172A]' : 'text-[#94A3B8]'
                        }`}
                      >
                        {option.value}★
                      </div>
                    </button>
                  ))}
                </div>
                {rating !== null && (
                  <div className="text-center mt-3">
                    <div className="text-xl font-bold text-white">
                      {ratingLabels.find((r) => r.value === rating)?.label}
                    </div>
                  </div>
                )}
              </div>

              {/* Optional Notes */}
              <div>
                <label className="block text-lg font-bold text-white mb-3">
                  📝 Any details to share? (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="How did the visit go? Any concerns or follow-up needed?"
                  rows={4}
                  className="w-full px-4 py-3 bg-[#0F172A] border border-[#334155] rounded-lg text-white text-lg placeholder-[#64748B] focus:border-[#84CC16] focus:outline-none transition-colors resize-none"
                />
              </div>

              {/* Ephemeral Capture Section */}
              <div className="bg-[#0F172A] rounded-lg p-4 border border-[#334155]">
                <div className="text-sm font-bold text-[#94A3B8] mb-2">
                  📸 Optional: Add Photo or Voice Note
                </div>
                <div className="text-sm text-[#64748B] mb-3">
                  Share a photo of paperwork or record a voice summary (24-hour TTL)
                </div>

                {ephemeralAssets.photoUrl || ephemeralAssets.voiceNoteUrl ? (
                  <div className="space-y-2">
                    {ephemeralAssets.photoUrl && (
                      <div className="flex items-center gap-3 bg-[#1E293B] rounded p-3">
                        <div className="text-2xl">📷</div>
                        <div className="flex-1 text-sm text-white">Photo attached</div>
                        <button
                          onClick={() =>
                            setEphemeralAssets({ ...ephemeralAssets, photoUrl: undefined })
                          }
                          className="text-[#FF4444] hover:text-[#FF5555]"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                    {ephemeralAssets.voiceNoteUrl && (
                      <div className="flex items-center gap-3 bg-[#1E293B] rounded p-3">
                        <div className="text-2xl">🎤</div>
                        <div className="flex-1 text-sm text-white">Voice note attached</div>
                        <button
                          onClick={() =>
                            setEphemeralAssets({
                              ...ephemeralAssets,
                              voiceNoteUrl: undefined,
                            })
                          }
                          className="text-[#FF4444] hover:text-[#FF5555]"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                    <button
                      onClick={() => setShowEphemeralCapture(true)}
                      className="w-full h-[56px] bg-[#334155] text-white text-base font-bold rounded-lg hover:bg-[#475569] active:scale-98 transition-all"
                    >
                      Add More
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowEphemeralCapture(true)}
                    className="w-full h-[64px] bg-[#334155] text-white text-lg font-bold rounded-lg hover:bg-[#475569] active:scale-98 transition-all flex items-center justify-center gap-2"
                  >
                    <span>📸</span>
                    <span>Add Photo or Voice Note</span>
                  </button>
                )}
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={rating === null}
                className="w-full h-[72px] bg-[#84CC16] text-[#0F172A] text-xl font-bold rounded-lg hover:bg-[#9DE622] active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span>✓</span>
                <span>Submit Feedback</span>
              </button>

              {/* Skip Button */}
              <button
                onClick={onSkip}
                className="w-full h-[56px] bg-transparent text-[#94A3B8] text-base font-bold rounded-lg hover:text-white active:scale-98 transition-all"
              >
                Skip for Now
              </button>

              {/* Privacy Notice */}
              <div className="bg-[#FBBF24]/20 border border-[#FBBF24] rounded-lg px-4 py-3 text-sm text-[#FBBF24]">
                ⏳ Photos and voice notes will be automatically deleted after 24 hours for
                privacy.
              </div>
            </div>
          </div>
        </div>
      ) : (
        <EphemeralCapture
          relatedEventId={visit.id}
          relatedEventType="post_visit_feedback"
          userId={userId}
          tenantId={visit.tenantId}
          onComplete={handleEphemeralCaptureComplete}
          onSkip={() => setShowEphemeralCapture(false)}
        />
      )}
    </>
  );
}
