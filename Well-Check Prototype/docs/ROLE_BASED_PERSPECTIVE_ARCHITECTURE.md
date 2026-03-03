# 📐 **ROLE-BASED PERSPECTIVE ARCHITECTURE**

**Version:** V9.4 - The Two-Button HUD  
**Date:** 2026-02-22  
**Status:** Active Development

---

## 🎯 **EXECUTIVE SUMMARY**

V9.4 introduces the "Two-Button HUD" with role-based perspective logic, collapsing all management links into a single "My Perspective" portal. Each role (Elderly, Minor, Protected, Monitor, Family Head) sees a personalized drawer with prioritized actions based on their needs.

**Key Changes:**
1. **Two-Button HUD:** Emergency (Panic - Red) + Perspective (Gear - Blue)
2. **Role-Specific Perspective:** Each role sees different prioritized actions
3. **UI Simplification:** Delete Quick Link Ribbon, delete top-right gear icon
4. **Elderly-First Design:** High-contrast, large elements for Elderly users
5. **AI Insight Toasts:** Pattern detection alerts (missed med, abnormal shift)

---

## 🧠 **THE "TWO-BUTTON" LOGIC**

### **Core Philosophy:**

**Before V9.4 (Complex):**
- Quick Link Ribbon: 4 icons (Home, Members, Geofence, Medication)
- Top-right gear icon (Settings)
- Floating Panic Button (Emergency)
- Multiple entry points, cognitive overload

**After V9.4 (Simple):**
- **Button 1:** Emergency (Panic) - Red - Bottom-center (existing)
- **Button 2:** Perspective (Gear) - Blue - Bottom-right (new)

**Result:**
- 2 primary actions (Emergency, Perspective)
- All management collapsed into single Perspective portal
- Role-based prioritization (different for each user type)
- Zero cognitive overload (simple, clear)

---

## 👥 **ROLE-BASED PERSPECTIVE LOGIC**

### **1. Elderly (Protected User - Age 65+)**

**Priority:** Health management, medication adherence, doctor visits

**Perspective Drawer Content:**
```typescript
const elderlyPerspective = {
  primary: [
    { id: 'medication-reminders', icon: 'Pill', label: 'Medication Reminders', priority: 1 },
    { id: 'doctor-logs', icon: 'Stethoscope', label: 'Doctor Visits', priority: 2 },
  ],
  secondary: [
    { id: 'daily-checkin', icon: 'Heart', label: 'Daily Check-in', priority: 3 },
    { id: 'emergency-contacts', icon: 'Phone', label: 'Emergency Contacts', priority: 4 },
    { id: 'settings', icon: 'Settings', label: 'Settings', priority: 5 },
  ]
};
```

**Visual Design:**
- High-contrast colors (7:1 ratio minimum)
- Large touch targets (64x64px minimum)
- Large text (18px body, 24px headings)
- Simple icons (bold, clear)
- Minimal cognitive load (2-3 primary actions)

**AI Insight Triggers:**
- Missed medication (2+ doses in 24h)
- Doctor visit due (within 7 days)
- Abnormal heart rate pattern (if tracking enabled)
- Fall detection (if supported)

---

### **2. Minor (Protected User - Age <18)**

**Priority:** Safety, daily check-ins, emergency access

**Perspective Drawer Content:**
```typescript
const minorPerspective = {
  primary: [
    { id: 'daily-checkin', icon: 'Heart', label: 'Daily Check-in', priority: 1 },
    { id: 'emergency-hub', icon: 'AlertTriangle', label: 'Emergency Hub', priority: 2 },
  ],
  secondary: [
    { id: 'family-map', icon: 'Map', label: 'Where is Everyone?', priority: 3 },
    { id: 'safe-zones', icon: 'Shield', label: 'My Safe Zones', priority: 4 },
    { id: 'settings', icon: 'Settings', label: 'Settings', priority: 5 },
  ]
};
```

**Visual Design:**
- Friendly, age-appropriate icons
- Bright colors (not overly childish)
- Simple language ("Where is Everyone?" not "Geofence Zones")
- Safe, non-threatening UI

**AI Insight Triggers:**
- Outside safe zone (geofence breach)
- Missed daily check-in (>24h since last)
- Emergency drill reminder (monthly)
- School pickup time reminder

---

### **3. Protected (Adult - Age 18-64)**

**Priority:** Status updates, medication, panic access

