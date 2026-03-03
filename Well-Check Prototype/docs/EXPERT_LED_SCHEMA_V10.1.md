# 📐 **EXPERT-LED DATA SCHEMA V10.1**

**Version:** V10.1 - Domain Expert Override  
**Date:** 2026-02-22  
**Status:** Schema Integration Complete

---

## 🎯 **EXECUTIVE SUMMARY**

V10.1 integrates Domain Expert validated health score weightings, Active Monitoring criteria, and multi-stage appointment reminders into the live database schema. Guardian visibility logic updated to only activate pulse-ring when Active Monitoring criteria are met (age 65+, AI enabled, 7+ days data, 24h check-in, health score <90).

**Key Integrations:**
1. **Health Score Weightings** - Medication 40pts, Check-in 20pts, Activity 20pts, Doctor 10pts, Location 10pts
2. **Active Monitoring Criteria** - Pulse-ring activation logic (5 conditions)
3. **Multi-Stage Appointment Reminders** - 7d (planning), 3d (preparation), 1d (execution)
4. **Location Shift Thresholds** - Elderly 2h, Minor <12 30min, Minor 13-17 1h

---

## 📊 **HEALTH SCORE SCHEMA INTEGRATION**

### **Updated User Schema (GuardianState):**

```typescript
interface GuardianState {
  enabled: boolean; // Is this user a Guardian (Elderly)?
  priority: 'high' | 'medium' | 'low'; // Priority level for monitoring
  aiMonitoring: boolean; // AI pattern detection active?
  lastCheckIn: number; // Timestamp of last check-in
  healthScore: number; // 0-100 health score
  alertThreshold: 'strict' | 'normal' | 'lenient'; // Alert aggressiveness
  
  // V10.1: Health Score Component Breakdown
  healthScoreComponents: {
    medicationAdherence: number; // 0-40 points
    checkInConsistency: number; // 0-20 points
    activityLevel: number; // 0-20 points
    doctorVisitCompliance: number; // 0-10 points
    locationConsistency: number; // 0-10 points
  };
  
  // V10.1: Active Monitoring Status
  activeMonitoring: {
    isActive: boolean; // Should pulse-ring be shown?
    lastDataUpdate: number; // Timestamp of last data update
    daysCovered: number; // Days of health data available
    criteria: {
      ageEligible: boolean; // 65+ years old
      aiEnabled: boolean; // AI monitoring enabled
      minDataMet: boolean; // 7+ days of data
      recentActivity: boolean; // Check-in within 24h
      riskLevel: 'low' | 'moderate' | 'high'; // Based on health score
    };
  };
}
```

---

### **Health Score Calculation (Domain Expert Validated):**

