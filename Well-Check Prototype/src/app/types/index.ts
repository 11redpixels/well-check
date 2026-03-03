// Well-Check Type Definitions (V8.1 - The Seven Pillars)
// Security Contract: All entities are scoped to tenant_id for multi-family isolation

export type AppStatus = 'idle' | 'ping_sent' | 'verified' | 'panic' | 'offline';

// 🆕 V6.0: PRD-Compliant User Roles (prd.md #13-22)
// 🆕 V7.7: Added "asset" role for Pet & Tracker Integration (Phase 5)
export type UserRole = 
  | 'family_head'    // Admin: Sole authority for medical schema, manages Family Code
  | 'protected'      // Vulnerable: Seniors/sick requiring intensive monitoring
  | 'monitor'        // Family: Maintain awareness, cannot change core safety rules
  | 'minor'          // Child: High-freq tracking, deactivated medical modules
  | 'asset';         // Passive: AirTags/Tile/Pets - location only, no UI/medical/panic

export type GPSAccuracy = 'high' | 'medium' | 'low' | 'none';

// 🆕 V7.7: Asset Tracker Types (Phase 5)
export type AssetTrackerType = 
  | 'airtag'         // Apple AirTag
  | 'tile'           // Tile tracker
  | 'chipolo'        // Chipolo tracker
  | 'samsung_tag'    // Samsung SmartTag
  | 'pet_collar'     // GPS pet collar (e.g., Fi, Whistle)
  | 'other';         // Other third-party tracker

export type PingStatus = 'pending' | 'replied' | 'timeout';

// 🆕 V5.0: Emergency Event Types
export type EmergencyStatus = 'active' | 'resolved' | 'false_alarm';
export type SyncMode = 'normal' | 'high_frequency' | 'offline_queue';
export type DistanceZone = 'nearby' | 'moderate' | 'far';

// 🆕 V6.0: Medication Module Types
export type MedicationStatus = 'pending' | 'taken' | 'missed' | 'snoozed';
export type EscalationStage = 0 | 1 | 2 | 3 | 'final';
export type ReasoningCode = 
  | 'refused'
  | 'sleeping'
  | 'traveling'
  | 'out_of_pills'
  | 'side_effects'
  | 'forgot'
  | 'other';

// 🆕 V7.0: Doctor Visits Module Types
export type AppointmentStatus = 
  | 'scheduled'    // Future appointment
  | 'en_route'     // User heading to appointment
  | 'arrived'      // Within geofence, confirmed check-in
  | 'late'         // 15+ minutes past scheduled time, not arrived
  | 'completed'    // Appointment finished
  | 'cancelled'    // Cancelled by Family Head
  | 'no_show';     // Did not arrive, appointment time passed

export type GeofenceStatus = 
  | 'outside'      // Not within geofence radius
  | 'approaching'  // Within 1 mile but outside geofence
  | 'inside'       // Within geofence (0.5 miles)
  | 'departed';    // Left geofence after arrival

// 🆕 V8.1: PILLAR 2 - Notification Center Types
export type NotificationEventType = 
  | 'panic'
  | 'medication_missed'
  | 'medication_confirmed'
  | 'geofence_late'
  | 'geofence_arrived'
  | 'doctor_visit'
  | 'ping_sent'
  | 'ping_received'
  | 'status_update'
  | 'asset_moved';

export type NotificationSeverity = 'critical' | 'high' | 'medium' | 'low';

// 🆕 V8.1: PILLAR 6 - Ephemeral Asset Types
export type EphemeralAssetType = 'photo' | 'voice_note';
export type EphemeralRelatedEventType = 
  | 'medication_confirmation'
  | 'doctor_arrival'
  | 'post_visit_feedback';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  tenantId: string; // Family group UUID
  avatarUrl?: string;
  createdAt: number;
}

export interface FamilyMember {
  id: string;
  name: string;
  role: UserRole;
  tenantId: string;
  isOnline: boolean;
  batteryLevel: number; // 0-100
  lastLocation?: Location;
  lastSeen: number; // Unix timestamp
}

export interface Location {
  lat: number;
  lng: number;
  accuracy: number; // meters
  timestamp: number;
}

export interface VerifiedPulse {
  userId: string;
  userName: string;
  location: Location;
  batteryLevel: number;
  timestamp: number;
  tenantId: string;
}

export interface PingRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  sentAt: number;
  status: PingStatus;
  tenantId: string;
}

