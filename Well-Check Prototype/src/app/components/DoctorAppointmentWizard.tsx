// 🏥 PILLAR 3: Doctor Appointment Wizard (V8.2)
// Coder - Simplified interface to sync or manually add doctor visits

import { useState } from 'react';
import type { DoctorVisit } from '../types';

interface DoctorAppointmentWizardProps {
  userId: string;
  tenantId: string;
  onComplete: (visit: Partial<DoctorVisit>) => void;
  onCancel: () => void;
}

type WizardStep = 1 | 2 | 3 | 4;

export function DoctorAppointmentWizard({
  userId,
  tenantId,
  onComplete,
  onCancel,
}: DoctorAppointmentWizardProps) {
  const [step, setStep] = useState<WizardStep>(1);
  
  // Form state
  const [doctorName, setDoctorName] = useState('');
  const [appointmentType, setAppointmentType] = useState<string>('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [location, setLocation] = useState('');
  const [locationLat, setLocationLat] = useState<number | null>(null);
  const [locationLng, setLocationLng] = useState<number | null>(null);
  const [notes, setNotes] = useState('');

  const appointmentTypes = [
    { code: 'general', label: 'General Checkup', icon: '🩺' },
    { code: 'specialist', label: 'Specialist Visit', icon: '👨‍⚕️' },
    { code: 'dental', label: 'Dental', icon: '🦷' },
    { code: 'vision', label: 'Vision/Eye', icon: '👁️' },
    { code: 'lab', label: 'Lab Work', icon: '🧪' },
    { code: 'imaging', label: 'Imaging (X-ray/MRI)', icon: '📷' },
    { code: 'therapy', label: 'Physical Therapy', icon: '🏃' },
    { code: 'other', label: 'Other', icon: '📋' },
  ];

  const handleNext = () => {
    if (step < 4) {
      setStep((step + 1) as WizardStep);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as WizardStep);
    }
  };

  const handleComplete = () => {
    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`).getTime();
    
    onComplete({
      userId,
      tenantId,
      doctorName,
      appointmentType,
      scheduledTime: scheduledDateTime,
      location,
      geofenceLat: locationLat,
      geofenceLng: locationLng,
      geofenceRadiusMeters: 804.672, // 0.5 miles default
      notes,
      geofenceStatus: 'pending',
    });
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return appointmentType !== '';
      case 2:
        return doctorName.trim().length > 0;
      case 3:
        return scheduledDate !== '' && scheduledTime !== '';
      case 4:
        return location.trim().length > 0;
      default:
        return false;
    }
  };

  const progressPercent = (step / 4) * 100;

  return (
    <div className="fixed inset-0 bg-[#0F172A] z-50 flex flex-col">
      {/* Header */}
      <div className="bg-[#1E293B] border-b border-[#334155] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <span>🏥</span>
              <span>New Doctor Visit</span>
            </h1>
            <p className="text-sm text-[#94A3B8] mt-1">Step {step} of 4</p>
          </div>
          <button
            onClick={onCancel}
            className="w-12 h-12 rounded-full bg-[#334155] text-white flex items-center justify-center hover:bg-[#475569] active:scale-95 transition-transform"
          >
            ✕
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 bg-[#334155] rounded-full h-3 overflow-hidden">
          <div
            className="bg-[#84CC16] h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        {/* STEP 1: Appointment Type */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">
                What type of appointment?
              </h2>
              <p className="text-lg text-[#94A3B8]">
                Select the category that best matches this visit
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {appointmentTypes.map((type) => (
                <button
                  key={type.code}
                  onClick={() => setAppointmentType(type.code)}
                  className={`p-6 rounded-lg text-left transition-all active:scale-98 ${
                    appointmentType === type.code
                      ? 'bg-[#84CC16] text-[#0F172A] border-2 border-white'
                      : 'bg-[#1E293B] text-white border border-[#334155] hover:border-[#84CC16]'
                  }`}
                >
                  <div className="text-4xl mb-2">{type.icon}</div>
                  <div className="text-lg font-bold">{type.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Doctor Name */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">
                Who is the doctor?
              </h2>
              <p className="text-lg text-[#94A3B8]">
                Enter the name of the healthcare provider
              </p>
            </div>

            <div>
              <label className="block text-lg font-bold text-[#94A3B8] mb-3">
                Doctor's Name
              </label>
              <input
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                placeholder="Dr. Smith"
                autoFocus
                className="w-full h-[72px] px-6 bg-[#1E293B] border-2 border-[#334155] rounded-lg text-white text-2xl placeholder-[#64748B] focus:border-[#84CC16] focus:outline-none transition-colors"
              />
            </div>

            {/* Quick Examples */}
            <div className="bg-[#1E293B] rounded-lg p-4 border border-[#334155]">
              <div className="text-sm font-bold text-[#94A3B8] mb-2">
                Examples:
              </div>
              <div className="flex flex-wrap gap-2">
                {['Dr. Johnson', 'Dr. Smith', 'Dr. Martinez'].map((name) => (
                  <button
                    key={name}
                    onClick={() => setDoctorName(name)}
                    className="px-3 py-2 bg-[#334155] text-white text-sm rounded hover:bg-[#475569] transition-colors"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Date & Time */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">
                When is the appointment?
              </h2>
              <p className="text-lg text-[#94A3B8]">
                Select the date and time
              </p>
            </div>

            <div className="space-y-4">
              {/* Date */}
              <div>
                <label className="block text-lg font-bold text-[#94A3B8] mb-3">
                  📅 Date
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full h-[72px] px-6 bg-[#1E293B] border-2 border-[#334155] rounded-lg text-white text-2xl focus:border-[#84CC16] focus:outline-none transition-colors"
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-lg font-bold text-[#94A3B8] mb-3">
                  🕐 Time
                </label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full h-[72px] px-6 bg-[#1E293B] border-2 border-[#334155] rounded-lg text-white text-2xl focus:border-[#84CC16] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Preview */}
            {scheduledDate && scheduledTime && (
              <div className="bg-[#84CC16]/20 border border-[#84CC16] rounded-lg p-4 text-center">
                <div className="text-sm text-[#94A3B8] mb-1">Scheduled for:</div>
                <div className="text-xl font-bold text-white">
                  {new Date(`${scheduledDate}T${scheduledTime}`).toLocaleString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: Location */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">
                Where is the appointment?
              </h2>
              <p className="text-lg text-[#94A3B8]">
                Enter the address or location
              </p>
            </div>

            <div>
              <label className="block text-lg font-bold text-[#94A3B8] mb-3">
                📍 Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="123 Main St, City, State"
                autoFocus
                className="w-full h-[72px] px-6 bg-[#1E293B] border-2 border-[#334155] rounded-lg text-white text-2xl placeholder-[#64748B] focus:border-[#84CC16] focus:outline-none transition-colors"
              />
            </div>

            {/* Geocode Button (Future Enhancement) */}
            <button
              onClick={async () => {
                // TODO: Implement geocoding API
                // For now, use placeholder coordinates
                setLocationLat(37.7749);
                setLocationLng(-122.4194);
              }}
              className="w-full h-[64px] bg-[#334155] text-white text-lg font-bold rounded-lg hover:bg-[#475569] active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <span>🗺️</span>
              <span>Auto-Detect Coordinates</span>
            </button>

            {locationLat && locationLng && (
              <div className="bg-[#1E293B] rounded-lg p-4 border border-[#334155]">
                <div className="text-sm text-[#94A3B8] mb-2">Coordinates:</div>
                <div className="text-sm text-white tabular-nums">
                  Lat: {locationLat.toFixed(6)}, Lng: {locationLng.toFixed(6)}
                </div>
              </div>
            )}

            {/* Optional Notes */}
            <div>
              <label className="block text-lg font-bold text-[#94A3B8] mb-3">
                📝 Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Special instructions, parking info, etc."
                rows={4}
                className="w-full px-4 py-3 bg-[#1E293B] border border-[#334155] rounded-lg text-white text-lg placeholder-[#64748B] focus:border-[#84CC16] focus:outline-none transition-colors resize-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="bg-[#1E293B] border-t border-[#334155] px-6 py-4 flex gap-3">
        {step > 1 && (
          <button
            onClick={handleBack}
            className="flex-1 h-[72px] bg-[#334155] text-white text-xl font-bold rounded-lg hover:bg-[#475569] active:scale-98 transition-all"
          >
            ← Back
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={!canProceed()}
          className="flex-1 h-[72px] bg-[#84CC16] text-[#0F172A] text-xl font-bold rounded-lg hover:bg-[#9DE622] active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {step === 4 ? (
            <>
              <span>✓</span>
              <span>Create Appointment</span>
            </>
          ) : (
            <>
              <span>Next</span>
              <span>→</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
