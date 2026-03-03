// 🛡️ AppointmentCard - Doctor Visit Display Component
// Coder: Visual representation of scheduled appointments
// Reference: prd.md #43-49

import { Calendar, Clock, MapPin, Phone, Stethoscope, CheckCircle2, AlertTriangle, Navigation } from 'lucide-react';
import type { DoctorVisit, AppointmentStatus } from '../types';

interface AppointmentCardProps {
  visit: DoctorVisit;
  userName?: string;
  onCheckIn?: (visitId: string) => void;
  onComplete?: (visitId: string) => void;
  onCancel?: (visitId: string) => void;
  onCallClinic?: () => void;
  onViewDetails?: (visitId: string) => void;
}

export function AppointmentCard({
  visit,
  userName,
  onCheckIn,
  onComplete,
  onCancel,
  onCallClinic,
  onViewDetails,
}: AppointmentCardProps) {
  const getStatusDisplay = (status: AppointmentStatus) => {
    switch (status) {
      case 'scheduled':
        return {
          label: 'Scheduled',
          color: 'text-[#94A3B8]',
          bgColor: 'bg-[#94A3B8]/10',
          icon: <Calendar className="w-4 h-4" />,
        };
      case 'en_route':
        return {
          label: 'En Route',
          color: 'text-[#FBBF24]',
          bgColor: 'bg-[#FBBF24]/10',
          icon: <Navigation className="w-4 h-4" />,
        };
      case 'arrived':
        return {
          label: 'Arrived',
          color: 'text-[#84CC16]',
          bgColor: 'bg-[#84CC16]/10',
          icon: <CheckCircle2 className="w-4 h-4" />,
        };
      case 'late':
        return {
          label: 'Late',
          color: 'text-[#FF4444]',
          bgColor: 'bg-[#FF4444]/10',
          icon: <AlertTriangle className="w-4 h-4" />,
        };
      case 'completed':
        return {
          label: 'Completed',
          color: 'text-[#64748B]',
          bgColor: 'bg-[#64748B]/10',
          icon: <CheckCircle2 className="w-4 h-4" />,
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          color: 'text-[#64748B]',
          bgColor: 'bg-[#64748B]/10',
          icon: null,
        };
      case 'no_show':
        return {
          label: 'No Show',
          color: 'text-[#FF4444]',
          bgColor: 'bg-[#FF4444]/10',
          icon: <AlertTriangle className="w-4 h-4" />,
        };
    }
  };

  const status = getStatusDisplay(visit.status);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isUpcoming = () => {
    return visit.appointmentDate > Date.now() && visit.status === 'scheduled';
  };

  const isToday = () => {
    const today = new Date();
    const apptDate = new Date(visit.appointmentDate);
    return (
      today.getFullYear() === apptDate.getFullYear() &&
      today.getMonth() === apptDate.getMonth() &&
      today.getDate() === apptDate.getDate()
    );
  };

  return (
    <div
      className={`bg-[#1E293B] border-2 rounded-lg overflow-hidden transition-all hover:border-[#84CC16] ${
        isToday() ? 'border-[#FBBF24]' : 'border-[#334155]'
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-[#334155]">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#84CC16]/10 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-[#84CC16]" />
            </div>
            <div>
              <p className="text-white font-bold text-lg">{visit.doctorName}</p>
              {visit.specialty && <p className="text-[#94A3B8] text-sm">{visit.specialty}</p>}
            </div>
          </div>

          {/* Status Badge */}
          <div className={`${status.bgColor} px-3 py-1 rounded-full flex items-center gap-1`}>
            {status.icon}
            <span className={`${status.color} font-bold text-xs`}>{status.label}</span>
          </div>
        </div>

        {userName && (
          <p className="text-[#64748B] text-sm">Patient: {userName}</p>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#64748B]" />
            <div>
              <p className="text-[#64748B] text-xs">Date</p>
              <p className="text-white text-sm font-bold">
                {isToday() ? 'Today' : formatDate(visit.appointmentDate)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#64748B]" />
            <div>
              <p className="text-[#64748B] text-xs">Time</p>
              <p className="text-white text-sm font-bold font-mono">{visit.appointmentTime}</p>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="mb-4">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-[#64748B] mt-1 flex-shrink-0" />
            <div>
              <p className="text-white text-sm font-bold">{visit.clinicName}</p>
              <p className="text-[#94A3B8] text-xs">{visit.clinicAddress}</p>
            </div>
          </div>
        </div>

        {/* Notes */}
        {visit.notes && (
          <div className="p-3 bg-[#0F172A] rounded-lg mb-4">
            <p className="text-[#94A3B8] text-sm">{visit.notes}</p>
          </div>
        )}

        {/* Arrival Info (if arrived) */}
        {visit.arrivedAt && (
          <div className="p-3 bg-[#84CC16]/10 border border-[#84CC16] rounded-lg mb-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-[#84CC16]" />
              <p className="text-[#84CC16] text-sm font-bold">Arrived</p>
            </div>
            <p className="text-[#94A3B8] text-xs">
              {new Date(visit.arrivedAt).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              })}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Check-In (if scheduled/en_route/late) */}
          {['scheduled', 'en_route', 'late'].includes(visit.status) && onCheckIn && (
            <button
              onClick={() => onCheckIn(visit.id)}
              className="h-[56px] bg-[#84CC16] text-[#0F172A] rounded-lg font-bold text-base hover:bg-[#9FE63C] transition-colors"
            >
              Manual Check-In
            </button>
          )}

          {/* Complete (if arrived) */}
          {visit.status === 'arrived' && onComplete && (
            <button
              onClick={() => onComplete(visit.id)}
              className="h-[56px] bg-[#84CC16] text-[#0F172A] rounded-lg font-bold text-base hover:bg-[#9FE63C] transition-colors"
            >
              Mark Completed
            </button>
          )}

          {/* Call Clinic */}
          {visit.clinicPhone && onCallClinic && (
            <a
              href={`tel:${visit.clinicPhone.replace(/\D/g, '')}`}
              onClick={onCallClinic}
              className="h-[56px] bg-[#334155] text-white rounded-lg font-bold text-base flex items-center justify-center gap-2 hover:bg-[#475569] transition-colors"
            >
              <Phone className="w-5 h-5" />
              Call Clinic
            </a>
          )}

          {/* Cancel (if scheduled/en_route) */}
          {['scheduled', 'en_route'].includes(visit.status) && onCancel && (
            <button
              onClick={() => onCancel(visit.id)}
              className="h-[56px] bg-[#FF4444]/10 border border-[#FF4444] text-[#FF4444] rounded-lg font-bold text-base hover:bg-[#FF4444] hover:text-white transition-colors"
            >
              Cancel
            </button>
          )}
        </div>

        {/* View Details Link */}
        {onViewDetails && (
          <button
            onClick={() => onViewDetails(visit.id)}
            className="w-full mt-3 h-[48px] bg-transparent border border-[#334155] text-[#94A3B8] rounded-lg font-bold text-sm hover:border-[#84CC16] hover:text-white transition-colors"
          >
            View Details
          </button>
        )}
      </div>

      {/* Today Indicator */}
      {isToday() && (
        <div className="px-4 py-2 bg-[#FBBF24]/10 border-t border-[#FBBF24]">
          <p className="text-[#FBBF24] text-xs font-bold text-center">
            📅 TODAY'S APPOINTMENT
          </p>
        </div>
      )}
    </div>
  );
}
