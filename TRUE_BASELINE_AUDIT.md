# TRUE GROUND-TRUTH BASELINE AUDIT (V65.0)
**Status:** ⚠️ CRITICAL READINESS GAPS DETECTED  
**Auditor:** Gemini CLI (flutter-agent)  
**Date:** February 24, 2026

---

## 🔐 1. SUPABASE AUTH & ROUTING
- **Auth Enforcement:** 🟢 **STRICT**. `lib/routing/router.dart` checks for an active Supabase session. If missing, it forces redirection to `/onboarding`.
- **Join Family Flow:** 🟡 **PARTIAL**. 
    - The schema supports `invite_code` in the `families` table.
    - `LoginView` has a UI for entering a code.
    - `FamilyNotifier` has a `joinFamily` method.
    - **Gap:** The RLS policies for joining via code are untested and may require a Supabase RPC function to handle the atomic "check code + link profile" operation securely.
- **Family Setup:** 🟢 **WIRED**. `FamilySetupView` correctly creates a new family entry and updates user metadata.

## 🧪 2. MOCK DATA ERADICATION
- **Status:** 🔴 **FAIL**. The codebase is still heavily "infected" with prototype character data.
- **Files containing "Richard/Miller/Aston/Sierra":**
    - `lib/services/stitch_service.dart`: Hardcoded list of 5 mock members.
    - `lib/services/hardware_monitor.dart`: Specifically targets `'richard'` for battery updates.
    - `lib/services/stitch_sync.dart`: Hardcoded logic for `'richard'` falls and missed meds.
    - `lib/services/weather_sentinel.dart`: Only updates `'richard'`.
    - `lib/features/family_head/family_head_view.dart`: Hardcoded calendar events and logic for `'richard'`, `'aston'`, and `'emery'`.
    - `lib/features/history/history_view.dart`: Hardcoded stats for Feb 22/21.
    - `lib/features/contacts/contacts_view.dart`: Static list of Miller family contacts.
- **Hardcoded Stats:** 🟡 **PARTIAL**. Many views still use static strings like `"120/80"` or `"72 bpm"` instead of pulling from the `vitals_log` table.

## 🗄️ 3. DATABASE SCHEMA ALIGNMENT
- **Profiles Table:** 🟢 **ALIGNED**. Supports `is_managed` and `auth_id`, matching the requirement for members without phones.
- **Managed Devices:** 🟢 **ALIGNED**. Table exists in `supabase_schema.sql` and `ManagedDevice` model exists in Flutter.
- **Nullability Gaps:** 🟡 **MINOR**. The `FamilyMember` model in Flutter expects many fields (hr, bp, info) to be non-null strings, but the database schema doesn't yet have columns for all the high-level status fields used in the UI.

## 🔔 4. PUSH NOTIFICATION / BACKGROUND STATUS
- **Background Worker:** 🟢 **FOUNDATION OK**. `flutter_background_service` is integrated and initialized in `main.dart`. `BackgroundEngine` has a 15-minute loop placeholder.
- **Push Notifications (FCM/APNs):** 🔴 **MISSING**. 
    - No `firebase_messaging` in `pubspec.yaml`.
    - No `google-services.json` or `GoogleService-Info.plist` detected in native directories.
    - **Conclusion:** Real-time alerts will NOT work if the app is closed.

## 🛑 5. CRITICAL GAPS (BLOCKERS FOR BETA)
1. **Mock Logic Dependency:** The core safety services (`HardwareMonitor`, `StitchSync`, `WeatherSentinel`) are explicitly tied to hardcoded IDs like `'richard'`. These will break or do nothing for a real family that creates their own profiles.
2. **Missing Real Notifications:** Without FCM integration, families will not receive "Emergency Panic" or "Fall Detected" alerts unless they happened to be looking at the app at that exact second. This is a primary safety failure.
3. **Data Write-Back:** Most UI actions (marking med taken, adding schedule) only update the **local** Riverpod state and do not `INSERT/UPDATE` the Supabase database. Data will be lost on refresh.

---

### 📋 AUDITOR RECOMMENDATION
**DO NOT LAUNCH.** The app is currently a "Supabase-flavored Mockup." To reach Beta status, we must move the logic inside `HardwareMonitor` and `StitchSync` to be role-based rather than name-based, and integrate a real notification delivery system.