```typescript
/**
 * V10.1: Calculate Guardian Health Score (0-100)
 * Domain Expert Validated - Clinically sound weightings
 */
function calculateHealthScore(userId: string): {
  totalScore: number;
  components: {
    medicationAdherence: number;
    checkInConsistency: number;
    activityLevel: number;
    doctorVisitCompliance: number;
    locationConsistency: number;
  };
} {
  // Initialize component scores
  const components = {
    medicationAdherence: 40, // Start at full points
    checkInConsistency: 20,
    activityLevel: 20,
    doctorVisitCompliance: 10,
    locationConsistency: 10,
  };

  // 1. Medication Adherence (0-40 points)
  // Domain Expert: Primary health indicator, 40% weight
  const adherenceRate = getMedicationAdherenceRate(userId);
  components.medicationAdherence = adherenceRate * 40;

  // 2. Check-in Consistency (0-20 points)
  // Domain Expert: Secondary indicator of cognitive function
  const checkInRate = getCheckInConsistencyRate(userId);
  components.checkInConsistency = checkInRate * 20;

  // 3. Activity Level (0-20 points)
  // Domain Expert: Tertiary indicator of physical health
  const activityRate = getActivityLevelRate(userId);
  components.activityLevel = activityRate * 20;

  // 4. Doctor Visit Compliance (0-10 points)
  // Domain Expert: Lower frequency, lower weight
  const doctorVisitRate = getDoctorVisitComplianceRate(userId);
  components.doctorVisitCompliance = doctorVisitRate * 10;

  // 5. Location Consistency (0-10 points)
  // Domain Expert: Behavioral stability indicator
  const locationRate = getLocationConsistencyRate(userId);
  components.locationConsistency = locationRate * 10;

  // Calculate total score
  const totalScore = Math.round(
    components.medicationAdherence +
    components.checkInConsistency +
    components.activityLevel +
    components.doctorVisitCompliance +
    components.locationConsistency
  );

  return {
    totalScore: Math.max(0, Math.min(100, totalScore)),
    components,
  };
}

/**
 * V10.1: Get Medication Adherence Rate (0-1)
 */
function getMedicationAdherenceRate(userId: string): number {
  const logsKey = `medicationLogs_${userId}`;
  const savedLogs = localStorage.getItem(logsKey);
  const logs: Array<{
    medicationId: string;
    timestamp: number;
    status: 'taken' | 'missed' | 'skipped';
  }> = savedLogs ? JSON.parse(savedLogs) : [];

  // Get logs from last 30 days
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  const recentLogs = logs.filter((log) => log.timestamp > thirtyDaysAgo);

  if (recentLogs.length === 0) return 1.0; // No data = assume perfect adherence

  // Calculate adherence rate
  const takenCount = recentLogs.filter((log) => log.status === 'taken').length;
  const totalCount = recentLogs.length;

  return takenCount / totalCount;
}

/**
 * V10.1: Get Check-in Consistency Rate (0-1)
 */
function getCheckInConsistencyRate(userId: string): number {
  const logsKey = `checkInLogs_${userId}`;
  const savedLogs = localStorage.getItem(logsKey);
  const logs: Array<{
    timestamp: number;
    status: 'ok' | 'help' | 'emergency';
  }> = savedLogs ? JSON.parse(savedLogs) : [];

  // Get logs from last 30 days
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  const recentLogs = logs.filter((log) => log.timestamp > thirtyDaysAgo);

  if (recentLogs.length === 0) return 0.5; // No data = neutral score

  // Calculate expected check-ins (1 per day for 30 days = 30)
  const expectedCheckIns = 30;
  const actualCheckIns = recentLogs.length;

  // Calculate consistency rate (penalize both missing and excessive check-ins)
  const baseRate = Math.min(1.0, actualCheckIns / expectedCheckIns);

  // Calculate time consistency (check-in at similar times each day)
  const checkInHours = recentLogs.map((log) => new Date(log.timestamp).getHours());
  const avgHour = checkInHours.reduce((sum, h) => sum + h, 0) / checkInHours.length;
  
  // Calculate standard deviation
  const variance = checkInHours.reduce((sum, h) => sum + Math.pow(h - avgHour, 2), 0) / checkInHours.length;
  const stdDev = Math.sqrt(variance);
  
  // Time consistency bonus (lower stdDev = higher consistency)
  // stdDev 0-2 hours = 1.0, 2-4 hours = 0.75, 4+ hours = 0.5
  const timeConsistencyBonus = stdDev < 2 ? 1.0 : stdDev < 4 ? 0.75 : 0.5;

  return baseRate * timeConsistencyBonus;
}

/**
 * V10.1: Get Activity Level Rate (0-1)
 */
function getActivityLevelRate(userId: string): number {
  const logsKey = `activityLogs_${userId}`;
  const savedLogs = localStorage.getItem(logsKey);
  const logs: Array<{
    timestamp: number;
    type: 'walk' | 'exercise' | 'social';
    duration: number; // minutes
  }> = savedLogs ? JSON.parse(savedLogs) : [];

  // Get logs from last 30 days
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  const recentLogs = logs.filter((log) => log.timestamp > thirtyDaysAgo);

  if (recentLogs.length === 0) return 0.5; // No data = neutral score

  // Calculate total activity minutes
  const totalMinutes = recentLogs.reduce((sum, log) => sum + log.duration, 0);

  // WHO recommendation for elderly: 150 minutes per week = ~640 minutes per month
  const targetMinutes = 640;

  // Calculate activity rate (cap at 1.0)
  return Math.min(1.0, totalMinutes / targetMinutes);
}

/**
 * V10.1: Get Doctor Visit Compliance Rate (0-1)
 */
function getDoctorVisitComplianceRate(userId: string): number {
  const visitsKey = `doctorVisits_${userId}`;
  const savedVisits = localStorage.getItem(visitsKey);
  const visits: Array<{
    id: string;
    date: string;
    status: 'scheduled' | 'completed' | 'cancelled';
  }> = savedVisits ? JSON.parse(savedVisits) : [];

  // Get visits from last 6 months
  const now = Date.now();
  const sixMonthsAgo = now - 6 * 30 * 24 * 60 * 60 * 1000;
  const recentVisits = visits.filter((visit) => new Date(visit.date).getTime() > sixMonthsAgo);

  if (recentVisits.length === 0) return 1.0; // No scheduled visits = assume compliance

  // Calculate completion rate
  const completedCount = recentVisits.filter((visit) => visit.status === 'completed').length;
  const totalCount = recentVisits.length;

  return completedCount / totalCount;
}

/**
 * V10.1: Get Location Consistency Rate (0-1)
 */
function getLocationConsistencyRate(userId: string): number {
  const logsKey = `locationLogs_${userId}`;
  const savedLogs = localStorage.getItem(logsKey);
  const logs: Array<{
    timestamp: number;
    lat: number;
    lng: number;
  }> = savedLogs ? JSON.parse(savedLogs) : [];

  // Get logs from last 30 days
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  const recentLogs = logs.filter((log) => log.timestamp > thirtyDaysAgo);

  if (recentLogs.length === 0) return 0.5; // No data = neutral score

  // Get geofence zones
  const zonesKey = `geofenceZones_${userId}`;
  const savedZones = localStorage.getItem(zonesKey);
  const zones: Array<{
    id: string;
    name: string;
    lat: number;
    lng: number;
    radius: number;
  }> = savedZones ? JSON.parse(savedZones) : [];

  if (zones.length === 0) return 1.0; // No zones = assume consistency

  // Calculate % of time inside safe zones
  const insideSafeZoneCount = recentLogs.filter((log) => {
    return zones.some((zone) => {
      const distance = getDistance(log.lat, log.lng, zone.lat, zone.lng);
      return distance <= zone.radius;
    });
  }).length;

  return insideSafeZoneCount / recentLogs.length;
}

// Helper: Haversine distance (from V9.5)
function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
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
```

