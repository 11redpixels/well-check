// 🛡️ Family Head View - Admin Dashboard
// Reference: prd.md (Family Head: Sole authority for medical schema, manages Family Code)

import { Shield } from 'lucide-react';
import { FamilyHeadDashboard } from '../components/FamilyHeadDashboard';
import { useApp } from '../context/AppContext';

export function FamilyHeadView() {
  const { familyMembers, capabilities, toggleCapability } = useApp();

  return (
    <div className="min-h-[calc(100vh-180px)]">
      <FamilyHeadDashboard
        familyMembers={familyMembers}
        capabilities={capabilities}
        onToggleCapability={toggleCapability}
      />
    </div>
  );
}
