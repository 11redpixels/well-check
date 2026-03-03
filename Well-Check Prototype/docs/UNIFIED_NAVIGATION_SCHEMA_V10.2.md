# 📐 **UNIFIED NAVIGATION SCHEMA V10.2**

**Version:** V10.2 - Dashboard Deconstruction & Member-Level Intelligence  
**Date:** 2026-02-22  
**Status:** Architecture Complete

---

## 🎯 **EXECUTIVE SUMMARY**

V10.2 introduces a unified navigation schema (Single Source Ledger) that consolidates all operational links, system status, and settings into one object tree accessible through the Command Center button. The dashboard top sections (Family Members, Online Now, Medication Tracking) are removed, with stats localized to individual member cards. Guardian status and health excerpts become the primary view.

**Key Changes:**
1. **Dashboard Deletion** - Remove top 3 sections (Family Members, Online Now, Medication Tracking)
2. **Stat Localization** - Move stats into individual member data objects
3. **Shield Logic** - Map priority_guardian_state to icon/color-code in member cards
4. **Single Source Ledger** - Merge all navigation into unified Command Center menu
5. **HUD Stripping** - Remove all buttons except Panic (red) + Command Center (blue)

---

## 🗑️ **DASHBOARD DELETION**

### **Original Dashboard (Before V10.2):**

```
┌────────────────────────────────────────────────┐
│  Family Head Dashboard                         │
├────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │  👥      │ │  🛡️     │ │  💊      │       │
│  │  3       │ │  2/3     │ │  5/6     │       │  ← DELETE THESE 3 SECTIONS
│  │ Members  │ │ Online   │ │ Meds     │       │
│  └──────────┘ └──────────┘ └──────────┘       │
├────────────────────────────────────────────────┤
│  [Capabilities] [Overview] [Members]           │  ← Tabs remain
├────────────────────────────────────────────────┤
│  Member Cards:                                 │
│  - Grandma Emma (Protected)                    │
│  - Sarah Chen (Monitor)                        │
│  - Tommy Chen (Minor)                          │
└────────────────────────────────────────────────┘
```

**Problem:** Global stats (3 Members, 2/3 Online, 5/6 Meds) are redundant and take up vertical space.

---

### **New Dashboard (After V10.2):**

```
┌────────────────────────────────────────────────┐
│  Family Head Dashboard                         │
├────────────────────────────────────────────────┤
│  [Capabilities] [Members]                      │  ← Tabs only
├────────────────────────────────────────────────┤
│  Member Cards (with inline stats):             │
│                                                │
│  [🛡️] Grandma Emma  Protected                 │
│  ⚠️ 1 Missed Dose  [View Details]              │  ← Stat excerpt
│  Health Score: 85/100                          │
│                                                │
│  [○] Sarah Chen  Monitor                       │
│  3/4 Doses Today  [View Progress]              │  ← Stat excerpt
│  Health Score: 92/100                          │
│                                                │
│  [○] Tommy Chen  Minor                         │
│  No medications  [Add Medication]              │  ← Stat excerpt
│  Battery: 78%                                  │
└────────────────────────────────────────────────┘
```

**Impact:**
- Vertical space saved: ~120px (3 stat cards removed)
- Stats localized to member context (more relevant)
- Guardian badge immediately visible (green shield vs. gray empty)

---

## 📊 **STAT LOCALIZATION**

### **Member Data Schema (Updated):**

