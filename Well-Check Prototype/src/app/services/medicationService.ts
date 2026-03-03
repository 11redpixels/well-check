// 🛡️ Medication Service - Database & Temporal Logic Layer
// Chief Architect: Database migration, Escalation timers, Inventory logic
// Reference: prd.md #26-42, ai-domain-expert.md #31 (Non-Repudiation Law)

import type { Medication, MedicationLog, MedicationStatus, EscalationStage, ReasoningCode, Location } from '../types';
import { ESCALATION_TIMINGS } from '../types';

// =====================================================================
// DATABASE LAYER (Mock - In production: Supabase)
// =====================================================================

// In-memory storage for demo (simulates database)
let medicationsDB: Medication[] = [];
let medicationLogsDB: MedicationLog[] = [];

// =====================================================================
// MEDICATION CRUD
// =====================================================================

export function createMedication(
  userId: string,
  tenantId: string,
  createdByUserId: string,
  data: {
    name: string;
    dosage: string;
    frequency: string;
    scheduledTimes: string[];
    initialPillCount?: number;
    lowSupplyThreshold: number;
    pharmacyName?: string;
    pharmacyPhone?: string;
    pharmacyAddress?: string;
  }
): Medication {
  const medication: Medication = {
    id: `med-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    tenantId,
    userId,
    name: data.name,
    dosage: data.dosage,
    frequency: data.frequency,
    scheduledTimes: data.scheduledTimes,
    initialPillCount: data.initialPillCount,
    currentPillCount: data.initialPillCount,
    lowSupplyThreshold: data.lowSupplyThreshold,
    pharmacyName: data.pharmacyName,
    pharmacyPhone: data.pharmacyPhone,
    pharmacyAddress: data.pharmacyAddress,
    createdByUserId,
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  medicationsDB.push(medication);
  saveToDB();
  return medication;
}

export function getMedications(userId?: string): Medication[] {
  if (userId) {
    return medicationsDB.filter((m) => m.userId === userId && m.isActive);
  }
  return medicationsDB.filter((m) => m.isActive);
}

export function getMedicationById(medicationId: string): Medication | undefined {
  return medicationsDB.find((m) => m.id === medicationId);
}

export function updateMedication(medicationId: string, updates: Partial<Medication>): Medication | null {
  const index = medicationsDB.findIndex((m) => m.id === medicationId);
  if (index === -1) return null;

  medicationsDB[index] = {
    ...medicationsDB[index],
    ...updates,
    updatedAt: Date.now(),
  };

  saveToDB();
  return medicationsDB[index];
}

export function deleteMedication(medicationId: string): boolean {
  const index = medicationsDB.findIndex((m) => m.id === medicationId);
  if (index === -1) return false;

  medicationsDB[index].isActive = false;
  medicationsDB[index].updatedAt = Date.now();
  saveToDB();
  return true;
}

// =====================================================================
// MEDICATION LOG CRUD
// =====================================================================

export function createMedicationLog(
  medicationId: string,
  scheduledTime: number,
  captureTime: number,
  location?: Location,
  batteryLevel?: number
): MedicationLog {
  const medication = getMedicationById(medicationId);
  if (!medication) throw new Error('Medication not found');

  const log: MedicationLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    tenantId: medication.tenantId,
    medicationId,
    userId: medication.userId,
    scheduledTime,
    status: 'pending',
    escalationStage: 0,
    captureTime,
    uploadTime: Date.now(), // Server timestamp
    gpsLocation: location,
    batteryLevel,
    undoWindowExpiresAt: undefined,
    isUndone: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  medicationLogsDB.push(log);
  saveToDB();
  return log;
}

export function getMedicationLogs(medicationId: string): MedicationLog[] {
  return medicationLogsDB.filter((l) => l.medicationId === medicationId);
}

export function getPendingMedicationLogs(userId: string): MedicationLog[] {
  const userMedications = getMedications(userId);
  const medicationIds = userMedications.map((m) => m.id);
  
  return medicationLogsDB.filter(
    (l) => medicationIds.includes(l.medicationId) && l.status === 'pending'
  );
}

export function updateMedicationLog(logId: string, updates: Partial<MedicationLog>): MedicationLog | null {
  const index = medicationLogsDB.findIndex((l) => l.id === logId);
  if (index === -1) return null;

  medicationLogsDB[index] = {
    ...medicationLogsDB[index],
    ...updates,
    updatedAt: Date.now(),
  };

  saveToDB();
  return medicationLogsDB[index];
}

// =====================================================================
// ESCALATION LADDER LOGIC (15m / 1h / 2h / 4h)
// =====================================================================

export function calculateEscalationStage(log: MedicationLog): EscalationStage {
  if (log.status !== 'pending') return log.escalationStage;

  const elapsed = Date.now() - log.scheduledTime;

  if (elapsed >= ESCALATION_TIMINGS.MISSED_FINAL) {
    return 'final'; // 4+ hours: Requires reasoning
  } else if (elapsed >= ESCALATION_TIMINGS.STAGE_3) {
    return 3; // 2+ hours: Critical alert
  } else if (elapsed >= ESCALATION_TIMINGS.STAGE_2) {
    return 2; // 1+ hour: Family nudge
  } else if (elapsed >= ESCALATION_TIMINGS.STAGE_1) {
    return 1; // 15+ minutes: Local nudge
  }

  return 0; // Not yet overdue
}

export function updateEscalationStages(): MedicationLog[] {
  const updatedLogs: MedicationLog[] = [];

  medicationLogsDB.forEach((log) => {
    if (log.status === 'pending') {
      const newStage = calculateEscalationStage(log);
      if (newStage !== log.escalationStage) {
        const updated = updateMedicationLog(log.id, { escalationStage: newStage });
        if (updated) updatedLogs.push(updated);
      }
    }
  });

  return updatedLogs;
}

// =====================================================================
// MEDICATION LOG ACTIONS
// =====================================================================

export function markTaken(
  logId: string,
  confirmedByUserId: string,
  captureTime: number,
  location?: Location,
  batteryLevel?: number
): MedicationLog | null {
  const log = medicationLogsDB.find((l) => l.id === logId);
  if (!log) return null;

  const medication = getMedicationById(log.medicationId);
  if (!medication) return null;

  // Decrement pill count (prd.md #33: Inventory Tracking)
  if (medication.currentPillCount !== undefined && medication.currentPillCount > 0) {
    updateMedication(medication.id, {
      currentPillCount: medication.currentPillCount - 1,
    });
  }

  // Update log status
  return updateMedicationLog(logId, {
    status: 'taken',
    takenAt: Date.now(),
    confirmedByUserId,
    captureTime,
    uploadTime: Date.now(),
    gpsLocation: location,
    batteryLevel,
    undoWindowExpiresAt: Date.now() + 60 * 1000, // 60 second undo window
  });
}

export function markMissed(
  logId: string,
  reasoningCode: ReasoningCode,
  reasoningNotes?: string,
  confirmedByUserId?: string
): MedicationLog | null {
  return updateMedicationLog(logId, {
    status: 'missed',
    reasoningCode,
    reasoningNotes,
    confirmedByUserId,
    captureTime: Date.now(),
    uploadTime: Date.now(),
  });
}

export function snoozeMedication(logId: string, snoozeMinutes: number = 15): MedicationLog | null {
  const log = medicationLogsDB.find((l) => l.id === logId);
  if (!log) return null;

  // Create new log for snoozed time
  const newScheduledTime = Date.now() + snoozeMinutes * 60 * 1000;
  
  // Mark current log as snoozed
  updateMedicationLog(logId, {
    status: 'snoozed',
    captureTime: Date.now(),
    uploadTime: Date.now(),
  });

  // Create new pending log
  return createMedicationLog(
    log.medicationId,
    newScheduledTime,
    Date.now(),
    log.gpsLocation,
    log.batteryLevel
  );
}

export function undoTaken(logId: string): MedicationLog | null {
  const log = medicationLogsDB.find((l) => l.id === logId);
  if (!log) return null;

  // Check if undo window expired
  if (log.undoWindowExpiresAt && Date.now() > log.undoWindowExpiresAt) {
    return null; // Too late to undo
  }

  const medication = getMedicationById(log.medicationId);
  if (!medication) return null;

  // Restore pill count
  if (medication.currentPillCount !== undefined) {
    updateMedication(medication.id, {
      currentPillCount: medication.currentPillCount + 1,
    });
  }

  // Mark as undone and reset to pending
  return updateMedicationLog(logId, {
    status: 'pending',
    isUndone: true,
    takenAt: undefined,
    undoWindowExpiresAt: undefined,
    escalationStage: calculateEscalationStage(log),
  });
}

// =====================================================================
// INVENTORY & REFILL ALERTS
// =====================================================================

export function checkLowSupply(medication: Medication): {
  isLow: boolean;
  daysRemaining: number;
  pillsRemaining: number;
} {
  if (!medication.currentPillCount) {
    return { isLow: false, daysRemaining: 0, pillsRemaining: 0 };
  }

  // Calculate doses per day from scheduledTimes
  const dosesPerDay = medication.scheduledTimes.length;
  const daysRemaining = Math.floor(medication.currentPillCount / dosesPerDay);
  const isLow = daysRemaining <= medication.lowSupplyThreshold;

  return {
    isLow,
    daysRemaining,
    pillsRemaining: medication.currentPillCount,
  };
}

export function getAllLowSupplyMedications(userId: string): Array<{
  medication: Medication;
  supply: { isLow: boolean; daysRemaining: number; pillsRemaining: number };
}> {
  const medications = getMedications(userId);
  const lowSupply: Array<{
    medication: Medication;
    supply: { isLow: boolean; daysRemaining: number; pillsRemaining: number };
  }> = [];

  medications.forEach((med) => {
    const supply = checkLowSupply(med);
    if (supply.isLow) {
      lowSupply.push({ medication: med, supply });
    }
  });

  return lowSupply;
}

// =====================================================================
// SCHEDULED DOSE GENERATION
// =====================================================================

export function generateScheduledDoses(medication: Medication, date: Date): void {
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD

  medication.scheduledTimes.forEach((time) => {
    // Parse time (e.g., "08:00")
    const [hours, minutes] = time.split(':').map(Number);
    const scheduledTime = new Date(date);
    scheduledTime.setHours(hours, minutes, 0, 0);

    // Check if log already exists for this time
    const existingLog = medicationLogsDB.find(
      (l) =>
        l.medicationId === medication.id &&
        l.scheduledTime === scheduledTime.getTime()
    );

    if (!existingLog && scheduledTime.getTime() <= Date.now()) {
      // Create pending log for missed doses
      createMedicationLog(
        medication.id,
        scheduledTime.getTime(),
        Date.now()
      );
    }
  });
}

// =====================================================================
// PERSISTENCE (localStorage for demo)
// =====================================================================

function saveToDB() {
  localStorage.setItem('well-check-medications', JSON.stringify(medicationsDB));
  localStorage.setItem('well-check-medication-logs', JSON.stringify(medicationLogsDB));
}

export function loadFromDB() {
  try {
    const medications = localStorage.getItem('well-check-medications');
    const logs = localStorage.getItem('well-check-medication-logs');

    if (medications) medicationsDB = JSON.parse(medications);
    if (logs) medicationLogsDB = JSON.parse(logs);
  } catch (error) {
    console.error('Failed to load medication data:', error);
  }
}

export function clearDB() {
  medicationsDB = [];
  medicationLogsDB = [];
  localStorage.removeItem('well-check-medications');
  localStorage.removeItem('well-check-medication-logs');
}

// Initialize on import
loadFromDB();