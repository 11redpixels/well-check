// 🛡️ V8.9: Medications View with First Success Toast
import { useState, useEffect } from 'react';
import { EmptyState } from '../components/EmptyState';
import { MedicationWizard } from '../components/MedicationWizard';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner'; // V8.9: First Success Toast

const FIRST_SUCCESS_KEY = 'wellcheck_first_medication_saved'; // V8.9: One-time toast flag

export function MedicationsView() {
  const { currentUser } = useApp();
  const [showWizard, setShowWizard] = useState(false);
  const [medications, setMedications] = useState<any[]>([]); // V8.8: Local state for instant update
  
  // TODO: Replace with actual data fetching from Supabase
  // const { data: medications, isLoading, refetch } = useMedications();
  const isLoading = false;

  // V8.9: Handle medication save with instant state update + First Success Toast
  const handleMedicationSaved = (medication: any) => {
    // Instant state update (no refresh needed)
    setMedications(prev => [...prev, medication]);
    setShowWizard(false);
    
    // V8.9: Show "First Success" toast (one-time only)
    const hasShownFirstSuccess = localStorage.getItem(FIRST_SUCCESS_KEY);
    if (!hasShownFirstSuccess) {
      toast.success('🛡️ First Medication Logged. Your family is now safer.', {
        duration: 4000,
        style: {
          background: '#84CC16', // Safety Green
          color: '#0F172A', // Midnight Slate
          fontWeight: 'bold',
          fontSize: '16px',
          border: 'none',
        },
      });
      localStorage.setItem(FIRST_SUCCESS_KEY, 'true');
    }
    
    // TODO: Also save to Supabase in background
    // await saveMedication(medication);
    // TODO: Check if should offer cleanup after 2nd medication (V8.9)
    // const cleanupCheck = await shouldOfferCleanup(currentUser.tenantId);
    // if (cleanupCheck.should_offer) { showCleanupDialog(); }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-180px)] flex items-center justify-center">
        <div className="text-white text-lg">Loading medications...</div>
      </div>
    );
  }

  // Show empty state if no medications
  if (!medications || medications.length === 0) {
    return (
      <>
        <div className="min-h-[calc(100vh-180px)]">
          <EmptyState
            icon="💊"
            title="No Medications Yet"
            message="Start tracking your medications to get personalized reminders and ensure you never miss a dose."
            actionLabel="Add Medication"
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
              <MedicationWizard
                userId={currentUser?.id || 'demo-user'}
                tenantId={currentUser?.tenantId || 'demo-tenant'}
                onComplete={handleMedicationSaved}
                onCancel={() => setShowWizard(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // V8.8: Show medications list (Live Medication Ledger)
  return (
    <>
      <div className="min-h-[calc(100vh-180px)] p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-white font-bold text-3xl">Medications</h1>
          <button
            onClick={() => setShowWizard(true)}
            className="h-12 px-6 bg-[#84CC16] text-[#0F172A] rounded-lg font-bold text-base hover:bg-[#A3E635] active:scale-95 transition-all"
          >
            + Add
          </button>
        </div>
        
        {/* TODO: Render MedicalLedger component */}
        <div className="space-y-4">
          {medications.map((med, index) => (
            <div
              key={index}
              className="bg-[#1E293B] border border-[#334155] rounded-lg p-4"
            >
              <h3 className="text-white font-bold text-lg">{med.name}</h3>
              <p className="text-[#94A3B8] text-sm">{med.dosage}</p>
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
            <MedicationWizard
              userId={currentUser?.id || 'demo-user'}
              tenantId={currentUser?.tenantId || 'demo-tenant'}
              onComplete={handleMedicationSaved}
              onCancel={() => setShowWizard(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}