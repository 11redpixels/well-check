Product Requirements Document (PRD)
Product Name: Well-Check Family Safety OS

Version: 6.0 (Build-Ready)

Status: Finalized for Architecture

🏗️ THE FOUNDATION
The Product Metaphor: "The Family Command Center." A rugged, industrial-grade safety net that replaces passive trackers with deterministic, verified safety pulses.

The Atomic Unit of Value: The "Verified Safety Event"—a data packet containing User ID, GPS, Timestamp, and Battery %, triggered by a Pulse, Medication Dose, or Appointment Arrival.

User Personas (Role Archetypes):

Family Head (Admin): Primary owner/payer. Manages Family Code, sets safety rules, and toggles medical modules per user.

The Protected (Vulnerable): Members requiring intensive monitoring (Seniors/Sick).

Monitors: Family members who maintain awareness but cannot change core safety rules.

Minors: Children with high-frequency tracking but deactivated medical modules.

🛠️ CORE OPERATIONAL MODULES
Capability-Based Role Toggles: Centralized control for the Family Head to turn "ON/OFF" specific modules (Medication, Doctor Visits, Panic Mode) per member.

Medication Management Engine: Admin-only interface for prescriptions and dosages. Admin sees a "Pull-All" adherence history.

Medical Service Calendar: Manual-entry calendar for health visits. Triggers arrival notifications via GPS proximity.

High-Vis "Senior Mode" UI: Enforces 60px touch targets, 7:1 contrast ratios, and zero nested menus.

Passwordless 6-Digit Onboarding: Members join via a unique 6-digit Family Code (e.g., XP9-2RT). No passwords for sub-members.

🪜 THE ESCALATION LADDER (MEDICATION)
Stage 1 (15m): Local Nudge. User’s device vibrates/sounds.

Stage 2 (1h): Family Nudge. Push notification to all Monitors: "Check on Mom—Medication window closing."

Stage 3 (2h): Critical Monitor Alert. Full-screen takeover for Monitors with a direct "Call Now" button and the user's current GPS.

Missed Dose "Reasoning" Log: If a dose is missed beyond Stage 3, the user or Monitor must select a reason (e.g., "Refused", "Sleeping") to close the audit trail.

🚨 SAFETY & EMERGENCY LOGIC
Silent Panic Protocol: Triggered by long-press on the Pulse button. No audio/visual feedback on the Protected user’s phone.

Encrypted Emergency Audio: Silent Panic broadcasts 30 seconds of live encrypted audio to Monitors instantly.

911 Emergency Strobe: Active Panic renders a red "breathing" strobe on the screen border to signal emergency state.

Mandatory 911 Legal Gate: Hard-coded, full-screen modal accepted before any data fetch. "NOT A REPLACEMENT FOR 911."

📍 AUTOMATED LOGISTICS
Auto-Clinic Check-In: Creates a 100m geofence around scheduled doctor appointments. Auto-notifies family upon entry.

Forced Last-Gasp Pulse: Device forces a high-accuracy GPS poll at 2% battery and sends a "Critical Shutdown" event.

Low-Signal Queueing (LSQ): Actions are stored in IndexedDB and sent with original capture timestamps once signal returns.

🔒 SECURITY & PRIVACY
Multi-Tenant RLS Isolation: Database-level security ensuring Family A never sees Family B’s data.

90-Day Active History Vault: All medical logs and pulses are retained for 90 days.

The Single-Source Ledger: Only the Family Head can commit changes to the Master Med List. Monitors "Suggest" changes only.

The Database "Kill Switch": If Safety Terms are not accepted, the database returns 0 rows, locking the app.

"Ghost" Privacy Toggle: Allows Adult/Monitor roles to hide location unless a Panic or Ping is triggered.

📱 USER EXPERIENCE STANDARDS
The 3-Zone HUD: Zone 1 (Pulse/Map), Zone 2 (Horizon/Family Cards), Zone 3 (Ghost/System Health).

Zero-Gravity Feedback: 0ms visual acknowledgment for all critical taps.

Grandmother Error Handling: Plain-language instructions for all technical failures.

Battery Health Alerts: Automated notifications to Monitors at <15% battery.

📈 SUCCESS METRICS
Time to Verify: Target < 60s from Ping sent to Reply.

Adherence Gap: Target > 95% medication doses logged versus scheduled.

🏗️ OPERATIONAL LOGIC & INTELLIGENCE 31. Proximity-Based Alert Suppression: If a Monitor is within 50 meters of a "Protected" user (detected via Bluetooth or GPS), the "Escalation Ladder" notifications are silenced for that specific Monitor to prevent redundant noise while physically present. 32. The "Slide-to-Confirm" Pulse: To prevent accidental pocket-taps, the Zone 1 Pulse button requires a "Slide-to-Confirm" gesture (200px track) instead of a simple tap. 33. Medication Inventory Tracking: The Admin inputs the "Initial Pill Count." The app decrements this with every confirmed dose and triggers a "Low Supply" alert to the Admin when only 5 days of medication remain. 34. Dynamic Pharmacy Alerting: If the Admin has not specified a pharmacy in the Medication Module, the system sends a generic "Refill Due" alert. If a pharmacy is specified, the alert includes a "One-Tap Call Pharmacy" button.

