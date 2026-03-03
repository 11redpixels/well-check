// 🛡️ Well-Check Routes - Role-Based Navigation
// Reference: prd.md (User Roles: Family Head, Protected, Monitor, Minor)
// V8.9: Smart Landing Page (First launch → Medications, Subsequent → Map)
// V11.4: Route Hardening (Driving Stats, Health Vitals, Invite Family)
// V12.0: Route Hardening Phase 2 (Medication Alerts, Geofence, Dashboard redirect, Panic History redirect)

import { createBrowserRouter } from 'react-router';

// Direct imports (no lazy loading to avoid suspense issues)
import { RootLayout } from './layouts/RootLayout';
import { SmartRootRedirect } from './components/SmartRootRedirect'; // V8.9: First launch logic

// Role-Based Views
import { FamilyHeadView } from './views/FamilyHeadView';
import { ProtectedView } from './views/ProtectedView';
import { MonitorView } from './views/MonitorView';
import { MinorView } from './views/MinorView';

// Feature Views
import { MedicationsView } from './views/MedicationsView';
import { DoctorVisitsView } from './views/DoctorVisitsView';
import { PanicView } from './views/PanicView';
import { SettingsView } from './views/SettingsView';
import { HistoryView } from './views/HistoryView';

// V11.4: New Operation Views (Command Center menu items)
import { DrivingStatsView } from './views/DrivingStatsView';
import { HealthVitalsView } from './views/HealthVitalsView';
import { InviteFamilyView } from './views/InviteFamilyView';

// V12.0: Route Hardening - New Views
import { MedicationAlertsView } from './views/MedicationAlertsView';
import { GeofenceView } from './views/GeofenceView';

// V12.0: Route Hardening - Redirect Components
import { RedirectToPanic } from './components/RedirectToPanic';
import { RedirectToFamilyHead } from './components/RedirectToFamilyHead';

// Error
import { NotFound } from './views/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      // V8.9: Smart Root Redirect (First launch → Medications, Subsequent → Map)
      { path: '/', Component: SmartRootRedirect },
      
      // Role-Based Home Routes
      { path: '/family-head', Component: FamilyHeadView },
      { path: '/protected', Component: ProtectedView },
      { path: '/monitor', Component: MonitorView },
      { path: '/minor', Component: MinorView },
      
      // Feature Routes
      { path: '/medications', Component: MedicationsView },
      { path: '/doctor-visits', Component: DoctorVisitsView },
      { path: '/panic', Component: PanicView },
      { path: '/settings', Component: SettingsView },
      { path: '/history', Component: HistoryView },
      
      // V11.4: New Operation Routes (Command Center menu items)
      { path: '/driving-stats', Component: DrivingStatsView },
      { path: '/health-vitals', Component: HealthVitalsView },
      { path: '/invite-family', Component: InviteFamilyView },
      
      // V12.0: Route Hardening - New Routes
      { path: '/medication-alerts', Component: MedicationAlertsView },
      { path: '/geofence', Component: GeofenceView },
      
      // V12.0: Route Hardening - Redirects
      { path: '/panic-history', Component: RedirectToPanic },
      { path: '/dashboard', Component: RedirectToFamilyHead },
      
      // Catch-all
      { path: '*', Component: NotFound },
    ],
  },
]);