```typescript
interface FamilyMember {
  id: string;
  name: string;
  age: number;
  role: UserRole;
  
  // V10.2: Stat Localization (moved from dashboard header)
  stats: {
    medication: {
      text: string; // e.g., "5/6 Doses Today"
      color: string; // e.g., "#F59E0B" (Amber)
      priority: 'critical' | 'warning' | 'info' | 'neutral';
      action: string; // e.g., "View Progress"
      route: string; // e.g., "/medication"
    };
    
    doctorVisit?: {
      text: string; // e.g., "Dr. Visit in 3 days"
      color: string;
      priority: 'critical' | 'warning' | 'info';
    };
    
    checkIn?: {
      text: string; // e.g., "Checked in 2h ago"
      color: string;
      priority: 'critical' | 'warning' | 'info';
    };
    
    location?: {
      text: string; // e.g., "Home (Safe Zone)"
      color: string;
      priority: 'info' | 'warning';
    };
  };
  
  // V10.2: Guardian Status (mapped from priority_guardian_state)
  guardianStatus: {
    active: boolean; // Is Guardian monitoring active?
    badge: {
      icon: 'shield' | 'empty'; // 🛡️ or ○
      color: string; // Green (#84CC16) or Gray (#64748B)
      label: string; // "System Monitoring Active" or "Routine Monitoring"
      pulse: boolean; // Pulse animation?
    };
    healthScore: number; // 0-100
    lastCheckIn: number; // Timestamp
  };
  
  // Existing fields
  location: { lat: number; lng: number };
  capabilities: {
    medication: boolean;
    doctorVisits: boolean;
    panic: boolean;
  };
}
```

---

### **Data Transformation Example:**

**Before V10.2 (Global Stats):**
```typescript
const dashboardStats = {
  totalMembers: 3,
  onlineMembers: 2,
  medicationAdherence: '5/6', // Global stat
};
```

**After V10.2 (Member-Localized Stats):**
```typescript
const familyMembers: FamilyMember[] = [
  {
    id: 'user-001',
    name: 'Grandma Emma',
    age: 72,
    role: 'protected',
    stats: {
      medication: {
        text: '⚠️ 1 Missed Dose',
        color: '#FF4444', // Red
        priority: 'critical',
        action: 'View Details',
        route: '/medication',
      },
    },
    guardianStatus: {
      active: true, // Active monitoring (age 65+, health score 85 < 90)
      badge: {
        icon: 'shield',
        color: '#84CC16', // Green
        label: 'System Monitoring Active',
        pulse: true, // 2s pulse animation
      },
      healthScore: 85,
      lastCheckIn: Date.now() - 30 * 60 * 1000, // 30 mins ago
    },
    location: { lat: 37.7749, lng: -122.4194 },
    capabilities: {
      medication: true,
      doctorVisits: true,
      panic: true,
    },
  },
  {
    id: 'user-002',
    name: 'Sarah Chen',
    age: 35,
    role: 'monitor',
    stats: {
      medication: {
        text: '3/4 Doses Today',
        color: '#F59E0B', // Amber (75% adherence)
        priority: 'warning',
        action: 'View Progress',
        route: '/medication',
      },
    },
    guardianStatus: {
      active: false, // Not active (age <65, or healthy score ≥90)
      badge: {
        icon: 'empty',
        color: '#64748B', // Gray
        label: 'Standard Monitoring',
        pulse: false,
      },
      healthScore: 92,
      lastCheckIn: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
    },
    location: { lat: 37.7849, lng: -122.4294 },
    capabilities: {
      medication: true,
      doctorVisits: false,
      panic: true,
    },
  },
  // ... more members
];
```

---

## 🛡️ **SHIELD LOGIC MAPPING**

### **Priority Guardian State → Badge Property:**

**V10.1 Schema (priority_guardian_state):**
```typescript
interface GuardianState {
  enabled: boolean;
  priority: 'high' | 'medium' | 'low';
  aiMonitoring: boolean;
  lastCheckIn: number;
  healthScore: number;
  alertThreshold: 'strict' | 'normal' | 'lenient';
  
  // Active Monitoring Criteria
  activeMonitoring: {
    isActive: boolean; // Should pulse-ring be shown?
    daysCovered: number;
    criteria: {
      ageEligible: boolean; // 65+
      aiEnabled: boolean;
      minDataMet: boolean; // 7+ days
      recentActivity: boolean; // 24h check-in
      riskLevel: 'low' | 'moderate' | 'high';
    };
  };
}
```

---

**V10.2 Mapping (guardianStatus.badge):**
```typescript
// Map priority_guardian_state → guardianStatus.badge
function mapGuardianStateToBadge(user: User): GuardianBadge {
  const isActive = user.guardianState?.activeMonitoring?.isActive || false;
  
  if (isActive) {
    // Active Guardian monitoring
    return {
      icon: 'shield', // 🛡️
      color: '#84CC16', // Green
      label: 'System Monitoring Active',
      pulse: true, // 2s pulse animation
    };
  } else {
    // Inactive or healthy
    const isElderly = user.age >= 65;
    return {
      icon: 'empty', // ○
      color: '#64748B', // Gray
      label: isElderly ? 'Routine Monitoring' : 'Standard Monitoring',
      pulse: false,
    };
  }
}
```

