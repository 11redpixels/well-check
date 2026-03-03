// 🛡️ RefillAlert - Low Supply Notification
// Coder: Refill reminder system for Monitors and Family Heads
// Reference: prd.md #33 (Inventory Tracking)

import { Phone, MapPin, AlertCircle } from 'lucide-react';
import type { Medication } from '../types';

interface RefillAlertProps {
  medication: Medication;
  daysRemaining: number;
  pillsRemaining: number;
  onCallPharmacy?: () => void;
  onDismiss?: () => void;
}

export function RefillAlert({
  medication,
  daysRemaining,
  pillsRemaining,
  onCallPharmacy,
  onDismiss,
}: RefillAlertProps) {
  const getUrgencyColor = () => {
    if (daysRemaining <= 2) return 'border-[#FF4444] bg-[#FF4444]/10';
    if (daysRemaining <= 5) return 'border-[#F97316] bg-[#F97316]/10';
    return 'border-[#FBBF24] bg-[#FBBF24]/10';
  };

  const getUrgencyIcon = () => {
    if (daysRemaining <= 2) {
      return <AlertCircle className="w-6 h-6 text-[#FF4444]" />;
    }
    return <AlertCircle className="w-6 h-6 text-[#FBBF24]" />;
  };

  return (
    <div className={`rounded-lg border-2 ${getUrgencyColor()} overflow-hidden`}>
      {/* Header */}
      <div className="p-4 border-b border-[#334155]">
        <div className="flex items-center gap-3">
          {getUrgencyIcon()}
          <div className="flex-1">
            <p className="text-white font-bold text-lg">Low Supply Alert</p>
            <p className="text-[#94A3B8] text-sm">
              {daysRemaining === 0
                ? 'Out of pills'
                : `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining`}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Medication Info */}
        <div className="mb-4">
          <p className="text-[#94A3B8] text-sm mb-1">Medication</p>
          <p className="text-white font-bold text-xl">{medication.name}</p>
          <p className="text-[#94A3B8] text-base">Dosage: {medication.dosage}</p>
          <p className="text-[#94A3B8] text-base">Frequency: {medication.frequency}</p>
        </div>

        {/* Inventory Status */}
        <div className="p-3 bg-[#0F172A] rounded-lg mb-4">
          <div className="flex justify-between items-center">
            <span className="text-[#94A3B8] text-sm">Pills Remaining:</span>
            <span
              className={`font-bold text-2xl font-mono ${
                pillsRemaining === 0
                  ? 'text-[#FF4444]'
                  : pillsRemaining <= 10
                  ? 'text-[#F97316]'
                  : 'text-[#FBBF24]'
              }`}
            >
              {pillsRemaining}
            </span>
          </div>
        </div>

        {/* Pharmacy Info */}
        {medication.pharmacyName && (
          <div className="mb-4 p-3 bg-[#0F172A] rounded-lg border border-[#334155]">
            <p className="text-white font-bold text-base mb-2">{medication.pharmacyName}</p>
            
            {medication.pharmacyPhone && (
              <div className="flex items-center gap-2 mb-1">
                <Phone className="w-4 h-4 text-[#64748B]" />
                <p className="text-[#94A3B8] text-sm font-mono">{medication.pharmacyPhone}</p>
              </div>
            )}
            
            {medication.pharmacyAddress && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#64748B]" />
                <p className="text-[#94A3B8] text-sm">{medication.pharmacyAddress}</p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {onCallPharmacy && medication.pharmacyPhone && (
            <a
              href={`tel:${medication.pharmacyPhone.replace(/\D/g, '')}`}
              onClick={onCallPharmacy}
              className="h-[56px] bg-[#84CC16] text-[#0F172A] rounded-lg font-bold text-base flex items-center justify-center gap-2 hover:bg-[#9FE63C] transition-colors"
            >
              <Phone className="w-5 h-5" />
              Call Pharmacy
            </a>
          )}

          {onDismiss && (
            <button
              onClick={onDismiss}
              className="h-[56px] bg-[#334155] text-white rounded-lg font-bold text-base hover:bg-[#475569] transition-colors"
            >
              Dismiss for Now
            </button>
          )}
        </div>

        {/* Legal Notice */}
        <p className="text-[#64748B] text-xs mt-3 text-center">
          Refill alerts are based on current inventory tracking. Always verify with your healthcare
          provider before requesting refills.
        </p>
      </div>
    </div>
  );
}
