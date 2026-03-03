# 👨‍🎨 FAMILY LAB VISUAL SPECIFICATION
**Product Designer:** AI UX/UI Design Agent  
**Date:** 2026-02-19  
**Directive:** V8.3 Family Lab & Integration  
**Component:** Family Lab (Settings Hub)

---

## 🎯 **DESIGN MANDATE**

**Requirement:** Ensure the Settings don't feel like a standard iOS/Android menu. Use the Industrial Blue palette with "Safety Amber" highlights for critical alert settings. Ensure the Family Head (who may be a senior themselves) can adjust the geofence radius using a large, tactile slider.

---

## 🎨 **VISUAL LANGUAGE: "INDUSTRIAL CONTROL ROOM"**

### **Theme:**
The Family Lab should feel like a **Mission Control Center** for family safety—industrial, technical, but approachable. Think NASA control panel meets smart home interface.

### **Color Palette:**

**Primary:**
- **Industrial Blue:** #1E40AF (Tailwind blue-700)
- **Deep Navy:** #1E3A8A (Tailwind blue-900) - Backgrounds
- **Electric Blue:** #3B82F6 (Tailwind blue-500) - Active states

**Accents:**
- **Safety Amber:** #FBBF24 (Warning/Alert settings)
- **Emergency Red:** #FF4444 (Critical settings)
- **Safety Green:** #84CC16 (Confirmation/Active toggles)

**Neutrals:**
- **Slate 900:** #0F172A (Base background)
- **Slate 800:** #1E293B (Card backgrounds)
- **Slate 700:** #334155 (Borders/Dividers)
- **Slate 400:** #94A3B8 (Secondary text)

---

## 📐 **LAYOUT STRUCTURE**

### **Top-Level View:**

```
┌──────────────────────────────────────────────────────┐
│  [Header: ⚙️ Family Lab]                            │
│  "Mission Control for Your Family's Safety"          │
├──────────────────────────────────────────────────────┤
│  [Tile Grid: 2 columns on mobile, 3 on tablet]      │
│  ┌────────────────┐  ┌────────────────┐             │
│  │  🚨 Safety     │  │  📍 Geofence   │             │
│  │  Alerts        │  │  Zones         │             │
│  │  72px height   │  │  72px height   │             │
│  └────────────────┘  └────────────────┘             │
│  ┌────────────────┐  ┌────────────────┐             │
│  │  👥 Member     │  │  🎨 Display    │             │
│  │  Permissions   │  │  Mode          │             │
│  │  72px height   │  │  72px height   │             │
│  └────────────────┘  └────────────────┘             │
└──────────────────────────────────────────────────────┘
```

---

## 🎨 **PRIMARY TILES (72px HEIGHT)**

### **Tile Design:**
```tsx
<SettingTile>
  <Icon size={32} color="#FBBF24" />
  <Title>Safety Alerts</Title>
  <Badge>3 Active</Badge>
  <Arrow>→</Arrow>
</SettingTile>
```

**Visual Properties:**
- Height: 72px (large touch target)
- Background: Linear gradient #1E40AF → #1E3A8A (Industrial Blue)
- Border: 2px solid #3B82F6 (Electric Blue)
- Border-radius: 12px
- Padding: 16px
- Shadow: 0 4px 12px rgba(30, 64, 175, 0.3)

**Hover/Active State:**
- Border: 3px solid #FBBF24 (Safety Amber)
- Shadow: 0 6px 16px rgba(251, 191, 36, 0.4)
- Transform: scale(1.02)

---

### **Tile 1: 🚨 Safety Alerts**
```tsx
<SettingTile
  icon="🚨"
  title="Safety Alerts"
  subtitle="Medication & Ping Sensitivity"
  badge="3 Active"
  color="#FBBF24" // Safety Amber
  onClick={() => navigate('/lab/safety-alerts')}
/>
```

**Badge States:**
- "3 Active" → Green #84CC16 (some alerts enabled)
- "All Off" → Gray #64748B (no alerts)
- "Critical" → Red #FF4444 (high sensitivity)

---