🛡️ FAILURE & EDGE-CASE MANAGEMENT 35. Network-Late Delivery "Capture Stamping": If a Pulse or Panic is delayed by poor signal, the UI must prominently display the Capture Time (when it happened) in large text, with the Arrival Time (when the server received it) in small metadata text. 36. Device Lockdown / Theft Mode: If the Family Head flags a device as "Stolen," the app enters a dummy "System Update" loop while broadcasting high-frequency GPS pings to the Admin every 60 seconds until battery depletion. 37. Heartbeat "Ghost" Resolution: If a device is silent for >15 minutes, the avatar displays a "Last Heartbeat" countdown (e.g., "Disconnected 14m ago") to help family distinguish between a dead battery and a signal gap. 38. The 90-Day "Active History" Purge: All medication logs, arrivals, and pulses are kept in the active DB for 90 days. On Day 91, records are moved to an encrypted "Cold Archive" for legal compliance, keeping the main app fast and light.

⚖️ LEGAL, SAFETY & AUDIT 39. The "Universal Family PIN": A single 4-digit Safety PIN for the entire network. If a Panic is triggered, it cannot be silenced without this PIN. The Admin has the sole authority to "Reset PIN" or "Generate New PIN" if a user is removed. 40. Responder Acknowledgment Log: The system logs exactly which Monitor "Acknowledged" an alert (e.g., "Sarah acknowledged Mom's Stage 3 Med Alert at 2:14 PM"). This eliminates the "Bystander Effect" where everyone assumes someone else is handling it. 41. Encrypted Audio Retention: Audio recorded during Panic events is stored for exactly 90 days (matching the history vault) before automatic permanent deletion.

🧩 ADVANCED USER INTERFACE 42. Admin Command Heatmap: A specialized view for the Family Head that displays all 5+ family members on a single "Status Grid," showing Med Adherence, Battery, and Last Pulse at a glance. 43. Polygon "Safety Zones": Admins can draw custom shapes on the map (Home, School, Pharmacy). Entering/Leaving these zones triggers a "Zone Transition" event in the family activity feed. 44. Haptic Language System: Specific vibration signatures for different priorities:

Medication Stage 1: Double short pulse.

Monitor Ping: Constant 3-second vibration.

Emergency Panic: Rapid SOS haptic pattern. 45. Deep-Link Panic Widget: A 1-tap Panic widget for iOS/Android home screens, allowing an emergency trigger without unlocking the phone or finding the app icon.

⏳ SECTION 8: TEMPORAL LOGIC (TIME-BASED STATES) 46. Ping Cooling-Off Period: Once a Ping is sent, the "Request" state is locked for 5 minutes. The Monitor sees a "Ping Sent: Waiting" status rather than a re-triggerable button to prevent "Alert Spamming" of the Protected user. 47. Pulse "Freshness" Decay: A verified pulse remains "Bright Green" for 15 minutes. After 15 minutes, it fades to "Stale Amber" to signal to the Monitor that the location data is no longer real-time. 48. Medication Window Expiration: If a medication dose is not logged within 4 hours of the scheduled time, the state transitions from "Overdue" to "Missed (Final)" and requires a mandatory reason code to close the loop. 49. Auto-Resolution for Pings: If a Monitor pings a user and the user moves more than 50 meters (detected via GPS), the Ping is automatically marked as "Self-Resolved" even if the user didn't tap the button. 50. The "I'm Safe Now" Protocol: If a Panic is triggered, the screen enters a "Persistent Emergency State." The user can only resolve this by entering the Universal Family PIN. Once entered, the UI must instantly clear the red strobe and return to the Idle Map.

🛠️ SECTION 9: MODIFIABLE ACTIONS & OVERRIDES 51. Mistake-Correction Window: After tapping "I've Taken Meds," the user has a 60-second "Undo" grace period to correct a mis-tap before the entry becomes an Immutable Audit Log. 52. Panic "False Alarm" Retraction: If a Panic is triggered accidentally, the user has 5 seconds to "Long-Press to Cancel" before the silent audio and family-wide alerts are broadcast. 53. Admin Force-Clear: The Family Head has the "God-Mode" ability to remotely clear any member's Panic or Ping state from their own dashboard, provided they acknowledge a legal disclaimer. 54. Role-Based HUD Scaling: The UI "shrinks" features based on state. If no Meds are due and no Pings are active, the medical cards disappear (Ghost State) to maximize map visibility.

📡 SECTION 10: ADVANCED SYSTEM AWARENESS 55. "In-Motion" State Detection: If the device detects speeds >15mph, the app suppresses Stage 1 Medication Nudges to prevent distracting a driver, delaying the alert until the "Stationary" state is resumed. 56. Proactive Sync Heartbeat: Every 30 minutes of idle time, the app performs a "Ghost Sync" (Zone 3) to verify the RLS Kill-Switch and Terms acceptance still match the database. 57. Dynamic Re-Ping Logic: If a Monitor's Ping fails due to "No Signal," the app enters an "Auto-Retry" state, attempting to push the Ping every 2 minutes for 1 hour until a "Delivered" receipt is received. 58. Persistent HUD Banners: Active emergencies (Panic/Stage 3 Meds) create a persistent, non-swipeable banner at the top of the app that stays visible even if the user navigates to the Settings or Calendar. 59. Multi-Monitor Conflict Resolution: If two Monitors try to Ping the same Protected user at once, the system merges them into a single "Group Ping" to reduce device battery drain and user stress. 60. The "Safe Path" Visualizer: During an active Panic or Ping, the map displays the last 5 minutes of movement as a "breadcrumb trail" to show the direction of travel, not just a single dot.