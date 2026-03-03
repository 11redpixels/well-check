// 🧠 AI Pattern Detection Service - V9.5
// Mandate: Detect medication adherence patterns, doctor visit reminders, abnormal shifts
// Reference: V9.4 AI Insight Toast Architecture

import type { AIInsight } from '../components/AIInsightToast';
import type { Medication } from '../types';
import { getMedications } from './medicationService';

// V9.5: Pattern Detection Configuration
const PATTERN_CONFIG = {
  MISSED_MED_THRESHOLD: 2, // 2+ missed doses in 24h triggers alert
  DOCTOR_VISIT_REMINDER_DAYS: 7, // Remind 7 days before visit
  FREQUENCY_LIMIT_HOUR: 3, // Max 3 insights per hour
  FREQUENCY_LIMIT_DAY: 10, // Max 10 insights per day
  DEDUP_WINDOW_HOURS: 24, // Deduplicate same insight within 24h
};

// V9.5: Insight History (in-memory store for frequency limiting)
// In production, this would be in a database or localStorage
let insightHistory: Array<{
  type: string;
  timestamp: number;
  userId: string;
}> = [];

// Load from localStorage on init
if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('aiInsightHistory');
  if (saved) {
    insightHistory = JSON.parse(saved);
    // Clean old entries (>24h)
    const now = Date.now();
    insightHistory = insightHistory.filter(
      (h) => now - h.timestamp < 24 * 60 * 60 * 1000
    );
  }
}

/**
 * V9.5: Check if insight should be shown based on frequency limits
 */
function canShowInsight(type: string, userId: string): boolean {
  const now = Date.now();
  const hourAgo = now - 60 * 60 * 1000;
  const dayAgo = now - 24 * 60 * 60 * 1000;

  // Count insights in last hour
  const hourCount = insightHistory.filter(
    (h) => h.userId === userId && h.timestamp > hourAgo
  ).length;

  // Count insights in last day
  const dayCount = insightHistory.filter(
    (h) => h.userId === userId && h.timestamp > dayAgo
  ).length;

  // Check deduplication (same type within 24h)
  const hasDuplicate = insightHistory.some(
    (h) =>
      h.type === type &&
      h.userId === userId &&
      now - h.timestamp < PATTERN_CONFIG.DEDUP_WINDOW_HOURS * 60 * 60 * 1000
  );

  // Allow if under limits and no duplicate
  return (
    hourCount < PATTERN_CONFIG.FREQUENCY_LIMIT_HOUR &&
    dayCount < PATTERN_CONFIG.FREQUENCY_LIMIT_DAY &&
    !hasDuplicate
  );
}

/**
 * V9.5: Record insight shown (for frequency limiting)
 */
function recordInsight(type: string, userId: string) {
  insightHistory.push({
    type,
    timestamp: Date.now(),
    userId,
  });

  // Persist to localStorage
  localStorage.setItem('aiInsightHistory', JSON.stringify(insightHistory));
}

/**
 * V9.5: Detect Missed Medication Pattern
 * 
 * Logic: If a user missed 2+ doses of any medication in the last 24h,
 * trigger a critical AI insight alert.
 */
export function detectMissedMedicationPattern(
  userId: string,
  userName: string
): AIInsight | null {
  // Get all medications for user
  const medications = getMedications(userId);
  if (!medications || medications.length === 0) {
    return null;
  }

  // Get medication logs from localStorage
  const logsKey = `medicationLogs_${userId}`;
  const savedLogs = localStorage.getItem(logsKey);
  const logs: Array<{
    medicationId: string;
    medicationName: string;
    timestamp: number;
    status: 'taken' | 'missed' | 'skipped';
  }> = savedLogs ? JSON.parse(savedLogs) : [];

  // Count missed doses in last 24h
  const now = Date.now();
  const dayAgo = now - 24 * 60 * 60 * 1000;
  const missedInLast24h = logs.filter(
    (log) => log.status === 'missed' && log.timestamp > dayAgo
  );

  // Trigger if 2+ missed doses
  if (missedInLast24h.length >= PATTERN_CONFIG.MISSED_MED_THRESHOLD) {
    // Check frequency limits
    if (!canShowInsight('medication-missed', userId)) {
      return null; // Suppressed due to frequency limit
    }

    // Get most frequently missed medication
    const medicationCounts: Record<string, number> = {};
    missedInLast24h.forEach((log) => {
      medicationCounts[log.medicationName] =
        (medicationCounts[log.medicationName] || 0) + 1;
    });

    const mostMissed = Object.entries(medicationCounts).sort(
      ([, a], [, b]) => b - a
    )[0];

    const [medicationName, missedCount] = mostMissed;

    // Record insight
    recordInsight('medication-missed', userId);

    // Return AI insight
    return {
      id: `insight-med-missed-${Date.now()}`,
      type: 'medication-missed',
      priority: 'critical',
      title: 'Pattern Detected: Medication Missed',
      message: `${userName} missed ${missedCount} dose${
        missedCount > 1 ? 's' : ''
      } of ${medicationName} today.`,
      actions: [
        {
          label: 'View Details',
          action: () => {
            window.location.href = '/medication';
          },
        },
        {
          label: 'Remind Now',
          action: () => {
            // In production: Send push notification
            alert(`Push notification sent to ${userName}: "Take ${medicationName}"`);
          },
        },
      ],
      timestamp: Date.now(),
    };
  }

  return null;
}