### **Tile 2: 📍 Geofence Zones**
```tsx
<SettingTile
  icon="📍"
  title="Geofence Zones"
  subtitle="Doctor Visits & Home Boundaries"
  badge="0.5 mi radius"
  color="#3B82F6" // Electric Blue
  onClick={() => navigate('/lab/geofence-zones')}
/>
```

**Badge:** Shows current default radius (e.g., "0.5 mi", "1.0 mi")

---

### **Tile 3: 👥 Member Permissions**
```tsx
<SettingTile
  icon="👥"
  title="Member Permissions"
  subtitle="Monitor Access & Role Settings"
  badge="5 Members"
  color="#A3E635" // Light Green
  onClick={() => navigate('/lab/member-permissions')}
/>
```

**Badge:** Shows member count (e.g., "5 Members")

---

### **Tile 4: 🎨 Display Mode**
```tsx
<SettingTile
  icon="🎨"
  title="Display Mode"
  subtitle="Theme, Font Size & Accessibility"
  badge="Midnight Slate"
  color="#94A3B8" // Slate 400
  onClick={() => navigate('/lab/display-mode')}
/>
```

**Badge:** Shows current theme (e.g., "Midnight Slate", "High Contrast")

---

## 🎨 **DETAIL VIEWS (DRILL-DOWN)**

### **Safety Alerts Detail View:**

```
┌──────────────────────────────────────────────────────┐
│  ← Back to Lab                                       │
│  🚨 Safety Alerts                                    │
├──────────────────────────────────────────────────────┤
│  [Section: Medication Alerts]                        │
│  ┌──────────────────────────────────────────────────┐
│  │  Amber Warning Threshold                         │
│  │  How many minutes before dose is "overdue"?      │
│  │                                                   │
│  │  [5 min] [10 min] [15 min] [30 min] [60 min]    │
│  │                    ↑ Selected                     │
│  │                                                   │
│  │  Current: 15 minutes                             │
│  └──────────────────────────────────────────────────┘
│                                                       │
│  ┌──────────────────────────────────────────────────┐
│  │  Critical Alert Threshold                        │
│  │  How many minutes before "critical" state?       │
│  │                                                   │
│  │  [30 min] [45 min] [60 min] [90 min] [120 min]  │
│  │            ↑ Selected                             │
│  │                                                   │
│  │  Current: 45 minutes                             │
│  └──────────────────────────────────────────────────┘
│                                                       │
│  [Section: Smart Ping]                               │
│  ┌──────────────────────────────────────────────────┐
│  │  Ping Interval                                    │
│  │  [1h] [2h] [3h] [4h] [6h]                        │
│  │             ↑ Selected                            │
│  └──────────────────────────────────────────────────┘
└──────────────────────────────────────────────────────┘
```

---

### **Geofence Zones Detail View:**

```
┌──────────────────────────────────────────────────────┐
│  ← Back to Lab                                       │
│  📍 Geofence Zones                                   │
├──────────────────────────────────────────────────────┤
│  [Section: Doctor Visit Geofence]                   │
│  ┌──────────────────────────────────────────────────┐
│  │  Default Radius                                   │
│  │  Adjust the detection zone for doctor visits.    │
│  │                                                   │
│  │  [Large Tactile Slider: 80px height]            │
│  │  ├────────────●─────────────────────────┤        │
│  │  0.1 mi               0.5 mi            1.0 mi   │
│  │                                                   │
│  │  Current: 0.5 miles (804 meters)                 │
│  │                                                   │
│  │  Preview: [Mini map with circle overlay]         │
│  └──────────────────────────────────────────────────┘
│                                                       │
│  [Section: Home Geofence]                            │
│  ┌──────────────────────────────────────────────────┐
│  │  Home Radius                                      │
│  │  [Large Tactile Slider: 80px height]            │
│  │  ├──────●───────────────────────────────┤        │
│  │  0.1 mi     0.25 mi            1.0 mi            │
│  │                                                   │
│  │  Alert on Exit: [Toggle: ON/OFF 64px]           │
│  └──────────────────────────────────────────────────┘
└──────────────────────────────────────────────────────┘
```

