// 🛡️ Monitor View - Family Member Monitoring Dashboard
// Reference: prd.md (Monitor Role: Maintain awareness, cannot change safety rules)

import { Eye } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SwipeableContainer } from '../components/SwipeableContainer';
import { FamilyHorizon } from '../components/FamilyHorizon';
import { MapPulse } from '../components/MapPulse';
import { MedicalLedger } from '../components/MedicalLedger';

export function MonitorView() {
  const { 
    familyMembers, 
    lastVerifiedPulse, 
    sendPing, 
    triggerPanic, 
    currentPanicEvent,
    familyCode,
    tenantId,
    gpsAccuracy,
    isOffline,
    isSyncing,
    lastSyncTimestamp,
  } = useApp();

  const isPanicLocked = currentPanicEvent?.status === 'active';
  const isPanicMode = currentPanicEvent?.status === 'active';

  return (
    <div className="h-[calc(100vh-180px)]">
      {/* Mobile-First 3-Pane Swipe Navigation */}
      <SwipeableContainer isPanicLocked={isPanicLocked}>
        {{
          // LEFT: Family Horizon
          horizon: (
            <FamilyHorizon
              familyMembers={familyMembers}
              onSelectMember={(id) => console.log('Selected member:', id)}
            />
          ),

          // CENTER: Map/Pulse (Default)
          pulse: (
            <MapPulse
              familyMembers={familyMembers}
              lastVerifiedPulse={lastVerifiedPulse}
              onSendPing={sendPing}
              onTriggerPanic={triggerPanic}
              familyCode={familyCode}
              tenantId={tenantId}
              isPanicMode={isPanicMode}
              gpsAccuracy={gpsAccuracy}
              isOnline={!isOffline}
              isSyncing={isSyncing}
              lastSyncTimestamp={lastSyncTimestamp}
            />
          ),

          // RIGHT: Medical Ledger
          ledger: (
            <MedicalLedger
              todayMedications={[]}
              todayAppointments={[]}
              onSelectMedication={(id) => console.log('Selected medication:', id)}
              onSelectAppointment={(id) => console.log('Selected appointment:', id)}
            />
          ),
        }}
      </SwipeableContainer>
    </div>
  );
}