---

### **Badge Display Logic:**

**Member Card UI (with Guardian Badge):**
```tsx
<div className="member-card">
  {/* Guardian Badge */}
  <div className="flex items-center gap-2">
    {member.guardianStatus.badge.icon === 'shield' ? (
      <Shield 
        className="w-6 h-6" 
        style={{ 
          color: member.guardianStatus.badge.color,
          animation: member.guardianStatus.badge.pulse ? 'pulse 2s infinite' : 'none',
        }} 
      />
    ) : (
      <Circle 
        className="w-6 h-6" 
        style={{ color: member.guardianStatus.badge.color }} 
      />
    )}
    
    <h3 className="text-white font-bold text-lg">{member.name}</h3>
    
    <span 
      className="text-xs font-bold px-2 py-1 rounded"
      style={{ 
        backgroundColor: member.role === 'protected' ? '#FF4444' : member.role === 'monitor' ? '#3B82F6' : '#84CC16',
        color: '#FFFFFF',
      }}
    >
      {member.role.toUpperCase()}
    </span>
  </div>
  
  {/* Guardian Status Label */}
  <p 
    className="text-xs mt-1"
    style={{ color: member.guardianStatus.badge.color }}
  >
    {member.guardianStatus.badge.label}
  </p>
  
  {/* Medication Stat Excerpt */}
  <p 
    className="text-sm mt-2 font-bold"
    style={{ color: member.stats.medication.color }}
  >
    {member.stats.medication.text}
  </p>
  
  {/* Health Score */}
  <p className="text-xs text-gray-400 mt-1">
    Health Score: {member.guardianStatus.healthScore}/100
  </p>
</div>
```

---

## 🗂️ **SINGLE SOURCE LEDGER (UNIFIED NAVIGATION)**

### **Purpose:**

Merge all operational links (Manage Members, Geofence, Medication Alerts), system status (History, Analytics), and settings (App Configuration) into one unified object tree accessible through the Command Center button.

---

### **Navigation Schema:**

```typescript
interface NavigationItem {
  id: string;
  label: string;
  icon: any; // Lucide icon
  route: string;
  category: 'operations' | 'status' | 'settings';
  priority: number; // Display order within category
  roles: UserRole[]; // Which roles can see this item
}

/**
 * V10.2: Single Source Ledger - Unified Navigation
 */
const NAVIGATION_LEDGER: NavigationItem[] = [
  // OPERATIONS (Primary actions)
  {
    id: 'family-dashboard',
    label: 'Family Dashboard',
    icon: LayoutDashboard,
    route: '/dashboard',
    category: 'operations',
    priority: 1,
    roles: ['family_head', 'monitor'],
  },
  {
    id: 'manage-members',
    label: 'Manage Members',
    icon: Users,
    route: '/dashboard', // Same as dashboard, but focus on Members tab
    category: 'operations',
    priority: 2,
    roles: ['family_head', 'monitor'],
  },
  {
    id: 'medication-center',
    label: 'Medication Center',
    icon: Pill,
    route: '/medication',
    category: 'operations',
    priority: 3,
    roles: ['family_head', 'monitor', 'protected'],
  },
  {
    id: 'medication-alerts',
    label: 'Medication Alerts',
    icon: Bell,
    route: '/medication-alerts',
    category: 'operations',
    priority: 4,
    roles: ['family_head', 'monitor'],
  },
  {
    id: 'doctor-visits',
    label: 'Doctor Appointments',
    icon: Calendar,
    route: '/doctor-visits',
    category: 'operations',
    priority: 5,
    roles: ['family_head', 'monitor', 'protected'],
  },
  {
    id: 'geofence-zones',
    label: 'Geofence Zones',
    icon: MapPin,
    route: '/geofence',
    category: 'operations',
    priority: 6,
    roles: ['family_head', 'monitor'],
  },
  {
    id: 'panic-history',
    label: 'Panic History',
    icon: AlertTriangle,
    route: '/panic-history',
    category: 'operations',
    priority: 7,
    roles: ['family_head', 'monitor'],
  },
  
  // STATUS (System information)
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart,
    route: '/analytics',
    category: 'status',
    priority: 1,
    roles: ['family_head'],
  },
  {
    id: 'activity-history',
    label: 'Activity History',
    icon: Clock,
    route: '/history',
    category: 'status',
    priority: 2,
    roles: ['family_head', 'monitor'],
  },
  {
    id: 'system-status',
    label: 'System Status',
    icon: Activity,
    route: '/status',
    category: 'status',
    priority: 3,
    roles: ['family_head', 'monitor', 'protected', 'minor'],
  },
  
  // SETTINGS (App configuration)
  {
    id: 'app-settings',
    label: 'App Settings',
    icon: Settings,
    route: '/settings',
    category: 'settings',
    priority: 1,
    roles: ['family_head', 'monitor', 'protected', 'minor'],
  },
  {
    id: 'family-code',
    label: 'Family Code',
    icon: Key,
    route: '/family-code',
    category: 'settings',
    priority: 2,
    roles: ['family_head'],
  },
  {
    id: 'account-settings',
    label: 'Account Settings',
    icon: User,
    route: '/account',
    category: 'settings',
    priority: 3,
    roles: ['family_head', 'monitor', 'protected', 'minor'],
  },
];
```

