// 🛡️ AppointmentNotifications - Arrival & Late Alerts
// Coder: Monitor notifications for geofence events
// Reference: prd.md #44-45

import { CheckCircle2, Clock, MapPin, Phone, AlertTriangle, Navigation } from 'lucide-react';
import type { DoctorVisit } from '../types';

interface ArrivalNotificationProps {
  visit: DoctorVisit;
  userName: string;
  onDismiss?: () => void;
  onCallClinic?: () => void;
}

export function ArrivalNotification({
  visit,
  userName,
  onDismiss,
  onCallClinic,
}: ArrivalNotificationProps) {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-[#84CC16]/10 border-2 border-[#84CC16] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-[#84CC16] p-4">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-8 h-8 text-[#0F172A]" />
          <div className="flex-1">
            <p className="text-[#0F172A] font-bold text-xl">Safe Arrival Confirmed</p>
            <p className="text-[#0F172A]/80 text-sm">{userName} has arrived</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Appointment Info */}
        <div className="mb-4">
          <p className="text-white font-bold text-lg mb-1">{visit.doctorName}</p>
          {visit.specialty && <p className="text-[#94A3B8] text-sm mb-1">{visit.specialty}</p>}
          <p className="text-[#94A3B8] text-sm">{visit.clinicName}</p>
        </div>

        {/* Arrival Details */}
        <div className="p-3 bg-[#0F172A] rounded-lg mb-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[#64748B] text-xs mb-1">Scheduled</p>
              <p className="text-white font-mono text-sm">{visit.appointmentTime}</p>
            </div>
            <div>
              <p className="text-[#64748B] text-xs mb-1">Arrived</p>
              <p className="text-[#84CC16] font-mono text-sm font-bold">
                {visit.arrivedAt ? formatTime(visit.arrivedAt) : '--'}
              </p>
            </div>
          </div>

          {visit.arrivedLocation && (
            <div className="mt-3 pt-3 border-t border-[#334155]">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#64748B]" />
                <p className="text-[#94A3B8] text-xs">
                  GPS: {visit.arrivedLocation.lat.toFixed(5)}, {visit.arrivedLocation.lng.toFixed(5)}
                </p>
              </div>
              <p className="text-[#64748B] text-xs ml-6">
                Accuracy: ±{visit.arrivedLocation.accuracy.toFixed(0)}m
              </p>
            </div>
          )}
        </div>

        {/* Status Badge */}
        <div className="flex items-center justify-center gap-2 p-3 bg-[#84CC16]/20 rounded-lg mb-4">
          <CheckCircle2 className="w-5 h-5 text-[#84CC16]" />
          <p className="text-[#84CC16] font-bold text-sm">Auto-Check-In Successful</p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {onCallClinic && visit.clinicPhone && (
            <a
              href={`tel:${visit.clinicPhone.replace(/\D/g, '')}`}
              onClick={onCallClinic}
              className="h-[56px] bg-[#334155] text-white rounded-lg font-bold text-base flex items-center justify-center gap-2 hover:bg-[#475569] transition-colors"
            >
              <Phone className="w-5 h-5" />
              Call Clinic
            </a>
          )}

          {onDismiss && (
            <button
              onClick={onDismiss}
              className="h-[56px] bg-[#84CC16] text-[#0F172A] rounded-lg font-bold text-base hover:bg-[#9FE63C] transition-colors"
            >
              Acknowledge
            </button>
          )}
        </div>

        {/* Legal Notice */}
        <p className="text-[#64748B] text-xs mt-3 text-center">
          ✅ Arrival logged with GPS timestamp for safety compliance
        </p>
      </div>
    </div>
  );
}

interface LateArrivalAlertProps {
  visit: DoctorVisit;
  userName: string;
  minutesLate: number;
  onCallUser?: () => void;
  onCallClinic?: () => void;
  onGetDirections?: () => void;
  onDismiss?: () => void;
}

