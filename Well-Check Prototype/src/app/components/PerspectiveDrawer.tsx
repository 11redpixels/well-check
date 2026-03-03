// 🛡️ PerspectiveDrawer - V9.4: Role-Specific Perspective Portal
// Mandate: Bottom sheet with role-based prioritized actions
// Reference: V9.4 Directive - "Two-Button Logic" & Role Segmentation

import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { X, Pill, Stethoscope, Heart, AlertTriangle, Phone, Map, Shield, Settings, Users, Bell, Calendar, MapPin, BarChart, LayoutDashboard, User } from 'lucide-react';
import type { UserRole } from '../types';

interface PerspectiveAction {
  id: string;
  icon: any;
  label: string;
  route: string;
  priority: number;
}

interface PerspectiveDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: UserRole;
}

export function PerspectiveDrawer({ isOpen, onClose, userRole }: PerspectiveDrawerProps) {
  const navigate = useNavigate();

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

  // V9.4: Role-Based Perspective Configurations
  const getPerspectiveActions = (): { primary: PerspectiveAction[]; secondary: PerspectiveAction[] } => {
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

  const { primary, secondary } = getPerspectiveActions();

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
          <h2 className="text-white font-bold text-xl">My Perspective</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg bg-[#0F172A] border border-[#334155] hover:border-[#84CC16] flex items-center justify-center transition-all duration-200"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-[#94A3B8] hover:text-[#84CC16]" />
          </button>
        </div>

        {/* Primary Actions */}
        <div className="px-6 py-4">
          {primary.map((action, index) => (
            <button
              key={action.id}
              onClick={() => handleActionClick(action.route)}
              className="w-full flex items-center gap-4 p-4 mb-3 bg-[#0F172A] border border-[#334155] hover:border-[#84CC16] rounded-lg transition-all duration-200 hover:scale-105"
              style={{
                animation: `fadeIn 300ms ease-out ${index * 50}ms both`,
              }}
            >
              <div className="w-12 h-12 bg-[#3B82F6] rounded-lg flex items-center justify-center">
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-white font-bold text-lg flex-1 text-left">{action.label}</span>
              <span className="text-[#94A3B8]">→</span>
            </button>
          ))}
        </div>

        {/* Divider */}
        {secondary.length > 0 && (
          <div className="px-6 pb-2">
            <div className="border-t border-[#334155]" />
          </div>
        )}

        {/* Secondary Actions */}
        {secondary.length > 0 && (
          <div className="px-6 py-2 pb-6">
            {secondary.map((action, index) => (
              <button
                key={action.id}
                onClick={() => handleActionClick(action.route)}
                className="w-full flex items-center gap-4 p-3 mb-2 bg-[#0F172A]/50 border border-[#334155]/50 hover:border-[#84CC16]/50 rounded-lg transition-all duration-200"
                style={{
                  animation: `fadeIn 300ms ease-out ${(primary.length + index) * 50}ms both`,
                }}
              >
                <action.icon className="w-5 h-5 text-[#94A3B8]" />
                <span className="text-[#94A3B8] font-medium text-base flex-1 text-left">{action.label}</span>
                <span className="text-[#64748B]">→</span>
              </button>
            ))}
          </div>
        )}

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
