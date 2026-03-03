# 📐 **CAPABILITY-TO-OPERATION PIVOT & GUARDIAN LOGIC**

**Version:** V10.0 - The "Well-Check" Consolidation  
**Date:** 2026-02-22  
**Status:** Active Development

---

## 🎯 **EXECUTIVE SUMMARY**

V10.0 introduces the "Capability-to-Operation Pivot", transforming the Capabilities tab from a simple toggle-switch list into a launchpad for specific operation views. Location Tracking becomes a first-class module. Elderly users (Grandma Emma) get "Guardian" status with priority_guardian_state, visually distinguished with pulse-ring or protective shield icon. AppHeader deleted for absolute HUD purity. PerspectiveButton renamed to CommandCenterButton (only 2 buttons: Emergency Red + Command Center Blue).

**Key Changes:**
1. **Capabilities → Launchpad:** Tapping a module (Meds, Doctor Visits, Tracking) launches specific operation view
2. **Tracking as Module:** Location Tracking added to capability list (first-class module)
3. **Guardian Logic:** Elderly users (age 65+) get priority_guardian_state with visual distinction
4. **Headless UI:** AppHeader deleted, dashboard starts at viewport top
5. **Two-Button Mandate:** Emergency Red (Panic) + Command Center Blue (Management)

---

## 🧠 **THE CAPABILITY-TO-OPERATION PIVOT**

### **Core Philosophy:**

**Before V10.0 (Toggle-Switch List):**
```
┌────────────────────────────────────┐
│  Capabilities                      │
├────────────────────────────────────┤
│  [Toggle] Medication Management    │
│  [Toggle] Doctor Visit Tracking    │
│  [Toggle] Panic Access             │
└────────────────────────────────────┘
```
**Problem:** Toggle switches are passive (enable/disable only, no action)

**After V10.0 (Launchpad):**
```
┌────────────────────────────────────┐
│  Capabilities Launchpad            │
├────────────────────────────────────┤
│  [Button → /medication] Medication │
│  [Button → /doctor-visits] Doctors │
│  [Button → /tracking] Tracking     │
│  [Button → /panic] Panic Hub       │
└────────────────────────────────────┘
```
**Solution:** Each capability is a launchpad button that navigates to specific operation view

---

## 🚀 **CAPABILITY LAUNCHPAD ARCHITECTURE**

### **Data Structure:**

```typescript
interface CapabilityModule {
  id: string;
  name: string;
  enabled: boolean; // Can family head enable/disable this module?
  route: string; // Where does tapping this module navigate?
  icon: any; // Lucide icon
  color: string; // Module color (e.g., #84CC16 for Medication)
  priority: number; // Display order (1 = highest)
  guardianRelevant: boolean; // Does this apply to Guardian (Elderly) users?
  description: string; // Short description
}

// Example: Medication Module
const medicationModule: CapabilityModule = {
  id: 'medication',
  name: 'Medication Management',
  enabled: true,
  route: '/medication',
  icon: Pill,
  color: '#84CC16', // Safety Green
  priority: 1,
  guardianRelevant: true, // Elderly priority
  description: 'Track medications, dosages, and adherence',
};
```

---

### **Module Definitions:**

**1. Medication Management (Priority 1 - Guardian Relevant):**
```typescript
{
  id: 'medication',
  name: 'Medication Management',
  enabled: true,
  route: '/medication',
  icon: Pill,
  color: '#84CC16',
  priority: 1,
  guardianRelevant: true,
  description: 'Track medications, dosages, and adherence',
}
```

**2. Doctor Visit Tracking (Priority 2 - Guardian Relevant):**
```typescript
{
  id: 'doctor-visits',
  name: 'Doctor Visit Tracking',
  enabled: true,
  route: '/doctor-visits',
  icon: Stethoscope,
  color: '#3B82F6',
  priority: 2,
  guardianRelevant: true,
  description: 'Schedule and log doctor appointments',
}
```

**3. Location Tracking (Priority 3 - New First-Class Module):**
```typescript
{
  id: 'location-tracking',
  name: 'Location Tracking',
  enabled: true,
  route: '/tracking', // or '/' for map view
  icon: MapPin,
  color: '#F59E0B', // Amber
  priority: 3,
  guardianRelevant: true, // Monitor Grandma Emma's location
  description: 'Real-time location monitoring and geofence alerts',
}
```