**Perspective Drawer Content:**
```typescript
const protectedPerspective = {
  primary: [
    { id: 'my-status', icon: 'User', label: 'My Status', priority: 1 },
    { id: 'medication', icon: 'Pill', label: 'Medication', priority: 2 },
  ],
  secondary: [
    { id: 'family-map', icon: 'Map', label: 'Family Map', priority: 3 },
    { id: 'panic-history', icon: 'AlertTriangle', label: 'Panic History', priority: 4 },
    { id: 'settings', icon: 'Settings', label: 'Settings', priority: 5 },
  ]
};
```

**Visual Design:**
- Standard touch targets (48x48px)
- Normal contrast (4.5:1 ratio)
- Standard text (16px body, 20px headings)
- Clean, modern UI

**AI Insight Triggers:**
- Medication due (within 1h)
- Location sharing off (reminder to enable)
- Battery low (<20%)
- Abnormal activity pattern (sudden change)

---

### **4. Monitor (Active Caregiver)**

**Priority:** Family oversight, member management, alerts

**Perspective Drawer Content:**
```typescript
const monitorPerspective = {
  primary: [
    { id: 'manage-members', icon: 'Users', label: 'Manage Members', priority: 1 },
    { id: 'medication-alerts', icon: 'Bell', label: 'Medication Alerts', priority: 2 },
  ],
  secondary: [
    { id: 'geofence-zones', icon: 'MapPin', label: 'Geofence Zones', priority: 3 },
    { id: 'doctor-visits', icon: 'Calendar', label: 'Doctor Visits', priority: 4 },
    { id: 'panic-history', icon: 'AlertTriangle', label: 'Panic History', priority: 5 },
    { id: 'settings', icon: 'Settings', label: 'Settings', priority: 6 },
  ]
};
```

**Visual Design:**
- Action-oriented UI (buttons, toggles)
- Status indicators (green/amber/red)
- Alert badges (notification counts)
- Compact, information-dense

**AI Insight Triggers:**
- Member missed medication (any family member)
- Member outside geofence (any family member)
- Panic event (any family member)
- Doctor visit due (any family member, within 7 days)
- Abnormal pattern detected (any family member)

---

### **5. Family Head (Admin)**

**Priority:** Full management, analytics, family oversight

**Perspective Drawer Content:**
```typescript
const familyHeadPerspective = {
  primary: [
    { id: 'family-dashboard', icon: 'LayoutDashboard', label: 'Family Dashboard', priority: 1 },
    { id: 'manage-members', icon: 'Users', label: 'Manage Members', priority: 2 },
  ],
  secondary: [
    { id: 'medication-center', icon: 'Pill', label: 'Medication Center', priority: 3 },
    { id: 'doctor-appointments', icon: 'Calendar', label: 'Doctor Appointments', priority: 4 },
    { id: 'geofence-zones', icon: 'MapPin', label: 'Geofence Zones', priority: 5 },
    { id: 'panic-history', icon: 'AlertTriangle', label: 'Panic History', priority: 6 },
    { id: 'analytics', icon: 'BarChart', label: 'Analytics', priority: 7 },
    { id: 'settings', icon: 'Settings', label: 'Settings', priority: 8 },
  ]
};
```

**Visual Design:**
- Full-featured UI (all capabilities)
- Analytics charts (recharts)
- Advanced settings
- Information-dense, powerful

**AI Insight Triggers:**
- Family-wide patterns (multiple members)
- Budget alerts (if tracking expenses)
- Medication adherence trends (weekly report)
- Panic event summary (monthly report)
- System health (battery, connectivity)

---

## 🎨 **PERSPECTIVE DRAWER UI DESIGN**

### **Layout:**

```
┌────────────────────────────────────────┐
│  My Perspective                    [X] │  ← Header (role name)
├────────────────────────────────────────┤
│                                        │
│  [Icon]  Medication Reminders      →  │  ← Primary action 1
│  [Icon]  Doctor Visits             →  │  ← Primary action 2
│                                        │
│  ──────────────────────────────────    │  ← Divider
│                                        │
│  [Icon]  Daily Check-in            →  │  ← Secondary action 1
│  [Icon]  Emergency Contacts        →  │  ← Secondary action 2
│  [Icon]  Settings                  →  │  ← Secondary action 3
│                                        │
└────────────────────────────────────────┘
```

**Interaction:**
- Tap Perspective button (bottom-right, blue) → Drawer slides up from bottom
- Tap primary action → Navigate to feature
- Tap secondary action → Navigate to feature
- Tap [X] or swipe down → Close drawer