export interface PanicEvent {
  id: string;
  userId: string;
  userName: string;
  location: Location;
  triggeredAt: number;
  audioRecording?: boolean;
  tenantId: string;
  forceHighAccuracy?: boolean; // 🚨 SAFETY OVERRIDE: Force high-accuracy GPS in panic mode
  
  // 🆕 V5.0: Emergency Event Fields
  status?: EmergencyStatus;
  syncMode?: SyncMode;
  resolvedBy?: string;
  resolvedAt?: number;
  resolutionNotes?: string;
  
  // 🆕 V7.4: Phase 4 - Panic Module Fields
  isSilentMode?: boolean; // Silent panic toggle
  audioBufferUrl?: string; // 30-second audio buffer
  audioBufferSha256?: string; // Encryption hash
  gpsPings?: Location[]; // 10-second GPS ping history
  broadcastSentAt?: number; // When emergency broadcast sent to monitors
  broadcastRecipients?: string[]; // Monitor IDs who received broadcast
  lockdownActive?: boolean; // App in lockdown mode (requires PIN to exit)
  hasAccepted911Terms?: boolean; // User accepted 911 Legal Gate
}

export interface AppState {
  // Core Status
  status: AppStatus;
  
  // User & Family Network
  currentUser: User | null;
  familyCode: string | null; // e.g., "XP9-2RT"
  tenantId: string | null;
  familyMembers: FamilyMember[];
  
  // Smart Ping State
  activePings: PingRequest[];
  lastVerifiedPulse: VerifiedPulse | null;
  awaitingReplyFrom: string[]; // Member IDs
  
  // System Health
  isOffline: boolean;
  isSyncing: boolean;
  lastSyncTimestamp: number;
  batteryLevel: number; // Device battery
  gpsAccuracy: GPSAccuracy;
  networkLatency: number; // ms
  
  // 🆕 V5.0: Sync Mode Indicator
  syncMode?: SyncMode;
  
  // Monitor-Specific
  activeWatchMode: boolean;
  nudgeThreshold: number; // Minutes
  
  // Panic Mode
  currentPanicEvent: PanicEvent | null;
  
  // 🆕 V7.5: HUD Re-Architecture - 3-Zone Navigation
  currentView: 'map' | 'horizon' | 'ledger'; // Center, Left, Right
  controlDrawerOpen: boolean; // Command Hub overlay
  
  // 🆕 V9.2: Management Action State (Success State Sync)
  managementActionInProgress?: {
    action: 'medication' | 'geofence' | 'members' | 'map';
    startedAt: number;
  } | null;
}

export interface OptimisticAction {
  id: string;
  type: 'ping' | 'reply' | 'panic';
  timestamp: number;
  pending: boolean;
}

// 🆕 V5.0: New Schema Entities

export interface AuditLog {
  id: string;
  tenantId: string;
  userId: string;
  eventType: 'ping_sent' | 'ping_replied' | 'panic_triggered' | 'panic_resolved' | 'status_change';
  eventData: Record<string, any>;
  
  // Battery-aware metadata
  metadata: {
    battery_at_time_of_ping?: number;
    gps_accuracy?: GPSAccuracy;
    network_latency_ms?: number;
    device_model?: string;
    app_version?: string;
  };
  
  // Compliance fields
  ipAddress?: string;
  userAgent?: string;
  serverTimestamp: number;
  createdAt: number;
}

export interface EmergencyEvent {
  id: string;
  tenantId: string;
  triggeredByUserId: string;
  triggeredByUserName: string;
  status: EmergencyStatus;
  syncMode: SyncMode;
  location: Location;
  audioRecordingEnabled: boolean;
  audioFileUrl?: string;
  audioSha256Hash?: string;
  forceHighAccuracy: boolean;
  resolvedByUserId?: string;
  resolvedAt?: number;
  resolutionNotes?: string;
  triggeredAt: number;
  createdAt: number;
  updatedAt: number;
}

export interface ProximitySnapshot {
  id: string;
  tenantId: string;
  fromUserId: string;
  toUserId: string;
  distanceMiles: number;
  distanceZone: DistanceZone;
  fromLocation: Location;
  toLocation: Location;
  calculationMethod: 'haversine' | 'google_maps_api';
  calculatedAt: number;
  expiresAt: number;
}

// 🆕 V6.0: Capability-Based Role Toggles (prd.md #24)
export interface UserCapabilities {
  id: string;
  userId: string;
  tenantId: string;
  medicationEnabled: boolean;
  doctorVisitsEnabled: boolean;
  panicModeEnabled: boolean;
  managedByUserId: string; // Family Head who controls capabilities
  updatedAt: number;
  createdAt: number;
}