**4. Panic Access (Priority 4):**
```typescript
{
  id: 'panic',
  name: 'Panic Hub',
  enabled: true,
  route: '/panic',
  icon: AlertTriangle,
  color: '#FF4444', // Emergency Red
  priority: 4,
  guardianRelevant: true,
  description: 'Emergency panic button and incident history',
}
```

**5. Social Pulse (Priority 5):**
```typescript
{
  id: 'social-pulse',
  name: 'Social Pulse',
  enabled: false,
  route: '/social-pulse',
  icon: Heart,
  color: '#EC4899', // Pink
  priority: 5,
  guardianRelevant: false,
  description: 'Ephemeral moments and family updates',
}
```

---

### **Launchpad UI Design:**

```
┌────────────────────────────────────────────────┐
│  Capabilities Launchpad                    [+] │  ← Header
├────────────────────────────────────────────────┤
│                                                │
│  [🛡️] Medication Management              →   │  ← Priority 1 (Guardian)
│  [📋] Track medications and adherence         │
│                                                │
│  [🏥] Doctor Visit Tracking               →   │  ← Priority 2 (Guardian)
│  [📋] Schedule and log appointments           │
│                                                │
│  [📍] Location Tracking                   →   │  ← Priority 3 (Guardian)
│  [📋] Real-time monitoring and geofences      │
│                                                │
│  [⚠️] Panic Hub                            →   │  ← Priority 4
│  [📋] Emergency panic and incident history    │
│                                                │
│  [💓] Social Pulse                         →   │  ← Priority 5 (Disabled)
│  [📋] Ephemeral moments and updates           │
│  [Toggle Off]                                  │
│                                                │
└────────────────────────────────────────────────┘
```

**Interaction:**
- Tap module button → Navigate to operation view (e.g., /medication)
- Long-press module → Show enable/disable toggle
- Guardian-relevant modules have 🛡️ shield icon badge

---

## 🛡️ **GUARDIAN LOGIC FOR ELDERLY**

### **Purpose:**

Elderly users (age 65+) require special monitoring and visual distinction. The "Guardian" state indicates the system is actively watching them through AI pattern detection, medication adherence tracking, and location monitoring.

---

### **Guardian State Definition:**

```typescript
interface GuardianState {
  enabled: boolean; // Is this user a Guardian (Elderly)?
  priority: 'high' | 'medium' | 'low'; // Priority level for monitoring
  aiMonitoring: boolean; // AI pattern detection active?
  lastCheckIn: number; // Timestamp of last check-in
  healthScore: number; // 0-100 health score (based on adherence, activity)
  alertThreshold: 'strict' | 'normal' | 'lenient'; // How aggressive are alerts?
}

// Example: Grandma Emma
const grandmaEmma = {
  id: 'user-001',
  name: 'Emma Johnson',
  role: 'protected',
  age: 72, // 65+ = Guardian status
  guardianState: {
    enabled: true,
    priority: 'high',
    aiMonitoring: true,
    lastCheckIn: Date.now(),
    healthScore: 85,
    alertThreshold: 'strict',
  },
};
```

---

### **Visual Distinction:**

**Standard Protected User:**
```
┌────────────────────────────────┐
│  [👤] John Smith               │
│  Protected User                │
│  Last seen: 2 hours ago        │
└────────────────────────────────┘
```

**Guardian (Elderly) User:**
```
┌────────────────────────────────┐
│  [🛡️ 🔔] Emma Johnson          │  ← Pulse-ring or shield icon
│  Guardian (Elderly - 72)       │  ← "Guardian" label
│  System Monitoring Active      │  ← AI monitoring status
│  Health Score: 85/100          │  ← Health score
│  Last Check-in: 30 mins ago    │  ← Recent check-in
└────────────────────────────────┘
```

**Guardian Badge:**
- Shield icon (🛡️) or pulse-ring animation
- "System Watching" indicator (green pulse)
- Health score (0-100)
- AI monitoring status (active/inactive)

---