/**
 * V9.5: Detect Doctor Visit Due Pattern
 * 
 * Logic: If a doctor visit is scheduled within 7 days, trigger a warning AI insight.
 */
export function detectDoctorVisitDuePattern(
  userId: string,
  userName: string
): AIInsight | null {
  // Get doctor visits from localStorage
  const visitsKey = `doctorVisits_${userId}`;
  const savedVisits = localStorage.getItem(visitsKey);
  const visits: Array<{
    id: string;
    doctorName: string;
    specialty: string;
    date: string;
    status: 'scheduled' | 'completed' | 'cancelled';
  }> = savedVisits ? JSON.parse(savedVisits) : [];

  // Find upcoming visits within 7 days
  const now = Date.now();
  const in7Days = now + 7 * 24 * 60 * 60 * 1000;

  const upcomingVisits = visits.filter((visit) => {
    if (visit.status !== 'scheduled') return false;
    const visitDate = new Date(visit.date).getTime();
    return visitDate > now && visitDate <= in7Days;
  });

  if (upcomingVisits.length > 0) {
    const nextVisit = upcomingVisits.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )[0];

    // Check frequency limits
    if (!canShowInsight('doctor-visit-due', userId)) {
      return null; // Suppressed
    }

    // Calculate days until visit
    const daysUntil = Math.ceil(
      (new Date(nextVisit.date).getTime() - now) / (24 * 60 * 60 * 1000)
    );

    // Record insight
    recordInsight('doctor-visit-due', userId);

    // Return AI insight
    return {
      id: `insight-doctor-visit-${Date.now()}`,
      type: 'doctor-visit-due',
      priority: 'warning',
      title: 'Doctor Visit Coming Up',
      message: `${userName} has a ${nextVisit.specialty} visit with Dr. ${
        nextVisit.doctorName
      } in ${daysUntil} day${daysUntil > 1 ? 's' : ''}.`,
      actions: [
        {
          label: 'View Details',
          action: () => {
            window.location.href = '/doctor-visits';
          },
        },
      ],
      timestamp: Date.now(),
    };
  }

  return null;
}

/**
 * V9.5: Detect Abnormal Activity Pattern
 * 
 * Logic: If daily check-in time has shifted by 3+ hours from usual time,
 * trigger a warning AI insight.
 */
export function detectAbnormalPatternShift(
  userId: string,
  userName: string
): AIInsight | null {
  // Get check-in logs from localStorage
  const logsKey = `checkInLogs_${userId}`;
  const savedLogs = localStorage.getItem(logsKey);
  const logs: Array<{
    timestamp: number;
    status: 'ok' | 'help' | 'emergency';
  }> = savedLogs ? JSON.parse(savedLogs) : [];

  if (logs.length < 7) {
    return null; // Not enough data (need at least 7 days)
  }

  // Calculate average check-in hour
  const checkInHours = logs.map((log) => new Date(log.timestamp).getHours());
  const avgHour =
    checkInHours.reduce((sum, h) => sum + h, 0) / checkInHours.length;

  // Get last check-in hour
  const lastCheckInHour = new Date(logs[logs.length - 1].timestamp).getHours();

  // Check if shifted by 3+ hours
  const hourDiff = Math.abs(lastCheckInHour - avgHour);

  if (hourDiff >= 3) {
    // Check frequency limits
    if (!canShowInsight('abnormal-pattern', userId)) {
      return null; // Suppressed
    }

    // Record insight
    recordInsight('abnormal-pattern', userId);

    // Return AI insight
    return {
      id: `insight-abnormal-pattern-${Date.now()}`,
      type: 'abnormal-pattern',
      priority: 'warning',
      title: 'Activity Pattern Changed',
      message: `${userName}'s daily check-in time has shifted by ${Math.round(
        hourDiff
      )}+ hours from usual.`,
      actions: [
        {
          label: 'View Details',
          action: () => {
            window.location.href = '/analytics';
          },
        },
      ],
      timestamp: Date.now(),
    };
  }

  return null;
}

/**
 * V9.5: Detect Geofence Breach Pattern
 * 
 * Logic: If a user is outside their safe zone (geofence), trigger critical alert.
 */
