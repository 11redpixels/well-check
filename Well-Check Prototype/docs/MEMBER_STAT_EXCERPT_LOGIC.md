# 🧠 **MEMBER-SPECIFIC HEALTH SUMMARIES - STAT EXCERPT LOGIC**

**Version:** V10.2 - Dashboard Deconstruction  
**Date:** 2026-02-22  
**Status:** Domain Expert Validation Complete

---

## 🎯 **EXECUTIVE SUMMARY**

V10.2 defines the critical single-line health status excerpts for individual member cards, replacing the global dashboard stats. Each member card displays the most important real-time health metric (medication adherence, upcoming appointments, check-in status) with color-coded Guardian badges indicating system monitoring status.

**Key Definitions:**
1. **Medication Excerpt** - "5/6 Doses" or "Next dose 2PM" (most critical info)
2. **Guardian Badge** - Green/Shield (active monitoring) or Gray/Empty (inactive/healthy)
3. **Priority Logic** - Medication > Appointments > Check-in > Activity

---

## 💊 **MEDICATION STAT EXCERPT LOGIC**

### **Purpose:**

Display the most critical medication status in a single line on the member card. Prioritize adherence data over schedule data.

---

### **Priority Order (Highest to Lowest):**

1. **Missed Dose Alert** (Critical - Red)
2. **Today's Adherence** (Warning - Amber)
3. **Next Scheduled Dose** (Info - Green)
4. **Weekly Adherence Rate** (Info - Gray)
5. **No Medication** (Neutral - Gray)

---

### **Excerpt Formats:**

**1. Missed Dose Alert (Critical):**
```
Status: User has missed 1+ doses today
Format: "⚠️ 1 Missed Dose" or "⚠️ 2 Missed Doses"
Color: Red (#FF4444)
Priority: CRITICAL (show immediately)
Action: "View Details" → Navigate to /medication
```

**Example:**
```
┌────────────────────────────────┐
│  Grandma Emma  [🛡️] Protected  │
│  ⚠️ 1 Missed Dose              │  ← Red text
│  [View Details]                │
└────────────────────────────────┘
```

---

**2. Today's Adherence (Warning):**
```
Status: User has taken some (but not all) doses today
Format: "5/6 Doses Today" or "2/3 Doses Today"
Color: Amber (#F59E0B) if <100%, Green (#84CC16) if 100%
Priority: WARNING (show if no critical alerts)
Action: "View Progress" → Navigate to /medication
```

**Example:**
```
┌────────────────────────────────┐
│  Sarah Chen  [○] Monitor       │
│  3/4 Doses Today               │  ← Amber text (75% adherence)
│  [View Progress]               │
└────────────────────────────────┘
```

---

**3. Next Scheduled Dose (Info):**
```
Status: User has completed today's doses, next dose scheduled
Format: "Next dose: 2:00 PM" or "Next dose: Tomorrow 8 AM"
Color: Green (#84CC16)
Priority: INFO (show if no critical/warning alerts)
Action: "View Schedule" → Navigate to /medication
```

**Example:**
```
┌────────────────────────────────┐
│  Grandma Emma  [🛡️] Protected  │
│  Next dose: 2:00 PM            │  ← Green text
│  [View Schedule]               │
└────────────────────────────────┘
```

---

**4. Weekly Adherence Rate (Info):**
```
Status: User has no upcoming doses today, show weekly adherence
Format: "95% Adherence (7 days)" or "100% Adherence (7 days)"
Color: Green (#84CC16) if ≥90%, Amber (#F59E0B) if 70-89%, Red (#FF4444) if <70%
Priority: INFO (show if no critical/warning/next dose alerts)
Action: "View History" → Navigate to /medication
```

**Example:**
```
┌────────────────────────────────┐
│  Sarah Chen  [○] Monitor       │
│  95% Adherence (7 days)        │  ← Green text
│  [View History]                │
└────────────────────────────────┘
```

---

**5. No Medication (Neutral):**
```
Status: User has no medication regimen configured
Format: "No medications" or "No active prescriptions"
Color: Gray (#94A3B8)
Priority: NEUTRAL (show if no medication data)
Action: "Add Medication" → Navigate to /medication
```

**Example:**
```
┌────────────────────────────────┐
│  Tommy Chen  [○] Minor         │
│  No medications                │  ← Gray text
│  [Add Medication]              │
└────────────────────────────────┘
```

