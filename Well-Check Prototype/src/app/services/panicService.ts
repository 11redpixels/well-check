// 🛡️ Panic Service - Emergency Broadcast & High-Frequency GPS
// Chief Architect: Emergency broadcast engine, 10-second GPS polling, 30-second audio buffer
// Reference: prd.md (Panic Module), ai-domain-expert.md (911 Legal Gate)
// ⚠️ CRITICAL: Zero margin for error

import type {
  PanicEvent,
  Location,
  EmergencyResolutionCode,
  PanicResolution,
  SafetyTermsAcceptance,
  UniversalFamilyPIN,
} from '../types';
import { PANIC_CONFIG } from '../types';

// =====================================================================
// DATABASE LAYER (Mock - In production: Supabase)
// =====================================================================

let panicEventsDB: PanicEvent[] = [];
let safetyTermsDB: SafetyTermsAcceptance[] = [];
let familyPINDB: UniversalFamilyPIN[] = [];

// =====================================================================
// GPS HIGH-FREQUENCY POLLING (10-second intervals)
// =====================================================================

interface GPSPollingSession {
  panicEventId: string;
  intervalId: NodeJS.Timeout;
  startedAt: number;
  pingsCollected: number;
}

const activeGPSSessions: Map<string, GPSPollingSession> = new Map();

/**
 * Start high-frequency GPS polling for active panic
 * Collects GPS every 10 seconds
 */
export function startGPSPolling(
  panicEventId: string,
  getCurrentLocation: () => Promise<Location>
): void {
  // Prevent duplicate sessions
  if (activeGPSSessions.has(panicEventId)) {
    console.warn(`GPS polling already active for panic ${panicEventId}`);
    return;
  }

  console.log('🚨 Starting high-frequency GPS polling', {
    panicEventId,
    interval: PANIC_CONFIG.GPS_PING_INTERVAL_MS,
  });

  const intervalId = setInterval(async () => {
    try {
      const location = await getCurrentLocation();
      addGPSPing(panicEventId, location);

      console.log('📍 GPS ping collected', {
        panicEventId,
        lat: location.lat.toFixed(5),
        lng: location.lng.toFixed(5),
        accuracy: location.accuracy,
        timestamp: new Date(location.timestamp).toISOString(),
      });
    } catch (error) {
      console.error('❌ GPS ping failed', error);
    }
  }, PANIC_CONFIG.GPS_PING_INTERVAL_MS);

  activeGPSSessions.set(panicEventId, {
    panicEventId,
    intervalId,
    startedAt: Date.now(),
    pingsCollected: 0,
  });
}

/**
 * Stop GPS polling when panic is resolved
 */
export function stopGPSPolling(panicEventId: string): void {
  const session = activeGPSSessions.get(panicEventId);
  if (!session) {
    console.warn(`No active GPS polling for panic ${panicEventId}`);
    return;
  }

  clearInterval(session.intervalId);
  activeGPSSessions.delete(panicEventId);

  console.log('⏹️ GPS polling stopped', {
    panicEventId,
    duration: Date.now() - session.startedAt,
    pingsCollected: session.pingsCollected,
  });
}

/**
 * Add GPS ping to panic event history
 */
function addGPSPing(panicEventId: string, location: Location): void {
  const panic = getPanicEventById(panicEventId);
  if (!panic) return;

  const gpsPings = panic.gpsPings || [];
  gpsPings.push(location);

  updatePanicEvent(panicEventId, { gpsPings });

  // Update session counter
  const session = activeGPSSessions.get(panicEventId);
  if (session) {
    session.pingsCollected++;
  }
}

// =====================================================================
// EMERGENCY BROADCAST ENGINE
// =====================================================================

interface EmergencyBroadcast {
  id: string;
  panicEventId: string;
  tenantId: string;
  triggeredByUserId: string;
  triggeredByUserName: string;
  location: Location;
  isSilentMode: boolean;
  recipients: string[]; // Monitor IDs
  sentAt: number;
}

/**
 * Broadcast emergency alert to ALL monitors simultaneously
 * High-priority push notification
 */
