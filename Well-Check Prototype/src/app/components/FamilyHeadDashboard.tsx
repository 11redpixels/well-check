// 🛡️ FamilyHeadDashboard - Admin Command Center
// Mandate: Phase 1 Demo - Capability Toggle System
// Reference: prd.md #24, #42 (Admin Command Heatmap)
// V11.2: Dashboard Purge - Delete 3-Header Stats + Capabilities/Overview tabs

import { useState, useEffect } from 'react';
import { Crown, Users, Settings, Shield, Pill, Plus } from 'lucide-react';
import { CapabilityToggle } from './CapabilityToggle';
import { MedicationScheduler } from './MedicationScheduler';
import { RefillAlert } from './RefillAlert';
import { getMedications, getAllLowSupplyMedications } from '../services/medicationService';
import type { FamilyMember, UserCapabilities, Medication } from '../types';

interface FamilyHeadDashboardProps {
  familyMembers: FamilyMember[];
  capabilities: Record<string, UserCapabilities>;
  onToggleCapability: (
    userId: string,
    capability: 'medication' | 'doctorVisits' | 'panicMode',
    enabled: boolean
  ) => Promise<void>;
}

export function FamilyHeadDashboard({
  familyMembers,
  capabilities,
  onToggleCapability,
}: FamilyHeadDashboardProps) {
  // Filter out self (Family Head) from member list
  const managedMembers = familyMembers.filter((m) => m.role !== 'family_head');

  // Medication Data
  const [medications, setMedications] = useState<Medication[]>([]);

  useEffect(() => {
    const fetchMedications = async () => {
      const allMedications = await getMedications();
      setMedications(allMedications);
    };

    fetchMedications();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* V13.0: PERSONALIZED WELCOME HEADER (Dynamic String) */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#A855F7] to-[#7C3AED] rounded-3xl flex items-center justify-center shadow-lg">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-[var(--color-text-primary)] font-bold text-2xl">
              Welcome back, David.
            </h1>
            <p className="text-[var(--color-text-tertiary)] text-sm mt-0.5">
              Your family is under the shield
            </p>
          </div>
        </div>
      </div>

      {/* V13.0: FLUID STATUS BUBBLES (More "air" between cards) */}
      <div className="space-y-6">
        {managedMembers.map((member) => {
          const memberCapabilities = capabilities[member.id] || {
            id: member.id,
            userId: member.id,
            tenantId: member.tenantId,
            medicationEnabled: false,
            doctorVisitsEnabled: false,
            panicModeEnabled: true,
            managedByUserId: 'family_head_id',
            updatedAt: Date.now(),
            createdAt: Date.now(),
          };

          // V13.0: Determine if this member is a "Guardian Protected" (elderly role)
          const isGuardianProtected = member.role === 'protected';

          return (
            <CapabilityToggle
              key={member.id}
              member={member}
              capabilities={memberCapabilities}
              onToggle={onToggleCapability}
              isGuardianProtected={isGuardianProtected}
            />
          );
        })}

        {managedMembers.length === 0 && (
          <div className="bg-[var(--color-card-bg)] rounded-3xl border border-[var(--color-border)] p-8 text-center shadow-lg">
            <Users className="w-12 h-12 text-[var(--color-text-tertiary)] mx-auto mb-3" />
            <p className="text-[var(--color-text-secondary)] text-lg">No family members to manage yet.</p>
            <p className="text-[var(--color-text-tertiary)] text-sm mt-1">
              Add family members using the Family Code to get started.
            </p>
          </div>
        )}
      </div>

      {/* Legal Footer */}
      <div className="mt-8 p-4 bg-[var(--color-bg)] rounded-3xl border border-[var(--color-border)] shadow-sm">
        <p className="text-[var(--color-text-tertiary)] text-xs">
          ⚖️ <strong>Single-Source Ledger:</strong> Only the Family Head can modify capability
          settings. All changes logged to audit trail.
        </p>
      </div>
    </div>
  );
}