// 🆕 V6.0: Medication Management (prd.md #26-27, #34-42)
export interface Medication {
  id: string;
  tenantId: string;
  userId: string;
  name: string;
  dosage: string; // e.g., "10mg", "2 tablets"
  frequency: string; // e.g., "2x daily", "Every 8 hours"
  scheduledTimes: string[]; // e.g., ['08:00', '20:00']
  
  // Inventory Tracking (prd.md #33)
  initialPillCount?: number;
  currentPillCount?: number;
  lowSupplyThreshold: number; // Alert when ≤ N days remaining
  
  // Pharmacy Info (prd.md #34)
  pharmacyName?: string;
  pharmacyPhone?: string;
  pharmacyAddress?: string;
  
  // Admin Controls
  createdByUserId: string; // Family Head
  isActive: boolean;
  
  createdAt: number;
  updatedAt: number;
}

export interface MedicationLog {
  id: string;
  tenantId: string;
  medicationId: string;
  userId: string;
  
  // Scheduling
  scheduledTime: number; // Unix timestamp
  
  // Status Tracking (prd.md #34-42)
  status: MedicationStatus;
  escalationStage: EscalationStage;
  
  // Confirmation (prd.md #31: Non-Repudiation Law)
  takenAt?: number;
  confirmedByUserId?: string; // Could be Monitor
  
  // Missed Dose Reasoning (prd.md #42)
  reasoningCode?: ReasoningCode;
  reasoningNotes?: string;
  
  // Non-Repudiation Metadata (ai-domain-expert.md #31)
  captureTime: number; // When action happened (client time)
  uploadTime?: number; // When server received it (server time)
  gpsLocation?: Location;
  batteryLevel?: number; // 0-100
  deviceModel?: string;
  appVersion?: string;
  
  // Undo Window (prd.md #51)
  undoWindowExpiresAt?: number; // 60 seconds after taken
  isUndone: boolean;
  
  createdAt: number;
  updatedAt: number;
}

// 🆕 V6.0: Escalation Ladder Timings (prd.md #34-38)
export const ESCALATION_TIMINGS = {
  STAGE_1: 15 * 60 * 1000,      // 15 minutes (Local Nudge)
  STAGE_2: 60 * 60 * 1000,      // 1 hour (Family Nudge)
  STAGE_3: 2 * 60 * 60 * 1000,  // 2 hours (Critical Alert)
  MISSED_FINAL: 4 * 60 * 60 * 1000, // 4 hours (Reasoning Required)
};

// 🆕 V7.0: Doctor Visits & Geofence (prd.md #43-49)
export interface DoctorVisit {
  id: string;
  tenantId: string;
  userId: string; // Protected user attending
  
  // Appointment Details
  doctorName: string;
  specialty?: string; // e.g., "Cardiologist", "Primary Care"
  appointmentDate: number; // Unix timestamp
  appointmentTime: string; // e.g., "14:30"
  duration: number; // Minutes (default: 60)
  notes?: string;
  
  // Location & Geofence (prd.md #43)
  clinicName: string;
  clinicAddress: string;
  clinicLocation: Location; // GPS coordinates
  geofenceRadius: number; // Meters (default: 804.672 = 0.5 miles)
  
  // Doctor Contact
  doctorPhone?: string;
  clinicPhone?: string;
  
  // Status Tracking
  status: AppointmentStatus;
  geofenceStatus?: GeofenceStatus;
  
  // Check-In Metadata (prd.md #44)
  arrivedAt?: number; // Auto-check-in timestamp
  arrivedLocation?: Location; // Location when auto-check-in triggered
  departedAt?: number;
  
  // Late Arrival Alert (prd.md #45)
  lateAlertSentAt?: number; // When 15-minute late alert was sent
  
  // Monitor Assignments
  assignedMonitorIds: string[]; // Monitors to notify
  
  // Admin Controls
  createdByUserId: string; // Family Head
  isCancelled: boolean;
  
  createdAt: number;
  updatedAt: number;
}

// 🆕 V7.0: Geofence Configuration
export const GEOFENCE_CONFIG = {
  DEFAULT_RADIUS_METERS: 804.672, // 0.5 miles
  APPROACHING_RADIUS_METERS: 1609.344, // 1 mile
  ACCURACY_THRESHOLD_METERS: 10, // ±10m accuracy requirement (Geofence Law)
  LATE_ALERT_MINUTES: 15, // Alert if not arrived 15 minutes after scheduled time
  AUTO_COMPLETE_HOURS: 2, // Auto-mark completed 2 hours after scheduled time if departed
};