---

## 🎨 **LARGE TACTILE CONTROLS (SENIOR-FRIENDLY)**

### **1. Toggle Switches (64px HEIGHT)**

```tsx
<TactileToggle
  value={isEnabled}
  onChange={setIsEnabled}
  label="Alert on Home Exit"
  height={64}
/>
```

**Visual Design:**
```
┌────────────────────────────────────────┐
│  Alert on Home Exit                    │
│                                        │
│  [Toggle Switch: 64px × 120px]        │
│  ┌────────────┐                        │
│  │ ●──────────│  OFF  ←  Gray #64748B │
│  └────────────┘                        │
│                                        │
│  ┌────────────┐                        │
│  │──────────● │  ON   ←  Green #84CC16│
│  └────────────┘                        │
└────────────────────────────────────────┘
```

**Properties:**
- Toggle width: 120px
- Toggle height: 64px
- Thumb size: 56px × 56px (large, easy to grab)
- Track color (OFF): #334155 (Slate 700)
- Track color (ON): #84CC16 (Safety Green)
- Thumb color: #FFFFFF (White)
- Shadow: 0 2px 8px rgba(0, 0, 0, 0.3)
- Transition: 200ms ease-out

---

### **2. Tactile Slider (80px HEIGHT)**

```tsx
<TactileSlider
  min={0.1}
  max={1.0}
  step={0.1}
  value={0.5}
  onChange={setValue}
  label="Doctor Visit Geofence Radius"
  unit="miles"
  height={80}
/>
```

**Visual Design:**
```
┌────────────────────────────────────────────────────┐
│  Doctor Visit Geofence Radius                      │
│                                                     │
│  Track (12px height):                              │
│  ├───────────────●──────────────────────────┤      │
│  │ Active        │ Inactive                 │      │
│  │ #FBBF24       │ #334155                  │      │
│                                                     │
│  Thumb (80px × 80px):                              │
│  ┌──────────┐                                      │
│  │    ●     │  ← Large circular thumb              │
│  │  0.5 mi  │  ← Value displayed inside            │
│  └──────────┘                                      │
│                                                     │
│  Labels:                                            │
│  0.1 mi        0.5 mi        1.0 mi                │
└────────────────────────────────────────────────────┘
```

**Properties:**
- Track height: 12px
- Track color (inactive): #334155 (Slate 700)
- Track color (active): #FBBF24 (Safety Amber)
- Thumb size: 80px × 80px (very large for precision)
- Thumb color: #1E40AF (Industrial Blue)
- Thumb border: 4px solid #FBBF24 (Safety Amber)
- Thumb shadow: 0 4px 12px rgba(251, 191, 36, 0.5)
- Value inside thumb: 24px font, white, bold
- Snap to step: true (visual feedback on snap)

**Interaction:**
- Draggable thumb (touch-optimized)
- Tap track to jump to value
- Haptic feedback on snap (mobile)
- Live preview updates (mini map shows circle)

---

### **3. Multi-Choice Selector (72px PER OPTION)**

```tsx
<MultiChoiceSelector
  options={[
    { value: 15, label: '15 min' },
    { value: 30, label: '30 min' },
    { value: 45, label: '45 min' },
  ]}
  value={15}
  onChange={setValue}
  height={72}
/>
```

**Visual Design:**
```
┌─────────────────────────────────────────────────┐
│  [15 min]   [30 min]   [45 min]   [60 min]     │
│     ↑          □          □          □          │
│  Selected   Inactive   Inactive   Inactive      │
│                                                  │
│  Active:  #FBBF24 background, white text        │
│  Inactive: #334155 background, #94A3B8 text     │
└─────────────────────────────────────────────────┘
```

**Properties:**
- Button height: 72px
- Button width: Auto (flex-grow)
- Gap: 12px
- Active background: #FBBF24 (Safety Amber)
- Active text: #0F172A (Dark)
- Active border: 3px solid #FFFFFF
- Inactive background: #334155 (Slate 700)
- Inactive text: #94A3B8 (Slate 400)
- Inactive border: 1px solid #475569 (Slate 600)
- Border-radius: 8px
- Transition: 200ms ease-out