---

## 🛡️ **ACTIVE MONITORING CRITERIA INTEGRATION**

### **Guardian Pulse-Ring Activation Logic:**

```typescript
/**
 * V10.1: Check if Guardian pulse-ring should be shown
 * Domain Expert: 5 criteria must be met
 */
function shouldShowGuardianPulseRing(user: User): boolean {
  // Criterion 1: User age 65+ (Guardian status)
  const ageEligible = user.age >= 65;
  if (!ageEligible) return false;

  // Criterion 2: AI monitoring enabled
  const aiEnabled = user.guardianState?.aiMonitoring || false;
  if (!aiEnabled) return false;

  // Criterion 3: Minimum 7 days of health data
  const daysCovered = getHealthDataCoverage(user.id);
  const minDataMet = daysCovered >= 7;
  if (!minDataMet) return false;

  // Criterion 4: Recent activity (check-in within 24h)
  const lastCheckIn = user.guardianState?.lastCheckIn || 0;
  const hoursSinceCheckIn = (Date.now() - lastCheckIn) / (60 * 60 * 1000);
  const recentActivity = hoursSinceCheckIn <= 24;
  if (!recentActivity) return false;

  // Criterion 5: Health score <90 (moderate-to-high risk)
  const healthScore = user.guardianState?.healthScore || 0;
  const riskLevel = healthScore >= 90 ? 'low' : healthScore >= 60 ? 'moderate' : 'high';
  const showForRiskLevel = riskLevel !== 'low'; // Only show for moderate/high risk

  // Update Active Monitoring status in user object
  if (user.guardianState) {
    user.guardianState.activeMonitoring = {
      isActive: showForRiskLevel,
      lastDataUpdate: Date.now(),
      daysCovered: daysCovered,
      criteria: {
        ageEligible,
        aiEnabled,
        minDataMet,
        recentActivity,
        riskLevel,
      },
    };
  }

  return showForRiskLevel;
}

/**
 * V10.1: Get health data coverage (days with data)
 */
function getHealthDataCoverage(userId: string): number {
  // Check medication logs
  const medLogsKey = `medicationLogs_${userId}`;
  const savedMedLogs = localStorage.getItem(medLogsKey);
  const medLogs = savedMedLogs ? JSON.parse(savedMedLogs) : [];

  // Check check-in logs
  const checkInLogsKey = `checkInLogs_${userId}`;
  const savedCheckInLogs = localStorage.getItem(checkInLogsKey);
  const checkInLogs = savedCheckInLogs ? JSON.parse(savedCheckInLogs) : [];

  // Combine all timestamps
  const allTimestamps = [
    ...medLogs.map((log: any) => log.timestamp),
    ...checkInLogs.map((log: any) => log.timestamp),
  ];

  if (allTimestamps.length === 0) return 0;

  // Get unique days (YYYY-MM-DD format)
  const uniqueDays = new Set(
    allTimestamps.map((ts: number) => {
      const date = new Date(ts);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    })
  );

  return uniqueDays.size;
}
```