---

### **Implementation Logic:**

```typescript
/**
 * V10.2: Get medication stat excerpt for member card
 * Domain Expert: Priority order (Missed > Today's > Next > Weekly > None)
 */
function getMedicationExcerpt(userId: string): {
  text: string;
  color: string;
  priority: 'critical' | 'warning' | 'info' | 'neutral';
  action: string;
  route: string;
} {
  // Get medication logs for today
  const todayLogs = getMedicationLogsToday(userId);
  const scheduledToday = getScheduledMedicationsToday(userId);

  // Priority 1: Missed Dose Alert (Critical)
  const missedToday = scheduledToday.filter(
    (med) => !todayLogs.some((log) => log.medicationId === med.id && log.status === 'taken')
  );
  if (missedToday.length > 0) {
    return {
      text: `⚠️ ${missedToday.length} Missed Dose${missedToday.length > 1 ? 's' : ''}`,
      color: '#FF4444', // Red
      priority: 'critical',
      action: 'View Details',
      route: '/medication',
    };
  }

  // Priority 2: Today's Adherence (Warning/Info)
  if (scheduledToday.length > 0) {
    const takenToday = todayLogs.filter((log) => log.status === 'taken').length;
    const adherenceRate = takenToday / scheduledToday.length;
    
    return {
      text: `${takenToday}/${scheduledToday.length} Doses Today`,
      color: adherenceRate === 1.0 ? '#84CC16' : '#F59E0B', // Green if 100%, Amber otherwise
      priority: adherenceRate === 1.0 ? 'info' : 'warning',
      action: 'View Progress',
      route: '/medication',
    };
  }

  // Priority 3: Next Scheduled Dose (Info)
  const nextDose = getNextScheduledDose(userId);
  if (nextDose) {
    const nextDoseTime = formatNextDoseTime(nextDose.scheduledTime);
    return {
      text: `Next dose: ${nextDoseTime}`,
      color: '#84CC16', // Green
      priority: 'info',
      action: 'View Schedule',
      route: '/medication',
    };
  }

  // Priority 4: Weekly Adherence Rate (Info)
  const weeklyAdherence = getWeeklyAdherenceRate(userId);
  if (weeklyAdherence !== null) {
    const adherencePercent = Math.round(weeklyAdherence * 100);
    let color: string;
    if (adherencePercent >= 90) color = '#84CC16'; // Green
    else if (adherencePercent >= 70) color = '#F59E0B'; // Amber
    else color = '#FF4444'; // Red

    return {
      text: `${adherencePercent}% Adherence (7 days)`,
      color: color,
      priority: 'info',
      action: 'View History',
      route: '/medication',
    };
  }

  // Priority 5: No Medication (Neutral)
  return {
    text: 'No medications',
    color: '#94A3B8', // Gray
    priority: 'neutral',
    action: 'Add Medication',
    route: '/medication',
  };
}

/**
 * Helper: Format next dose time (e.g., "2:00 PM", "Tomorrow 8 AM")
 */
function formatNextDoseTime(timestamp: number): string {
  const now = new Date();
  const nextDose = new Date(timestamp);

  const isToday = now.toDateString() === nextDose.toDateString();
  const isTomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString() === nextDose.toDateString();

  const timeStr = nextDose.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (isToday) return timeStr;
  if (isTomorrow) return `Tomorrow ${timeStr}`;
  return `${nextDose.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${timeStr}`;
}
```

---

## 🛡️ **GUARDIAN BADGE LOGIC**

### **Purpose:**

Visual indicator on member cards showing whether the user is under active Guardian system monitoring (age 65+, health score <90, AI enabled).

---

### **Badge States:**

**1. Active Monitoring (Green Shield):**
```
Icon: 🛡️ (Shield icon)
Color: Green (#84CC16)
Animation: Pulse-ring (2s infinite)
Condition: All 5 Active Monitoring Criteria met (from V10.1)
  - Age 65+
  - AI monitoring enabled
  - Minimum 7 days of health data
  - Recent check-in within 24h
  - Health score <90 (moderate-to-high risk)
```

**Example:**
```
┌────────────────────────────────┐
│  [🛡️] Grandma Emma  Protected  │  ← Green shield with pulse
│  Health Score: 85/100          │
│  System Monitoring Active      │
└────────────────────────────────┘
```

---

**2. Inactive Monitoring (Gray Empty Shield):**
```
Icon: ○ (Empty circle/shield outline)
Color: Gray (#64748B)
Animation: None
Condition: Any of the 5 criteria NOT met
  - Age <65 (not elderly)
  - AI monitoring disabled
  - <7 days of health data
  - No check-in in 24h
  - Health score ≥90 (low risk, healthy)
```

**Example:**
```
┌────────────────────────────────┐
│  [○] Sarah Chen  Monitor       │  ← Gray empty shield (no pulse)
│  Health Score: 92/100          │  ← Healthy, low risk
│  Routine Monitoring            │
└────────────────────────────────┘
```

---

### **Color-Coding Verification:**

**Domain Expert Validation:**

| Shield State | Icon | Color | Animation | Criteria | Status |
|--------------|------|-------|-----------|----------|--------|
| **Active** | 🛡️ Shield | Green (#84CC16) | Pulse (2s) | All 5 criteria met | ✅ **APPROVED** |
| **Inactive** | ○ Empty | Gray (#64748B) | None | Any criteria NOT met | ✅ **APPROVED** |

**Rationale:**
- **Green Shield (Active):** Indicates system is actively monitoring user due to moderate-to-high risk (health score <90)
- **Gray Empty (Inactive):** Indicates user is healthy (health score ≥90) or not eligible for Guardian monitoring (age <65)
- **Pulse Animation:** Only for active monitoring to draw attention to users requiring oversight
- **No Alarm Fatigue:** Healthy users (90+ score) don't trigger visual alerts

---

### **Implementation Logic:**

```typescript
/**
 * V10.2: Get Guardian badge state for member card
 * Domain Expert: Green/Shield (active) or Gray/Empty (inactive)
 */
function getGuardianBadge(user: User): {
  icon: 'shield' | 'empty';
  color: string;
  label: string;
  pulse: boolean;
} {
  // Check if user meets Active Monitoring Criteria (from V10.1)
  const isActive = shouldShowGuardianPulseRing(user);

  if (isActive) {
    return {
      icon: 'shield',
      color: '#84CC16', // Green
      label: 'System Monitoring Active',
      pulse: true, // 2s pulse animation
    };
  } else {
    return {
      icon: 'empty',
      color: '#64748B', // Gray
      label: user.age >= 65 ? 'Routine Monitoring' : 'Standard Monitoring',
      pulse: false, // No animation
    };
  }
}
```

---

## 📊 **OTHER HEALTH EXCERPTS (FUTURE)**

### **Doctor Visit Excerpt:**

```typescript
/**
 * V10.2: Get doctor visit excerpt for member card (FUTURE)
 * Priority: Upcoming > Overdue > Completed
 */
function getDoctorVisitExcerpt(userId: string): {
  text: string;
  color: string;
  priority: 'critical' | 'warning' | 'info';
} {
  const upcomingVisits = getUpcomingVisits(userId, 7); // Within 7 days

  if (upcomingVisits.length > 0) {
    const nextVisit = upcomingVisits[0];
    const daysUntil = Math.ceil((new Date(nextVisit.date).getTime() - Date.now()) / (24 * 60 * 60 * 1000));

    return {
      text: `Dr. Visit in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`,
      color: daysUntil <= 1 ? '#FF4444' : daysUntil <= 3 ? '#F59E0B' : '#84CC16',
      priority: daysUntil <= 1 ? 'critical' : daysUntil <= 3 ? 'warning' : 'info',
    };
  }

  return {
    text: 'No upcoming visits',
    color: '#94A3B8', // Gray
    priority: 'info',
  };
}
```

---

### **Check-in Excerpt:**

```typescript
/**
 * V10.2: Get check-in excerpt for member card (FUTURE)
 * Priority: Overdue > Recent > Normal
 */
function getCheckInExcerpt(userId: string): {
  text: string;
  color: string;
  priority: 'critical' | 'warning' | 'info';
} {
  const lastCheckIn = getLastCheckIn(userId);

  if (!lastCheckIn) {
    return {
      text: 'No check-in',
      color: '#94A3B8', // Gray
      priority: 'info',
    };
  }

  const hoursSince = (Date.now() - lastCheckIn) / (60 * 60 * 1000);

  if (hoursSince > 24) {
    return {
      text: `Last check-in ${Math.floor(hoursSince / 24)}d ago`,
      color: '#FF4444', // Red
      priority: 'critical',
    };
  } else if (hoursSince > 12) {
    return {
      text: `Last check-in ${Math.floor(hoursSince)}h ago`,
      color: '#F59E0B', // Amber
      priority: 'warning',
    };
  } else {
    return {
      text: `Checked in ${Math.floor(hoursSince)}h ago`,
      color: '#84CC16', // Green
      priority: 'info',
    };
  }
}
```

---

## 📋 **STAT EXCERPT SUMMARY**

| Excerpt Type | Priority | Format Example | Color | Status |
|--------------|----------|----------------|-------|--------|
| **Medication (Critical)** | 1 | "⚠️ 1 Missed Dose" | Red | ✅ DEFINED |
| **Medication (Warning)** | 2 | "5/6 Doses Today" | Amber/Green | ✅ DEFINED |
| **Medication (Info)** | 3 | "Next dose: 2:00 PM" | Green | ✅ DEFINED |
| **Medication (Weekly)** | 4 | "95% Adherence (7 days)" | Green/Amber/Red | ✅ DEFINED |
| **Medication (None)** | 5 | "No medications" | Gray | ✅ DEFINED |
| **Guardian Badge (Active)** | - | 🛡️ Green Shield (pulse) | Green | ✅ DEFINED |
| **Guardian Badge (Inactive)** | - | ○ Gray Empty (no pulse) | Gray | ✅ DEFINED |
| **Doctor Visit (Future)** | - | "Dr. Visit in 3 days" | Amber | 📋 SPEC ONLY |
| **Check-in (Future)** | - | "Checked in 2h ago" | Green | 📋 SPEC ONLY |

---

## ✅ **FINAL STATUS**

**Domain Expert Validation:** ✅ **COMPLETE - STAT EXCERPT LOGIC DEFINED**

**Key Definitions:**
- ✅ Medication Excerpt (5-level priority: Missed > Today's > Next > Weekly > None)
- ✅ Guardian Badge (Green/Shield active, Gray/Empty inactive)
- ✅ Color-Coding (Red critical, Amber warning, Green info, Gray neutral)
- ✅ Shield Verification (Active Monitoring Criteria from V10.1)

**Next Steps:**
- Chief Architect: Integrate stat excerpt logic into member data schema
- Coder: Implement Guardian badge + medication excerpt UI on member cards

---

**End of Member-Specific Health Summaries**

**Version:** V10.2 - Dashboard Deconstruction  
**Date:** 2026-02-22  
**Status:** ✅ **DOMAIN EXPERT VALIDATION COMPLETE**

---

**🧠 V10.2: MEMBER STAT EXCERPT LOGIC DEFINED. MEDICATION EXCERPT 5-LEVEL PRIORITY (1-MISSED-DOSE-CRITICAL RED ⚠️ 2-TODAYS-ADHERENCE-WARNING AMBER 5/6-DOSES 3-NEXT-DOSE-INFO GREEN NEXT-2PM 4-WEEKLY-ADHERENCE-INFO 95%-7DAYS 5-NO-MEDICATION-NEUTRAL GRAY). GUARDIAN BADGE 2-STATES (ACTIVE-GREEN-SHIELD-🛡️-PULSE-2S ALL-5-CRITERIA-MET AGE-65+ AI-ENABLED 7D-DATA 24H-CHECKIN SCORE<90, INACTIVE-GRAY-EMPTY-○-NO-PULSE ANY-CRITERIA-NOT-MET HEALTHY-SCORE≥90). COLOR-CODING VERIFIED (RED-CRITICAL AMBER-WARNING GREEN-INFO GRAY-NEUTRAL). SHIELD-VERIFICATION APPROVED (ACTIVE-MODERATE-HIGH-RISK INACTIVE-LOW-RISK-HEALTHY ALARM-FATIGUE-AVOIDANCE). IMPLEMENTATION-READY getMedicationExcerpt() FUNCTION getGuardianBadge() FUNCTION formatNextDoseTime() HELPER. 100% DOMAIN-EXPERT-VALIDATION-COMPLETE. 🧠⚡📊**
