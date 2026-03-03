// 🛡️ Protected User View - Simplified Interface for Vulnerable Users
// Reference: prd.md (Protected Role: Seniors/sick requiring intensive monitoring)

import { User, Shield, Pill, Stethoscope, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router';
import { SwipeableContainer } from '../components/SwipeableContainer';
import { FamilyHorizon } from '../components/FamilyHorizon';
import { MapPulse } from '../components/MapPulse';
import { MedicalLedger } from '../components/MedicalLedger';

export function ProtectedView() {
  const navigate = useNavigate();
  const { 
    currentUser, 
    capabilities, 
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

  const userCapabilities = currentUser ? capabilities[currentUser.id] : null;
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

          // CENTER: Map/Pulse with Quick Actions (Default)
          pulse: (
            <div className="relative h-full">
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
              
              {/* Protected User Overlay */}
              <div className="absolute top-20 left-4 right-4 z-30 bg-[#FF4444]/20 backdrop-blur-sm border-2 border-[#FF4444] rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <User className="w-8 h-8 text-[#FF4444]" />
                  <div>
                    <p className="text-white font-bold text-base">{currentUser?.name}</p>
                    <p className="text-[#FF4444] text-sm">Protected User</p>
                  </div>
                </div>
              </div>
            </div>
          ),

          // RIGHT: Medical Ledger
          ledger: (
            <MedicalLedger
              todayMedications={[]}
              todayAppointments={[]}
              onSelectMedication={(id) => navigate('/medications')}
              onSelectAppointment={(id) => navigate('/doctor-visits')}
            />
          ),
        }}
      </SwipeableContainer>
    </div>
  );
}