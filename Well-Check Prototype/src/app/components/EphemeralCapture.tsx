// 📸 PILLAR 6: Ephemeral Capture (Photo/Voice with 24h TTL)
// Mandate: Proof of life, then privacy. 24-hour TTL enforced at database level.

import { useState, useRef } from 'react';
import type { EphemeralAssetType, EphemeralRelatedEventType } from '../types';

interface EphemeralCaptureProps {
  relatedEventId: string;
  relatedEventType: EphemeralRelatedEventType;
  userId: string;
  tenantId: string;
  onCapture: (assetType: EphemeralAssetType, assetData: Blob) => Promise<void>;
  onSkip: () => void;
}

export function EphemeralCapture({
  relatedEventId,
  relatedEventType,
  userId,
  tenantId,
  onCapture,
  onSkip,
}: EphemeralCaptureProps) {
  const [captureMode, setCaptureMode] = useState<EphemeralAssetType | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const getPromptText = () => {
    switch (relatedEventType) {
      case 'medication_confirmation':
        return 'Add photo or voice note to confirm you took your medication';
      case 'doctor_arrival':
        return 'Add photo or voice note from your doctor visit';
      case 'post_visit_feedback':
        return 'Add photo or voice note about your visit';
      default:
        return 'Add photo or voice note';
    }
  };

  const handlePhotoCapture = () => {
    setCaptureMode('photo');
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (10MB max for photos)
    if (file.size > 10 * 1024 * 1024) {
      alert('Photo must be less than 10MB');
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    setIsCapturing(true);
    try {
      await onCapture('photo', file);
    } catch (error) {
      console.error('Photo upload failed:', error);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Check file size (5MB max for voice notes)
        if (audioBlob.size > 5 * 1024 * 1024) {
          alert('Voice note must be less than 5MB (max 2 minutes)');
          return;
        }

        setIsCapturing(true);
        try {
          await onCapture('voice_note', audioBlob);
        } catch (error) {
          console.error('Voice note upload failed:', error);
          alert('Failed to upload voice note. Please try again.');
        } finally {
          setIsCapturing(false);
        }

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setCaptureMode('voice_note');

      // Update duration every second
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => {
          const newDuration = prev + 1;
          // Max 120 seconds (2 minutes)
          if (newDuration >= 120) {
            stopVoiceRecording();
          }
          return newDuration;
        });
      }, 1000);
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Failed to access microphone. Please check permissions.');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-[#0F172A]/95 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-fade-in">
      <div className="w-full max-w-md bg-[#1E293B] rounded-2xl border-2 border-[#84CC16] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#84CC16] to-[#65A30D] px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#0F172A]">
                📸 Add Moment (Optional)
              </h2>
              <p className="text-sm text-[#0F172A]/70">Automatically deleted in 24 hours</p>
            </div>
            <button
              onClick={onSkip}
              disabled={isCapturing || isRecording}
              className="w-12 h-12 rounded-full bg-white/20 text-[#0F172A] flex items-center justify-center hover:bg-white/30 active:scale-95 transition-all disabled:opacity-50"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-8 space-y-6">
          <p className="text-lg text-[#94A3B8] text-center">{getPromptText()}</p>

          {/* Preview (if photo captured) */}
          {preview && (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-full rounded-lg border-2 border-[#84CC16]"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-[#0F172A]/50 rounded-lg">
                <div className="text-white text-lg font-bold">
                  {isCapturing ? 'Uploading...' : 'Upload Complete ✓'}
                </div>
              </div>
            </div>
          )}

          {/* Voice Recording UI */}
          {isRecording && (
            <div className="bg-[#0F172A] rounded-lg p-6 border-2 border-[#FF4444]">
              <div className="text-center space-y-4">
                <div className="text-6xl animate-pulse">🎤</div>
                <div className="text-3xl font-bold text-white tabular-nums">
                  {formatDuration(recordingDuration)}
                </div>
                <div className="text-sm text-[#94A3B8]">
                  Recording... (max 2 minutes)
                </div>

                {/* Audio Visualizer */}
                <div className="h-16 flex items-end justify-center gap-1">
                  {Array.from({ length: 20 }).map((_, i) => {
                    const height = Math.sin(i / 3 + Date.now() / 100) * 30 + 30;
                    return (
                      <div
                        key={i}
                        className="flex-1 bg-[#FF4444] rounded-sm transition-all duration-100"
                        style={{ height: `${height}%` }}
                      />
                    );
                  })}
                </div>

                <button
                  onClick={stopVoiceRecording}
                  className="w-full h-[64px] bg-[#FF4444] text-white text-xl font-bold rounded-lg hover:bg-[#FF5555] active:scale-98 transition-all"
                >
                  ⏹️ Stop Recording
                </button>
              </div>
            </div>
          )}

          {/* Capture Buttons */}
          {!preview && !isRecording && !isCapturing && (
            <div className="space-y-3">
              {/* Photo Button */}
              <button
                onClick={handlePhotoCapture}
                className="w-full h-[80px] bg-[#84CC16] text-[#0F172A] text-2xl font-bold rounded-lg hover:bg-[#9DE622] active:scale-98 transition-all flex items-center justify-center gap-3"
              >
                <span className="text-3xl">📷</span>
                <span>Take Photo</span>
              </button>

              {/* Voice Note Button */}
              <button
                onClick={startVoiceRecording}
                className="w-full h-[80px] bg-[#FBBF24] text-[#0F172A] text-2xl font-bold rounded-lg hover:bg-[#FCD34D] active:scale-98 transition-all flex items-center justify-center gap-3"
              >
                <span className="text-3xl">🎤</span>
                <span>Voice Note</span>
              </button>

              {/* Skip Button */}
              <button
                onClick={onSkip}
                className="w-full h-[64px] bg-[#334155] text-white text-xl font-bold rounded-lg hover:bg-[#475569] active:scale-98 transition-all"
              >
                Skip
              </button>
            </div>
          )}

          {/* Privacy Notice */}
          <div className="bg-[#0F172A] rounded-lg p-4 border border-[#334155]">
            <div className="text-sm text-[#94A3B8] space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-base">🔒</span>
                <span>
                  <strong className="text-white">Privacy:</strong> Photos and voice notes are
                  automatically deleted after 24 hours
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-base">👁️</span>
                <span>
                  <strong className="text-white">Visibility:</strong> Only you and your
                  monitors can view this
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-base">🚫</span>
                <span>
                  <strong className="text-white">No Recovery:</strong> Once deleted, it's gone
                  forever (no backup)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

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
      `}</style>
    </div>
  );
}