// 🆕 V7.4: Panic & Emergency Configuration (Phase 4)
export const PANIC_CONFIG = {
  HOLD_TO_ACTIVATE_MS: 5000, // 5-second hold to activate (prevent accidental triggers)
  GPS_PING_INTERVAL_MS: 10000, // 10-second GPS ping interval during active panic
  AUDIO_BUFFER_DURATION_MS: 30000, // 30-second audio buffer
  STROBE_ANIMATION_DURATION_MS: 2000, // 2-second breathing animation cycle
  HAPTIC_FEEDBACK_INTERVAL_MS: 500, // Haptic pulse every 500ms during hold
};

// 🆕 V7.4: Universal Family PIN
export interface UniversalFamilyPIN {
  tenantId: string;
  pinHash: string; // SHA-256 hash of PIN
  createdByUserId: string; // Family Head
  createdAt: number;
  lastUsedAt?: number;
}

// 🆕 V7.4: 911 Legal Gate Acceptance
export interface SafetyTermsAcceptance {
  userId: string;
  tenantId: string;
  acceptedAt: number;
  ipAddress?: string;
  deviceModel?: string;
  appVersion?: string;
}

// 🆕 V7.4: Emergency Resolution Codes
export type EmergencyResolutionCode =
  | 'false_alarm'      // Accidental trigger
  | 'resolved_safely'  // Situation resolved, user safe
  | 'medical_help'     // Medical assistance provided
  | 'police_called'    // Police were contacted
  | 'fire_called'      // Fire department contacted
  | '911_called'       // 911 was called
  | 'family_assisted'  // Family member helped
  | 'other';           // Other resolution

export interface PanicResolution {
  panicEventId: string;
  resolvedByUserId: string;
  resolvedByUserName: string;
  resolutionCode: EmergencyResolutionCode;
  resolutionNotes?: string;
  pinVerified: boolean; // Universal Family PIN was verified
  resolvedAt: number;
}

// 🆕 V7.7: Pet & Asset Tracker Integration (Phase 5)
export interface Asset {
  id: string;
  tenantId: string;
  name: string; // e.g., "Max's Collar", "Car Keys", "Grandma's Purse"
  trackerType: AssetTrackerType;
  
  // Tracker-Specific IDs
  deviceId: string; // External tracker ID (e.g., AirTag serial)
  externalProvider?: 'find_my' | 'google_find_my' | 'tile' | 'other';
  
  // Location Data (normalized to 90-Day Vault schema)
  lastLocation?: Location;
  lastSeen: number; // Unix timestamp
  batteryLevel?: number; // 0-100 (if supported by tracker)
  isOnline: boolean; // Currently transmitting location
  
  // Visual Customization
  iconType: 'paw' | 'tag' | 'key' | 'car' | 'purse' | 'bike' | 'backpack' | 'other';
  iconColor?: string; // Hex color for custom marker
  
  // Privacy & Permissions
  visibleToMonitors: boolean; // Always true for assets (no privacy toggles)
  addedByUserId: string; // Family Head who added tracker
  
  // Metadata
  notes?: string; // e.g., "Dog wears this collar during walks"
  isActive: boolean; // Tracker is actively being monitored
  
  createdAt: number;
  updatedAt: number;
}

// 🆕 V7.7: Asset Location History (90-Day Vault Compliance)
export interface AssetLocationSnapshot {
  id: string;
  tenantId: string;
  assetId: string;
  location: Location;
  batteryLevel?: number;
  
  // Non-Repudiation Metadata (ai-domain-expert.md #31)
  captureTime: number; // When tracker reported location (client time)
  uploadTime?: number; // When server received it (server time)
  
  // Third-Party Integration
  externalProvider?: string;
  externalId?: string; // External event ID from Find My API
  
  createdAt: number;
  expiresAt: number; // 90 days from captureTime
}

// 🆕 V8.1: PILLAR 1 - Medication Command Center
export interface MedicationV8 {
  id: string;
  tenantId: string;
  userId: string; // Protected user
  name: string;
  dosage: string; // "10mg", "2 pills", etc.
  schedule: MedicationScheduleV8[];
  inventoryRemaining: number;
  lowInventoryThreshold: number;
  createdByUserId: string; // Family Head
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface MedicationScheduleV8 {
  id: string;
  medicationId: string;
  time: string; // "08:00", "14:00", "20:00"
  days: ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[];
  isActive: boolean;
}

// 🆕 V8.1: PILLAR 2 - 90-Day Notification Center (Vault)
export interface NotificationEvent {
  id: string;
  tenantId: string;
  eventType: NotificationEventType;
  severity: NotificationSeverity;
  userId: string; // Event originator
  targetUserIds: string[]; // Monitors who need to see this
  title: string;
  body: string;
  metadata: Record<string, any>;
  timestamp: number;
  expiresAt: number; // 90 days from timestamp
  