---

## 🎨 **ACCESSIBILITY FEATURES**

### **1. High Contrast Mode**

When `ui_theme = 'high_contrast'`:
- Backgrounds: Pure black #000000
- Text: Pure white #FFFFFF
- Borders: 3px solid (increased from 2px)
- Active states: Bright yellow #FFFF00 (not amber)
- Shadows: Removed (reduce visual clutter)

---

### **2. Extra Large Font Mode**

When `ui_font_size = 'extra_large'`:
- Tile titles: 24px (up from 18px)
- Tile subtitles: 18px (up from 14px)
- Section headers: 28px (up from 20px)
- Body text: 20px (up from 16px)
- Slider value: 32px (up from 24px)
- Toggle labels: 22px (up from 16px)

---

### **3. Touch Target Minimums**

All interactive elements:
- Minimum height: 48px (WCAG AAA)
- Preferred height: 64-72px (senior-friendly)
- Minimum width: 48px
- Minimum spacing: 12px between adjacent targets

---

### **4. Screen Reader Support**

```tsx
<TactileToggle
  aria-label="Alert on Home Exit"
  aria-checked={isEnabled}
  role="switch"
/>

<TactileSlider
  aria-label="Doctor Visit Geofence Radius"
  aria-valuemin={0.1}
  aria-valuemax={1.0}
  aria-valuenow={0.5}
  aria-valuetext="0.5 miles"
/>
```

---

## 🎨 **MINI MAP PREVIEW (GEOFENCE VISUALIZATION)**

### **Component:**
```tsx
<GeofencePreview
  centerLat={37.7749}
  centerLng={-122.4194}
  radiusMeters={804.672}
  label="Doctor's Office"
/>
```

**Visual Design:**
```
┌──────────────────────────────┐
│   [Static map image]         │
│   ┌──────────────────┐       │
│   │        ●         │       │
│   │    ╱       ╲     │       │
│   │  ╱           ╲   │       │
│   │ │    0.5 mi   │  │       │
│   │  ╲           ╱   │       │
│   │    ╲       ╱     │       │
│   │        ○         │       │
│   └──────────────────┘       │
│                               │
│   Center: 📍 Doctor's Office │
│   Radius: 0.5 miles          │
└──────────────────────────────┘
```

**Properties:**
- Size: 200px × 200px
- Border: 2px solid #3B82F6
- Border-radius: 8px
- Center pin: 🚩 (doctor visit) or 🏠 (home)
- Circle color: #FBBF24 with 30% opacity
- Circle border: 2px solid #FBBF24
- Updates in real-time as slider moves

---

## 🎨 **SAVE CONFIRMATION MODAL**

When user changes a setting:

```
┌──────────────────────────────────────┐
│  ⚠️ Confirm Setting Change           │
├──────────────────────────────────────┤
│  You are about to change:            │
│                                       │
│  Setting: Medication Amber Threshold │
│  Old Value: 15 minutes               │
│  New Value: 30 minutes               │
│                                       │
│  This will apply to all family       │
│  members immediately.                │
│                                       │
│  [Cancel]         [Save Change]      │
│   64px              64px             │
└──────────────────────────────────────┘
```

**Properties:**
- Modal width: 400px (max)
- Modal background: #1E293B
- Border: 2px solid #FBBF24
- Save button: 64px height, #84CC16 background
- Cancel button: 64px height, #334155 background
- Backdrop: 98% opacity black, blur 8px

---

## 🎨 **WEBSOOCKET SYNC INDICATOR**

When settings change on another device:

```tsx
<SyncIndicator status="syncing" />
```

**Visual Design:**
```
┌────────────────────────────────────────┐
│  [Top of screen, floating toast]      │
│  ┌──────────────────────────────────┐ │
│  │  🔄 Settings Updated              │ │
│  │  Changes from another device      │ │
│  │  synced successfully.             │ │
│  └──────────────────────────────────┘ │
└────────────────────────────────────────┘
```

