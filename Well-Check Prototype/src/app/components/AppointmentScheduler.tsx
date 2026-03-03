// 🛡️ AppointmentScheduler - Doctor Visit Creation Wizard
// Coder: Appointment scheduling UI for Family Heads
// Reference: prd.md #43-49

import { useState } from 'react';
import { Calendar, Clock, MapPin, Phone, Stethoscope, Users, X } from 'lucide-react';
import { createDoctorVisit } from '../services/doctorVisitService';
import { GEOFENCE_CONFIG } from '../types';
import { toast } from 'sonner';

interface AppointmentSchedulerProps {
  userId: string;
  userName: string;
  tenantId: string;
  familyHeadId: string;
  availableMonitors: Array<{ id: string; name: string }>;
  onComplete: () => void;
  onCancel: () => void;
}

export function AppointmentScheduler({
  userId,
  userName,
  tenantId,
  familyHeadId,
  availableMonitors,
  onComplete,
  onCancel,
}: AppointmentSchedulerProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Doctor & Appointment Info
  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [notes, setNotes] = useState('');

  // Step 2: Clinic Location
  const [clinicName, setClinicName] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');
  const [clinicLat, setClinicLat] = useState('');
  const [clinicLng, setClinicLng] = useState('');
  const [geofenceRadius, setGeofenceRadius] = useState(
    (GEOFENCE_CONFIG.DEFAULT_RADIUS_METERS / 1609.344).toFixed(1)
  ); // Convert meters to miles

  // Step 3: Contact & Monitors
  const [doctorPhone, setDoctorPhone] = useState('');
  const [clinicPhone, setClinicPhone] = useState('');
  const [selectedMonitorIds, setSelectedMonitorIds] = useState<string[]>([]);

  const toggleMonitor = (monitorId: string) => {
    if (selectedMonitorIds.includes(monitorId)) {
      setSelectedMonitorIds(selectedMonitorIds.filter((id) => id !== monitorId));
    } else {
      setSelectedMonitorIds([...selectedMonitorIds, monitorId]);
    }
  };

  const handleSubmit = () => {
    // Validation
    if (!doctorName.trim()) {
      toast.error('Please enter doctor name');
      return;
    }

    if (!appointmentDate || !appointmentTime) {
      toast.error('Please select date and time');
      return;
    }

    if (!clinicName.trim() || !clinicAddress.trim()) {
      toast.error('Please enter clinic information');
      return;
    }

    if (!clinicLat || !clinicLng) {
      toast.error('Please enter GPS coordinates');
      return;
    }

    if (selectedMonitorIds.length === 0) {
      toast.error('Please select at least one monitor to notify');
      return;
    }

    // Parse date and time
    const [year, month, day] = appointmentDate.split('-').map(Number);
    const [hours, minutes] = appointmentTime.split(':').map(Number);
    const appointmentDateTime = new Date(year, month - 1, day, hours, minutes);

    // Create appointment
    try {
      createDoctorVisit(userId, tenantId, familyHeadId, {
        doctorName: doctorName.trim(),
        specialty: specialty.trim() || undefined,
        appointmentDate: appointmentDateTime.getTime(),
        appointmentTime,
        duration: parseInt(duration),
        notes: notes.trim() || undefined,
        clinicName: clinicName.trim(),
        clinicAddress: clinicAddress.trim(),
        clinicLocation: {
          lat: parseFloat(clinicLat),
          lng: parseFloat(clinicLng),
          accuracy: 10, // Assumed accurate for manually entered coordinates
          timestamp: Date.now(),
        },
        geofenceRadius: parseFloat(geofenceRadius) * 1609.344, // Convert miles to meters
        doctorPhone: doctorPhone.trim() || undefined,
        clinicPhone: clinicPhone.trim() || undefined,
        assignedMonitorIds: selectedMonitorIds,
      });

      toast.success('Appointment Scheduled', {
        description: `${doctorName} on ${appointmentDate} at ${appointmentTime}`,
        duration: 4000,
      });

      onComplete();
    } catch (error) {
      toast.error('Failed to schedule appointment');
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
              <Stethoscope className="w-8 h-8 text-[#0F172A]" />
              <div>
                <h2 className="text-[#0F172A] font-bold text-2xl">Schedule Doctor Visit</h2>
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
            { num: 1, label: 'Appointment' },
            { num: 2, label: 'Location' },
            { num: 3, label: 'Contacts' },
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
          {/* Step 1: Doctor & Appointment Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="doctor-name" className="block text-white font-bold text-base mb-2">
                  Doctor Name <span className="text-[#FF4444]">*</span>
                </label>
                <input
                  id="doctor-name"
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="e.g., Dr. Sarah Johnson"
                  className="w-full h-[56px] px-4 bg-[#0F172A] border-2 border-[#334155] rounded-lg text-white text-base focus:border-[#84CC16] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="specialty" className="block text-white font-bold text-base mb-2">
                  Specialty
                </label>
                <input
                  id="specialty"
                  type="text"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  placeholder="e.g., Cardiologist, Primary Care"
                  className="w-full h-[56px] px-4 bg-[#0F172A] border-2 border-[#334155] rounded-lg text-white text-base focus:border-[#84CC16] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="appt-date" className="block text-white font-bold text-base mb-2">
                    Date <span className="text-[#FF4444]">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                    <input
                      id="appt-date"
                      type="date"
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      className="w-full h-[56px] pl-12 pr-4 bg-[#0F172A] border-2 border-[#334155] rounded-lg text-white text-base focus:border-[#84CC16] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="appt-time" className="block text-white font-bold text-base mb-2">
                    Time <span className="text-[#FF4444]">*</span>
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                    <input
                      id="appt-time"
                      type="time"
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                      className="w-full h-[56px] pl-12 pr-4 bg-[#0F172A] border-2 border-[#334155] rounded-lg text-white text-base focus:border-[#84CC16] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="duration" className="block text-white font-bold text-base mb-2">
                  Duration (minutes)
                </label>
                <input
                  id="duration"
                  type="number"
                  min="15"
                  max="240"
                  step="15"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full h-[56px] px-4 bg-[#0F172A] border-2 border-[#334155] rounded-lg text-white text-base focus:border-[#84CC16] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="notes" className="block text-white font-bold text-base mb-2">
                  Notes
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Reason for visit, special instructions..."
                  rows={3}
                  className="w-full px-4 py-3 bg-[#0F172A] border-2 border-[#334155] rounded-lg text-white text-base focus:border-[#84CC16] focus:outline-none resize-none"
                />
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!doctorName || !appointmentDate || !appointmentTime}
                className="w-full h-[60px] bg-[#84CC16] text-[#0F172A] rounded-lg font-bold text-xl hover:bg-[#9FE63C] transition-colors disabled:bg-[#334155] disabled:text-[#64748B] disabled:cursor-not-allowed"
              >
                Next: Location
              </button>
            </div>
          )}

          {/* Step 2: Clinic Location */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="clinic-name" className="block text-white font-bold text-base mb-2">
                  Clinic Name <span className="text-[#FF4444]">*</span>
                </label>
                <input
                  id="clinic-name"
                  type="text"
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  placeholder="e.g., Mercy Medical Center"
                  className="w-full h-[56px] px-4 bg-[#0F172A] border-2 border-[#334155] rounded-lg text-white text-base focus:border-[#84CC16] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="clinic-address" className="block text-white font-bold text-base mb-2">
                  Address <span className="text-[#FF4444]">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                  <input
                    id="clinic-address"
                    type="text"
                    value={clinicAddress}
                    onChange={(e) => setClinicAddress(e.target.value)}
                    placeholder="123 Main St, City, ST 12345"
                    className="w-full h-[56px] pl-12 pr-4 bg-[#0F172A] border-2 border-[#334155] rounded-lg text-white text-base focus:border-[#84CC16] focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-4 bg-[#FBBF24]/10 border border-[#FBBF24] rounded-lg">
                <p className="text-[#FBBF24] text-sm mb-2 font-bold">📍 GPS Coordinates</p>
                <p className="text-[#94A3B8] text-xs mb-3">
                  Enter clinic GPS coordinates for geofence auto-check-in
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="lat" className="block text-white text-sm mb-1">
                      Latitude <span className="text-[#FF4444]">*</span>
                    </label>
                    <input
                      id="lat"
                      type="text"
                      value={clinicLat}
                      onChange={(e) => setClinicLat(e.target.value)}
                      placeholder="37.7749"
                      className="w-full h-[56px] px-3 bg-[#0F172A] border border-[#334155] rounded-lg text-white text-base focus:border-[#84CC16] focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label htmlFor="lng" className="block text-white text-sm mb-1">
                      Longitude <span className="text-[#FF4444]">*</span>
                    </label>
                    <input
                      id="lng"
                      type="text"
                      value={clinicLng}
                      onChange={(e) => setClinicLng(e.target.value)}
                      placeholder="-122.4194"
                      className="w-full h-[56px] px-3 bg-[#0F172A] border border-[#334155] rounded-lg text-white text-base focus:border-[#84CC16] focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="geofence" className="block text-white font-bold text-base mb-2">
                  Geofence Radius (miles)
                </label>
                <input
                  id="geofence"
                  type="number"
                  min="0.1"
                  max="5"
                  step="0.1"
                  value={geofenceRadius}
                  onChange={(e) => setGeofenceRadius(e.target.value)}
                  className="w-full h-[56px] px-4 bg-[#0F172A] border-2 border-[#334155] rounded-lg text-white text-base focus:border-[#84CC16] focus:outline-none"
                />
                <p className="text-[#64748B] text-xs mt-1">
                  Auto-check-in when within {geofenceRadius} miles of clinic (±10m GPS accuracy
                  required)
                </p>
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
                  disabled={!clinicName || !clinicAddress || !clinicLat || !clinicLng}
                  className="flex-1 h-[60px] bg-[#84CC16] text-[#0F172A] rounded-lg font-bold text-xl hover:bg-[#9FE63C] transition-colors disabled:bg-[#334155] disabled:text-[#64748B] disabled:cursor-not-allowed"
                >
                  Next: Contacts
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Contact & Monitors */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="doctor-phone" className="block text-white font-bold text-base mb-2">
                  Doctor Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                  <input
                    id="doctor-phone"
                    type="tel"
                    value={doctorPhone}
                    onChange={(e) => setDoctorPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    className="w-full h-[56px] pl-12 pr-4 bg-[#0F172A] border-2 border-[#334155] rounded-lg text-white text-base focus:border-[#84CC16] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="clinic-phone" className="block text-white font-bold text-base mb-2">
                  Clinic Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                  <input
                    id="clinic-phone"
                    type="tel"
                    value={clinicPhone}
                    onChange={(e) => setClinicPhone(e.target.value)}
                    placeholder="(555) 987-6543"
                    className="w-full h-[56px] pl-12 pr-4 bg-[#0F172A] border-2 border-[#334155] rounded-lg text-white text-base focus:border-[#84CC16] focus:outline-none"
                  />
                </div>
              </div>

              {/* Monitor Assignment */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-5 h-5 text-[#84CC16]" />
                  <label className="text-white font-bold text-base">
                    Assign Monitors <span className="text-[#FF4444]">*</span>
                  </label>
                </div>
                <p className="text-[#94A3B8] text-sm mb-3">
                  Select monitors to receive arrival/late notifications
                </p>

                <div className="space-y-2">
                  {availableMonitors.map((monitor) => (
                    <button
                      key={monitor.id}
                      onClick={() => toggleMonitor(monitor.id)}
                      className={`w-full h-[56px] px-4 rounded-lg flex items-center justify-between transition-colors ${
                        selectedMonitorIds.includes(monitor.id)
                          ? 'bg-[#84CC16] text-[#0F172A]'
                          : 'bg-[#0F172A] border-2 border-[#334155] text-white hover:border-[#84CC16]'
                      }`}
                    >
                      <span className="font-bold">{monitor.name}</span>
                      <div
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                          selectedMonitorIds.includes(monitor.id)
                            ? 'border-[#0F172A] bg-[#0F172A]'
                            : 'border-[#334155]'
                        }`}
                      >
                        {selectedMonitorIds.includes(monitor.id) && (
                          <span className="text-[#84CC16] text-xl">✓</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {selectedMonitorIds.length === 0 && (
                  <p className="text-[#FF4444] text-sm mt-2">
                    ⚠️ At least one monitor must be selected
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 h-[60px] bg-[#334155] text-white rounded-lg font-bold text-lg hover:bg-[#475569] transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={selectedMonitorIds.length === 0}
                  className="flex-1 h-[60px] bg-[#84CC16] text-[#0F172A] rounded-lg font-bold text-xl hover:bg-[#9FE63C] transition-colors disabled:bg-[#334155] disabled:text-[#64748B] disabled:cursor-not-allowed"
                >
                  Schedule Appointment
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
