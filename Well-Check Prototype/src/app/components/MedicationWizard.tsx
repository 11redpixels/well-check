// 💊 PILLAR 1: Medication Wizard (V8.1)
// Mandate: "Grandparent-Simple" - 60px+ inputs, one question per screen, zero scrolling

import { useState } from 'react';
import type { MedicationV8, MedicationScheduleV8 } from '../types';

interface MedicationWizardProps {
  userId: string;
  tenantId: string;
  onComplete: (medication: Partial<MedicationV8>) => void;
  onCancel: () => void;
}

type WizardStep = 'name' | 'dosage' | 'schedule';

export function MedicationWizard({ userId, tenantId, onComplete, onCancel }: MedicationWizardProps) {
  const [step, setStep] = useState<WizardStep>('name');
  
  // Step 1: Medication Name
  const [name, setName] = useState('');
  
  // Step 2: Dosage
  const [dosage, setDosage] = useState('');
  
  // Step 3: Schedule
  const [schedules, setSchedules] = useState<MedicationScheduleV8[]>([
    {
      id: crypto.randomUUID(),
      medicationId: '', // Will be set on save
      time: '08:00',
      days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
      isActive: true,
    },
  ]);

  const handleNext = () => {
    if (step === 'name' && name.trim()) {
      setStep('dosage');
    } else if (step === 'dosage' && dosage.trim()) {
      setStep('schedule');
    }
  };

  const handleBack = () => {
    if (step === 'dosage') {
      setStep('name');
    } else if (step === 'schedule') {
      setStep('dosage');
    }
  };

  const handleComplete = () => {
    const medication: Partial<MedicationV8> = {
      tenantId,
      userId,
      name: name.trim(),
      dosage: dosage.trim(),
      schedule: schedules,
      inventoryRemaining: 30, // Default: 30 days
      lowInventoryThreshold: 7, // Alert at 7 days remaining
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    onComplete(medication);
  };

  const addSchedule = () => {
    setSchedules([
      ...schedules,
      {
        id: crypto.randomUUID(),
        medicationId: '',
        time: '20:00',
        days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
        isActive: true,
      },
    ]);
  };

  const updateScheduleTime = (id: string, time: string) => {
    setSchedules(schedules.map(s => s.id === id ? { ...s, time } : s));
  };

  const toggleScheduleDay = (id: string, day: MedicationScheduleV8['days'][number]) => {
    setSchedules(schedules.map(s => {
      if (s.id === id) {
        const days = s.days.includes(day)
          ? s.days.filter(d => d !== day)
          : [...s.days, day];
        return { ...s, days };
      }
      return s;
    }));
  };

  const removeSchedule = (id: string) => {
    if (schedules.length > 1) {
      setSchedules(schedules.filter(s => s.id !== id));
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0F172A] z-50 flex flex-col">
      {/* Header */}
      <div className="bg-[#1E293B] border-b border-[#334155] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Add Medication</h1>
            <p className="text-sm text-[#94A3B8] mt-1">
              Step {step === 'name' ? '1' : step === 'dosage' ? '2' : '3'} of 3
            </p>
          </div>
          <button
            onClick={onCancel}
            className="w-12 h-12 rounded-full bg-[#334155] text-white flex items-center justify-center hover:bg-[#475569] active:scale-95 transition-transform"
            aria-label="Cancel"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-[#1E293B]">
        <div
          className="h-full bg-[#84CC16] transition-all duration-300"
          style={{
            width: step === 'name' ? '33%' : step === 'dosage' ? '66%' : '100%',
          }}
        />
      </div>

      {/* Content - ONE QUESTION PER SCREEN, NO SCROLLING */}
      <div className="flex-1 flex flex-col justify-center px-6 pb-24">
        {/* STEP 1: Medication Name */}
        {step === 'name' && (
          <div className="space-y-8">
            <div>
              <label className="block text-3xl font-bold text-white mb-4">
                What medication?
              </label>
              <p className="text-lg text-[#94A3B8]">
                Enter the name exactly as it appears on the bottle
              </p>
            </div>
            
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Lisinopril"
              className="w-full h-[72px] px-6 bg-[#1E293B] border-2 border-[#334155] rounded-lg text-white text-2xl placeholder-[#64748B] focus:border-[#84CC16] focus:outline-none transition-colors"
              autoFocus
              style={{ fontSize: '28px' }} // Extra large for grandparents
            />

            <div className="text-sm text-[#64748B]">
              💡 Tip: Use the exact name from your prescription
            </div>
          </div>
        )}

        {/* STEP 2: Dosage */}
        {step === 'dosage' && (
          <div className="space-y-8">
            <div>
              <label className="block text-3xl font-bold text-white mb-4">
                What dosage?
              </label>
              <p className="text-lg text-[#94A3B8]">
                How much do you take each time?
              </p>
            </div>
            
            <input
              type="text"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder="e.g., 10mg or 2 pills"
              className="w-full h-[72px] px-6 bg-[#1E293B] border-2 border-[#334155] rounded-lg text-white text-2xl placeholder-[#64748B] focus:border-[#84CC16] focus:outline-none transition-colors"
              autoFocus
              style={{ fontSize: '28px' }}
            />

            <div className="grid grid-cols-3 gap-3">
              {['5mg', '10mg', '20mg', '1 pill', '2 pills', '1 tablet'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setDosage(suggestion)}
                  className="h-[56px] bg-[#1E293B] border border-[#334155] rounded-lg text-white text-base hover:border-[#84CC16] hover:bg-[#334155] active:scale-95 transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Schedule */}
        {step === 'schedule' && (
          <div className="space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
            <div>
              <label className="block text-3xl font-bold text-white mb-4">
                When do you take it?
              </label>
              <p className="text-lg text-[#94A3B8]">
                Set the time(s) you take this medication
              </p>
            </div>

            {schedules.map((schedule, index) => (
              <div key={schedule.id} className="bg-[#1E293B] rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-white">
                    Time #{index + 1}
                  </span>
                  {schedules.length > 1 && (
                    <button
                      onClick={() => removeSchedule(schedule.id)}
                      className="w-10 h-10 rounded-full bg-[#334155] text-white flex items-center justify-center hover:bg-[#475569] active:scale-95 transition-transform"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Time Picker */}
                <div>
                  <label className="block text-sm font-bold text-[#94A3B8] mb-2">
                    TIME
                  </label>
                  <input
                    type="time"
                    value={schedule.time}
                    onChange={(e) => updateScheduleTime(schedule.id, e.target.value)}
                    className="w-full h-[64px] px-4 bg-[#0F172A] border-2 border-[#334155] rounded-lg text-white text-2xl focus:border-[#84CC16] focus:outline-none transition-colors"
                  />
                </div>

                {/* Day Selector */}
                <div>
                  <label className="block text-sm font-bold text-[#94A3B8] mb-2">
                    DAYS
                  </label>
                  <div className="grid grid-cols-7 gap-2">
                    {[
                      { key: 'mon', label: 'M' },
                      { key: 'tue', label: 'T' },
                      { key: 'wed', label: 'W' },
                      { key: 'thu', label: 'T' },
                      { key: 'fri', label: 'F' },
                      { key: 'sat', label: 'S' },
                      { key: 'sun', label: 'S' },
                    ].map((day) => {
                      const isSelected = schedule.days.includes(day.key as any);
                      return (
                        <button
                          key={day.key}
                          onClick={() => toggleScheduleDay(schedule.id, day.key as any)}
                          className={`h-[48px] rounded-lg font-bold text-lg transition-all active:scale-95 ${
                            isSelected
                              ? 'bg-[#84CC16] text-[#0F172A]'
                              : 'bg-[#334155] text-[#94A3B8] hover:bg-[#475569]'
                          }`}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}

            {/* Add Another Time */}
            <button
              onClick={addSchedule}
              className="w-full h-[64px] bg-[#1E293B] border-2 border-dashed border-[#334155] rounded-lg text-[#84CC16] text-xl font-bold hover:border-[#84CC16] hover:bg-[#334155] active:scale-98 transition-all"
            >
              + Add Another Time
            </button>
          </div>
        )}
      </div>

      {/* Navigation Buttons - FIXED AT BOTTOM */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#1E293B] border-t border-[#334155] px-6 py-4 flex gap-3">
        {step !== 'name' && (
          <button
            onClick={handleBack}
            className="flex-1 h-[72px] bg-[#334155] text-white text-2xl font-bold rounded-lg hover:bg-[#475569] active:scale-98 transition-all"
          >
            Back
          </button>
        )}
        
        {step === 'schedule' ? (
          <button
            onClick={handleComplete}
            disabled={schedules.length === 0 || schedules.every(s => s.days.length === 0)}
            className="flex-1 h-[72px] bg-[#84CC16] text-[#0F172A] text-2xl font-bold rounded-lg hover:bg-[#9DE622] active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Complete
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={
              (step === 'name' && !name.trim()) ||
              (step === 'dosage' && !dosage.trim())
            }
            className="flex-1 h-[72px] bg-[#84CC16] text-[#0F172A] text-2xl font-bold rounded-lg hover:bg-[#9DE622] active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
