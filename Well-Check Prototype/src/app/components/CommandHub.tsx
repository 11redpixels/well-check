// 🛡️ Command Hub - Unified Control Entry Point
// Product Designer: Single System Health icon → Full-screen Control Center
// Reference: prd.md (3-Zone HUD), ai-prd-uiux.md (Abolish Menu Hunting)
// ⚠️ V7.5: Zero-Gravity interaction, 72px tiles

import { 
  Settings, 
  Users, 
  Shield, 
  Pill, 
  Stethoscope, 
  History, 
  Lock, 
  FileText,
  ChevronRight,
  X,
  Activity,
  Wifi,
  Battery,
  MapPin
} from 'lucide-react';

interface CommandHubProps {
  isOpen: boolean;
  onToggle: () => void;
  systemHealth: {
    battery: number;
    gpsAccuracy: 'high' | 'medium' | 'low' | 'none';
    isOnline: boolean;
    isSyncing: boolean;
  };
  userRole: 'family_head' | 'protected' | 'monitor' | 'minor';
}

export function CommandHub({ isOpen, onToggle, systemHealth, userRole }: CommandHubProps) {
  const getGPSColor = () => {
    switch (systemHealth.gpsAccuracy) {
      case 'high': return '#84CC16';
      case 'medium': return '#FBBF24';
      case 'low': return '#F97316';
      default: return '#64748B';
    }
  };

  const getBatteryColor = () => {
    if (systemHealth.battery >= 50) return '#84CC16';
    if (systemHealth.battery >= 20) return '#FBBF24';
    return '#FF4444';
  };

  return (
    <>
      {/* System Health Icon (Top Right) */}
      <button
        onClick={onToggle}
        className="fixed top-4 right-4 z-50 w-16 h-16 rounded-full bg-[#1E293B] border-2 border-[#334155] flex items-center justify-center hover:border-[#84CC16] transition-colors"
        aria-label="Open Command Hub"
      >
        <div className="relative">
          <Activity className="w-8 h-8 text-[#84CC16]" />
          
          {/* Status Indicators */}
          <div className="absolute -bottom-1 -right-1 flex gap-0.5">
            {/* Battery */}
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: getBatteryColor() }}
            />
            {/* GPS */}
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: getGPSColor() }}
            />
            {/* Network */}
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: systemHealth.isOnline ? '#84CC16' : '#FF4444' }}
            />
          </div>
        </div>
      </button>

      {/* Control Drawer (Full-Screen Overlay) */}
      {isOpen && (
        <div className="fixed inset-0 z-[9998] bg-black/95 overflow-y-auto">
          <div className="min-h-screen p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-white font-bold text-4xl mb-2">Command Center</h1>
                <p className="text-[#94A3B8] text-base">System Health & Controls</p>
              </div>
              
              <button
                onClick={onToggle}
                className="w-16 h-16 rounded-full bg-[#334155] flex items-center justify-center hover:bg-[#475569] transition-colors"
                aria-label="Close"
              >
                <X className="w-8 h-8 text-white" />
              </button>
            </div>

            {/* System Health Status */}
            <div className="mb-8 p-6 bg-[#1E293B] border-2 border-[#334155] rounded-lg">
              <h2 className="text-white font-bold text-xl mb-4">System Status</h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* Battery */}
                <div className="text-center">
                  <Battery 
                    className="w-8 h-8 mx-auto mb-2" 
                    style={{ color: getBatteryColor() }}
                  />
                  <p className="text-white font-bold text-2xl font-mono">{systemHealth.battery}%</p>
                  <p className="text-[#64748B] text-xs">Battery</p>
                </div>

                {/* GPS */}
                <div className="text-center">
                  <MapPin 
                    className="w-8 h-8 mx-auto mb-2" 
                    style={{ color: getGPSColor() }}
                  />
                  <p className="text-white font-bold text-base capitalize">{systemHealth.gpsAccuracy}</p>
                  <p className="text-[#64748B] text-xs">GPS</p>
                </div>

                {/* Network */}
                <div className="text-center">
                  <Wifi 
                    className="w-8 h-8 mx-auto mb-2" 
                    style={{ color: systemHealth.isOnline ? '#84CC16' : '#FF4444' }}
                  />
                  <p className="text-white font-bold text-base">
                    {systemHealth.isOnline ? 'Online' : 'Offline'}
                  </p>
                  <p className="text-[#64748B] text-xs">Network</p>
                </div>

                {/* Sync */}
                <div className="text-center">
                  <Activity 
                    className={`w-8 h-8 mx-auto mb-2 ${systemHealth.isSyncing ? 'animate-pulse' : ''}`}
                    style={{ color: systemHealth.isSyncing ? '#FBBF24' : '#84CC16' }}
                  />
                  <p className="text-white font-bold text-base">
                    {systemHealth.isSyncing ? 'Syncing' : 'Ready'}
                  </p>
                  <p className="text-[#64748B] text-xs">Status</p>
                </div>
              </div>
            </div>

            {/* MANAGEMENT Section */}
            <div className="mb-8">
              <h2 className="text-[#84CC16] font-bold text-2xl mb-4">Management</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Users */}
                {userRole === 'family_head' && (
                  <ControlTile
                    icon={<Users className="w-10 h-10 text-[#84CC16]" />}
                    label="Family Members"
                    description="Manage users & roles"
                    onClick={() => {/* Navigate to Users */}}
                  />
                )}

                {/* Capabilities */}
                {userRole === 'family_head' && (
                  <ControlTile
                    icon={<Shield className="w-10 h-10 text-[#84CC16]" />}
                    label="Capabilities"
                    description="Toggle module access"
                    onClick={() => {/* Navigate to Capabilities */}}
                  />
                )}

                {/* Pharmacy */}
                <ControlTile
                  icon={<Pill className="w-10 h-10 text-[#84CC16]" />}
                  label="Medications"
                  description="Manage prescriptions"
                  onClick={() => {/* Navigate to Medications */}}
                />

                {/* Doctor Visits */}
                <ControlTile
                  icon={<Stethoscope className="w-10 h-10 text-[#84CC16]" />}
                  label="Doctor Visits"
                  description="Appointments & geofence"
                  onClick={() => {/* Navigate to Doctor Visits */}}
                />
              </div>
            </div>

            {/* SYSTEM Section */}
            <div className="mb-8">
              <h2 className="text-[#FBBF24] font-bold text-2xl mb-4">System</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Settings */}
                <ControlTile
                  icon={<Settings className="w-10 h-10 text-[#FBBF24]" />}
                  label="Settings"
                  description="App preferences"
                  onClick={() => {/* Navigate to Settings */}}
                />

                {/* PIN Management */}
                {userRole === 'family_head' && (
                  <ControlTile
                    icon={<Lock className="w-10 h-10 text-[#FBBF24]" />}
                    label="Universal PIN"
                    description="Set Family PIN"
                    onClick={() => {/* Navigate to PIN Setup */}}
                  />
                )}

                {/* Safety Terms */}
                <ControlTile
                  icon={<FileText className="w-10 h-10 text-[#FBBF24]" />}
                  label="Safety Terms"
                  description="View 911 Legal Gate"
                  onClick={() => {/* Navigate to Safety Terms */}}
                />
              </div>
            </div>

            {/* HISTORY Section */}
            <div>
              <h2 className="text-[#6366F1] font-bold text-2xl mb-4">History</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 90-Day Vault */}
                <ControlTile
                  icon={<History className="w-10 h-10 text-[#6366F1]" />}
                  label="90-Day Vault"
                  description="Audit trail & events"
                  onClick={() => {/* Navigate to History */}}
                  fullWidth
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// =====================================================================
// CONTROL TILE (72px touch target)
// =====================================================================

interface ControlTileProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
  fullWidth?: boolean;
}

function ControlTile({ icon, label, description, onClick, fullWidth }: ControlTileProps) {
  return (
    <button
      onClick={onClick}
      className={`h-[88px] p-4 bg-[#1E293B] border-2 border-[#334155] rounded-lg flex items-center gap-4 hover:border-[#84CC16] transition-colors text-left ${
        fullWidth ? 'col-span-full' : ''
      }`}
    >
      <div className="w-14 h-14 bg-[#0F172A] rounded-lg flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      
      <div className="flex-1">
        <p className="text-white font-bold text-lg mb-1">{label}</p>
        <p className="text-[#64748B] text-sm">{description}</p>
      </div>

      <ChevronRight className="w-6 h-6 text-[#64748B] flex-shrink-0" />
    </button>
  );
}