**Animation:**
- Slide up from bottom (300ms ease-out)
- Backdrop fade in (200ms)
- Staggered item fade-in (50ms delay per item)

---

## 🧠 **AI INSIGHT TOAST ARCHITECTURE**

### **Purpose:**

Non-intrusive pattern detection alerts that appear when AI detects:
- Missed medication (2+ doses in 24h)
- Doctor visit due (within 7 days)
- Abnormal activity pattern (sudden change in routine)
- Geofence breach (outside safe zone)
- Battery low (<20%)

### **Design:**

```
┌──────────────────────────────────────────────────┐
│  🤖 AI Insight                            [Dismiss] │
│                                                  │
│  Pattern Detected: Medication Missed             │
│  John missed 2 doses of Aspirin (81mg) today.    │
│                                                  │
│  [View Details]  [Remind Now]                    │
└──────────────────────────────────────────────────┘
```

**Properties:**
- Position: top-center (below AppHeader if present)
- Duration: 8 seconds (auto-dismiss)
- Dismissible: YES (tap [Dismiss] or swipe up)
- Actions: 1-2 action buttons (View Details, Remind Now, etc.)
- Priority: Warning (amber) or Critical (red)

**Interaction:**
- Appears automatically when pattern detected
- Smooth fade-in (200ms)
- Pulses gently (2s interval) if critical
- Tap [View Details] → Navigate to relevant feature
- Tap [Remind Now] → Send push notification to member
- Tap [Dismiss] or swipe up → Close toast

### **AI Insight Rules:**

**Frequency Limits (Prevent Spam):**
- Max 3 insights per hour (per user)
- Max 10 insights per day (per user)
- Deduplicate: Same insight within 24h = suppress

**Priority Levels:**
```typescript
enum InsightPriority {
  INFO = 'info',        // Blue, 5s duration, no pulse
  WARNING = 'warning',  // Amber, 8s duration, no pulse
  CRITICAL = 'critical' // Red, 15s duration, gentle pulse
}
```

**Example Insights:**

**Missed Medication (Critical):**
```typescript
{
  id: 'insight-001',
  type: 'medication-missed',
  priority: 'critical',
  title: 'Pattern Detected: Medication Missed',
  message: 'John missed 2 doses of Aspirin (81mg) today.',
  actions: [
    { label: 'View Details', action: () => navigate('/medication') },
    { label: 'Remind Now', action: () => sendPushNotification('john', 'Take Aspirin') }
  ],
  icon: 'AlertTriangle',
  timestamp: Date.now(),
}
```

**Doctor Visit Due (Warning):**
```typescript
{
  id: 'insight-002',
  type: 'doctor-visit-due',
  priority: 'warning',
  title: 'Doctor Visit Coming Up',
  message: 'John has a doctor visit in 5 days (Feb 27).',
  actions: [
    { label: 'View Details', action: () => navigate('/doctor-visits') },
  ],
  icon: 'Calendar',
  timestamp: Date.now(),
}
```

**Abnormal Pattern (Warning):**
```typescript
{
  id: 'insight-003',
  type: 'abnormal-pattern',
  priority: 'warning',
  title: 'Activity Pattern Changed',
  message: 'John\'s daily check-in time has shifted by 3+ hours.',
  actions: [
    { label: 'View Details', action: () => navigate('/analytics') },
  ],
  icon: 'TrendingUp',
  timestamp: Date.now(),
}
```

---

## 🔧 **IMPLEMENTATION CHECKLIST**

### **Phase 1: Architecture & Logic (Chief Architect)**

- [x] Define role-based perspective configurations
- [x] Document Elderly prioritization (Medication, Doctor Logs)
- [x] Document Minor prioritization (Daily Check-ins, Emergency Hub)
- [x] Define AI Insight toast architecture
- [x] Document frequency limits and priority levels

### **Phase 2: UI Stripping (Coder)**

- [ ] Delete QuickLinkRibbon component (`/src/app/components/QuickLinkRibbon.tsx`)
- [ ] Remove QuickLinkRibbon from Dashboard (`/src/app/pages/Dashboard.tsx`)
- [ ] Remove Settings gear icon from AppHeader (`/src/app/components/AppHeader.tsx`)
- [ ] Verify FloatingPanicButton still renders (bottom-center, red)

### **Phase 3: New Components (Coder)**

