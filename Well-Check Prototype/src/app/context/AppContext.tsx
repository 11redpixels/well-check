import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import type { AppState, User, FamilyMember, PingRequest, VerifiedPulse, PanicEvent, UserCapabilities } from '../types';

// Mock data for prototype demonstration
const MOCK_FAMILY_CODE = 'XP9-2RT';
const MOCK_TENANT_ID = 'tenant-demo-001';

// 🆕 V6.0: Updated to use PRD-compliant roles
const MOCK_CURRENT_USER: User = {
  id: 'user-001',
  name: 'Alex Chen',
  role: 'family_head', // Family Head (Admin)
  tenantId: MOCK_TENANT_ID,
  createdAt: Date.now(),
};

// 🆕 V6.0: Updated family members with PRD roles
const MOCK_FAMILY_MEMBERS: FamilyMember[] = [
  {
    id: 'user-002',
    name: 'Grandma Emma',
    role: 'protected', // Protected (Vulnerable senior)
    tenantId: MOCK_TENANT_ID,
    isOnline: true,
    batteryLevel: 45,
    lastLocation: { lat: 37.7749, lng: -122.4194, accuracy: 10, timestamp: Date.now() - 120000 },
    lastSeen: Date.now() - 120000,
  },
  {
    id: 'user-003',
    name: 'Sarah Chen',
    role: 'monitor', // Monitor (Family member)
    tenantId: MOCK_TENANT_ID,
    isOnline: true,
    batteryLevel: 78,
    lastLocation: { lat: 37.7849, lng: -122.4094, accuracy: 15, timestamp: Date.now() - 300000 },
    lastSeen: Date.now() - 300000,
  },
  {
    id: 'user-004',
    name: 'Tommy Chen',
    role: 'minor', // Minor (Child)
    tenantId: MOCK_TENANT_ID,
    isOnline: false,
    batteryLevel: 12,
    lastLocation: { lat: 37.7649, lng: -122.4294, accuracy: 50, timestamp: Date.now() - 1800000 },
    lastSeen: Date.now() - 1800000,
  },
];

// 🆕 V6.0: Mock capabilities for demo
const MOCK_CAPABILITIES: Record<string, UserCapabilities> = {
  'user-002': {
    id: 'cap-002',
    userId: 'user-002',
    tenantId: MOCK_TENANT_ID,
    medicationEnabled: true,
    doctorVisitsEnabled: true,
    panicModeEnabled: true,
    managedByUserId: 'user-001',
    updatedAt: Date.now(),
    createdAt: Date.now(),
  },
  'user-003': {
    id: 'cap-003',
    userId: 'user-003',
    tenantId: MOCK_TENANT_ID,
    medicationEnabled: false,
    doctorVisitsEnabled: false,
    panicModeEnabled: true,
    managedByUserId: 'user-001',
    updatedAt: Date.now(),
    createdAt: Date.now(),
  },
  'user-004': {
    id: 'cap-004',
    userId: 'user-004',
    tenantId: MOCK_TENANT_ID,
    medicationEnabled: false, // Typically off for minors
    doctorVisitsEnabled: false,
    panicModeEnabled: true,
    managedByUserId: 'user-001',
    updatedAt: Date.now(),
    createdAt: Date.now(),
  },
};

const INITIAL_STATE: AppState = {
  status: 'idle',
  currentUser: MOCK_CURRENT_USER,
  familyCode: MOCK_FAMILY_CODE,
  tenantId: MOCK_TENANT_ID,
  familyMembers: MOCK_FAMILY_MEMBERS,
  activePings: [],
  lastVerifiedPulse: null,
  awaitingReplyFrom: [],
  isOffline: false,
  isSyncing: false,
  lastSyncTimestamp: Date.now(),
  batteryLevel: 78,
  gpsAccuracy: 'high',
  networkLatency: 45,
  syncMode: 'normal', // 🆕 V5.0: Default sync mode
  activeWatchMode: false,
  nudgeThreshold: 30,
  currentPanicEvent: null,
  // 🆕 V7.5: HUD defaults
  currentView: 'map',
  controlDrawerOpen: false,
  // 🆕 V9.2: Management action state
  managementActionInProgress: null,
};

