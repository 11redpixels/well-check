// ⚙️ PILLAR 4: Family Lab (Tile-Based Settings Menu)
// Product Designer Mandate: Robust, tile-based settings for Family Head

import { useState } from 'react';
import type { FamilySettings, UserRole } from '../types';

interface FamilyLabProps {
  settings: FamilySettings;
  currentUserRole: UserRole;
  onUpdateSettings: (settings: Partial<FamilySettings>) => void;
  onClose: () => void;
}

type SettingsTab = 'notifications' | 'geofences' | 'roles' | 'ui';

export function FamilyLab({
  settings,
  currentUserRole,
  onUpdateSettings,
  onClose,
}: FamilyLabProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('notifications');
  const [localSettings, setLocalSettings] = useState(settings);
  const [hasChanges, setHasChanges] = useState(false);

  const isFamilyHead = currentUserRole === 'family_head';

  const handleSettingChange = (path: string[], value: any) => {
    setLocalSettings((prev) => {
      const next = { ...prev };
      let current: any = next;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return next;
    });
    setHasChanges(true);
  };

  const handleSave = () => {
    onUpdateSettings(localSettings);
    setHasChanges(false);
  };

  const handleReset = () => {
    setLocalSettings(settings);
    setHasChanges(false);
  };

  return (
    <div className="fixed inset-0 bg-[#0F172A] z-50 flex flex-col">
      {/* Header */}
      <div className="bg-[#1E293B] border-b border-[#334155] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <span>⚙️</span>
              <span>Family Lab</span>
            </h1>
            <p className="text-sm text-[#94A3B8] mt-1">
              {isFamilyHead
                ? 'Customize your family safety system'
                : 'View family settings (editing requires Family Head)'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-[#334155] text-white flex items-center justify-center hover:bg-[#475569] active:scale-95 transition-transform"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-4 overflow-x-auto">
          {[
            { key: 'notifications', label: 'Notifications', icon: '🔔' },
            { key: 'geofences', label: 'Geofences', icon: '📍' },
            { key: 'roles', label: 'Roles', icon: '👥' },
            { key: 'ui', label: 'Interface', icon: '🎨' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as SettingsTab)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-[#84CC16] text-[#0F172A]'
                  : 'bg-[#334155] text-[#94A3B8] hover:bg-[#475569]'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {/* NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Notification Sensitivities</h2>
              <p className="text-sm text-[#94A3B8] mb-4">
                Control how quickly alerts are sent to family members
              </p>
            </div>

            {/* Medication Alerts */}
            <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">💊</span>
                <div>
                  <h3 className="text-lg font-bold text-white">Medication Alerts</h3>
                  <p className="text-sm text-[#64748B]">
                    Time delay before escalating missed doses
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {['immediate', '5min', '15min'].map((option) => (
                  <button
                    key={option}
                    disabled={!isFamilyHead}
                    onClick={() =>
                      handleSettingChange(
                        ['notificationSensitivity', 'medication'],
                        option
                      )
                    }
                    className={`h-[64px] rounded-lg text-sm font-bold transition-all ${
                      localSettings.notificationSensitivity.medication === option
                        ? 'bg-[#84CC16] text-[#0F172A] border-2 border-white'
                        : 'bg-[#334155] text-white hover:bg-[#475569]'
                    } ${!isFamilyHead && 'opacity-50 cursor-not-allowed'}`}
                  >
                    {option === 'immediate'
                      ? 'Immediate'
                      : option === '5min'
                      ? '5 Minutes'
                      : '15 Minutes'}
                  </button>
                ))}
              </div>
            </div>

            {/* Geofence Alerts */}
            <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">📍</span>
                <div>
                  <h3 className="text-lg font-bold text-white">Geofence Alerts</h3>
                  <p className="text-sm text-[#64748B]">
                    Location-based notification preferences
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: 'all', label: 'All Events' },
                  { key: 'late_only', label: 'Late Only' },
                  { key: 'none', label: 'Disabled' },
                ].map((option) => (
                  <button
                    key={option.key}
                    disabled={!isFamilyHead}
                    onClick={() =>
                      handleSettingChange(
                        ['notificationSensitivity', 'geofence'],
                        option.key
                      )
                    }
                    className={`h-[64px] rounded-lg text-sm font-bold transition-all ${
                      localSettings.notificationSensitivity.geofence === option.key
                        ? 'bg-[#84CC16] text-[#0F172A] border-2 border-white'
                        : 'bg-[#334155] text-white hover:bg-[#475569]'
                    } ${!isFamilyHead && 'opacity-50 cursor-not-allowed'}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Ping Alerts */}
            <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">📤</span>
                <div>
                  <h3 className="text-lg font-bold text-white">Smart Ping Alerts</h3>
                  <p className="text-sm text-[#64748B]">Who receives ping notifications</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: 'all', label: 'All Family' },
                  { key: 'family_head_only', label: 'Head Only' },
                  { key: 'none', label: 'Disabled' },
                ].map((option) => (
                  <button
                    key={option.key}
                    disabled={!isFamilyHead}
                    onClick={() =>
                      handleSettingChange(['notificationSensitivity', 'ping'], option.key)
                    }
                    className={`h-[64px] rounded-lg text-sm font-bold transition-all ${
                      localSettings.notificationSensitivity.ping === option.key
                        ? 'bg-[#84CC16] text-[#0F172A] border-2 border-white'
                        : 'bg-[#334155] text-white hover:bg-[#475569]'
                    } ${!isFamilyHead && 'opacity-50 cursor-not-allowed'}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Panic Alerts (Always On) */}
            <div className="bg-[#FF4444]/20 border-2 border-[#FF4444] rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">🚨</span>
                <div>
                  <h3 className="text-lg font-bold text-white">Panic Mode Alerts</h3>
                  <p className="text-sm text-[#94A3B8]">Always enabled (cannot be changed)</p>
                </div>
              </div>
              <div className="bg-[#0F172A] rounded-lg px-4 py-3 text-sm text-white">
                ⚠️ Panic alerts are always sent immediately to all family members for safety
                reasons
              </div>
            </div>
          </div>
        )}

        {/* GEOFENCES TAB */}
        {activeTab === 'geofences' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Geofence Radii</h2>
              <p className="text-sm text-[#94A3B8] mb-4">
                Customize location boundary sizes for different event types
              </p>
            </div>

            {/* Doctor Visit Geofence */}
            <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🏥</span>
                <div>
                  <h3 className="text-lg font-bold text-white">Doctor Visits</h3>
                  <p className="text-sm text-[#64748B]">
                    Radius for auto check-in at medical appointments
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { value: 402.336, label: '0.25 mi' },
                  { value: 804.672, label: '0.5 mi' },
                  { value: 1609.344, label: '1 mi' },
                  { value: 3218.688, label: '2 mi' },
                ].map((option) => (
                  <button
                    key={option.value}
                    disabled={!isFamilyHead}
                    onClick={() =>
                      handleSettingChange(['geofenceRadii', 'doctorVisit'], option.value)
                    }
                    className={`h-[64px] rounded-lg text-sm font-bold transition-all ${
                      localSettings.geofenceRadii.doctorVisit === option.value
                        ? 'bg-[#84CC16] text-[#0F172A] border-2 border-white'
                        : 'bg-[#334155] text-white hover:bg-[#475569]'
                    } ${!isFamilyHead && 'opacity-50 cursor-not-allowed'}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Home Geofence */}
            <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🏠</span>
                <div>
                  <h3 className="text-lg font-bold text-white">Home</h3>
                  <p className="text-sm text-[#64748B]">Home location boundary</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 160.9344, label: '0.1 mi' },
                  { value: 402.336, label: '0.25 mi' },
                  { value: 804.672, label: '0.5 mi' },
                ].map((option) => (
                  <button
                    key={option.value}
                    disabled={!isFamilyHead}
                    onClick={() =>
                      handleSettingChange(['geofenceRadii', 'home'], option.value)
                    }
                    className={`h-[64px] rounded-lg text-sm font-bold transition-all ${
                      localSettings.geofenceRadii.home === option.value
                        ? 'bg-[#84CC16] text-[#0F172A] border-2 border-white'
                        : 'bg-[#334155] text-white hover:bg-[#475569]'
                    } ${!isFamilyHead && 'opacity-50 cursor-not-allowed'}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* School Geofence */}
            <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🏫</span>
                <div>
                  <h3 className="text-lg font-bold text-white">School</h3>
                  <p className="text-sm text-[#64748B]">School location boundary</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 402.336, label: '0.25 mi' },
                  { value: 804.672, label: '0.5 mi' },
                  { value: 1609.344, label: '1 mi' },
                ].map((option) => (
                  <button
                    key={option.value}
                    disabled={!isFamilyHead}
                    onClick={() =>
                      handleSettingChange(['geofenceRadii', 'school'], option.value)
                    }
                    className={`h-[64px] rounded-lg text-sm font-bold transition-all ${
                      localSettings.geofenceRadii.school === option.value
                        ? 'bg-[#84CC16] text-[#0F172A] border-2 border-white'
                        : 'bg-[#334155] text-white hover:bg-[#475569]'
                    } ${!isFamilyHead && 'opacity-50 cursor-not-allowed'}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ROLES TAB */}
        {activeTab === 'roles' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Role Management</h2>
              <p className="text-sm text-[#94A3B8] mb-4">
                {isFamilyHead
                  ? 'Manage family member roles and permissions'
                  : 'View family roles (editing requires Family Head)'}
              </p>
            </div>

            <div className="bg-[#FBBF24]/20 border-2 border-[#FBBF24] rounded-lg p-6">
              <div className="text-center space-y-2">
                <div className="text-4xl">🚧</div>
                <div className="text-lg font-bold text-white">Coming Soon</div>
                <div className="text-sm text-[#94A3B8]">
                  Role management features will be available in Phase 8
                </div>
              </div>
            </div>
          </div>
        )}

        {/* UI TAB */}
        {activeTab === 'ui' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Interface Customization</h2>
              <p className="text-sm text-[#94A3B8] mb-4">
                Adjust visual settings for better accessibility
              </p>
            </div>

            {/* Contrast Mode */}
            <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🔆</span>
                <div>
                  <h3 className="text-lg font-bold text-white">Contrast Mode</h3>
                  <p className="text-sm text-[#64748B]">WCAG accessibility compliance</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'standard', label: 'Standard (7:1)', desc: 'WCAG AA' },
                  { key: 'high', label: 'High (10:1)', desc: 'WCAG AAA' },
                ].map((option) => (
                  <button
                    key={option.key}
                    onClick={() =>
                      handleSettingChange(['uiSettings', 'contrastMode'], option.key)
                    }
                    className={`p-4 rounded-lg text-left transition-all ${
                      localSettings.uiSettings.contrastMode === option.key
                        ? 'bg-[#84CC16] text-[#0F172A] border-2 border-white'
                        : 'bg-[#334155] text-white hover:bg-[#475569]'
                    }`}
                  >
                    <div className="text-base font-bold">{option.label}</div>
                    <div className="text-sm opacity-70 mt-1">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🔤</span>
                <div>
                  <h3 className="text-lg font-bold text-white">Font Size</h3>
                  <p className="text-sm text-[#64748B]">Text size across the app</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { key: 'small', label: 'S' },
                  { key: 'medium', label: 'M' },
                  { key: 'large', label: 'L' },
                  { key: 'xl', label: 'XL' },
                ].map((option) => (
                  <button
                    key={option.key}
                    onClick={() =>
                      handleSettingChange(['uiSettings', 'fontSize'], option.key)
                    }
                    className={`h-[64px] rounded-lg text-2xl font-bold transition-all ${
                      localSettings.uiSettings.fontSize === option.key
                        ? 'bg-[#84CC16] text-[#0F172A] border-2 border-white'
                        : 'bg-[#334155] text-white hover:bg-[#475569]'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme */}
            <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🎨</span>
                <div>
                  <h3 className="text-lg font-bold text-white">Theme</h3>
                  <p className="text-sm text-[#64748B]">Color scheme preference</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: 'dark', label: 'Dark', icon: '🌙' },
                  { key: 'light', label: 'Light', icon: '☀️' },
                  { key: 'auto', label: 'Auto', icon: '⚙️' },
                ].map((option) => (
                  <button
                    key={option.key}
                    onClick={() => handleSettingChange(['uiSettings', 'theme'], option.key)}
                    className={`h-[64px] rounded-lg text-sm font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                      localSettings.uiSettings.theme === option.key
                        ? 'bg-[#84CC16] text-[#0F172A] border-2 border-white'
                        : 'bg-[#334155] text-white hover:bg-[#475569]'
                    }`}
                  >
                    <span className="text-2xl">{option.icon}</span>
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {isFamilyHead && (
        <div className="bg-[#1E293B] border-t border-[#334155] px-6 py-4 flex gap-3">
          <button
            onClick={handleReset}
            disabled={!hasChanges}
            className="flex-1 h-[64px] bg-[#334155] text-white text-xl font-bold rounded-lg hover:bg-[#475569] active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className="flex-1 h-[64px] bg-[#84CC16] text-[#0F172A] text-xl font-bold rounded-lg hover:bg-[#9DE622] active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span>💾</span>
            <span>Save Changes</span>
          </button>
        </div>
      )}

      {/* Non-Family Head Notice */}
      {!isFamilyHead && (
        <div className="bg-[#FBBF24]/20 border-t-2 border-[#FBBF24] px-6 py-4">
          <div className="text-center text-sm text-[#FBBF24]">
            ⚠️ Only the Family Head can edit these settings
          </div>
        </div>
      )}
    </div>
  );
}
