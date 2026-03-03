// 🛡️ Health Vitals View - V11.2: Competitor Feature Injection
// Reference: V11.2 Phase 1 (Health Vitals schema - BP, HR, Glucose, BMI, Water)
// V11.4: Route Hardening - "Data Syncing" fallback state

import { Activity, Heart, Droplet, TrendingUp, Thermometer, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export function HealthVitalsView() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasVitalsData, setHasVitalsData] = useState(false);

  useEffect(() => {
    // V11.4: Simulate data check (TODO: Replace with real health vitals API)
    const timer = setTimeout(() => {
      setIsLoading(false);
      setHasVitalsData(false); // No data yet - show fallback
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
            Loading Health Vitals...
          </h1>
          <p className="text-[var(--color-text-secondary)] text-base">
            Syncing your family's health data
          </p>
        </div>
      </div>
    );
  }

  // V11.4: No Data Fallback (instead of broken link)
  if (!hasVitalsData) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-8 h-8 text-[#3B82F6]" />
              <h1 className="text-[var(--color-text-primary)] font-bold text-3xl">
                Health Vitals
              </h1>
            </div>
            <p className="text-[var(--color-text-secondary)] text-base">
              Monitor blood pressure, heart rate, glucose, and more
            </p>
          </div>

          {/* Data Syncing State */}
          <div className="bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-2xl p-12 text-center">
            <div className="w-20 h-20 bg-[#3B82F6]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Activity className="w-10 h-10 text-[#3B82F6]" />
            </div>
            <h2 className="text-[var(--color-text-primary)] font-bold text-2xl mb-3">
              Health Data Syncing
            </h2>
            <p className="text-[var(--color-text-secondary)] text-lg mb-6 max-w-md mx-auto">
              We're preparing your family's health dashboard. Soon you'll be able to track:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
              <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg p-4">
                <Heart className="w-6 h-6 text-[#FF4444] mb-2" />
                <h3 className="text-[var(--color-text-primary)] font-bold text-base mb-1">
                  Blood Pressure
                </h3>
                <p className="text-[var(--color-text-tertiary)] text-sm">
                  Systolic/Diastolic readings with AHA clinical thresholds
                </p>
              </div>
              <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg p-4">
                <Activity className="w-6 h-6 text-[#84CC16] mb-2" />
                <h3 className="text-[var(--color-text-primary)] font-bold text-base mb-1">
                  Heart Rate
                </h3>
                <p className="text-[var(--color-text-tertiary)] text-sm">
                  Resting heart rate with abnormal rhythm detection
                </p>
              </div>
              <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg p-4">
                <Droplet className="w-6 h-6 text-[#3B82F6] mb-2" />
                <h3 className="text-[var(--color-text-primary)] font-bold text-base mb-1">
                  Blood Glucose
                </h3>
                <p className="text-[var(--color-text-tertiary)] text-sm">
                  mmol/L tracking with ADA diabetic threshold alerts
                </p>
              </div>
              <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg p-4">
                <TrendingUp className="w-6 h-6 text-[#FBBF24] mb-2" />
                <h3 className="text-[var(--color-text-primary)] font-bold text-base mb-1">
                  BMI & Water Intake
                </h3>
                <p className="text-[var(--color-text-tertiary)] text-sm">
                  Weight management and hydration tracking (WHO standards)
                </p>
              </div>
            </div>
            
            {/* 7-Day Health Forecast Teaser */}
            <div className="mt-8 p-6 bg-[var(--color-bg)] border border-[#84CC16]/30 rounded-xl">
              <Thermometer className="w-8 h-8 text-[#84CC16] mx-auto mb-3" />
              <h3 className="text-[var(--color-text-primary)] font-bold text-lg mb-2">
                Coming Soon: 7-Day Health Forecast
              </h3>
              <p className="text-[var(--color-text-secondary)] text-sm max-w-md mx-auto">
                AI-powered predictions for blood pressure trends, medication adherence impact, and early warning signs (scored 0-100).
              </p>
            </div>

            <p className="text-[var(--color-text-tertiary)] text-sm mt-8">
              💡 <strong>Pro Tip:</strong> Connect a health device (Apple Health, Google Fit) to auto-sync vitals.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // TODO: Real health vitals UI (with actual data)
  return null;
}