export function LateArrivalAlert({
  visit,
  userName,
  minutesLate,
  onCallUser,
  onCallClinic,
  onGetDirections,
  onDismiss,
}: LateArrivalAlertProps) {
  const getUrgencyLevel = () => {
    if (minutesLate >= 30) return { color: '#FF4444', label: 'CRITICAL', bgColor: 'bg-[#FF4444]/10', borderColor: 'border-[#FF4444]' };
    if (minutesLate >= 20) return { color: '#F97316', label: 'URGENT', bgColor: 'bg-[#F97316]/10', borderColor: 'border-[#F97316]' };
    return { color: '#FBBF24', label: 'WARNING', bgColor: 'bg-[#FBBF24]/10', borderColor: 'border-[#FBBF24]' };
  };

  const urgency = getUrgencyLevel();

  return (
    <div className={`${urgency.bgColor} border-2 ${urgency.borderColor} rounded-lg overflow-hidden`}>
      {/* Header */}
      <div className="p-4 border-b border-[#334155]">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-8 h-8" style={{ color: urgency.color }} />
          <div className="flex-1">
            <p className="text-white font-bold text-xl">Late Arrival Alert</p>
            <p className="text-[#94A3B8] text-sm">{userName} has not arrived</p>
          </div>
          <div className="px-3 py-1 rounded-full" style={{ backgroundColor: urgency.color }}>
            <p className="text-white font-bold text-xs">{urgency.label}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Appointment Info */}
        <div className="mb-4">
          <p className="text-white font-bold text-lg mb-1">{visit.doctorName}</p>
          {visit.specialty && <p className="text-[#94A3B8] text-sm mb-1">{visit.specialty}</p>}
          <p className="text-[#94A3B8] text-sm">{visit.clinicName}</p>
        </div>

        {/* Late Status */}
        <div className="p-4 bg-[#0F172A] rounded-lg mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[#64748B] text-xs mb-1">Scheduled Time</p>
              <p className="text-white font-mono text-base">{visit.appointmentTime}</p>
            </div>
            <div>
              <p className="text-[#64748B] text-xs mb-1">Minutes Late</p>
              <p className="font-mono text-2xl font-bold" style={{ color: urgency.color }}>
                +{minutesLate}
              </p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-[#334155]">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#64748B]" />
              <p className="text-[#94A3B8] text-sm">{visit.clinicAddress}</p>
            </div>
          </div>
        </div>

        {/* Status Message */}
        <div className="p-3 rounded-lg mb-4" style={{ backgroundColor: `${urgency.color}20` }}>
          <p className="text-sm" style={{ color: urgency.color }}>
            <Clock className="w-4 h-4 inline mr-2" />
            {userName} has not checked in within the geofence ({(visit.geofenceRadius / 1609.344).toFixed(1)} miles).
            {minutesLate >= 30 && ' Consider calling immediately.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          {onCallUser && (
            <button
              onClick={onCallUser}
              className="h-[60px] rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-colors"
              style={{
                backgroundColor: urgency.color,
                color: '#FFFFFF',
              }}
            >
              <Phone className="w-5 h-5" />
              Call {userName}
            </button>
          )}

          {onCallClinic && visit.clinicPhone && (
            <a
              href={`tel:${visit.clinicPhone.replace(/\D/g, '')}`}
              onClick={onCallClinic}
              className="h-[60px] bg-[#334155] text-white rounded-lg font-bold text-base flex items-center justify-center gap-2 hover:bg-[#475569] transition-colors"
            >
              <Phone className="w-5 h-5" />
              Call Clinic
            </a>
          )}
        </div>

        {onGetDirections && (
          <button
            onClick={onGetDirections}
            className="w-full h-[56px] bg-[#0F172A] border border-[#334155] text-white rounded-lg font-bold text-base flex items-center justify-center gap-2 hover:border-[#84CC16] transition-colors mb-3"
          >
            <Navigation className="w-5 h-5" />
            Get Directions to Clinic
          </button>
        )}

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="w-full h-[56px] bg-[#334155] text-white rounded-lg font-bold text-base hover:bg-[#475569] transition-colors"
          >
            Dismiss Alert
          </button>
        )}

        {/* Legal Notice */}
        <p className="text-[#64748B] text-xs mt-3 text-center">
          ⚠️ Late arrival logged. GPS check-in requires ±10m accuracy per Geofence Law.
        </p>
      </div>
    </div>
  );
}

interface GeofenceStatusIndicatorProps {
  visit: DoctorVisit;
  userName: string;
  distanceMiles?: number;
}

export function GeofenceStatusIndicator({
  visit,
  userName,
  distanceMiles,
}: GeofenceStatusIndicatorProps) {
  const getStatusDisplay = () => {
    switch (visit.geofenceStatus) {
      case 'inside':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-[#84CC16]" />,
          label: 'At Clinic',
          color: 'text-[#84CC16]',
          bgColor: 'bg-[#84CC16]/10',
          borderColor: 'border-[#84CC16]',
        };
      case 'approaching':
        return {
          icon: <Navigation className="w-5 h-5 text-[#FBBF24]" />,
          label: 'En Route',
          color: 'text-[#FBBF24]',
          bgColor: 'bg-[#FBBF24]/10',
          borderColor: 'border-[#FBBF24]',
        };
      case 'departed':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-[#94A3B8]" />,
          label: 'Departed',
          color: 'text-[#94A3B8]',
          bgColor: 'bg-[#94A3B8]/10',
          borderColor: 'border-[#94A3B8]',
        };
      default:
        return {
          icon: <MapPin className="w-5 h-5 text-[#64748B]" />,
          label: 'Not Yet Nearby',
          color: 'text-[#64748B]',
          bgColor: 'bg-[#64748B]/10',
          borderColor: 'border-[#334155]',
        };
    }
  };

  const status = getStatusDisplay();

  return (
    <div className={`${status.bgColor} border ${status.borderColor} rounded-lg p-3`}>
      <div className="flex items-center gap-3">
        {status.icon}
        <div className="flex-1">
          <p className={`${status.color} font-bold text-sm`}>{status.label}</p>
          {distanceMiles !== undefined && (
            <p className="text-[#94A3B8] text-xs">
              {distanceMiles < 1
                ? `${(distanceMiles * 5280).toFixed(0)} feet away`
                : `${distanceMiles.toFixed(1)} miles away`}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-[#64748B] text-xs">Geofence</p>
          <p className="text-white text-sm font-mono">
            {(visit.geofenceRadius / 1609.344).toFixed(1)} mi
          </p>
        </div>
      </div>
    </div>
  );
}