export function broadcastEmergency(panicEvent: PanicEvent, monitorIds: string[]): EmergencyBroadcast {
  const broadcast: EmergencyBroadcast = {
    id: `broadcast-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    panicEventId: panicEvent.id,
    tenantId: panicEvent.tenantId,
    triggeredByUserId: panicEvent.userId,
    triggeredByUserName: panicEvent.userName,
    location: panicEvent.location,
    isSilentMode: panicEvent.isSilentMode || false,
    recipients: monitorIds,
    sentAt: Date.now(),
  };

  // Update panic event with broadcast metadata
  updatePanicEvent(panicEvent.id, {
    broadcastSentAt: broadcast.sentAt,
    broadcastRecipients: monitorIds,
  });

  console.log('📢 EMERGENCY BROADCAST SENT', {
    panicEventId: panicEvent.id,
    userName: panicEvent.userName,
    recipients: monitorIds.length,
    isSilentMode: broadcast.isSilentMode,
    location: `${panicEvent.location.lat.toFixed(5)}, ${panicEvent.location.lng.toFixed(5)}`,
  });

  // In production: Send push notifications via Supabase/FCM
  // For demo: Log to console
  monitorIds.forEach((monitorId) => {
    console.log(`🚨 → Monitor ${monitorId}: EMERGENCY ALERT from ${panicEvent.userName}`);
  });

  return broadcast;
}

// =====================================================================
// SILENT PANIC AUDIO BUFFER (30-second)
// =====================================================================

/**
 * Start recording 30-second audio buffer (Silent Panic)
 * In production: Use MediaRecorder API
 */
export async function startAudioBuffer(panicEventId: string): Promise<string | null> {
  console.log('🎤 Starting 30-second audio buffer', { panicEventId });

  // In production: Implement MediaRecorder
  // For demo: Return mock URL
  const mockAudioUrl = `audio://panic-${panicEventId}-${Date.now()}.enc`;

  // Simulate 30-second recording
  setTimeout(() => {
    console.log('✅ Audio buffer complete', {
      panicEventId,
      duration: PANIC_CONFIG.AUDIO_BUFFER_DURATION_MS,
      url: mockAudioUrl,
    });

    // In production: Upload to secure storage and generate SHA-256 hash
    const mockHash = `sha256:${Math.random().toString(36).substring(7)}`;

    updatePanicEvent(panicEventId, {
      audioBufferUrl: mockAudioUrl,
      audioBufferSha256: mockHash,
    });
  }, PANIC_CONFIG.AUDIO_BUFFER_DURATION_MS);

  return mockAudioUrl;
}

// =====================================================================
// PANIC EVENT CRUD
// =====================================================================

export function triggerPanic(
  userId: string,
  userName: string,
  tenantId: string,
  location: Location,
  options: {
    isSilentMode?: boolean;
    hasAccepted911Terms?: boolean;
    monitorIds: string[];
  }
): PanicEvent {
  const panicEvent: PanicEvent = {
    id: `panic-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    userId,
    userName,
    tenantId,
    location,
    triggeredAt: Date.now(),
    forceHighAccuracy: true, // Always force high-accuracy GPS in panic
    status: 'active',
    syncMode: 'high_frequency',
    isSilentMode: options.isSilentMode || false,
    hasAccepted911Terms: options.hasAccepted911Terms || false,
    lockdownActive: true, // Immediately lock app
    gpsPings: [location], // Initial location
  };

  panicEventsDB.push(panicEvent);
  saveToDB();

  console.log('🚨 PANIC TRIGGERED', {
    id: panicEvent.id,
    userId,
    userName,
    isSilentMode: panicEvent.isSilentMode,
    location: `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`,
  });

  // Start high-frequency GPS polling
  startGPSPolling(panicEvent.id, async () => {
    // In production: Call actual GPS service
    // For demo: Return simulated location with slight variation
    return {
      lat: location.lat + (Math.random() - 0.5) * 0.0001,
      lng: location.lng + (Math.random() - 0.5) * 0.0001,
      accuracy: 5 + Math.random() * 5,
      timestamp: Date.now(),
    };
  });

  // Broadcast to all monitors
  broadcastEmergency(panicEvent, options.monitorIds);

  // Start audio buffer if silent mode
  if (panicEvent.isSilentMode) {
    startAudioBuffer(panicEvent.id);
  }

  return panicEvent;
}

export function getPanicEventById(panicEventId: string): PanicEvent | undefined {
  return panicEventsDB.find((p) => p.id === panicEventId);
}

export function getActivePanicEvents(tenantId?: string): PanicEvent[] {
  return panicEventsDB.filter(
    (p) => p.status === 'active' && (!tenantId || p.tenantId === tenantId)
  );
}

export function updatePanicEvent(panicEventId: string, updates: Partial<PanicEvent>): PanicEvent | null {
  const index = panicEventsDB.findIndex((p) => p.id === panicEventId);
  if (index === -1) return null;

  panicEventsDB[index] = {
    ...panicEventsDB[index],
    ...updates,
  };

  saveToDB();
  return panicEventsDB[index];
}

// =====================================================================
// PANIC RESOLUTION (Universal Family PIN required)
// =====================================================================

/**
 * Resolve panic with Universal Family PIN verification
 */
export function resolvePanic(
  panicEventId: string,
  resolution: {
    resolvedByUserId: string;
    resolvedByUserName: string;
    resolutionCode: EmergencyResolutionCode;
    resolutionNotes?: string;
    pin: string; // Universal Family PIN
    tenantId: string;
  }
): { success: boolean; reason?: string; panic?: PanicEvent } {
  const panic = getPanicEventById(panicEventId);
  if (!panic) {
    return { success: false, reason: 'Panic event not found' };
  }

  if (panic.status !== 'active') {
    return { success: false, reason: 'Panic already resolved' };
  }

  // Verify Universal Family PIN
  const pinValid = verifyFamilyPIN(resolution.tenantId, resolution.pin);
  if (!pinValid) {
    console.error('❌ Invalid Universal Family PIN');
    return { success: false, reason: 'Invalid PIN' };
  }

  // Stop GPS polling
  stopGPSPolling(panicEventId);

  // Update panic event
  const finalStatus = resolution.resolutionCode === 'false_alarm' ? 'false_alarm' : 'resolved';
  const updatedPanic = updatePanicEvent(panicEventId, {
    status: finalStatus,
    resolvedBy: resolution.resolvedByUserId,
    resolvedAt: Date.now(),
    resolutionNotes: `[${resolution.resolutionCode}] ${resolution.resolutionNotes || ''}`,
    lockdownActive: false, // Release lockdown
  });

  console.log('✅ PANIC RESOLVED', {
    panicEventId,
    resolvedBy: resolution.resolvedByUserName,
    resolutionCode: resolution.resolutionCode,
    duration: updatedPanic ? updatedPanic.resolvedAt! - updatedPanic.triggeredAt : 0,
    gpsPingsCollected: updatedPanic?.gpsPings?.length || 0,
  });

  return { success: true, panic: updatedPanic || undefined };
}

// =====================================================================
// UNIVERSAL FAMILY PIN
// =====================================================================

/**
 * Create Universal Family PIN (Family Head only)
 */
export function createFamilyPIN(
  tenantId: string,
  pin: string,
  createdByUserId: string
): UniversalFamilyPIN {
  // Simple hash for demo (in production: use bcrypt or similar)
  const pinHash = hashPIN(pin);

  const familyPIN: UniversalFamilyPIN = {
    tenantId,
    pinHash,
    createdByUserId,
    createdAt: Date.now(),
  };

  // Remove existing PIN for tenant
  familyPINDB = familyPINDB.filter((p) => p.tenantId !== tenantId);
  familyPINDB.push(familyPIN);

  saveToDB();

  console.log('🔐 Universal Family PIN created', { tenantId });
  return familyPIN;
}

/**
 * Verify Universal Family PIN
 */
export function verifyFamilyPIN(tenantId: string, pin: string): boolean {
  const familyPIN = familyPINDB.find((p) => p.tenantId === tenantId);
  if (!familyPIN) {
    console.error('❌ No Family PIN set for tenant', { tenantId });
    return false;
  }

  const pinHash = hashPIN(pin);
  const isValid = pinHash === familyPIN.pinHash;

  if (isValid) {
    // Update last used timestamp
    familyPIN.lastUsedAt = Date.now();
    saveToDB();
  }

  return isValid;
}

/**
 * Simple PIN hash (for demo - use bcrypt in production)
 */
function hashPIN(pin: string): string {
  // In production: use crypto-js or bcrypt
  return `hash:${pin.split('').reverse().join('')}`;
}

// =====================================================================
// 911 LEGAL GATE
// =====================================================================

/**
 * Record user acceptance of 911 Legal Gate / Safety Terms
 */
export function acceptSafetyTerms(
  userId: string,
  tenantId: string,
  metadata?: {
    ipAddress?: string;
    deviceModel?: string;
    appVersion?: string;
  }
): SafetyTermsAcceptance {
  const acceptance: SafetyTermsAcceptance = {
    userId,
    tenantId,
    acceptedAt: Date.now(),
    ipAddress: metadata?.ipAddress,
    deviceModel: metadata?.deviceModel,
    appVersion: metadata?.appVersion,
  };

  safetyTermsDB.push(acceptance);
  saveToDB();

  console.log('✅ Safety Terms accepted', { userId, tenantId });
  return acceptance;
}

/**
 * Check if user has accepted 911 Legal Gate
 */
export function hasAcceptedSafetyTerms(userId: string, tenantId: string): boolean {
  return safetyTermsDB.some((a) => a.userId === userId && a.tenantId === tenantId);
}

// =====================================================================
// PERSISTENCE (localStorage for demo)
// =====================================================================

function saveToDB() {
  localStorage.setItem('well-check-panic-events', JSON.stringify(panicEventsDB));
  localStorage.setItem('well-check-safety-terms', JSON.stringify(safetyTermsDB));
  localStorage.setItem('well-check-family-pins', JSON.stringify(familyPINDB));
}

export function loadFromDB() {
  try {
    const panics = localStorage.getItem('well-check-panic-events');
    if (panics) panicEventsDB = JSON.parse(panics);

    const terms = localStorage.getItem('well-check-safety-terms');
    if (terms) safetyTermsDB = JSON.parse(terms);

    const pins = localStorage.getItem('well-check-family-pins');
    if (pins) familyPINDB = JSON.parse(pins);
  } catch (error) {
    console.error('Failed to load panic data:', error);
  }
}

export function clearDB() {
  panicEventsDB = [];
  safetyTermsDB = [];
  familyPINDB = [];
  localStorage.removeItem('well-check-panic-events');
  localStorage.removeItem('well-check-safety-terms');
  localStorage.removeItem('well-check-family-pins');
}

// Initialize on import
loadFromDB();
