// 🛡️ CommandCenterDrawer - V10.0: Command Center Portal
// Mandate: Bottom sheet with role-based prioritized actions
// Reference: V10.0 Directive - "Two-Button Mandate" & Headless UI
// V10.0: Renamed from PerspectiveDrawer for absolute HUD purity
// V10.2: System Status + Merged navigation (Battery, GPS, Connection + Operations)
// V11.2: Competitor features (Driving Stats, Health Vitals, Invite Family)
// V11.4: Theme toggle (Clinical White / Dark skin)

import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { X, Pill, Stethoscope, Heart, AlertTriangle, Phone, Map, Shield, Settings, Users, Bell, Calendar, MapPin, BarChart, LayoutDashboard, User, Battery, BatteryLow, BatteryWarning, MapPinIcon, Wifi, WifiOff, History, Clock, Car, Activity, UserPlus, Key, Sun, Moon } from 'lucide-react';
import type { UserRole } from '../types';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext'; // V11.4: Theme engine

interface CommandCenterAction {
  id: string;
  icon: any;
  label: string;
  route: string;
  priority: number;
}

interface CommandCenterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: UserRole;
}

export function CommandCenterDrawer({ isOpen, onClose, userRole }: CommandCenterDrawerProps) {
  const navigate = useNavigate();
  const { batteryLevel, gpsAccuracy, isOffline } = useApp();
  const { theme, toggleTheme } = useTheme(); // V11.4: Theme engine

  // Close drawer on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // V10.2: Get battery icon and color based on level
  const getBatteryDisplay = () => {
    if (batteryLevel >= 50) {
      return { 
        icon: Battery, 
        color: '#84CC16', // Green
        label: `${batteryLevel}%` 
      };
    } else if (batteryLevel >= 20) {
      return { 
        icon: BatteryWarning, 
        color: '#F59E0B', // Amber
        label: `${batteryLevel}%` 
      };
    } else {
      return { 
        icon: BatteryLow, 
        color: '#FF4444', // Red
        label: `${batteryLevel}%` 
      };
    }
  };

  // V10.2: Get GPS accuracy display
  const getGPSDisplay = () => {
    const accuracy = gpsAccuracy;
    if (accuracy === 'high') {
      return { 
        color: '#F59E0B', // Amber
        label: 'High' 
      };
    } else if (accuracy === 'medium') {
      return { 
        color: '#F59E0B', // Amber
        label: 'Medium' 
      };
    } else {
      return { 
        color: '#64748B', // Gray
        label: 'Low' 
      };
    }
  };

  // V10.2: Get connection display
  const getConnectionDisplay = () => {
    if (!isOffline) {
      return { 
        icon: Wifi, 
        color: '#84CC16', // Green
        label: 'Online' 
      };
    } else {
      return { 
        icon: WifiOff, 
        color: '#FF4444', // Red
        label: 'Offline' 
      };
    }
  };

  const battery = getBatteryDisplay();
  const gps = getGPSDisplay();
  const connection = getConnectionDisplay();

  // V10.0: Role-Based Command Center Configurations (same as V9.4 Perspective)
  const getCommandCenterActions = (): { primary: CommandCenterAction[]; secondary: CommandCenterAction[] } => {
    switch (userRole) {
      case 'protected':
        // Check if elderly (age 65+) - For demo, assume all 'protected' are elderly
        // In production, check user.age >= 65
        const isElderly = true; // TODO: Link to user.age

        if (isElderly) {
          // Elderly (Protected User - Age 65+)
          return {
            primary: [
              { id: 'medication-reminders', icon: Pill, label: 'Medication Reminders', route: '/medication', priority: 1 },
              { id: 'doctor-logs', icon: Stethoscope, label: 'Doctor Visits', route: '/doctor-visits', priority: 2 },
            ],
            secondary: [
              { id: 'daily-checkin', icon: Heart, label: 'Daily Check-in', route: '/checkin', priority: 3 },
              { id: 'emergency-contacts', icon: Phone, label: 'Emergency Contacts', route: '/contacts', priority: 4 },
              { id: 'settings', icon: Settings, label: 'Settings', route: '/settings', priority: 5 },
            ],
          };
        }

        // Protected (Adult - Age 18-64)
        return {
          primary: [
            { id: 'my-status', icon: User, label: 'My Status', route: '/status', priority: 1 },
            { id: 'medication', icon: Pill, label: 'Medication', route: '/medication', priority: 2 },
          ],
          secondary: [
            { id: 'family-map', icon: Map, label: 'Family Map', route: '/', priority: 3 },
            { id: 'panic-history', icon: AlertTriangle, label: 'Panic History', route: '/panic-history', priority: 4 },
            { id: 'settings', icon: Settings, label: 'Settings', route: '/settings', priority: 5 },
          ],
        };

      case 'minor':
        // Minor (Protected User - Age <18)
        return {
          primary: [
            { id: 'daily-checkin', icon: Heart, label: 'Daily Check-in', route: '/checkin', priority: 1 },
            { id: 'emergency-hub', icon: AlertTriangle, label: 'Emergency Hub', route: '/emergency-hub', priority: 2 },
          ],
          secondary: [
            { id: 'family-map', icon: Map, label: 'Where is Everyone?', route: '/', priority: 3 },
            { id: 'safe-zones', icon: Shield, label: 'My Safe Zones', route: '/safe-zones', priority: 4 },
            { id: 'settings', icon: Settings, label: 'Settings', route: '/settings', priority: 5 },
          ],
        };

      case 'monitor':
        // Monitor (Active Caregiver)
        return {
          primary: [
            { id: 'manage-members', icon: Users, label: 'Manage Members', route: '/dashboard', priority: 1 },
            { id: 'medication-alerts', icon: Bell, label: 'Medication Alerts', route: '/medication-alerts', priority: 2 },
          ],
          secondary: [
            { id: 'geofence-zones', icon: MapPin, label: 'Geofence Zones', route: '/geofence', priority: 3 },
            { id: 'doctor-visits', icon: Calendar, label: 'Doctor Visits', route: '/doctor-visits', priority: 4 },
            { id: 'panic-history', icon: AlertTriangle, label: 'Panic History', route: '/panic-history', priority: 5 },
            { id: 'settings', icon: Settings, label: 'Settings', route: '/settings', priority: 6 },
          ],
        };

      case 'family_head':
        // Family Head (Admin)
        return {
          primary: [
            { id: 'family-dashboard', icon: LayoutDashboard, label: 'Family Dashboard', route: '/dashboard', priority: 1 },
            { id: 'manage-members', icon: Users, label: 'Manage Members', route: '/dashboard', priority: 2 },
          ],
          secondary: [
            { id: 'medication-center', icon: Pill, label: 'Medication Center', route: '/medication', priority: 3 },
            { id: 'doctor-appointments', icon: Calendar, label: 'Doctor Appointments', route: '/doctor-visits', priority: 4 },
            { id: 'geofence-zones', icon: MapPin, label: 'Geofence Zones', route: '/geofence', priority: 5 },
            { id: 'panic-history', icon: AlertTriangle, label: 'Panic History', route: '/panic-history', priority: 6 },
            { id: 'analytics', icon: BarChart, label: 'Analytics', route: '/analytics', priority: 7 },
            { id: 'settings', icon: Settings, label: 'Settings', route: '/settings', priority: 8 },
          ],
        };

      default:
        // Default fallback
        return {
          primary: [
            { id: 'my-status', icon: User, label: 'My Status', route: '/status', priority: 1 },
          ],
          secondary: [
            { id: 'settings', icon: Settings, label: 'Settings', route: '/settings', priority: 2 },
          ],
        };
    }
  };

  const { primary, secondary } = getCommandCenterActions();

  const handleActionClick = (route: string) => {
    navigate(route);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
        style={{ animation: 'fadeIn 300ms ease-out' }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-[#1E293B] border-t-2 border-[#84CC16] z-50 rounded-t-3xl shadow-2xl max-w-lg mx-auto"
        style={{
          animation: 'slideUp 300ms ease-out',
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#1E293B] border-b border-[#334155] px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-2xl">Command Center</h2>
            <p className="text-[#94A3B8] text-sm mt-1">
              {userRole === 'family_head' ? 'Family Head Dashboard' : 
               userRole === 'monitor' ? 'Monitor Dashboard' : 
               userRole === 'protected' ? 'Protected Dashboard' : 
               'Minor Dashboard'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-[#334155] hover:bg-[#475569] flex items-center justify-center transition-all duration-200"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* V10.2: System Status Section */}
        <div className="px-6 py-6">
          <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">SYSTEM STATUS</h3>
          <div className="grid grid-cols-3 gap-3">
            {/* Battery Card */}
            <div className="bg-[#0F172A] border border-[#334155] rounded-xl p-4 flex flex-col items-center justify-center">
              <battery.icon className="w-8 h-8 mb-2" style={{ color: battery.color }} />
              <span className="text-white font-bold text-xl">{battery.label}</span>
            </div>
            
            {/* GPS Accuracy Card */}
            <div className="bg-[#0F172A] border border-[#334155] rounded-xl p-4 flex flex-col items-center justify-center">
              <MapPinIcon className="w-8 h-8 mb-2" style={{ color: gps.color }} />
              <span className="text-white font-bold text-xl">{gps.label}</span>
            </div>
            
            {/* Connection Card */}
            <div className="bg-[#0F172A] border border-[#334155] rounded-xl p-4 flex flex-col items-center justify-center">
              <connection.icon className="w-8 h-8 mb-2" style={{ color: connection.color }} />
              <span className="text-white font-bold text-xl">{connection.label}</span>
            </div>
          </div>
        </div>

        {/* V10.2: Management Section */}
        <div className="px-6 py-4">
          <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">MANAGEMENT</h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Family Card */}
            <button
              onClick={() => handleActionClick('/dashboard')}
              className="bg-[#0F172A] border border-[#334155] hover:border-[#84CC16] rounded-xl p-4 flex flex-col items-start transition-all duration-200"
            >
              <Users className="w-6 h-6 mb-3" style={{ color: '#84CC16' }} />
              <span className="text-white font-bold text-lg">Family</span>
              <span className="text-[#64748B] text-sm mt-1">Manage members</span>
            </button>
            
            {/* History Card */}
            <button
              onClick={() => handleActionClick('/history')}
              className="bg-[#0F172A] border border-[#334155] hover:border-[#84CC16] rounded-xl p-4 flex flex-col items-start transition-all duration-200"
            >
              <Clock className="w-6 h-6 mb-3" style={{ color: '#6366F1' }} />
              <span className="text-white font-bold text-lg">History</span>
              <span className="text-[#64748B] text-sm mt-1">90-day vault</span>
            </button>
          </div>
        </div>

        {/* V10.2: Operational Actions (from screenshot 1) */}
        <div className="px-6 py-2">
          {/* Manage Members */}
          <button
            onClick={() => handleActionClick('/dashboard')}
            className="w-full flex items-center gap-4 p-4 mb-2 bg-[#0F172A] border border-[#334155] hover:border-[#84CC16] rounded-xl transition-all duration-200"
          >
            <div className="w-12 h-12 bg-[#3B82F6] rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-bold text-lg flex-1 text-left">Manage Members</span>
            <span className="text-[#94A3B8]">→</span>
          </button>

          {/* Medication Alerts */}
          <button
            onClick={() => handleActionClick('/medication-alerts')}
            className="w-full flex items-center gap-4 p-4 mb-2 bg-[#0F172A] border border-[#334155] hover:border-[#84CC16] rounded-xl transition-all duration-200"
          >
            <div className="w-12 h-12 bg-[#3B82F6] rounded-xl flex items-center justify-center">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-bold text-lg flex-1 text-left">Medication Alerts</span>
            <span className="text-[#94A3B8]">→</span>
          </button>

          {/* Geofence Zones */}
          <button
            onClick={() => handleActionClick('/geofence')}
            className="w-full flex items-center gap-3 p-3 mb-2 bg-transparent border border-transparent hover:border-[#334155] rounded-xl transition-all duration-200"
          >
            <MapPin className="w-5 h-5 text-[#64748B]" />
            <span className="text-[#94A3B8] font-medium text-base flex-1 text-left">Geofence Zones</span>
            <span className="text-[#64748B]">→</span>
          </button>

          {/* Doctor Visits */}
          <button
            onClick={() => handleActionClick('/doctor-visits')}
            className="w-full flex items-center gap-3 p-3 mb-2 bg-transparent border border-transparent hover:border-[#334155] rounded-xl transition-all duration-200"
          >
            <Calendar className="w-5 h-5 text-[#64748B]" />
            <span className="text-[#94A3B8] font-medium text-base flex-1 text-left">Doctor Visits</span>
            <span className="text-[#64748B]">→</span>
          </button>

          {/* Panic History */}
          <button
            onClick={() => handleActionClick('/panic-history')}
            className="w-full flex items-center gap-3 p-3 mb-2 bg-transparent border border-transparent hover:border-[#334155] rounded-xl transition-all duration-200"
          >
            <AlertTriangle className="w-5 h-5 text-[#64748B]" />
            <span className="text-[#94A3B8] font-medium text-base flex-1 text-left">Panic History</span>
            <span className="text-[#64748B]">→</span>
          </button>

          {/* V11.2: Driving Stats (Competitors 1 & 2) */}
          <button
            onClick={() => handleActionClick('/driving-stats')}
            className="w-full flex items-center gap-3 p-3 mb-2 bg-transparent border border-transparent hover:border-[#334155] rounded-xl transition-all duration-200"
          >
            <Car className="w-5 h-5 text-[#64748B]" />
            <span className="text-[#94A3B8] font-medium text-base flex-1 text-left">Driving Stats</span>
            <span className="text-[#64748B]">→</span>
          </button>

          {/* V11.2: Health Vitals (Competitor 4) */}
          <button
            onClick={() => handleActionClick('/health-vitals')}
            className="w-full flex items-center gap-3 p-3 mb-2 bg-transparent border border-transparent hover:border-[#334155] rounded-xl transition-all duration-200"
          >
            <Activity className="w-5 h-5 text-[#64748B]" />
            <span className="text-[#94A3B8] font-medium text-base flex-1 text-left">Health Vitals</span>
            <span className="text-[#64748B]">→</span>
          </button>

          {/* V11.2: Invite Family (Competitor 3 - Sharing Code) */}
          <button
            onClick={() => handleActionClick('/invite-family')}
            className="w-full flex items-center gap-3 p-3 mb-2 bg-transparent border border-transparent hover:border-[#334155] rounded-xl transition-all duration-200"
          >
            <UserPlus className="w-5 h-5 text-[#64748B]" />
            <span className="text-[#94A3B8] font-medium text-base flex-1 text-left">Invite Family</span>
            <span className="text-[#64748B]">→</span>
          </button>
        </div>

        {/* V10.2: System Section */}
        <div className="px-6 py-4">
          <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">SYSTEM</h3>
          <button
            onClick={() => handleActionClick('/settings')}
            className="w-full flex items-center gap-4 p-4 bg-[#0F172A] border border-[#334155] hover:border-[#84CC16] rounded-xl transition-all duration-200"
          >
            <Settings className="w-6 h-6 text-[#64748B]" />
            <div className="flex-1 text-left">
              <span className="text-white font-bold text-lg block">Settings</span>
              <span className="text-[#64748B] text-sm">App configuration</span>
            </div>
            <span className="text-[#94A3B8]">→</span>
          </button>
        </div>

        {/* V11.4: Theme Toggle */}
        <div className="px-6 py-4">
          <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">THEME</h3>
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-4 p-4 bg-[#0F172A] border border-[#334155] hover:border-[#84CC16] rounded-xl transition-all duration-200"
          >
            {theme === 'dark' ? <Sun className="w-6 h-6 text-[#64748B]" /> : <Moon className="w-6 h-6 text-[#64748B]" />}
            <div className="flex-1 text-left">
              <span className="text-white font-bold text-lg block">Toggle Theme</span>
              <span className="text-[#64748B] text-sm">Switch to {theme === 'dark' ? 'Light' : 'Dark'} mode</span>
            </div>
            <span className="text-[#94A3B8]">→</span>
          </button>
        </div>

        {/* Bottom padding for safe area */}
        <div className="h-4" />
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}