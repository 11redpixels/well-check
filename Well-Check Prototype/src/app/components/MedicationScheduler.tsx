// 🛡️ MedicationScheduler - Family Head Medication Management
// Coder: Initial Pill Count entry, Pharmacy info, Schedule configuration
// Reference: prd.md #26-33 (Medication Management)

import { useState } from 'react';
import { Pill, Plus, X, Phone, MapPin, Clock } from 'lucide-react';
import { createMedication } from '../services/medicationService';
import { toast } from 'sonner';

interface MedicationSchedulerProps {
  userId: string;
  userName: string;
  tenantId: string;
  familyHeadId: string;
  onComplete: () => void;
  onCancel: () => void;
}

export function MedicationScheduler({
  userId,
  userName,
  tenantId,
  familyHeadId,
  onComplete,
  onCancel,
}: MedicationSchedulerProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Basic Info
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');

  // Step 2: Schedule
  const [scheduledTimes, setScheduledTimes] = useState<string[]>(['']);

  // Step 3: Inventory & Pharmacy
  const [trackInventory, setTrackInventory] = useState(true);
  const [initialPillCount, setInitialPillCount] = useState('');
  const [lowSupplyThreshold, setLowSupplyThreshold] = useState('5');
  const [pharmacyName, setPharmacyName] = useState('');
  const [pharmacyPhone, setPharmacyPhone] = useState('');
  const [pharmacyAddress, setPharmacyAddress] = useState('');

  const addTimeSlot = () => {
    setScheduledTimes([...scheduledTimes, '']);
  };

  const removeTimeSlot = (index: number) => {
    setScheduledTimes(scheduledTimes.filter((_, i) => i !== index));
  };

  const updateTimeSlot = (index: number, value: string) => {
    const updated = [...scheduledTimes];
    updated[index] = value;
    setScheduledTimes(updated);
  };

  const handleSubmit = () => {
    // Validation
    if (!name.trim()) {
      toast.error('Please enter medication name');
      return;
    }

    if (!dosage.trim()) {
      toast.error('Please enter dosage');
      return;
    }

    if (!frequency.trim()) {
      toast.error('Please enter frequency');
      return;
    }

    const validTimes = scheduledTimes.filter((t) => t.trim() !== '');
    if (validTimes.length === 0) {
      toast.error('Please add at least one scheduled time');
      return;
    }

    if (trackInventory && !initialPillCount) {
      toast.error('Please enter initial pill count');
      return;
    }

    // Create medication
    try {
      createMedication(userId, tenantId, familyHeadId, {
        name: name.trim(),
        dosage: dosage.trim(),
        frequency: frequency.trim(),
        scheduledTimes: validTimes,
        initialPillCount: trackInventory ? parseInt(initialPillCount) : undefined,
        lowSupplyThreshold: parseInt(lowSupplyThreshold),
        pharmacyName: pharmacyName.trim() || undefined,
        pharmacyPhone: pharmacyPhone.trim() || undefined,
        pharmacyAddress: pharmacyAddress.trim() || undefined,
      });

      toast.success('Medication Added', {
        description: `${name} scheduled for ${userName}`,
        duration: 4000,
      });

      onComplete();
    } catch (error) {
      toast.error('Failed to create medication');
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#1E293B] rounded-lg border-2 border-[#84CC16] my-8">
        {/* Header */}
        <div className="bg-[#84CC16] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Pill className="w-8 h-8 text-[#0F172A]" />
              <div>
                <h2 className="text-[#0F172A] font-bold text-2xl">Add Medication</h2>
                <p className="text-[#0F172A]/80 text-sm">For: {userName}</p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6 text-[#0F172A]" />
            </button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex border-b border-[#334155]">
          {[
            { num: 1, label: 'Basic Info' },
            { num: 2, label: 'Schedule' },
            { num: 3, label: 'Inventory' },
          ].map(({ num, label }) => (
            <button
              key={num}
              onClick={() => setStep(num as 1 | 2 | 3)}
              className={`flex-1 py-3 text-center font-bold text-sm transition-colors ${
                step === num
                  ? 'bg-[#0F172A] text-[#84CC16] border-b-2 border-[#84CC16]'
                  : 'text-[#64748B] hover:text-white'
              }`}
            >
              Step {num}: {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="med-name" className="block text-white font-bold text-base mb-2">
                  Medication Name <span className="text-[#FF4444]">*</span>
                </label>
                <input
                  id="med-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Aspirin, Metformin"
                  className="w-full h-[56px] px-4 bg-[#0F172A] border-2 border-[#334155] rounded-lg text-white text-base focus:border-[#84CC16] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="med-dosage" className="block text-white font-bold text-base mb-2">
                  Dosage <span className="text-[#FF4444]">*</span>
                </label>
                <input
                  id="med-dosage"
                  type="text"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  placeholder="e.g., 10mg, 2 tablets"
                  className="w-full h-[56px] px-4 bg-[#0F172A] border-2 border-[#334155] rounded-lg text-white text-base focus:border-[#84CC16] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="med-frequency" className="block text-white font-bold text-base mb-2">
                  Frequency <span className="text-[#FF4444]">*</span>
                </label>
                <input
                  id="med-frequency"
                  type="text"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  placeholder="e.g., 2x daily, Every 8 hours"
                  className="w-full h-[56px] px-4 bg-[#0F172A] border-2 border-[#334155] rounded-lg text-white text-base focus:border-[#84CC16] focus:outline-none"
                />
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!name || !dosage || !frequency}
                className="w-full h-[60px] bg-[#84CC16] text-[#0F172A] rounded-lg font-bold text-xl hover:bg-[#9FE63C] transition-colors disabled:bg-[#334155] disabled:text-[#64748B] disabled:cursor-not-allowed"
              >
                Next: Schedule
              </button>
            </div>
          )}

          {/* Step 2: Schedule */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-white font-bold text-base">
                    Scheduled Times <span className="text-[#FF4444]">*</span>
                  </label>
                  <button
                    onClick={addTimeSlot}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0F172A] border border-[#84CC16] rounded-lg text-[#84CC16] text-sm font-bold hover:bg-[#84CC16] hover:text-[#0F172A] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Time
                  </button>
                </div>

                <div className="space-y-3">
                  {scheduledTimes.map((time, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-[#64748B] flex-shrink-0" />
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => updateTimeSlot(index, e.target.value)}
                        className="flex-1 h-[56px] px-4 bg-[#0F172A] border-2 border-[#334155] rounded-lg text-white text-base focus:border-[#84CC16] focus:outline-none"
                      />
                      {scheduledTimes.length > 1 && (
                        <button
                          onClick={() => removeTimeSlot(index)}
                          className="w-12 h-12 rounded-lg bg-[#FF4444]/10 border border-[#FF4444] flex items-center justify-center hover:bg-[#FF4444] hover:text-white transition-colors"
                        >
                          <X className="w-5 h-5 text-[#FF4444]" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 h-[60px] bg-[#334155] text-white rounded-lg font-bold text-lg hover:bg-[#475569] transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={scheduledTimes.filter((t) => t).length === 0}
                  className="flex-1 h-[60px] bg-[#84CC16] text-[#0F172A] rounded-lg font-bold text-xl hover:bg-[#9FE63C] transition-colors disabled:bg-[#334155] disabled:text-[#64748B] disabled:cursor-not-allowed"
                >
                  Next: Inventory
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Inventory & Pharmacy */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Inventory Tracking Toggle */}
              <div className="p-4 bg-[#0F172A] rounded-lg border border-[#334155]">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-white font-bold text-base">Track Pill Inventory</p>
                    <p className="text-[#94A3B8] text-sm">Monitor remaining pills and get refill alerts</p>
                  </div>
                  <button
                    onClick={() => setTrackInventory(!trackInventory)}
                    className={`w-16 h-8 rounded-full transition-colors ${
                      trackInventory ? 'bg-[#84CC16]' : 'bg-[#334155]'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 bg-white rounded-full transition-transform ${
                        trackInventory ? 'translate-x-9' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {trackInventory && (
                  <div className="space-y-3 mt-4">
                    <div>
                      <label htmlFor="pill-count" className="block text-white font-bold text-sm mb-2">
                        Initial Pill Count <span className="text-[#FF4444]">*</span>
                      </label>
                      <input
                        id="pill-count"
                        type="number"
                        min="1"
                        value={initialPillCount}
                        onChange={(e) => setInitialPillCount(e.target.value)}
                        placeholder="e.g., 30, 60, 90"
                        className="w-full h-[56px] px-4 bg-[#1E293B] border-2 border-[#334155] rounded-lg text-white text-base focus:border-[#84CC16] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="threshold" className="block text-white font-bold text-sm mb-2">
                        Low Supply Alert (days remaining)
                      </label>
                      <input
                        id="threshold"
                        type="number"
                        min="1"
                        max="30"
                        value={lowSupplyThreshold}
                        onChange={(e) => setLowSupplyThreshold(e.target.value)}
                        className="w-full h-[56px] px-4 bg-[#1E293B] border-2 border-[#334155] rounded-lg text-white text-base focus:border-[#84CC16] focus:outline-none"
                      />
                      <p className="text-[#64748B] text-xs mt-1">
                        Alert when ≤ {lowSupplyThreshold} days of pills remaining
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Pharmacy Info */}
              <div className="p-4 bg-[#0F172A] rounded-lg border border-[#334155]">
                <p className="text-white font-bold text-base mb-3">Pharmacy Information (Optional)</p>

                <div className="space-y-3">
                  <input
                    type="text"
                    value={pharmacyName}
                    onChange={(e) => setPharmacyName(e.target.value)}
                    placeholder="Pharmacy Name"
                    className="w-full h-[56px] px-4 bg-[#1E293B] border-2 border-[#334155] rounded-lg text-white text-base focus:border-[#84CC16] focus:outline-none"
                  />

                  <div className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-[#64748B]" />
                    <input
                      type="tel"
                      value={pharmacyPhone}
                      onChange={(e) => setPharmacyPhone(e.target.value)}
                      placeholder="Phone Number"
                      className="flex-1 h-[56px] px-4 bg-[#1E293B] border-2 border-[#334155] rounded-lg text-white text-base focus:border-[#84CC16] focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#64748B]" />
                    <input
                      type="text"
                      value={pharmacyAddress}
                      onChange={(e) => setPharmacyAddress(e.target.value)}
                      placeholder="Address"
                      className="flex-1 h-[56px] px-4 bg-[#1E293B] border-2 border-[#334155] rounded-lg text-white text-base focus:border-[#84CC16] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 h-[60px] bg-[#334155] text-white rounded-lg font-bold text-lg hover:bg-[#475569] transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={trackInventory && !initialPillCount}
                  className="flex-1 h-[60px] bg-[#84CC16] text-[#0F172A] rounded-lg font-bold text-xl hover:bg-[#9FE63C] transition-colors disabled:bg-[#334155] disabled:text-[#64748B] disabled:cursor-not-allowed"
                >
                  Add Medication
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