### **Guardian-Specific AI Patterns:**

**Priority Order for Elderly:**
1. Medication Missed (critical) → Immediate alert
2. Doctor Visit Due (warning) → 7-day reminder
3. Abnormal Pattern (warning) → 3+ hour shift in routine
4. Location Anomaly (warning) → Outside usual areas
5. Battery Low (info) → <20% charge

**Alert Threshold (Strict):**
- Medication: Alert after 1 missed dose (vs. 2 for standard users)
- Check-in: Alert after 12h no check-in (vs. 24h for standard users)
- Location: Alert if outside primary zone for 2h (vs. 4h for standard users)

---

### **Health Score Calculation:**

```typescript
function calculateHealthScore(user: User): number {
  let score = 100;

  // Medication adherence (0-40 points)
  const adherenceRate = getMedicationAdherenceRate(user.id);
  score -= (1 - adherenceRate) * 40;

  // Check-in consistency (0-20 points)
  const checkInRate = getCheckInConsistencyRate(user.id);
  score -= (1 - checkInRate) * 20;

  // Activity level (0-20 points)
  const activityRate = getActivityLevelRate(user.id);
  score -= (1 - activityRate) * 20;

  // Doctor visit compliance (0-10 points)
  const doctorVisitRate = getDoctorVisitComplianceRate(user.id);
  score -= (1 - doctorVisitRate) * 10;

  // Location consistency (0-10 points)
  const locationRate = getLocationConsistencyRate(user.id);
  score -= (1 - locationRate) * 10;

  return Math.max(0, Math.min(100, score));
}
```

**Health Score Ranges:**
- 90-100: Excellent (green)
- 75-89: Good (green)
- 60-74: Fair (amber)
- 40-59: Poor (amber)
- 0-39: Critical (red)

---

## 📍 **LOCATION TRACKING AS FIRST-CLASS MODULE**

### **Purpose:**

Location Tracking is now a first-class capability module, allowing Family Head to:
- Monitor real-time location of all family members
- View Guardian (Elderly) location with priority
- Set geofence zones and receive breach alerts
- View location history

---

### **Tracking Module UI:**

```
┌────────────────────────────────────────────────┐
│  Location Tracking                        [⚙️] │
├────────────────────────────────────────────────┤
│                                                │
│  🛡️ Emma Johnson (Guardian)                   │
│  Last seen: 2 mins ago                         │
│  📍 Home (Safe Zone)                           │
│  [View Map]                                    │
│                                                │
│  👤 John Smith                                 │
│  Last seen: 30 mins ago                        │
│  📍 Work (Safe Zone)                           │
│  [View Map]                                    │
│                                                │
│  👶 Sarah Smith (Minor)                        │
│  Last seen: 1 hour ago                         │
│  ⚠️ Outside Safe Zone                          │
│  [View Map]  [Send Alert]                      │
│                                                │
└────────────────────────────────────────────────┘
```

**Features:**
- Guardian users listed first (priority)
- Real-time location status
- Safe zone indicators (green check or red alert)
- Quick actions (View Map, Send Alert)

---

## 🔧 **TWO-BUTTON MANDATE (UPDATED)**

### **V10.0 Two-Button HUD:**