  // Monitor Lock (PILLAR 2)
  requiresAcknowledgement: boolean;
  acknowledgedBy: {
    monitorId: string;
    acknowledgedAt: number;
  }[];
  isFullyAcknowledged: boolean; // All monitors acknowledged
}

// 🆕 V8.1: PILLAR 3 - Post-Visit Pulse
export interface PostVisitFeedback {
  id: string;
  tenantId: string;
  doctorVisitId: string;
  userId: string; // Who submitted feedback (Protected or Monitor)
  rating: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  photoUrl?: string; // Ephemeral asset
  voiceNoteUrl?: string; // Ephemeral asset
  submittedAt: number;
}

// 🆕 V8.1: PILLAR 4 - Family Lab Settings
export interface FamilySettings {
  id: string;
  tenantId: string;
  
  // Notification Sensitivities
  notificationSensitivity: {
    medication: 'immediate' | '5min' | '15min';
    geofence: 'all' | 'late_only' | 'none';
    ping: 'all' | 'family_head_only' | 'none';
    panic: 'always'; // Cannot be changed
  };
  
  // Geofence Radii (in meters)
  geofenceRadii: {
    doctorVisit: number; // Default: 804.672 (0.5mi)
    home: number;
    school: number;
  };
  
  // UI Settings
  uiSettings: {
    contrastMode: 'standard' | 'high';
    fontSize: 'small' | 'medium' | 'large' | 'xl';
    theme: 'dark' | 'light' | 'auto';
  };
  
  updatedAt: number;
  updatedBy: string; // User who changed settings
}

// 🆕 V8.1: PILLAR 5 - Panic Room (Enhanced)
export interface PanicEventV8 extends PanicEvent {
  // Force-Sync (all family members' apps show Panic Room)
  forceSyncTimestamp: number;
  connectedMonitors: {
    monitorId: string;
    connectedAt: number;
    viewingLiveStream: boolean;
  }[];
  
  // High-Frequency GPS (3-second pings during panic)
  highFrequencyGPS: Location[]; // Every 3s (vs 10s standard)
  
  // Live Audio Stream
  liveAudioStreamUrl?: string; // Real-time audio stream
  audioBufferUrl?: string; // 30-second pre-panic buffer
  
  // 911 Bridge
  call911Initiated?: {
    monitorId: string;
    timestamp: number;
    callDuration?: number;
  };
}

// 🆕 V8.1: PILLAR 6 - Ephemeral Assets (Social Pulse)
export interface EphemeralAsset {
  id: string;
  tenantId: string;
  userId: string; // Creator
  relatedEventId: string; // MedicationLog or DoctorVisit ID
  relatedEventType: EphemeralRelatedEventType;
  
  assetType: EphemeralAssetType;
  assetUrl: string; // Temporary URL (expires 24h)
  assetSize: number; // Bytes
  
  createdAt: number;
  expiresAt: number; // createdAt + 86400000 (24 hours)
  
  // Auto-deletion tracking
  deletionScheduled: boolean;
  deletedAt?: number;
  
  // Privacy
  visibleTo: string[]; // User IDs who can view (Protected + Monitors)
}

// 🆕 V8.1: Post-Visit Pulse Trigger Config
export const POST_VISIT_CONFIG = {
  TRIGGER_DELAY_MS: 30 * 60 * 1000, // 30 minutes after geofence exit
  PROMPT_EXPIRATION_MS: 24 * 60 * 60 * 1000, // Prompt expires after 24 hours
};

// 🆕 V8.1: Ephemeral Asset TTL Config
export const EPHEMERAL_CONFIG = {
  TTL_MS: 24 * 60 * 60 * 1000, // 24 hours
  PURGE_CHECK_INTERVAL_MS: 60 * 60 * 1000, // Check every hour
  MAX_PHOTO_SIZE_MB: 10, // 10MB max photo size
  MAX_VOICE_SIZE_MB: 5, // 5MB max voice note size
  MAX_VOICE_DURATION_SECONDS: 120, // 2 minutes max voice recording
};