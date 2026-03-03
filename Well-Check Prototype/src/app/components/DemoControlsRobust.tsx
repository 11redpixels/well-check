// 🔧 Demo Controls - Comprehensive Testing Suite
// V11.5: Full testing toolkit with routes, features, state manipulation, data controls
// Press Ctrl+D to toggle visibility

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { 
  Settings, 
  Users, 
  Shield, 
  Activity, 
  RotateCcw, 
  AlertTriangle,
  User,
  Eye,
  Baby,
  X,
  Navigation,
  Palette,
  Database,
  Zap,
  Battery,
  Wifi,
  WifiOff,
  MapPin,
  Bell,
  Pill,
  Calendar,
  Heart,
  Car,
  UserPlus,
  Home,
  History,
  ChevronRight,
  Power,
  Target
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { resetAllData } from '../utils/resetAll';
import { toast } from 'sonner';

export function DemoControlsRobust() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, switchRole, triggerPanic, replySafe, toggleActiveWatch, activeWatchMode, capabilities, toggleCapability, familyMembers, batteryLevel, isOffline } = useApp();
  const { theme, toggleTheme, setTheme } = useTheme();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'routes' | 'roles' | 'features' | 'data' | 'system'>('routes');
  
  // V11.5: Simple visibility toggle with Ctrl+D
  const [isVisible, setIsVisible] = useState(false); // Default: hidden

  // V11.5: Global keyboard listener (Ctrl + D to toggle visibility)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + D to toggle demo controls
      if (e.ctrlKey && e.key === 'd' && (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsVisible(prev => {
          const newValue = !prev;
          toast.success(newValue ? '🛠️ Demo Controls Shown' : '👋 Demo Controls Hidden', {
            description: 'Press Ctrl + D to toggle',
            duration: 2000,
          });
          return newValue;
        });
      }

      // Escape to close
      if (e.key === 'Escape' && isVisible) {
        setIsVisible(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  if (!isVisible) {
    return null;
  }

  // All available routes
  const routes = [
    { path: '/family-head', label: 'Family Head', icon: <Shield className="w-4 h-4" />, color: '#FBBF24' },
    { path: '/protected', label: 'Protected', icon: <User className="w-4 h-4" />, color: '#FF4444' },
    { path: '/monitor', label: 'Monitor', icon: <Eye className="w-4 h-4" />, color: '#84CC16' },
    { path: '/minor', label: 'Minor', icon: <Baby className="w-4 h-4" />, color: '#6366F1' },
    { path: '/medications', label: 'Medications', icon: <Pill className="w-4 h-4" />, color: '#10B981' },
    { path: '/doctor-visits', label: 'Doctor Visits', icon: <Calendar className="w-4 h-4" />, color: '#3B82F6' },
    { path: '/panic', label: 'Panic View', icon: <AlertTriangle className="w-4 h-4" />, color: '#EF4444' },
    { path: '/settings', label: 'Settings', icon: <Settings className="w-4 h-4" />, color: '#64748B' },
    { path: '/history', label: 'History', icon: <History className="w-4 h-4" />, color: '#8B5CF6' },
    { path: '/driving-stats', label: 'Driving Stats', icon: <Car className="w-4 h-4" />, color: '#F59E0B' },
    { path: '/health-vitals', label: 'Health Vitals', icon: <Heart className="w-4 h-4" />, color: '#EC4899' },
    { path: '/invite-family', label: 'Invite Family', icon: <UserPlus className="w-4 h-4" />, color: '#06B6D4' },
  ];

  const roles: Array<{
    value: 'family_head' | 'protected' | 'monitor' | 'minor';
    label: string;
    route: string;
    icon: React.ReactNode;
    color: string;
  }> = [
    {
      value: 'family_head',
      label: 'Family Head',
      route: '/family-head',
      icon: <Shield className="w-5 h-5" />,
      color: '#FBBF24',
    },
    {
      value: 'protected',
      label: 'Protected User',
      route: '/protected',
      icon: <User className="w-5 h-5" />,
      color: '#FF4444',
    },
    {
      value: 'monitor',
      label: 'Monitor',
      route: '/monitor',
      icon: <Eye className="w-5 h-5" />,
      color: '#84CC16',
    },
    {
      value: 'minor',
      label: 'Minor',
      route: '/minor',
      icon: <Baby className="w-5 h-5" />,
      color: '#6366F1',
    },
  ];

  const handleRoleSwitch = (role: 'family_head' | 'protected' | 'monitor' | 'minor', route: string) => {
    // Cast to old role type for backward compatibility
    const legacyRole = role === 'family_head' ? 'primary_user' : 
                       role === 'protected' ? 'primary_user' :
                       'monitor';
    
    switchRole(legacyRole as any);
    navigate(route);
    toast.success(`✅ Switched to ${roles.find(r => r.value === role)?.label}`, {
      duration: 2000,
    });
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    toast.success(`📍 Navigated to ${path}`, { duration: 1500 });
  };

  const handleReset = () => {
    setShowResetConfirm(true);
  };

  const confirmReset = () => {
    toast.loading('🔄 Resetting all data...', { duration: 1000 });
    setTimeout(() => {
      resetAllData();
    }, 500);
  };

  const cancelReset = () => {
    setShowResetConfirm(false);
  };

  const currentRoleData = roles.find(r => r.value === (currentUser?.role || 'monitor'));
  const currentRoute = location.pathname;

  // Tab configuration
  const tabs = [
    { id: 'routes', label: 'Routes', icon: <Navigation className="w-4 h-4" /> },
    { id: 'roles', label: 'Roles', icon: <Users className="w-4 h-4" /> },
    { id: 'features', label: 'Features', icon: <Zap className="w-4 h-4" /> },
    { id: 'data', label: 'Data', icon: <Database className="w-4 h-4" /> },
    { id: 'system', label: 'System', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <>
      {/* V11.5: Full Overlay (above everything) */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-6">
        {/* Demo Controls Panel */}
        <div className="w-full max-w-4xl bg-[#1E293B] border-2 border-[#84CC16] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="bg-[#0F172A] border-b-2 border-[#334155] p-6 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-4">
              <Activity className="w-8 h-8 text-[#84CC16]" />
              <div>
                <h2 className="text-white font-bold text-2xl">Demo Controls - Testing Suite</h2>
                <p className="text-[#64748B] text-sm">
                  Role: <span className="text-[#84CC16] font-bold">{currentRoleData?.label}</span> • Route: <span className="text-[#FBBF24] font-bold">{currentRoute}</span> • Theme: <span className="text-[#3B82F6] font-bold">{theme}</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="w-12 h-12 rounded-full bg-[#334155] hover:bg-[#475569] flex items-center justify-center transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="bg-[#0F172A] border-b border-[#334155] p-4 flex gap-2 overflow-x-auto flex-shrink-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 font-bold text-sm transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[#84CC16] text-[#0F172A]'
                    : 'bg-[#1E293B] text-[#94A3B8] hover:bg-[#334155] hover:text-white'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Area (Scrollable) */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* ROUTES TAB */}
            {activeTab === 'routes' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Navigation className="w-5 h-5 text-[#84CC16]" />
                  <h3 className="text-white font-bold text-lg">All Routes</h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {routes.map((route) => (
                    <button
                      key={route.path}
                      onClick={() => handleNavigate(route.path)}
                      className={`h-[64px] px-4 rounded-xl border-2 flex items-center gap-3 transition-all ${
                        currentRoute === route.path
                          ? 'border-[#84CC16] bg-[#84CC16]/10 scale-105'
                          : 'border-[#334155] bg-[#0F172A] hover:border-[#84CC16] hover:scale-105'
                      }`}
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${route.color}20` }}
                      >
                        <div style={{ color: route.color }}>{route.icon}</div>
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-white font-bold text-sm">{route.label}</p>
                        <p className="text-[#64748B] text-xs">{route.path}</p>
                      </div>
                      {currentRoute === route.path && (
                        <div className="w-2 h-2 rounded-full bg-[#84CC16] animate-pulse" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ROLES TAB */}
            {activeTab === 'roles' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-[#84CC16]" />
                  <h3 className="text-white font-bold text-lg">Switch User Role</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {roles.map((role) => (
                    <button
                      key={role.value}
                      onClick={() => handleRoleSwitch(role.value, role.route)}
                      className={`h-[80px] px-4 rounded-xl border-2 flex items-center gap-3 transition-all ${
                        currentUser?.role === role.value
                          ? 'border-[#84CC16] bg-[#84CC16]/10 scale-105'
                          : 'border-[#334155] bg-[#0F172A] hover:border-[#84CC16] hover:scale-105'
                      }`}
                    >
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${role.color}20` }}
                      >
                        <div style={{ color: role.color }}>{role.icon}</div>
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-white font-bold text-base">{role.label}</p>
                        <p className="text-[#64748B] text-xs">{role.route}</p>
                      </div>
                      {currentUser?.role === role.value && (
                        <div className="w-3 h-3 rounded-full bg-[#84CC16] animate-pulse" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* FEATURES TAB */}
            {activeTab === 'features' && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-[#84CC16]" />
                  <h3 className="text-white font-bold text-lg">Feature Controls</h3>
                </div>

                {/* Quick Actions */}
                <div>
                  <label className="text-[#94A3B8] font-bold text-sm mb-3 block">Quick Actions</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        triggerPanic();
                        toast.success('🚨 Panic Triggered!', { duration: 2000 });
                      }}
                      className="h-[64px] px-4 bg-[#FF4444] hover:bg-[#DC2626] rounded-xl flex items-center gap-3 transition-all hover:scale-105"
                    >
                      <AlertTriangle className="w-6 h-6 text-white" />
                      <div className="text-left">
                        <p className="text-white font-bold text-base">Trigger Panic</p>
                        <p className="text-white/70 text-xs">Emergency mode</p>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        replySafe();
                        toast.success('✅ Replied Safe!', { duration: 2000 });
                      }}
                      className="h-[64px] px-4 bg-[#10B981] hover:bg-[#059669] rounded-xl flex items-center gap-3 transition-all hover:scale-105"
                    >
                      <Shield className="w-6 h-6 text-white" />
                      <div className="text-left">
                        <p className="text-white font-bold text-base">Reply Safe</p>
                        <p className="text-white/70 text-xs">Send confirmation</p>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        toggleActiveWatch();
                        toast.success(activeWatchMode ? '👁️ Active Watch OFF' : '👁️ Active Watch ON', { duration: 2000 });
                      }}
                      className={`h-[64px] px-4 rounded-xl flex items-center gap-3 transition-all hover:scale-105 ${
                        activeWatchMode ? 'bg-[#84CC16] hover:bg-[#65A30D]' : 'bg-[#334155] hover:bg-[#475569]'
                      }`}
                    >
                      <Eye className="w-6 h-6 text-white" />
                      <div className="text-left">
                        <p className="text-white font-bold text-base">Active Watch</p>
                        <p className="text-white/70 text-xs">{activeWatchMode ? 'ON' : 'OFF'}</p>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        navigate('/');
                        toast.success('🏠 Navigated to Home', { duration: 1500 });
                      }}
                      className="h-[64px] px-4 bg-[#1E293B] border-2 border-[#334155] hover:border-[#84CC16] rounded-xl flex items-center gap-3 transition-all hover:scale-105"
                    >
                      <Home className="w-6 h-6 text-[#84CC16]" />
                      <div className="text-left">
                        <p className="text-white font-bold text-base">Go Home</p>
                        <p className="text-[#64748B] text-xs">Root redirect</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Capability Toggles */}
                <div>
                  <label className="text-[#94A3B8] font-bold text-sm mb-3 block">Family Member Capabilities</label>
                  <div className="space-y-3">
                    {familyMembers.map((member) => (
                      <div key={member.id} className="bg-[#0F172A] border border-[#334155] rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-[#334155] flex items-center justify-center">
                            <User className="w-5 h-5 text-[#84CC16]" />
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-bold text-sm">{member.name}</p>
                            <p className="text-[#64748B] text-xs capitalize">{member.role}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => toggleCapability(member.id, 'medication', !capabilities[member.id]?.medicationEnabled)}
                            className={`h-[48px] px-3 rounded-lg text-xs font-bold transition-all ${
                              capabilities[member.id]?.medicationEnabled
                                ? 'bg-[#84CC16] text-[#0F172A]'
                                : 'bg-[#1E293B] text-[#64748B] border border-[#334155]'
                            }`}
                          >
                            <Pill className="w-4 h-4 mx-auto mb-1" />
                            Meds
                          </button>
                          <button
                            onClick={() => toggleCapability(member.id, 'doctorVisits', !capabilities[member.id]?.doctorVisitsEnabled)}
                            className={`h-[48px] px-3 rounded-lg text-xs font-bold transition-all ${
                              capabilities[member.id]?.doctorVisitsEnabled
                                ? 'bg-[#3B82F6] text-white'
                                : 'bg-[#1E293B] text-[#64748B] border border-[#334155]'
                            }`}
                          >
                            <Calendar className="w-4 h-4 mx-auto mb-1" />
                            Visits
                          </button>
                          <button
                            onClick={() => toggleCapability(member.id, 'panicMode', !capabilities[member.id]?.panicModeEnabled)}
                            className={`h-[48px] px-3 rounded-lg text-xs font-bold transition-all ${
                              capabilities[member.id]?.panicModeEnabled
                                ? 'bg-[#EF4444] text-white'
                                : 'bg-[#1E293B] text-[#64748B] border border-[#334155]'
                            }`}
                          >
                            <AlertTriangle className="w-4 h-4 mx-auto mb-1" />
                            Panic
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* DATA TAB */}
            {activeTab === 'data' && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Database className="w-5 h-5 text-[#84CC16]" />
                  <h3 className="text-white font-bold text-lg">Data Manipulation</h3>
                </div>

                {/* Current State */}
                <div>
                  <label className="text-[#94A3B8] font-bold text-sm mb-3 block">Current State</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#0F172A] border border-[#334155] rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Battery className="w-4 h-4 text-[#84CC16]" />
                        <p className="text-[#94A3B8] text-xs">Battery Level</p>
                      </div>
                      <p className="text-white font-bold text-2xl">{batteryLevel}%</p>
                    </div>
                    <div className="bg-[#0F172A] border border-[#334155] rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        {isOffline ? <WifiOff className="w-4 h-4 text-[#FF4444]" /> : <Wifi className="w-4 h-4 text-[#84CC16]" />}
                        <p className="text-[#94A3B8] text-xs">Network Status</p>
                      </div>
                      <p className="text-white font-bold text-xl">{isOffline ? 'Offline' : 'Online'}</p>
                    </div>
                    <div className="bg-[#0F172A] border border-[#334155] rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-[#84CC16]" />
                        <p className="text-[#94A3B8] text-xs">Family Members</p>
                      </div>
                      <p className="text-white font-bold text-2xl">{familyMembers.length}</p>
                    </div>
                    <div className="bg-[#0F172A] border border-[#334155] rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-[#84CC16]" />
                        <p className="text-[#94A3B8] text-xs">Active Watch</p>
                      </div>
                      <p className="text-white font-bold text-xl">{activeWatchMode ? 'ON' : 'OFF'}</p>
                    </div>
                  </div>
                </div>

                {/* Data Actions */}
                <div>
                  <label className="text-[#94A3B8] font-bold text-sm mb-3 block">Data Actions</label>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        // Simulate location request
                        toast.promise(
                          new Promise((resolve) => setTimeout(resolve, 1500)),
                          {
                            loading: '📍 Requesting GPS location...',
                            success: '✅ Location acquired',
                            error: '❌ Location denied',
                          }
                        );
                      }}
                      className="w-full h-[56px] bg-[#0F172A] border-2 border-[#334155] hover:border-[#84CC16] rounded-xl flex items-center justify-between px-4 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-[#84CC16]" />
                        <span className="text-white font-bold text-sm">Request Location Permission</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#64748B]" />
                    </button>
                    <button
                      onClick={() => {
                        toast.success('🔔 Notification sent to all monitors', { duration: 2000 });
                      }}
                      className="w-full h-[56px] bg-[#0F172A] border-2 border-[#334155] hover:border-[#FBBF24] rounded-xl flex items-center justify-between px-4 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-[#FBBF24]" />
                        <span className="text-white font-bold text-sm">Send Test Notification</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#64748B]" />
                    </button>
                    <button
                      onClick={() => {
                        localStorage.clear();
                        toast.success('🗑️ LocalStorage cleared (refresh to see effect)', { duration: 3000 });
                      }}
                      className="w-full h-[56px] bg-[#0F172A] border-2 border-[#334155] hover:border-[#FF4444] rounded-xl flex items-center justify-between px-4 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <Database className="w-5 h-5 text-[#FF4444]" />
                        <span className="text-white font-bold text-sm">Clear LocalStorage</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#64748B]" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SYSTEM TAB */}
            {activeTab === 'system' && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="w-5 h-5 text-[#84CC16]" />
                  <h3 className="text-white font-bold text-lg">System Controls</h3>
                </div>

                {/* Theme Controls */}
                <div>
                  <label className="text-[#94A3B8] font-bold text-sm mb-3 block">Theme</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        setTheme('dark');
                        toast.success('🌙 Dark theme activated', { duration: 1500 });
                      }}
                      className={`h-[72px] px-4 rounded-xl border-2 flex items-center gap-3 transition-all ${
                        theme === 'dark'
                          ? 'border-[#84CC16] bg-[#84CC16]/10'
                          : 'border-[#334155] bg-[#0F172A] hover:border-[#84CC16]'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-[#0F172A] flex items-center justify-center">
                        <Palette className="w-6 h-6 text-[#94A3B8]" />
                      </div>
                      <div className="text-left">
                        <p className="text-white font-bold text-base">Dark Theme</p>
                        <p className="text-[#64748B] text-xs">Midnight Slate</p>
                      </div>
                      {theme === 'dark' && <div className="w-3 h-3 rounded-full bg-[#84CC16] animate-pulse ml-auto" />}
                    </button>
                    <button
                      onClick={() => {
                        setTheme('light');
                        toast.success('☀️ Light theme activated', { duration: 1500 });
                      }}
                      className={`h-[72px] px-4 rounded-xl border-2 flex items-center gap-3 transition-all ${
                        theme === 'light'
                          ? 'border-[#84CC16] bg-[#84CC16]/10'
                          : 'border-[#334155] bg-[#0F172A] hover:border-[#84CC16]'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                        <Palette className="w-6 h-6 text-[#0F172A]" />
                      </div>
                      <div className="text-left">
                        <p className="text-white font-bold text-base">Light Theme</p>
                        <p className="text-[#64748B] text-xs">Clinical White</p>
                      </div>
                      {theme === 'light' && <div className="w-3 h-3 rounded-full bg-[#84CC16] animate-pulse ml-auto" />}
                    </button>
                  </div>
                </div>

                {/* System Actions */}
                <div>
                  <label className="text-[#94A3B8] font-bold text-sm mb-3 block">System Actions</label>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        window.location.reload();
                      }}
                      className="w-full h-[56px] bg-[#0F172A] border-2 border-[#334155] hover:border-[#FBBF24] rounded-xl flex items-center justify-between px-4 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <RotateCcw className="w-5 h-5 text-[#FBBF24]" />
                        <span className="text-white font-bold text-sm">Reload Application</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#64748B]" />
                    </button>
                    <button
                      onClick={() => {
                        console.log('=== WELL-CHECK DEBUG STATE ===');
                        console.log('Current User:', currentUser);
                        console.log('Family Members:', familyMembers);
                        console.log('Capabilities:', capabilities);
                        console.log('Theme:', theme);
                        console.log('Route:', currentRoute);
                        console.log('Battery:', batteryLevel);
                        console.log('Offline:', isOffline);
                        console.log('Active Watch:', activeWatchMode);
                        console.log('==============================');
                        toast.success('📝 State logged to console', { duration: 2000 });
                      }}
                      className="w-full h-[56px] bg-[#0F172A] border-2 border-[#334155] hover:border-[#3B82F6] rounded-xl flex items-center justify-between px-4 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <Activity className="w-5 h-5 text-[#3B82F6]" />
                        <span className="text-white font-bold text-sm">Log State to Console</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#64748B]" />
                    </button>
                  </div>
                </div>

                {/* Emergency Reset */}
                <div className="pt-4 border-t border-[#334155]">
                  <button
                    onClick={handleReset}
                    className="w-full h-[72px] bg-[#FF4444] text-white rounded-xl font-bold text-lg hover:bg-[#DC2626] transition-all flex items-center justify-center gap-3 hover:scale-105"
                  >
                    <Power className="w-6 h-6" />
                    Emergency Reset (Clear All Data)
                  </button>
                  <p className="text-[#64748B] text-xs text-center mt-2">
                    ⚠️ Clears all data and reloads the application
                  </p>
                </div>
              </div>
            )}

            {/* Keyboard Shortcut Hint */}
            <div className="text-center pt-4 border-t border-[#334155]">
              <p className="text-[#64748B] text-sm">
                💡 <strong className="text-white">Keyboard Shortcuts:</strong> <kbd className="px-2 py-1 bg-[#0F172A] border border-[#334155] rounded text-white font-mono text-xs">Ctrl + D</kbd> to toggle • <kbd className="px-2 py-1 bg-[#0F172A] border border-[#334155] rounded text-white font-mono text-xs">Esc</kbd> to close
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal (Above Demo Controls) */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 p-4">
          <div className="w-full max-w-md bg-[#1E293B] border-4 border-[#FF4444] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-10 h-10 text-[#FF4444]" />
              <h2 className="text-white font-bold text-2xl">Confirm Reset</h2>
            </div>

            <p className="text-[#94A3B8] text-base mb-6">
              This will clear ALL data including:
            </p>

            <ul className="space-y-2 mb-6 text-[#94A3B8] text-sm">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#FF4444]" />
                <span>App state & user roles</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#FF4444]" />
                <span>Panic events & safety terms</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#FF4444]" />
                <span>Medications & logs</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#FF4444]" />
                <span>Doctor visits & appointments</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#FF4444]" />
                <span>All localStorage data</span>
              </li>
            </ul>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={cancelReset}
                className="h-[60px] bg-[#334155] text-white rounded-xl font-bold text-base hover:bg-[#475569] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmReset}
                className="h-[60px] bg-[#FF4444] text-white rounded-xl font-bold text-base hover:bg-[#DC2626] transition-colors"
              >
                Reset Now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
