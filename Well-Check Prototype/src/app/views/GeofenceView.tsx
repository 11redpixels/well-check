// 🛡️ Geofence View - V12.0: Route Hardening
// Mandate: No more "buttons to nowhere" - Command Center link now functional
// Reference: V12.0 Audit - Chief Architect identified missing route

import { MapPin, Plus, Edit2, Trash2, AlertCircle, Home, Hospital, School } from 'lucide-react';
import { useState } from 'react';

interface GeofenceZone {
  id: string;
  name: string;
  type: 'home' | 'hospital' | 'school' | 'unsafe' | 'custom';
  latitude: number;
  longitude: number;
  radius: number; // meters
  alertOnEntry: boolean;
  alertOnExit: boolean;
  color: string;
}

export function GeofenceView() {
  // V12.0: Mock geofence zones (TODO: Replace with real data from Supabase)
  const [zones, setZones] = useState<GeofenceZone[]>([
    {
      id: 'zone-001',
      name: 'Home',
      type: 'home',
      latitude: 37.7749,
      longitude: -122.4194,
      radius: 500,
      alertOnEntry: false,
      alertOnExit: true,
      color: '#84CC16',
    },
    {
      id: 'zone-002',
      name: 'St. Mary Hospital',
      type: 'hospital',
      latitude: 37.7849,
      longitude: -122.4094,
      radius: 200,
      alertOnEntry: true,
      alertOnExit: true,
      color: '#3B82F6',
    },
    {
      id: 'zone-003',
      name: 'Downtown (Unsafe)',
      type: 'unsafe',
      latitude: 37.7649,
      longitude: -122.4294,
      radius: 1000,
      alertOnEntry: true,
      alertOnExit: false,
      color: '#FF4444',
    },
  ]);

  const getZoneIcon = (type: GeofenceZone['type']) => {
    switch (type) {
      case 'home':
        return Home;
      case 'hospital':
        return Hospital;
      case 'school':
        return School;
      case 'unsafe':
        return AlertCircle;
      default:
        return MapPin;
    }
  };

  const getZoneTypeLabel = (type: GeofenceZone['type']) => {
    switch (type) {
      case 'home':
        return 'Safe Zone';
      case 'hospital':
        return 'Medical Facility';
      case 'school':
        return 'Educational';
      case 'unsafe':
        return 'Restricted Area';
      default:
        return 'Custom';
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <MapPin className="w-8 h-8 text-[#3B82F6]" />
              <h1 className="text-[var(--color-text-primary)] font-bold text-3xl">
                Geofence Zones
              </h1>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#3B82F6] text-white font-bold text-base rounded-xl hover:bg-[#2563EB] transition-all active:scale-95">
              <Plus className="w-5 h-5" />
              Add Zone
            </button>
          </div>
          <p className="text-[var(--color-text-secondary)] text-base">
            Location-based alerts for family safety monitoring
          </p>
        </div>

        {/* Zone Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Safe Zones */}
          <div className="bg-[var(--color-card-bg)] border-2 border-[#84CC16] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Home className="w-8 h-8 text-[#84CC16]" />
              <span className="text-[#84CC16] font-bold text-3xl">
                {zones.filter((z) => z.type === 'home').length}
              </span>
            </div>
            <h3 className="text-[var(--color-text-primary)] font-bold text-lg">Safe Zones</h3>
            <p className="text-[var(--color-text-tertiary)] text-sm mt-1">
              Home, trusted locations
            </p>
          </div>

          {/* Medical Facilities */}
          <div className="bg-[var(--color-card-bg)] border-2 border-[#3B82F6] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Hospital className="w-8 h-8 text-[#3B82F6]" />
              <span className="text-[#3B82F6] font-bold text-3xl">
                {zones.filter((z) => z.type === 'hospital').length}
              </span>
            </div>
            <h3 className="text-[var(--color-text-primary)] font-bold text-lg">Medical</h3>
            <p className="text-[var(--color-text-tertiary)] text-sm mt-1">
              Hospitals, clinics
            </p>
          </div>

          {/* Restricted Areas */}
          <div className="bg-[var(--color-card-bg)] border-2 border-[#FF4444] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="w-8 h-8 text-[#FF4444]" />
              <span className="text-[#FF4444] font-bold text-3xl">
                {zones.filter((z) => z.type === 'unsafe').length}
              </span>
            </div>
            <h3 className="text-[var(--color-text-primary)] font-bold text-lg">Restricted</h3>
            <p className="text-[var(--color-text-tertiary)] text-sm mt-1">
              Unsafe areas
            </p>
          </div>
        </div>

        {/* Zone List */}
        <div className="bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-2xl p-6">
          <h2 className="text-[var(--color-text-primary)] font-bold text-xl mb-6">
            Active Zones ({zones.length})
          </h2>

          <div className="space-y-4">
            {zones.map((zone) => {
              const ZoneIcon = getZoneIcon(zone.type);

              return (
                <div
                  key={zone.id}
                  className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
                >
                  {/* Zone Icon */}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${zone.color}20`, border: `2px solid ${zone.color}` }}
                  >
                    <ZoneIcon className="w-6 h-6" style={{ color: zone.color }} />
                  </div>

                  {/* Zone Details */}
                  <div className="flex-1">
                    <h3 className="text-[var(--color-text-primary)] font-bold text-base mb-1">
                      {zone.name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-[var(--color-text-tertiary)]">
                        Type: <strong className="text-[var(--color-text-secondary)]">{getZoneTypeLabel(zone.type)}</strong>
                      </span>
                      <span className="text-[var(--color-text-tertiary)]">
                        Radius: <strong className="text-[var(--color-text-secondary)]">{zone.radius}m</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      {zone.alertOnEntry && (
                        <span className="px-2 py-1 bg-[#3B82F6]/10 text-[#3B82F6] text-xs font-bold rounded-full">
                          Alert on Entry
                        </span>
                      )}
                      {zone.alertOnExit && (
                        <span className="px-2 py-1 bg-[#F59E0B]/10 text-[#F59E0B] text-xs font-bold rounded-full">
                          Alert on Exit
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button className="w-10 h-10 rounded-lg bg-[var(--color-card-bg)] border border-[var(--color-border)] hover:border-[#3B82F6] flex items-center justify-center transition-all">
                      <Edit2 className="w-5 h-5 text-[var(--color-text-tertiary)]" />
                    </button>
                    <button className="w-10 h-10 rounded-lg bg-[var(--color-card-bg)] border border-[var(--color-border)] hover:border-[#FF4444] flex items-center justify-center transition-all">
                      <Trash2 className="w-5 h-5 text-[var(--color-text-tertiary)]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Map Integration (Coming Soon) */}
        <div className="mt-6 p-6 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-center">
          <MapPin className="w-8 h-8 text-[var(--color-text-tertiary)] mx-auto mb-2" />
          <p className="text-[var(--color-text-tertiary)] text-sm">
            <strong>Coming Soon:</strong> Interactive map view with real-time family location overlay
          </p>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-xl p-6">
          <h3 className="text-[var(--color-text-primary)] font-bold text-lg mb-4">
            How Geofencing Works
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#3B82F6] text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <p className="text-[var(--color-text-secondary)]">
                <strong>Create Zones:</strong> Define safe areas (home, hospital) or restricted zones (unsafe neighborhoods).
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#3B82F6] text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <p className="text-[var(--color-text-secondary)]">
                <strong>Set Alerts:</strong> Choose to be notified when family members enter or exit zones.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#3B82F6] text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <p className="text-[var(--color-text-secondary)]">
                <strong>Real-Time Monitoring:</strong> Receive instant notifications via push alerts and in-app messages.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