**Properties:**
- Position: Fixed top, centered
- Background: #1E40AF (Industrial Blue)
- Border: 2px solid #84CC16 (Success)
- Duration: 3 seconds (auto-dismiss)
- Animation: Slide down from top (300ms)

**States:**
- Syncing: 🔄 Blue background
- Success: ✓ Green border
- Conflict: ⚠️ Amber border (requires user intervention)

---

## 📐 **RESPONSIVE LAYOUT**

### **Mobile (< 768px):**
- Tile grid: 1 column (full width)
- Slider track: 100% width
- Toggle switches: Full width labels
- Mini map: 200px × 200px (centered)

### **Tablet (768px - 1024px):**
- Tile grid: 2 columns
- Slider track: 80% width
- Side-by-side toggles: 2 per row

### **Desktop (> 1024px):**
- Tile grid: 3 columns
- Slider track: 60% width (max 600px)
- Side-by-side toggles: 3 per row
- Mini map: 300px × 300px

---

## 🎨 **ANIMATION SPECIFICATIONS**

### **Tile Hover:**
```css
.setting-tile {
  transition: all 200ms ease-out;
}

.setting-tile:hover {
  transform: scale(1.02);
  border-color: #FBBF24;
  box-shadow: 0 6px 16px rgba(251, 191, 36, 0.4);
}

.setting-tile:active {
  transform: scale(0.98);
}
```

---

### **Toggle Switch:**
```css
.toggle-thumb {
  transition: transform 200ms ease-out;
}

.toggle-thumb.on {
  transform: translateX(56px); /* Thumb width */
}
```

---

### **Slider Thumb:**
```css
.slider-thumb {
  transition: all 150ms ease-out;
}

.slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(251, 191, 36, 0.6);
}

.slider-thumb:active {
  transform: scale(1.05);
}
```

---

## 🎯 **ACCEPTANCE CRITERIA**

### **Must Have:**
- [x] Industrial Blue palette (#1E40AF base)
- [x] Safety Amber (#FBBF24) for critical settings
- [x] Tile height: 72px minimum
- [x] Toggle switches: 64px height
- [x] Tactile slider: 80px height, 80px thumb
- [x] All touch targets ≥ 48px
- [x] High contrast mode support
- [x] Extra large font mode support
- [x] WebSocket sync indicator
- [x] Mini map geofence preview

### **Nice to Have:**
- [ ] Haptic feedback on slider snap (mobile)
- [ ] Animated geofence circle expansion (when radius changes)
- [ ] Voice control support ("Set geofence to 1 mile")
- [ ] Settings export/import (backup configuration)

---

## 📊 **DESIGN TOKENS**

```typescript
export const FamilyLabTokens = {
  colors: {
    industrialBlue: '#1E40AF',
    deepNavy: '#1E3A8A',
    electricBlue: '#3B82F6',
    safetyAmber: '#FBBF24',
    emergencyRed: '#FF4444',
    safetyGreen: '#84CC16',
  },
  spacing: {
    tileHeight: 72,
    toggleHeight: 64,
    sliderHeight: 80,
    sliderThumbSize: 80,
    touchTargetMin: 48,
  },
  typography: {
    tileTitle: { fontSize: 18, fontWeight: 700 },
    tileSubtitle: { fontSize: 14, fontWeight: 400 },
    sectionHeader: { fontSize: 20, fontWeight: 700 },
    sliderValue: { fontSize: 24, fontWeight: 700 },
  },
  animation: {
    duration: 200,
    easing: 'ease-out',
  },
};
```

---

**End of Family Lab Visual Specification**

**Designer:** AI UX/UI Design Agent  
**Status:** ✅ **SPECIFICATION COMPLETE**  
**Next Action:** Coder implementation (FamilyLab.tsx)

---

**👨‍🎨 V8.3: FAMILY LAB VISUAL LANGUAGE COMPLETE. INDUSTRIAL CONTROL ROOM AESTHETIC. SENIOR-FRIENDLY TACTILE CONTROLS. READY FOR IMPLEMENTATION. 🎨**