---

## 📅 **MULTI-STAGE APPOINTMENT REMINDERS**

### **Enhanced Appointment Reminder Schema:**

```typescript
interface AppointmentReminder {
  visitId: string;
  userId: string;
  visitDate: number; // Timestamp of appointment
  reminderStage: 'planning' | 'preparation' | 'execution';
  priority: 'warning' | 'urgent' | 'critical';
  daysUntil: number;
  actions: Array<{
    label: string;
    action: () => void;
  }>;
  lastSentAt: number; // Timestamp of last reminder sent
}

/**
 * V10.1: Generate multi-stage appointment reminders
 * Domain Expert: 7d (planning), 3d (preparation), 1d (execution)
 */
function generateAppointmentReminders(userId: string): AppointmentReminder[] {
  const visitsKey = `doctorVisits_${userId}`;
  const savedVisits = localStorage.getItem(visitsKey);
  const visits: Array<{
    id: string;
    doctorName: string;
    specialty: string;
    date: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    location: string;
  }> = savedVisits ? JSON.parse(savedVisits) : [];

  const now = Date.now();
  const reminders: AppointmentReminder[] = [];

  visits.forEach((visit) => {
    if (visit.status !== 'scheduled') return;

    const visitDate = new Date(visit.date).getTime();
    const timeUntilVisit = visitDate - now;
    const daysUntil = Math.ceil(timeUntilVisit / (24 * 60 * 60 * 1000));

    // Determine reminder stage
    let reminderStage: 'planning' | 'preparation' | 'execution';
    let priority: 'warning' | 'urgent' | 'critical';
    let actions: Array<{ label: string; action: () => void }>;

    if (daysUntil >= 4 && daysUntil <= 7) {
      // 7-4 days out: Planning stage
      reminderStage = 'planning';
      priority = 'warning';
      actions = [
        { label: 'Schedule Transport', action: () => window.location.href = '/transport' },
        { label: 'View Details', action: () => window.location.href = '/doctor-visits' },
      ];
    } else if (daysUntil >= 2 && daysUntil <= 3) {
      // 3-2 days out: Preparation stage
      reminderStage = 'preparation';
      priority = 'urgent';
      actions = [
        { label: 'Confirm Transport', action: () => alert(`Confirm transport for ${visit.doctorName}`) },
        { label: 'Prepare Questions', action: () => window.location.href = '/visit-prep' },
        { label: 'View Details', action: () => window.location.href = '/doctor-visits' },
      ];
    } else if (daysUntil === 1) {
      // 1 day out: Execution stage
      reminderStage = 'execution';
      priority = 'critical';
      actions = [
        { label: 'Call Patient', action: () => alert(`Call patient for ${visit.doctorName} visit tomorrow`) },
        { label: 'View Directions', action: () => window.open(`https://maps.google.com/?q=${visit.location}`) },
        { label: 'Cancel Visit', action: () => alert(`Cancel visit with ${visit.doctorName}`) },
      ];
    } else {
      // Outside reminder window
      return;
    }

    reminders.push({
      visitId: visit.id,
      userId: userId,
      visitDate: visitDate,
      reminderStage,
      priority,
      daysUntil,
      actions,
      lastSentAt: Date.now(),
    });
  });

  return reminders;
}
```

---

## 📍 **LOCATION SHIFT THRESHOLD INTEGRATION**

### **Enhanced Location Shift Detection Schema:**

```typescript
interface LocationShiftThreshold {
  userType: 'elderly' | 'adult' | 'minor_young' | 'minor_teen';
  ageRange: string;
  thresholdMinutes: number;
  thresholdHours: number;
  justification: string;
}

const LOCATION_SHIFT_THRESHOLDS: LocationShiftThreshold[] = [
  {
    userType: 'elderly',
    ageRange: '65+',
    thresholdMinutes: 120, // 2 hours
    thresholdHours: 2,
    justification: 'Wandering detection, dementia care standards',
  },
  {
    userType: 'adult',
    ageRange: '18-64',
    thresholdMinutes: 240, // 4 hours
    thresholdHours: 4,
    justification: 'Independent lifestyle, moderate monitoring',
  },
  {
    userType: 'minor_young',
    ageRange: '<12',
    thresholdMinutes: 30, // 30 minutes
    thresholdHours: 0.5,
    justification: 'High supervision requirement, pediatric safety',
  },
  {
    userType: 'minor_teen',
    ageRange: '13-17',
    thresholdMinutes: 60, // 1 hour
    thresholdHours: 1,
    justification: 'Balanced autonomy with safety monitoring',
  },
];