**Button 1: Emergency (Panic) - Red - Bottom-center (existing)**
- 72px circular
- Emergency Red (#FF4444 glow)
- AlertTriangle icon
- 3-second hold to trigger

**Button 2: Command Center - Blue - Bottom-right (renamed from Perspective)**
- 72px circular
- Industrial Blue (#3B82F6 glow)
- Settings or Command icon
- Opens Command Center drawer (role-specific)

**Deleted:**
- AppHeader (branding)
- PerspectiveButton (renamed to CommandCenterButton)

**Result:**
- Headless UI (no header, full viewport)
- Two-button mandate (Emergency + Command Center)
- Absolute HUD purity

---

## 📋 **IMPLEMENTATION CHECKLIST**

### **Phase 1: Architecture (Chief Architect)**

- [x] Define capability module data structure
- [x] Document capability-to-operation pivot
- [x] Define Guardian state for Elderly users
- [x] Document Location Tracking as first-class module
- [x] Document Two-Button Mandate updates

### **Phase 2: UI Deconstruction (Coder)**

- [ ] Delete AppHeader component (headless UI)
- [ ] Rename PerspectiveButton → CommandCenterButton
- [ ] Rename PerspectiveDrawer → CommandCenterDrawer
- [ ] Update keyboard shortcut: Shift + D → Ctrl + D (DemoControls)
- [ ] Vertical shift: Move FloatingPanicButton up 24px

### **Phase 3: Capability Launchpad (Coder)**

- [ ] Refactor Capabilities tab (toggles → launchpad buttons)
- [ ] Add Location Tracking module
- [ ] Implement navigation on tap (e.g., /medication)
- [ ] Add Guardian badge for Elderly users
- [ ] Add enable/disable toggle (long-press)

### **Phase 4: Guardian Logic (Chief Architect + Coder)**

- [ ] Add guardianState to User type
- [ ] Implement calculateHealthScore function
- [ ] Add Guardian badge UI (pulse-ring or shield icon)
- [ ] Prioritize Guardian users in lists (sort by priority)
- [ ] Implement strict alert thresholds for Guardian users

### **Phase 5: Tab Consolidation (Product Designer + Coder)**

- [ ] Delete "Overview" tab from FamilyHeadDashboard
- [ ] Move member counts/online status to Capabilities tab header
- [ ] Update tab navigation (Capabilities, Members only)

---

## 📊 **EXPECTED OUTCOMES**

### **UI Simplification:**

| Metric | Before V10.0 | After V10.0 | Improvement |
|--------|--------------|-------------|-------------|
| **Header Height** | 72px | 0px | **100% reduction** |
| **Primary Buttons** | 2 (Panic + Perspective) | 2 (Panic + Command Center) | **Same, renamed** |
| **Capabilities UI** | Toggle switches | Launchpad buttons | **Actionable** |
| **Tabs** | 3 (Overview, Capabilities, Members) | 2 (Capabilities, Members) | **33% reduction** |
| **Elderly Distinction** | None | Guardian badge + health score | **Visible priority** |

---

### **Guardian Monitoring:**

| Feature | Before V10.0 | After V10.0 | Improvement |
|---------|--------------|-------------|-------------|
| **Elderly Visual Distinction** | None (same as Protected) | Guardian badge + pulse-ring | **Clear priority** |
| **AI Monitoring** | Generic (all users) | Prioritized (Elderly first) | **Focused** |
| **Health Score** | None | 0-100 score | **Quantified** |
| **Alert Threshold** | Normal (2 missed meds) | Strict (1 missed med) | **Tighter monitoring** |
| **Location Tracking** | Hidden in map view | First-class module | **Prominent** |

---

**End of Capability-to-Operation Pivot & Guardian Logic**

**Version:** V10.0 - The "Well-Check" Consolidation  
**Date:** 2026-02-22  
**Status:** ✅ **ARCHITECTURE COMPLETE - READY FOR IMPLEMENTATION**

---

**📐 V10.0: CAPABILITY-TO-OPERATION PIVOT ARCHITECTURE COMPLETE. CAPABILITIES TAB REFACTORED (TOGGLE-SWITCHES → LAUNCHPAD BUTTONS, TAP NAVIGATION /MEDICATION /DOCTOR-VISITS /TRACKING /PANIC). LOCATION TRACKING FIRST-CLASS MODULE (REAL-TIME MONITORING, GEOFENCE ALERTS, GUARDIAN PRIORITY). GUARDIAN LOGIC DEFINED (PRIORITY_GUARDIAN_STATE FOR ELDERLY 65+, PULSE-RING/SHIELD ICON, HEALTH SCORE 0-100 CALCULATION, STRICT ALERT THRESHOLD 1 MISSED MED VS 2 STANDARD). TWO-BUTTON MANDATE (EMERGENCY RED PANIC + COMMAND CENTER BLUE, APPHEADER DELETED HEADLESS UI 72PX → 0PX). OVERVIEW TAB DELETED (MEMBER COUNTS MOVED TO CAPABILITIES HEADER, 3 TABS → 2 TABS 33% REDUCTION). IMPLEMENTATION READY. 🧠⚡📊**
