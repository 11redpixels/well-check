// 🛡️ V8.8: Doctor Visits View with Slide-In Animation & Instant State Update
import { useState } from 'react';
import { EmptyState } from '../components/EmptyState';
import { DoctorAppointmentWizard } from '../components/DoctorAppointmentWizard';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';

export function DoctorVisitsView() {
  const { currentUser } = useApp();
  const [showWizard, setShowWizard] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]); // V8.8: Local state for instant update
  
  // TODO: Replace with actual data fetching from Supabase
  // const { data: appointments, isLoading } = useAppointments();
  const isLoading = false;

  // V8.8: Handle appointment save with instant state update
  const handleAppointmentSaved = (appointment: any) => {
    // Instant state update (no refresh needed)
    setAppointments(prev => [...prev, appointment]);
    setShowWizard(false);
    
    // TODO: Also save to Supabase in background
    // await saveAppointment(appointment);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-180px)] flex items-center justify-center">
        <div className="text-white text-lg">Loading appointments...</div>
      </div>
    );
  }

  // Show empty state if no appointments
  if (!appointments || appointments.length === 0) {
    return (
      <>
        <div className="min-h-[calc(100vh-180px)]">
          <EmptyState
            icon="🏥"
            title="No Appointments Scheduled"
            message="Schedule your first doctor appointment and get reminders before your visit. Track post-visit notes and follow-ups."
            actionLabel="Schedule Appointment"
            onAction={() => setShowWizard(true)}
          />
        </div>

        {/* V8.8: Slide-In Wizard Overlay (0ms latency) */}
        <AnimatePresence>
          {showWizard && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
              className="fixed inset-0 z-50 bg-[#0F172A]"
            >
              <DoctorAppointmentWizard
                userId={currentUser?.id || 'demo-user'}
                tenantId={currentUser?.tenantId || 'demo-tenant'}
                onComplete={handleAppointmentSaved}
                onCancel={() => setShowWizard(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // V8.8: Show appointments list
  return (
    <>
      <div className="min-h-[calc(100vh-180px)] p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-white font-bold text-3xl">Doctor Visits</h1>
          <button
            onClick={() => setShowWizard(true)}
            className="h-12 px-6 bg-[#84CC16] text-[#0F172A] rounded-lg font-bold text-base hover:bg-[#A3E635] active:scale-95 transition-all"
          >
            + Schedule
          </button>
        </div>
        
        {/* TODO: Render AppointmentScheduler component */}
        <div className="space-y-4">
          {appointments.map((appt, index) => (
            <div
              key={index}
              className="bg-[#1E293B] border border-[#334155] rounded-lg p-4"
            >
              <h3 className="text-white font-bold text-lg">{appt.appointmentType || 'Appointment'}</h3>
              <p className="text-[#94A3B8] text-sm">{appt.doctor || 'Doctor Name'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* V8.8: Slide-In Wizard Overlay (0ms latency) */}
      <AnimatePresence>
        {showWizard && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
            className="fixed inset-0 z-50 bg-[#0F172A]"
          >
            <DoctorAppointmentWizard
              userId={currentUser?.id || 'demo-user'}
              tenantId={currentUser?.tenantId || 'demo-tenant'}
              onComplete={handleAppointmentSaved}
              onCancel={() => setShowWizard(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}