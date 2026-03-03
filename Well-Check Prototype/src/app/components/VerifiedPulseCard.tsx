// Verified Pulse Display Card (Location + Timestamp + Battery)
import { useState, useEffect } from 'react';
import { MapPin, Clock, Battery, CheckCircle } from 'lucide-react';
import type { VerifiedPulse } from '../types';
import { calculateDistance, getDistanceZone, getZoneColor, getZoneLabel, isValidLocation } from '../lib/proximity';
import { useApp } from '../context/AppContext';

interface VerifiedPulseCardProps {
  pulse: VerifiedPulse;
  onDismiss: () => void;
}

export function VerifiedPulseCard({ pulse, onDismiss }: VerifiedPulseCardProps) {
  const { currentUser } = useApp();
  const [proximityMiles, setProximityMiles] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(true);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // 🚨 PRODUCTION PROXIMITY: Calculate real distance using Haversine
  useEffect(() => {
    async function calculateProximity() {
      setIsCalculating(true);

      // In production, get Monitor's current location
      // For prototype, use mock Monitor location
      const monitorLocation = {
        lat: 37.7749, // San Francisco (Monitor's location)
        lng: -122.4194,
      };

      // Validate pulse location
      if (!isValidLocation(pulse.location)) {
        console.warn('Invalid pulse location:', pulse.location);
        setProximityMiles(0);
        setIsCalculating(false);
        return;
      }

      try {
        const distance = await calculateDistance(
          monitorLocation.lat,
          monitorLocation.lng,
          pulse.location.lat,
          pulse.location.lng
        );

        setProximityMiles(distance);
      } catch (error) {
        console.error('Failed to calculate proximity:', error);
        setProximityMiles(0);
      } finally {
        setIsCalculating(false);
      }
    }

    calculateProximity();
  }, [pulse.location]);

  // Get distance zone styling
  const zone = proximityMiles !== null ? getDistanceZone(proximityMiles) : 'moderate';
  const zoneColor = getZoneColor(zone);
  const zoneLabel = getZoneLabel(zone);

  // Color-coded backgrounds
  const zoneBgColor = zone === 'nearby' 
    ? 'bg-[#00FF00]/20' 
    : zone === 'moderate' 
    ? 'bg-[#FBBF24]/20' 
    : 'bg-[#FF6B6B]/20';
  
  const zoneBorderColor = zone === 'nearby' 
    ? 'border-[#00FF00]' 
    : zone === 'moderate' 
    ? 'border-[#FBBF24]' 
    : 'border-[#FF6B6B]';

  return (
    <div className="bg-[#1E293B] border-2 border-[#00FF00] rounded-lg p-6 shadow-2xl shadow-[#00FF00]/20 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-[#00FF00]/20 flex items-center justify-center">
          <CheckCircle className="w-7 h-7 text-[#00FF00]" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-white font-bold text-lg leading-tight">Safety Verified</h3>
          <p className="text-[#00FF00] text-sm font-mono">{pulse.userName}</p>
        </div>
      </div>

      {/* Pulse Data */}
      <div className="space-y-3 mb-4">
        {/* Proximity Distance (Glanceable) */}
        <div className={`flex items-start gap-3 rounded-lg p-3 ${zoneBgColor} border-2 ${zoneBorderColor}`}>
          <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: zoneColor }} aria-hidden="true" />
          <div className="flex-1">
            <div className="text-[#64748B] text-xs mb-1">Proximity</div>
            {isCalculating ? (
              <div className="text-white font-bold text-2xl font-mono">
                Calculating...
              </div>
            ) : (
              <div className="text-white font-bold text-2xl font-mono">
                {proximityMiles !== null ? proximityMiles.toFixed(1) : '0.0'} mi
              </div>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span 
                className="text-xs font-bold px-2 py-1 rounded"
                style={{ 
                  color: zoneColor,
                  backgroundColor: `${zoneColor}20`
                }}
              >
                {zoneLabel}
              </span>
              <span className="text-[#64748B] text-xs">
                ±{pulse.location.accuracy}m accuracy
              </span>
            </div>
          </div>
        </div>

        {/* Timestamp */}
        <div className="flex items-start gap-3 bg-[#0F172A] rounded-lg p-3">
          <Clock className="w-5 h-5 text-[#FBBF24] flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <div className="text-[#64748B] text-xs mb-1">Response Time</div>
            <div className="text-white font-mono text-sm">{formatTime(pulse.timestamp)}</div>
          </div>
        </div>

        {/* Battery */}
        <div className="flex items-start gap-3 bg-[#0F172A] rounded-lg p-3">
          <Battery
            className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
              pulse.batteryLevel < 15 ? 'text-[#FF6B6B]' : 'text-[#00FF00]'
            }`}
            aria-hidden="true"
          />
          <div>
            <div className="text-[#64748B] text-xs mb-1">Device Battery</div>
            <div
              className={`font-mono text-sm ${
                pulse.batteryLevel < 15 ? 'text-[#FF6B6B] font-bold' : 'text-white'
              }`}
            >
              {pulse.batteryLevel}%
            </div>
          </div>
        </div>
      </div>

      {/* Dismiss Button */}
      <button
        onClick={onDismiss}
        className="w-full min-h-[48px] bg-[#334155] hover:bg-[#475569] text-white font-bold rounded-lg transition-colors"
        aria-label="Dismiss safety verification"
      >
        Dismiss
      </button>
    </div>
  );
}