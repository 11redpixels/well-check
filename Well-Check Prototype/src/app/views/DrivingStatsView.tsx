// 🛡️ Driving Stats View - V11.2: Competitor Feature Injection
// Reference: V11.2 Phase 1 (Driving Stats with Geofence Logs)
// V11.4: Route Hardening - "Data Syncing" fallback state

import { Car, MapPin, Clock, TrendingUp, AlertTriangle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export function DrivingStatsView() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasDrivingData, setHasDrivingData] = useState(false);

  useEffect(() => {
    // V11.4: Simulate data check (TODO: Replace with real driving stats API)
    const timer = setTimeout(() => {
      setIsLoading(false);
      setHasDrivingData(false); // No data yet - show fallback
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // V11.4: Data Syncing State (instead of 404)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-[#3B82F6] mx-auto mb-4 animate-spin" />
          <h1 className="text-[var(--color-text-primary)] font-bold text-2xl mb-2">
            Loading Driving Stats...
          </h1>
          <p className="text-[var(--color-text-secondary)] text-base">
            Syncing your family's driving data
          </p>
        </div>
      </div>
    );
  }

  // V11.4: No Data Fallback (instead of broken link)
  if (!hasDrivingData) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Car className="w-8 h-8 text-[#3B82F6]" />
              <h1 className="text-[var(--color-text-primary)] font-bold text-3xl">
                Driving Stats
              </h1>
            </div>
            <p className="text-[var(--color-text-secondary)] text-base">
              Track family driving patterns and geofence alerts
            </p>
          </div>

          {/* Data Syncing State */}
          <div className="bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-2xl p-12 text-center">
            <div className="w-20 h-20 bg-[#3B82F6]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Car className="w-10 h-10 text-[#3B82F6]" />
            </div>
            <h2 className="text-[var(--color-text-primary)] font-bold text-2xl mb-3">
              Driving Data Syncing
            </h2>
            <p className="text-[var(--color-text-secondary)] text-lg mb-6 max-w-md mx-auto">
              We're collecting driving data from your family members. Check back soon for insights on:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
              <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg p-4">
                <MapPin className="w-6 h-6 text-[#FBBF24] mb-2" />
                <h3 className="text-[var(--color-text-primary)] font-bold text-base mb-1">
                  Geofence Alerts
                </h3>
                <p className="text-[var(--color-text-tertiary)] text-sm">
                  Location-based notifications (home, hospital, unsafe areas)
                </p>
              </div>
              <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg p-4">
                <TrendingUp className="w-6 h-6 text-[#84CC16] mb-2" />
                <h3 className="text-[var(--color-text-primary)] font-bold text-base mb-1">
                  Trip History
                </h3>
                <p className="text-[var(--color-text-tertiary)] text-sm">
                  Daily routes, distance traveled, and time on road
                </p>
              </div>
              <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg p-4">
                <AlertTriangle className="w-6 h-6 text-[#FF4444] mb-2" />
                <h3 className="text-[var(--color-text-primary)] font-bold text-base mb-1">
                  Safety Incidents
                </h3>
                <p className="text-[var(--color-text-tertiary)] text-sm">
                  Hard braking, speeding, or unusual driving patterns
                </p>
              </div>
              <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg p-4">
                <Clock className="w-6 h-6 text-[#6366F1] mb-2" />
                <h3 className="text-[var(--color-text-primary)] font-bold text-base mb-1">
                  Weekly Summary
                </h3>
                <p className="text-[var(--color-text-tertiary)] text-sm">
                  Total miles, trips per week, and driving score
                </p>
              </div>
            </div>
            <p className="text-[var(--color-text-tertiary)] text-sm mt-8">
              💡 <strong>Pro Tip:</strong> Enable location tracking in Settings to activate Driving Stats.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // TODO: Real driving stats UI (with actual data)
  return null;
}