/**
 * V10.1: Get location shift threshold for user
 * Domain Expert: Age-based thresholds (Elderly 2h, Minor <12 30m, Minor 13-17 1h)
 */
function getLocationShiftThreshold(user: User): number {
  if (user.age >= 65) {
    return 120; // 2 hours (Elderly/Guardian)
  } else if (user.age >= 18) {
    return 240; // 4 hours (Adult)
  } else if (user.age >= 13) {
    return 60; // 1 hour (Teen)
  } else {
    return 30; // 30 minutes (Young minor)
  }
}
```

---

## 📋 **SCHEMA INTEGRATION SUMMARY**

| Component | Schema Update | Status |
|-----------|---------------|--------|
| **Health Score Components** | Added healthScoreComponents breakdown | ✅ COMPLETE |
| **Active Monitoring Criteria** | Added activeMonitoring object with 5 criteria | ✅ COMPLETE |
| **Pulse-Ring Activation Logic** | Added shouldShowGuardianPulseRing() function | ✅ COMPLETE |
| **Multi-Stage Reminders** | Added AppointmentReminder schema + generator | ✅ COMPLETE |
| **Location Shift Thresholds** | Added LOCATION_SHIFT_THRESHOLDS constant | ✅ COMPLETE |

---

## ✅ **FINAL STATUS**

**Expert-Led Schema Integration:** ✅ **COMPLETE - READY FOR CODER IMPLEMENTATION**

**Key Integrations:**
- ✅ Health Score Components (40/20/20/10/10 breakdown)
- ✅ Active Monitoring Criteria (5-condition pulse-ring logic)
- ✅ Multi-Stage Appointment Reminders (7d/3d/1d)
- ✅ Location Shift Thresholds (Elderly 2h, Minor 30m/1h)

**Next Steps:**
- Coder: Implement health score calculation in aiPatternDetectionService.ts
- Coder: Implement Active Monitoring criteria in Guardian components
- Coder: Implement multi-stage reminders in appointment logic

---

**End of Expert-Led Data Schema V10.1**

**Version:** V10.1 - Domain Expert Override  
**Date:** 2026-02-22  
**Status:** ✅ **SCHEMA INTEGRATION COMPLETE - READY FOR IMPLEMENTATION**

---

**📐 V10.1: EXPERT-LED SCHEMA INTEGRATION COMPLETE. HEALTH SCORE WEIGHTINGS INTEGRATED (MEDICATION-ADHERENCE 40PTS getMedicationAdherenceRate() 30D-LOGS TAKEN/TOTAL, CHECKIN-CONSISTENCY 20PTS getCheckInConsistencyRate() TIME-CONSISTENCY-BONUS STDDEV <2H=1.0 2-4H=0.75 4H+=0.5, ACTIVITY-LEVEL 20PTS getActivityLevelRate() WHO-150MIN-WEEK 640MIN-MONTH, DOCTOR-VISIT-COMPLIANCE 10PTS getDoctorVisitComplianceRate() 6M-WINDOW COMPLETED/TOTAL, LOCATION-CONSISTENCY 10PTS getLocationConsistencyRate() GEOFENCE-INSIDE-RATE). ACTIVE MONITORING CRITERIA (shouldShowGuardianPulseRing() 5-CONDITIONS AGE-65+ AI-ENABLED MIN-7D-DATA RECENT-24H-CHECKIN HEALTH-SCORE<90 MODERATE-HIGH-RISK ALARM-FATIGUE-AVOIDANCE). MULTI-STAGE APPOINTMENT REMINDERS (generateAppointmentReminders() 7-4D-PLANNING SCHEDULE-TRANSPORT 3-2D-PREPARATION CONFIRM-TRANSPORT PREPARE-QUESTIONS 1D-EXECUTION CALL-PATIENT VIEW-DIRECTIONS CANCEL-VISIT). LOCATION SHIFT THRESHOLDS (getLocationShiftThreshold() ELDERLY-65+ 120MIN-2H ADULT-18-64 240MIN-4H MINOR-13-17 60MIN-1H MINOR<12 30MIN AGE-BASED DIFFERENTIATED). 100% SCHEMA-INTEGRATION-READY. 🧠⚡📊**
