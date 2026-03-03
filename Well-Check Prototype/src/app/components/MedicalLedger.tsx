// 🛡️ Medical Ledger - Right Pane (Schedule + Pills)
// V7.5: Vertical scroll medical dashboard
// Reference: prd.md (Medical Modules)

import { Pill, Stethoscope, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  time: string;
  taken: boolean;
}

interface Appointment {
  id: string;
  doctor: string;
  specialty: string;
  time: string;
  location: string;
}

interface MedicalLedgerProps {
  todayMedications: Medication[];
  todayAppointments: Appointment[];
  onSelectMedication: (id: string) => void;
  onSelectAppointment: (id: string) => void;
}

export function MedicalLedger({
  todayMedications,
  todayAppointments,
  onSelectMedication,
  onSelectAppointment,
}: MedicalLedgerProps) {
  // Mock data for demo
  const mockMedications: Medication[] = todayMedications.length > 0 ? todayMedications : [
    { id: '1', name: 'Lisinopril', dosage: '10mg', time: '8:00 AM', taken: true },
    { id: '2', name: 'Metformin', dosage: '500mg', time: '12:00 PM', taken: false },
    { id: '3', name: 'Atorvastatin', dosage: '20mg', time: '8:00 PM', taken: false },
  ];

  const mockAppointments: Appointment[] = todayAppointments.length > 0 ? todayAppointments : [
    {
      id: '1',
      doctor: 'Dr. Sarah Johnson',
      specialty: 'Cardiology',
      time: '2:30 PM',
      location: 'Memorial Hospital',
    },
  ];

  return (
    <div className="h-full bg-[#0F172A] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0F172A]/95 backdrop-blur-sm border-b-2 border-[#334155] p-6">
        <h1 className="text-white font-bold text-3xl mb-2">Medical Ledger</h1>
        <p className="text-[#94A3B8] text-base">Today's schedule</p>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6 pb-32">
        {/* Medications Section */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Pill className="w-6 h-6 text-[#84CC16]" />
            <h2 className="text-white font-bold text-xl">Medications</h2>
            <span className="ml-auto text-[#94A3B8] text-sm">
              {mockMedications.filter(m => m.taken).length}/{mockMedications.length} taken
            </span>
          </div>

          <div className="space-y-3">
            {mockMedications.map((med) => (
              <button
                key={med.id}
                onClick={() => onSelectMedication(med.id)}
                className={`w-full p-4 rounded-xl border-2 transition-all active:scale-95 ${
                  med.taken
                    ? 'bg-[#84CC16]/10 border-[#84CC16]'
                    : 'bg-[#1E293B] border-[#334155] hover:border-[#84CC16]'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Status Icon */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    med.taken ? 'bg-[#84CC16]' : 'bg-[#334155]'
                  }`}>
                    {med.taken ? (
                      <CheckCircle className="w-6 h-6 text-[#0F172A]" />
                    ) : (
                      <Pill className="w-6 h-6 text-[#94A3B8]" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 text-left">
                    <p className="text-white font-bold text-base">{med.name}</p>
                    <p className="text-[#94A3B8] text-sm">{med.dosage}</p>
                  </div>

                  {/* Time */}
                  <div className="text-right">
                    <p className={`font-bold text-base ${
                      med.taken ? 'text-[#84CC16]' : 'text-white'
                    }`}>
                      {med.time}
                    </p>
                    {med.taken && (
                      <p className="text-[#84CC16] text-xs">Taken ✓</p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Add Medication */}
          <button className="w-full mt-3 h-[60px] bg-[#1E293B] border-2 border-dashed border-[#334155] rounded-xl flex items-center justify-center gap-2 hover:border-[#84CC16] transition-colors">
            <Pill className="w-5 h-5 text-[#84CC16]" />
            <span className="text-[#84CC16] font-bold text-sm">Add Medication</span>
          </button>
        </div>

        {/* Appointments Section */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Stethoscope className="w-6 h-6 text-[#FBBF24]" />
            <h2 className="text-white font-bold text-xl">Appointments</h2>
            <span className="ml-auto text-[#94A3B8] text-sm">
              {mockAppointments.length} today
            </span>
          </div>

          {mockAppointments.length > 0 ? (
            <div className="space-y-3">
              {mockAppointments.map((apt) => (
                <button
                  key={apt.id}
                  onClick={() => onSelectAppointment(apt.id)}
                  className="w-full p-4 bg-[#1E293B] border-2 border-[#334155] rounded-xl hover:border-[#FBBF24] transition-all active:scale-95"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="w-12 h-12 bg-[#FBBF24]/20 rounded-full flex items-center justify-center">
                      <Stethoscope className="w-6 h-6 text-[#FBBF24]" />
                    </div>

                    {/* Details */}
                    <div className="flex-1 text-left">
                      <p className="text-white font-bold text-base mb-1">{apt.doctor}</p>
                      <p className="text-[#FBBF24] text-sm mb-1">{apt.specialty}</p>
                      <div className="flex items-center gap-2 text-[#94A3B8] text-xs">
                        <Clock className="w-3 h-3" />
                        <span>{apt.time}</span>
                      </div>
                      <p className="text-[#64748B] text-xs mt-1">{apt.location}</p>
                    </div>

                    {/* Alert */}
                    <AlertCircle className="w-5 h-5 text-[#FBBF24]" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-6 bg-[#1E293B] border border-[#334155] rounded-xl text-center">
              <p className="text-[#94A3B8] text-sm">No appointments today</p>
            </div>
          )}

          {/* Add Appointment */}
          <button className="w-full mt-3 h-[60px] bg-[#1E293B] border-2 border-dashed border-[#334155] rounded-xl flex items-center justify-center gap-2 hover:border-[#FBBF24] transition-colors">
            <Stethoscope className="w-5 h-5 text-[#FBBF24]" />
            <span className="text-[#FBBF24] font-bold text-sm">Add Appointment</span>
          </button>
        </div>

        {/* Summary Card */}
        <div className="p-4 bg-gradient-to-br from-[#6366F1]/10 to-[#8B5CF6]/10 border border-[#6366F1] rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-[#6366F1]" />
            <p className="text-white font-bold text-sm">Medical Summary</p>
          </div>
          <p className="text-[#94A3B8] text-xs">
            {mockMedications.filter(m => !m.taken).length} medications remaining today
          </p>
          <p className="text-[#94A3B8] text-xs">
            {mockAppointments.length} appointments scheduled
          </p>
        </div>
      </div>
    </div>
  );
}