---

### **Command Center Drawer Structure:**

```
┌────────────────────────────────────────────────┐
│  Command Center                           [X]  │
├────────────────────────────────────────────────┤
│  OPERATIONS                                    │  ← Category 1
├────────────────────────────────────────────────┤
│  [📊] Family Dashboard                    →   │
│  [👥] Manage Members                      →   │
│  [💊] Medication Center                   →   │
│  [🔔] Medication Alerts                   →   │
│  [📅] Doctor Appointments                 →   │
│  [📍] Geofence Zones                      →   │
│  [⚠️] Panic History                        →   │
├────────────────────────────────────────────────┤
│  SYSTEM STATUS                                 │  ← Category 2
├────────────────────────────────────────────────┤
│  [📈] Analytics                           →   │
│  [🕒] Activity History                    →   │
│  [⚡] System Status                       →   │
├────────────────────────────────────────────────┤
│  SETTINGS                                      │  ← Category 3
├────────────────────────────────────────────────┤
│  [⚙️] App Settings                        →   │
│  [🔑] Family Code                         →   │
│  [👤] Account Settings                    →   │
└────────────────────────────────────────────────┘
```

---

## 🎨 **HUD STRIPPING**

### **Button Consolidation:**

**Before V10.2 (Multiple Buttons):**
```
┌────────────────────────────────────────────────┐
│  Dashboard content                             │
│  ...                                           │
│                                                │
│                          [⚙️ Settings] ← Green │
│              [🚨 Panic] ← Red                  │
│                          [👤 My Perspective]   │
│                          ← Blue                │
└────────────────────────────────────────────────┘
```
**Problem:** Too many buttons, cluttered HUD

---

**After V10.2 (Two-Button Mandate):**
```
┌────────────────────────────────────────────────┐
│  Dashboard content                             │
│  ...                                           │
│                                                │
│                          [⌘ Command Center]    │
│              [🚨 Panic]                         │
│                          ← Blue (only 2)       │
└────────────────────────────────────────────────┘
```
**Result:** Only 2 buttons (Panic Red + Command Center Blue)

**Impact:**
- Settings button deleted (consolidated into Command Center)
- My Perspective button renamed to Command Center (done in V10.0)
- Clean HUD with only 2 action points

---

## 📋 **IMPLEMENTATION CHECKLIST**

### **Phase 1: Dashboard Deletion**

- [ ] Remove "Family Members" stat card from dashboard header
- [ ] Remove "Online Now" stat card from dashboard header
- [ ] Remove "Medication Tracking" stat card from dashboard header
- [ ] Vertical space saved: ~120px

### **Phase 2: Stat Localization**