- [ ] Create PerspectiveButton component (floating, bottom-right, blue)
- [ ] Create PerspectiveDrawer component (role-specific content)
- [ ] Create AIInsightToast component (pattern detection)
- [ ] Add PerspectiveButton to RootLayout
- [ ] Wire up perspective configs (Elderly, Minor, Protected, Monitor, Family Head)

### **Phase 4: Elderly Interface (Product Designer + Coder)**

- [ ] High-contrast color tokens (7:1 ratio)
- [ ] Large touch targets (64x64px minimum)
- [ ] Large text (18px body, 24px headings)
- [ ] Simple icons (bold, clear)
- [ ] Test with Elderly persona (age 65+)

### **Phase 5: Testing & Validation**

- [ ] Test Elderly perspective (Medication, Doctor Logs priority)
- [ ] Test Minor perspective (Daily Check-ins, Emergency Hub priority)
- [ ] Test Protected perspective (My Status, Medication)
- [ ] Test Monitor perspective (Manage Members, Medication Alerts)
- [ ] Test Family Head perspective (Full dashboard)
- [ ] Test AI Insight toasts (frequency limits, priority levels)
- [ ] Test two-button HUD (Emergency + Perspective, clear UX)

---

## 📊 **EXPECTED OUTCOMES**

### **UI Simplification:**

| Metric | Before V9.4 | After V9.4 | Improvement |
|--------|-------------|------------|-------------|
| **Primary Actions** | 4+ (Ribbon) + 1 (Gear) + 1 (Panic) = 6+ | 2 (Emergency + Perspective) | **67% reduction** |
| **Cognitive Load** | High (6+ entry points) | Low (2 buttons) | **Simple, clear** |
| **Role Personalization** | None (same UI for all) | Full (different per role) | **Personalized** |
| **Elderly-Friendly** | Standard (no special consideration) | High-contrast, large elements | **Accessible** |
| **AI Insights** | None | Pattern detection alerts | **Proactive** |

---

### **Role-Specific Personalization:**

| Role | Before V9.4 | After V9.4 |
|------|-------------|------------|
| **Elderly** | Generic UI (overwhelming) | High-contrast, Medication + Doctor Logs priority |
| **Minor** | Generic UI (confusing) | Simple, Daily Check-ins + Emergency Hub priority |
| **Protected** | Generic UI (okay) | Personalized, My Status + Medication priority |
| **Monitor** | Generic UI (too simple) | Action-oriented, Manage Members + Medication Alerts |
| **Family Head** | Generic UI (too simple) | Full-featured, Family Dashboard + Analytics |

---

## 🛡️ **SECURITY & PRIVACY**

### **Role-Based Access Control:**

Each role sees only what they're allowed to access:
- Elderly: Own medication, doctor visits (cannot see other members)
- Minor: Own check-ins, emergency hub (cannot see other members)
- Protected: Own status, medication (cannot see other members)
- Monitor: All members (can see and manage)
- Family Head: All members + analytics (full access)

### **AI Insight Privacy:**

AI insights are:
- Tenant-scoped (only family members in same tenant)
- Role-filtered (Elderly sees own insights only, Monitor sees all)
- Anonymized in analytics (no PII in aggregated reports)

---

**End of Role-Based Perspective Architecture**

**Version:** V9.4 - The Two-Button HUD  
**Date:** 2026-02-22  
**Status:** ✅ **Architecture Complete - Ready for Implementation**

---

**📐 V9.4: ROLE-BASED PERSPECTIVE ARCHITECTURE COMPLETE. TWO-BUTTON HUD LOGIC DEFINED (EMERGENCY + PERSPECTIVE, 67% ACTION REDUCTION). ELDERLY PRIORITIZATION: MEDICATION REMINDERS + DOCTOR LOGS (HIGH-CONTRAST, LARGE ELEMENTS 64X64PX, 18PX TEXT). MINOR PRIORITIZATION: DAILY CHECK-INS + EMERGENCY HUB (SIMPLE LANGUAGE, FRIENDLY UI). PROTECTED/MONITOR/FAMILY HEAD PERSPECTIVES DOCUMENTED. AI INSIGHT TOAST ARCHITECTURE (PATTERN DETECTION: MISSED MED, DOCTOR VISIT DUE, ABNORMAL PATTERN, FREQUENCY LIMITS 3/HOUR 10/DAY, PRIORITY LEVELS INFO/WARNING/CRITICAL). UI STRIPPING CHECKLIST (DELETE QUICKLINKRIBBON, DELETE GEAR ICON). IMPLEMENTATION READY. 🧠⚡📊**