export function detectGeofenceBreachPattern(
  userId: string,
  userName: string
): AIInsight | null {
  // Get geofence zones from localStorage
  const zonesKey = `geofenceZones_${userId}`;
  const savedZones = localStorage.getItem(zonesKey);
  const zones: Array<{
    id: string;
    name: string;
    lat: number;
    lng: number;
    radius: number; // meters
  }> = savedZones ? JSON.parse(savedZones) : [];

  if (zones.length === 0) {
    return null; // No geofence zones set
  }

  // Get current location from localStorage (demo)
  const locationKey = `currentLocation_${userId}`;
  const savedLocation = localStorage.getItem(locationKey);
  const currentLocation: { lat: number; lng: number } = savedLocation
    ? JSON.parse(savedLocation)
    : null;

  if (!currentLocation) {
    return null; // No location data
  }

  // Check if user is outside all safe zones
  const isInsideSafeZone = zones.some((zone) => {
    const distance = getDistance(
      currentLocation.lat,
      currentLocation.lng,
      zone.lat,
      zone.lng
    );
    return distance <= zone.radius;
  });

  if (!isInsideSafeZone) {
    // Check frequency limits
    if (!canShowInsight('geofence-breach', userId)) {
      return null; // Suppressed
    }

    // Record insight
    recordInsight('geofence-breach', userId);

    // Return AI insight
    return {
      id: `insight-geofence-breach-${Date.now()}`,
      type: 'geofence-breach',
      priority: 'critical',
      title: 'Outside Safe Zone',
      message: `${userName} is currently outside all designated safe zones.`,
      actions: [
        {
          label: 'View Map',
          action: () => {
            window.location.href = '/';
          },
        },
      ],
      timestamp: Date.now(),
    };
  }

  return null;
}

/**
 * V9.5: Detect Low Battery Pattern
 * 
 * Logic: If battery is below 20%, trigger info alert.
 */
export function detectLowBatteryPattern(
  userId: string,
  userName: string,
  batteryLevel: number
): AIInsight | null {
  if (batteryLevel < 20) {
    // Check frequency limits
    if (!canShowInsight('battery-low', userId)) {
      return null; // Suppressed
    }

    // Record insight
    recordInsight('battery-low', userId);

    // Return AI insight
    return {
      id: `insight-battery-low-${Date.now()}`,
      type: 'battery-low',
      priority: 'info',
      title: 'Battery Low',
      message: `${userName}'s battery is at ${batteryLevel}%. Charge device soon.`,
      actions: [],
      timestamp: Date.now(),
    };
  }

  return null;
}

/**
 * V9.5: Run All Pattern Detections (Elderly Role)
 * 
 * For Elderly users, prioritize:
 * 1. Medication missed (critical)
 * 2. Doctor visit due (warning)
 * 3. Abnormal pattern (warning)
 */
export function runElderlyPatternDetection(
  userId: string,
  userName: string,
  batteryLevel: number
): AIInsight | null {
  // Priority order: Medication > Doctor Visit > Abnormal Pattern > Battery

  // 1. Check medication missed (critical)
  const medicationInsight = detectMissedMedicationPattern(userId, userName);
  if (medicationInsight) {
    return medicationInsight;
  }

  // 2. Check doctor visit due (warning)
  const doctorVisitInsight = detectDoctorVisitDuePattern(userId, userName);
  if (doctorVisitInsight) {
    return doctorVisitInsight;
  }

  // 3. Check abnormal pattern (warning)
  const abnormalPatternInsight = detectAbnormalPatternShift(userId, userName);
  if (abnormalPatternInsight) {
    return abnormalPatternInsight;
  }

  // 4. Check battery low (info)
  const batteryInsight = detectLowBatteryPattern(userId, userName, batteryLevel);
  if (batteryInsight) {
    return batteryInsight;
  }

  return null; // No patterns detected
}

/**
 * V9.5: Run All Pattern Detections (Minor Role)
 * 
 * For Minors, prioritize:
 * 1. Geofence breach (critical)
 * 2. Abnormal pattern (warning)
 */
export function runMinorPatternDetection(
  userId: string,
  userName: string
): AIInsight | null {
  // Priority order: Geofence > Abnormal Pattern

  // 1. Check geofence breach (critical)
  const geofenceInsight = detectGeofenceBreachPattern(userId, userName);
  if (geofenceInsight) {
    return geofenceInsight;
  }

  // 2. Check abnormal pattern (warning)
  const abnormalPatternInsight = detectAbnormalPatternShift(userId, userName);
  if (abnormalPatternInsight) {
    return abnormalPatternInsight;
  }

  return null;
}

// Helper: Calculate distance between two lat/lng points (Haversine formula)
function getDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in meters
}