- [ ] Add `stats` object to FamilyMember type
- [ ] Add `guardianStatus` object to FamilyMember type
- [ ] Implement `getMedicationExcerpt()` function (from Domain Expert)
- [ ] Implement `getGuardianBadge()` function (from Domain Expert)
- [ ] Update member card UI to display inline stats

### **Phase 3: Shield Logic**

- [ ] Map `priority_guardian_state` → `guardianStatus.badge`
- [ ] Implement `mapGuardianStateToBadge()` function
- [ ] Add Guardian badge icon to member cards (Shield vs. Empty)
- [ ] Add pulse animation for active Guardian monitoring

### **Phase 4: Single Source Ledger**

- [ ] Define `NAVIGATION_LEDGER` constant
- [ ] Update CommandCenterDrawer to use navigation ledger
- [ ] Categorize menu items (Operations, Status, Settings)
- [ ] Filter by user role (family_head sees all, monitor sees subset)

### **Phase 5: HUD Stripping**

- [ ] Remove CommandOrb component (if exists)
- [ ] Remove ControlCenter component (if exists)
- [ ] Remove any separate Settings button
- [ ] Ensure only 2 buttons: Panic (red) + Command Center (blue)

---

## ✅ **FINAL STATUS**

**Unified Navigation Schema:** ✅ **ARCHITECTURE COMPLETE**

**Key Definitions:**
- ✅ Dashboard deletion (remove top 3 stat cards, save ~120px)
- ✅ Stat localization (move stats into member data objects)
- ✅ Shield logic mapping (priority_guardian_state → badge property)
- ✅ Single Source Ledger (NAVIGATION_LEDGER with 13 items)
- ✅ HUD stripping (only 2 buttons: Panic + Command Center)

**Next Steps:**
- Coder: Implement member card stat excerpts + Guardian badge
- Coder: Remove old buttons (CommandOrb, ControlCenter)
- Coder: Update CommandCenterDrawer with unified navigation

---

**End of Unified Navigation Schema V10.2**

**Version:** V10.2 - Dashboard Deconstruction  
**Date:** 2026-02-22  
**Status:** ✅ **ARCHITECTURE COMPLETE - READY FOR IMPLEMENTATION**

---

**📐 V10.2: UNIFIED NAVIGATION SCHEMA COMPLETE. DASHBOARD DELETION (REMOVE TOP-3-STAT-CARDS FAMILY-MEMBERS ONLINE-NOW MEDICATION-TRACKING SAVE-120PX VERTICAL-SPACE). STAT LOCALIZATION (MOVE MEDICATION-ADHERENCE DOCTOR-VISITS CHECKIN LOCATION INTO MEMBER-DATA-OBJECTS stats OBJECT medication-TEXT-COLOR-PRIORITY-ACTION-ROUTE guardianStatus OBJECT active-BADGE-HEALTHSCORE-LASTCHECKIN). SHIELD LOGIC MAPPING (priority_guardian_state → guardianStatus.badge mapGuardianStateToBadge() FUNCTION ACTIVE-GREEN-SHIELD-🛡️-PULSE INACTIVE-GRAY-EMPTY-○-NO-PULSE). SINGLE SOURCE LEDGER (NAVIGATION_LEDGER 13-ITEMS 3-CATEGORIES OPERATIONS-7-ITEMS FAMILY-DASHBOARD MANAGE-MEMBERS MEDICATION-CENTER MEDICATION-ALERTS DOCTOR-VISITS GEOFENCE-ZONES PANIC-HISTORY, STATUS-3-ITEMS ANALYTICS ACTIVITY-HISTORY SYSTEM-STATUS, SETTINGS-3-ITEMS APP-SETTINGS FAMILY-CODE ACCOUNT-SETTINGS ROLE-BASED-FILTERING). HUD STRIPPING (DELETE COMMANDORB CONTROLCENTER SETTINGS-BUTTON ONLY-2-BUTTONS PANIC-RED BOTTOM-CENTER COMMAND-CENTER-BLUE BOTTOM-RIGHT TWO-BUTTON-MANDATE). 100% ARCHITECTURE-COMPLETE IMPLEMENTATION-READY. 📐⚡📊**