interface AppContextValue extends AppState {
  sendPing: (targetUserId: string) => void;
  replySafe: () => void;
  triggerPanic: () => void;
  toggleActiveWatch: () => void;
  clearVerifiedPulse: () => void;
  switchRole: (role: 'primary_user' | 'monitor') => void;
  requestLocationPermission: () => Promise<boolean>; // ✅ NEW: GPS permission check
  
  // 🆕 V6.0: Capability Management
  capabilities: Record<string, UserCapabilities>;
  toggleCapability: (
    userId: string,
    capability: 'medication' | 'doctorVisits' | 'panicMode',
    enabled: boolean
  ) => Promise<void>;
  
  // 🆕 V9.2: Management Action State Sync
  setManagementAction: (action: 'medication' | 'geofence' | 'members' | 'map' | null) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

// =====================================================================
// HELPER: Check if Supabase is connected (production mode)
// =====================================================================
function isSupabaseConnected(): boolean {
  // In demo mode, Supabase is not connected
  // In production, check if VITE_SUPABASE_URL is defined
  return false; // Demo mode for prototype
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    // Load from localStorage if available (Offline-First)
    const saved = localStorage.getItem('well-check-state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...INITIAL_STATE, ...parsed, isOffline: !navigator.onLine };
      } catch {
        return INITIAL_STATE;
      }
    }
    return INITIAL_STATE;
  });
  
  // 🆕 V6.0: Capabilities state
  const [capabilities, setCapabilities] = useState<Record<string, UserCapabilities>>(() => {
    const saved = localStorage.getItem('well-check-capabilities');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return MOCK_CAPABILITIES;
      }
    }
    return MOCK_CAPABILITIES;
  });

  // Persist state to localStorage (Offline-First requirement)
  useEffect(() => {
    localStorage.setItem('well-check-state', JSON.stringify(state));
  }, [state]);
  
  // Persist capabilities to localStorage
  useEffect(() => {
    localStorage.setItem('well-check-capabilities', JSON.stringify(capabilities));
  }, [capabilities]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setState((prev) => ({ ...prev, isOffline: false, lastSyncTimestamp: Date.now() }));
    };
    const handleOffline = () => {
      setState((prev) => ({ ...prev, isOffline: true, status: 'offline' }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 🚨 SAFETY OVERRIDE: Battery Alert Logic for Monitors
  useEffect(() => {
    // Only trigger alerts if user is a Monitor
    if (state.currentUser?.role !== 'monitor') return;

    state.familyMembers.forEach((member) => {
      if (member.batteryLevel < 15) {
        // Check if we've already alerted for this member recently (prevent spam)
        const alertKey = `battery-alert-${member.id}`;
        const lastAlert = localStorage.getItem(alertKey);
        const now = Date.now();
        
        // Only alert once per 30 minutes per member
        if (!lastAlert || now - parseInt(lastAlert) > 30 * 60 * 1000) {
          toast.error(`Critical Battery Alert: ${member.name}`, {
            description: `Battery at ${member.batteryLevel}% - Consider checking in`,
            duration: 10000,
            important: true,
          });
          localStorage.setItem(alertKey, now.toString());
        }
      }
    });
  }, [state.familyMembers, state.currentUser?.role]);

  // =====================================================================
  // ✅ FIX 1: GPS PERMISSION CHECK (GRANDMOTHER TEST)
  // =====================================================================
  // Request and validate GPS permission with user-friendly error messages
  const requestLocationPermission = async (): Promise<boolean> => {
    // Check if Geolocation API is supported
    if (!navigator.geolocation) {
      toast.error('Location Not Supported', {
        description: 'Your device does not support location services',
        duration: 8000,
      });
      return false;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Success: Permission granted
          console.log(' GPS permission granted:', position.coords);
          resolve(true);
        },
        (error) => {
          // Error: Handle different error codes
          // ✅ FIX: Log detailed error info (code, message)
          console.error('❌ GPS permission error:', {
            code: error.code,
            message: error.message,
            PERMISSION_DENIED: error.code === 1,
            POSITION_UNAVAILABLE: error.code === 2,
            TIMEOUT: error.code === 3,
          });

          switch (error.code) {
            case 1: // PERMISSION_DENIED
              toast.error('GPS Access Required', {
                description: 'Well-Check needs your location to send safety updates. Please enable GPS in your device settings.',
                duration: 10000,
                action: {
                  label: 'How to Enable',
                  onClick: () => {
                    // Show platform-specific instructions
                    const isiOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
                    const isAndroid = /Android/.test(navigator.userAgent);

                    let instructions = 'To enable location access:\\n\\n';
                    if (isiOS) {
                      instructions += 'iPhone/iPad:\\n';
                      instructions += '1. Open Settings\\n';
                      instructions += '2. Tap Privacy & Security\\n';
                      instructions += '3. Tap Location Services\\n';
                      instructions += '4. Enable Location Services\\n';
                      instructions += '5. Scroll to Well-Check and tap "While Using the App"';
                    } else if (isAndroid) {
                      instructions += 'Android:\\n';
                      instructions += '1. Open Settings\\n';
                      instructions += '2. Tap Apps\\n';
                      instructions += '3. Tap Well-Check\\n';
                      instructions += '4. Tap Permissions\\n';
                      instructions += '5. Tap Location\\n';
                      instructions += '6. Select "Allow only while using the app"';
                    } else {
                      instructions += 'Check your browser or device settings to enable location access for this website.';
                    }

                    alert(instructions);
                  },
                },
              });
              break;

            case 2: // POSITION_UNAVAILABLE
              toast.error('Location Unavailable', {
                description: 'Unable to determine your location. Try moving outdoors or near a window.',
                duration: 8000,
              });
              break;

            case 3: // TIMEOUT
              toast.error('Location Timeout', {
                description: 'Location request timed out. Please try again.',
                duration: 6000,
                action: {
                  label: 'Retry',
                  onClick: () => requestLocationPermission(),
                },
              });
              break;

            default:
              toast.error('Location Error', {
                description: 'An unknown error occurred while accessing your location.',
                duration: 6000,
              });
          }

          resolve(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  };

  // =====================================================================
  // ✅ FIX 2: DATABASE FAIL-SAFE WITH RETRY (OPTIMISTIC UI + ERROR HANDLING)
  // =====================================================================
  // Optimistic UI: Send Ping with error handling
  const sendPing = async (targetUserId: string) => {
    const targetMember = state.familyMembers.find((m) => m.id === targetUserId);
    if (!targetMember) return;

    const pingRequest: PingRequest = {
      id: `ping-${Date.now()}`,
      fromUserId: state.currentUser!.id,
      fromUserName: state.currentUser!.name,
      toUserId: targetUserId,
      toUserName: targetMember.name,
      sentAt: Date.now(),
      status: 'pending',
      tenantId: state.tenantId!,
    };

    // Immediate state update (0ms feedback)
    setState((prev) => ({
      ...prev,
      status: 'ping_sent',
      activePings: [...prev.activePings, pingRequest],
      awaitingReplyFrom: [...prev.awaitingReplyFrom, targetUserId],
    }));

    // Simulate server response (in production, this would be Supabase Realtime)
    setTimeout(() => {
      setState((prev) => ({
        ...prev,
        isSyncing: false,
        lastSyncTimestamp: Date.now(),
      }));
    }, 1500);
  };

  // Optimistic UI: Reply "I'm Safe" (0ms feedback)
  const replySafe = () => {
    const verifiedPulse: VerifiedPulse = {
      userId: state.currentUser!.id,
      userName: state.currentUser!.name,
      location: {
        lat: 37.7749 + Math.random() * 0.01,
        lng: -122.4194 + Math.random() * 0.01,
        accuracy: 8,
        timestamp: Date.now(),
      },
      batteryLevel: state.batteryLevel,
      timestamp: Date.now(),
      tenantId: state.tenantId!,
    };

    // Immediate state update (0ms feedback)
    setState((prev) => ({
      ...prev,
      status: 'verified',
      lastVerifiedPulse: verifiedPulse,
      activePings: prev.activePings.map((p) =>
        p.toUserId === state.currentUser!.id ? { ...p, status: 'replied' as PingStatus } : p
      ),
      awaitingReplyFrom: prev.awaitingReplyFrom.filter((id) => id !== state.currentUser!.id),
    }));

    // Return to idle after 3s
    setTimeout(() => {
      setState((prev) => ({ ...prev, status: 'idle' }));
    }, 3000);
  };

  // Optimistic UI: Trigger Panic (0ms feedback)
  const triggerPanic = () => {
    const panicEvent: PanicEvent = {
      id: `panic-${Date.now()}`,
      userId: state.currentUser!.id,
      userName: state.currentUser!.name,
      location: {
        lat: 37.7749,
        lng: -122.4194,
        accuracy: 10,
        timestamp: Date.now(),
      },
      triggeredAt: Date.now(),
      audioRecording: true,
      tenantId: state.tenantId!,
      forceHighAccuracy: true, // 🚨 SAFETY OVERRIDE: Force GPS high-accuracy mode
      status: 'active', // 🆕 V5.0: Emergency event status
      syncMode: 'high_frequency', // 🆕 V5.0: Enable high-frequency sync
    };

    // Immediate state update (0ms feedback)
    setState((prev) => ({
      ...prev,
      status: 'panic',
      currentPanicEvent: panicEvent,
      gpsAccuracy: 'high', // 🚨 Override GPS to high-accuracy during panic
      syncMode: 'high_frequency', // 🆕 V5.0: Switch to high-frequency sync mode
    }));

    // In production: This would trigger:
    // 1. Background location updates every 5s
    // 2. Disable battery-saving GPS modes
    // 3. Send immediate push notifications to all monitors
    // 4. Start audio recording buffer
    // 5. Create emergency_event in database
  };

  const toggleActiveWatch = () => {
    setState((prev) => ({ ...prev, activeWatchMode: !prev.activeWatchMode }));
  };

  const clearVerifiedPulse = () => {
    setState((prev) => ({ ...prev, lastVerifiedPulse: null }));
  };

  const switchRole = (role: 'primary_user' | 'monitor') => {
    setState((prev) => ({
      ...prev,
      currentUser: { ...prev.currentUser, role },
    }));
  };

  // 🆕 V6.0: Capability Management
  const toggleCapability = async (
    userId: string,
    capability: 'medication' | 'doctorVisits' | 'panicMode',
    enabled: boolean
  ) => {
    const member = state.familyMembers.find((m) => m.id === userId);
    const capabilityLabels = {
      medication: 'Medication Module',
      doctorVisits: 'Doctor Visits',
      panicMode: 'Panic Mode',
    };

    const updatedCapabilities = {
      ...capabilities,
      [userId]: {
        ...capabilities[userId],
        [`${capability}Enabled`]: enabled,
        updatedAt: Date.now(),
      },
    };

    // Immediate state update (0ms feedback)
    setCapabilities(updatedCapabilities);

    // User feedback
    toast.success(`${capabilityLabels[capability]} ${enabled ? 'Enabled' : 'Disabled'}`, {
      description: `${member?.name}: ${capabilityLabels[capability]} is now ${enabled ? 'ON' : 'OFF'}`,
      duration: 3000,
    });

    // Simulate server response (in production, this would be Supabase Realtime)
    setTimeout(() => {
      setState((prev) => ({
        ...prev,
        isSyncing: false,
        lastSyncTimestamp: Date.now(),
      }));
    }, 1500);
  };
  
  // 🆕 V9.2: Management Action State Sync
  const setManagementAction = (action: 'medication' | 'geofence' | 'members' | 'map' | null) => {
    setState((prev) => ({
      ...prev,
      managementActionInProgress: action,
    }));
  };

  const value: AppContextValue = {
    ...state,
    sendPing,
    replySafe,
    triggerPanic,
    toggleActiveWatch,
    clearVerifiedPulse,
    switchRole,
    requestLocationPermission,
    
    // 🆕 V6.0: Capability Management
    capabilities: capabilities,
    toggleCapability,
    
    // 🆕 V9.2: Management Action State Sync
    setManagementAction,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}