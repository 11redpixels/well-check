// 🛡️ Doctor Visit Service - Geofence & Appointment Management
// Chief Architect: Geofence system, auto-check-in logic, appointment schema
// Reference: prd.md #43-49, ai-domain-expert.md (Geofence Law)

import type {
  DoctorVisit,
  AppointmentStatus,
  GeofenceStatus,
  Location,
} from '../types';
import { GEOFENCE_CONFIG } from '../types';

// =====================================================================
// DATABASE LAYER (Mock - In production: Supabase)
// =====================================================================

let doctorVisitsDB: DoctorVisit[] = [];

// =====================================================================
// GEOFENCE UTILITIES
// =====================================================================

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * Returns distance in meters
 */
export function calculateDistance(loc1: Location, loc2: Location): number {
  const R = 6371000; // Earth's radius in meters
  const lat1Rad = (loc1.lat * Math.PI) / 180;
  const lat2Rad = (loc2.lat * Math.PI) / 180;
  const deltaLat = ((loc2.lat - loc1.lat) * Math.PI) / 180;
  const deltaLng = ((loc2.lng - loc1.lng) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

/**
 * Validate GPS accuracy meets ±10m threshold (Geofence Law)
 * Prevents "drive-by" false positives
 */
export function validateGPSAccuracy(location: Location): {
  isValid: boolean;
  reason?: string;
} {
  if (location.accuracy > GEOFENCE_CONFIG.ACCURACY_THRESHOLD_METERS) {
    return {
      isValid: false,
      reason: `GPS accuracy too low (${location.accuracy.toFixed(0)}m). Required: ≤${GEOFENCE_CONFIG.ACCURACY_THRESHOLD_METERS}m`,
    };
  }

  return { isValid: true };
}

/**
 * Determine geofence status based on user location and appointment location
 */
export function calculateGeofenceStatus(
  userLocation: Location,
  clinicLocation: Location,
  geofenceRadius: number
): GeofenceStatus {
  const distance = calculateDistance(userLocation, clinicLocation);

  if (distance <= geofenceRadius) {
    return 'inside'; // Within 0.5 mile geofence
  } else if (distance <= GEOFENCE_CONFIG.APPROACHING_RADIUS_METERS) {
    return 'approaching'; // Within 1 mile, but outside geofence
  } else {
    return 'outside'; // Far from appointment
  }
}

/**
 * Check if auto-check-in should trigger
 * Requirements:
 * 1. User within geofence radius
 * 2. GPS accuracy ≤ 10m (Geofence Law)
 * 3. Appointment status is 'scheduled' or 'en_route' or 'late'
 * 4. Within appointment window (up to 2 hours after scheduled time)
 */
export function shouldAutoCheckIn(
  visit: DoctorVisit,
  userLocation: Location
): {
  shouldCheckIn: boolean;
  reason?: string;
} {
  // Check GPS accuracy first (Geofence Law)
  const accuracyCheck = validateGPSAccuracy(userLocation);
  if (!accuracyCheck.isValid) {
    return { shouldCheckIn: false, reason: accuracyCheck.reason };
  }

  // Check geofence status
  const geofenceStatus = calculateGeofenceStatus(
    userLocation,
    visit.clinicLocation,
    visit.geofenceRadius
  );

  if (geofenceStatus !== 'inside') {
    return { shouldCheckIn: false, reason: 'Not within geofence radius' };
  }

  // Check appointment status
  if (!['scheduled', 'en_route', 'late'].includes(visit.status)) {
    return { shouldCheckIn: false, reason: `Appointment status is ${visit.status}` };
  }

  // Check appointment window (not more than 2 hours past)
  const appointmentTimestamp = visit.appointmentDate;
  const maxCheckInTime = appointmentTimestamp + GEOFENCE_CONFIG.AUTO_COMPLETE_HOURS * 60 * 60 * 1000;

  if (Date.now() > maxCheckInTime) {
    return { shouldCheckIn: false, reason: 'Appointment window expired' };
  }

  return { shouldCheckIn: true };
}

// =====================================================================
// DOCTOR VISIT CRUD
// =====================================================================

export function createDoctorVisit(
  userId: string,
  tenantId: string,
  createdByUserId: string,
  data: {
    doctorName: string;
    specialty?: string;
    appointmentDate: number;
    appointmentTime: string;
    duration?: number;
    notes?: string;
    clinicName: string;
    clinicAddress: string;
    clinicLocation: Location;
    geofenceRadius?: number;
    doctorPhone?: string;
    clinicPhone?: string;
    assignedMonitorIds: string[];
  }
): DoctorVisit {
  const visit: DoctorVisit = {
    id: `visit-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    tenantId,
    userId,
    doctorName: data.doctorName,
    specialty: data.specialty,
    appointmentDate: data.appointmentDate,
    appointmentTime: data.appointmentTime,
    duration: data.duration || 60,
    notes: data.notes,
    clinicName: data.clinicName,
    clinicAddress: data.clinicAddress,
    clinicLocation: data.clinicLocation,
    geofenceRadius: data.geofenceRadius || GEOFENCE_CONFIG.DEFAULT_RADIUS_METERS,
    doctorPhone: data.doctorPhone,
    clinicPhone: data.clinicPhone,
    status: 'scheduled',
    assignedMonitorIds: data.assignedMonitorIds,
    createdByUserId,
    isCancelled: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  doctorVisitsDB.push(visit);
  saveToDB();
  return visit;
}

export function getDoctorVisits(userId?: string): DoctorVisit[] {
  if (userId) {
    return doctorVisitsDB.filter((v) => v.userId === userId && !v.isCancelled);
  }
  return doctorVisitsDB.filter((v) => !v.isCancelled);
}

export function getUpcomingVisits(userId: string): DoctorVisit[] {
  const now = Date.now();
  return doctorVisitsDB.filter(
    (v) =>
      v.userId === userId &&
      !v.isCancelled &&
      v.status !== 'completed' &&
      v.status !== 'no_show' &&
      v.appointmentDate >= now - 2 * 60 * 60 * 1000 // Include visits up to 2 hours in past
  );
}

export function getDoctorVisitById(visitId: string): DoctorVisit | undefined {
  return doctorVisitsDB.find((v) => v.id === visitId);
}

export function updateDoctorVisit(visitId: string, updates: Partial<DoctorVisit>): DoctorVisit | null {
  const index = doctorVisitsDB.findIndex((v) => v.id === visitId);
  if (index === -1) return null;

  doctorVisitsDB[index] = {
    ...doctorVisitsDB[index],
    ...updates,
    updatedAt: Date.now(),
  };

  saveToDB();
  return doctorVisitsDB[index];
}

export function cancelDoctorVisit(visitId: string): boolean {
  const visit = getDoctorVisitById(visitId);
  if (!visit) return false;

  updateDoctorVisit(visitId, {
    status: 'cancelled',
    isCancelled: true,
  });

  return true;
}

// =====================================================================
// AUTO-CHECK-IN LOGIC
// =====================================================================

/**
 * Process geofence check for a visit
 * Called by background service or on-demand location update
 */
export function processGeofenceCheck(
  visitId: string,
  userLocation: Location
): {
  updated: boolean;
  visit: DoctorVisit | null;
  action?: 'checked_in' | 'approaching' | 'departed';
  reason?: string;
} {
  const visit = getDoctorVisitById(visitId);
  if (!visit) {
    return { updated: false, visit: null, reason: 'Visit not found' };
  }

  // Calculate geofence status
  const geofenceStatus = calculateGeofenceStatus(
    userLocation,
    visit.clinicLocation,
    visit.geofenceRadius
  );

  // Update geofence status
  updateDoctorVisit(visitId, { geofenceStatus });

  // Check if auto-check-in should trigger
  const checkInCheck = shouldAutoCheckIn(visit, userLocation);

  if (checkInCheck.shouldCheckIn) {
    // Trigger auto-check-in
    const updated = updateDoctorVisit(visitId, {
      status: 'arrived',
      arrivedAt: Date.now(),
      arrivedLocation: userLocation,
      geofenceStatus: 'inside',
    });

    console.log('✅ Auto-check-in triggered', {
      visitId,
      userId: visit.userId,
      clinicName: visit.clinicName,
      arrivedAt: new Date().toISOString(),
      accuracy: userLocation.accuracy,
    });

    return { updated: true, visit: updated, action: 'checked_in' };
  }

  // Check if user departed after arrival
  if (visit.status === 'arrived' && geofenceStatus === 'outside') {
    const updated = updateDoctorVisit(visitId, {
      departedAt: Date.now(),
      geofenceStatus: 'departed',
    });

    return { updated: true, visit: updated, action: 'departed' };
  }

  // Check if approaching
  if (geofenceStatus === 'approaching' && visit.status === 'scheduled') {
    const updated = updateDoctorVisit(visitId, {
      status: 'en_route',
      geofenceStatus: 'approaching',
    });

    return { updated: true, visit: updated, action: 'approaching' };
  }

  return {
    updated: false,
    visit,
    reason: checkInCheck.reason || 'No status change',
  };
}

/**
 * Process all upcoming visits for a user
 * Called by background service
 */
export function processAllGeofenceChecks(
  userId: string,
  userLocation: Location
): Array<{
  visitId: string;
  updated: boolean;
  action?: string;
  reason?: string;
}> {
  const upcomingVisits = getUpcomingVisits(userId);
  const results: Array<{
    visitId: string;
    updated: boolean;
    action?: string;
    reason?: string;
  }> = [];

  upcomingVisits.forEach((visit) => {
    const result = processGeofenceCheck(visit.id, userLocation);
    results.push({
      visitId: visit.id,
      updated: result.updated,
      action: result.action,
      reason: result.reason,
    });
  });

  return results;
}

// =====================================================================
// LATE ARRIVAL DETECTION
// =====================================================================

/**
 * Check for late arrivals and send alerts
 * Called by background timer every minute
 */
export function checkLateArrivals(): DoctorVisit[] {
  const now = Date.now();
  const lateVisits: DoctorVisit[] = [];

  doctorVisitsDB.forEach((visit) => {
    // Skip if not scheduled/en_route or already marked late
    if (!['scheduled', 'en_route'].includes(visit.status)) return;
    if (visit.lateAlertSentAt) return; // Already sent alert

    // Check if 15+ minutes past appointment time
    const lateThreshold = visit.appointmentDate + GEOFENCE_CONFIG.LATE_ALERT_MINUTES * 60 * 1000;

    if (now >= lateThreshold) {
      // Mark as late and record alert time
      const updated = updateDoctorVisit(visit.id, {
        status: 'late',
        lateAlertSentAt: now,
      });

      if (updated) {
        lateVisits.push(updated);
        console.log('⚠️ Late arrival alert', {
          visitId: visit.id,
          userId: visit.userId,
          clinicName: visit.clinicName,
          minutesLate: Math.floor((now - visit.appointmentDate) / 60000),
        });
      }
    }
  });

  return lateVisits;
}

// =====================================================================
// AUTO-COMPLETION
// =====================================================================

/**
 * Auto-complete visits that have departed and passed completion window
 * Called by background timer
 */
export function autoCompleteVisits(): DoctorVisit[] {
  const now = Date.now();
  const completedVisits: DoctorVisit[] = [];

  doctorVisitsDB.forEach((visit) => {
    // Only process arrived visits that have departed
    if (visit.status !== 'arrived' || !visit.departedAt) return;

    // Check if auto-completion window has passed
    const completionThreshold =
      visit.appointmentDate + GEOFENCE_CONFIG.AUTO_COMPLETE_HOURS * 60 * 60 * 1000;

    if (now >= completionThreshold) {
      const updated = updateDoctorVisit(visit.id, {
        status: 'completed',
      });

      if (updated) {
        completedVisits.push(updated);
        console.log('✅ Auto-completed visit', {
          visitId: visit.id,
          userId: visit.userId,
          clinicName: visit.clinicName,
        });
      }
    }
  });

  return completedVisits;
}

// =====================================================================
// MANUAL ACTIONS
// =====================================================================

export function manualCheckIn(
  visitId: string,
  userLocation: Location,
  confirmedByUserId: string
): DoctorVisit | null {
  const visit = getDoctorVisitById(visitId);
  if (!visit) return null;

  return updateDoctorVisit(visitId, {
    status: 'arrived',
    arrivedAt: Date.now(),
    arrivedLocation: userLocation,
  });
}

export function markCompleted(
  visitId: string,
  confirmedByUserId: string
): DoctorVisit | null {
  return updateDoctorVisit(visitId, {
    status: 'completed',
  });
}

export function markNoShow(
  visitId: string,
  confirmedByUserId: string
): DoctorVisit | null {
  return updateDoctorVisit(visitId, {
    status: 'no_show',
  });
}

// =====================================================================
// PERSISTENCE (localStorage for demo)
// =====================================================================

function saveToDB() {
  localStorage.setItem('well-check-doctor-visits', JSON.stringify(doctorVisitsDB));
}

export function loadFromDB() {
  try {
    const visits = localStorage.getItem('well-check-doctor-visits');
    if (visits) doctorVisitsDB = JSON.parse(visits);
  } catch (error) {
    console.error('Failed to load doctor visits:', error);
  }
}

export function clearDB() {
  doctorVisitsDB = [];
  localStorage.removeItem('well-check-doctor-visits');
}

// Initialize on import
loadFromDB();
