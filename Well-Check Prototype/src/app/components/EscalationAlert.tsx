// 🛡️ EscalationAlert - 3-Stage Medication Alert System
// Mandate: Grandparent Law (48px+ touch targets, 7:1 contrast)
// Reference: prd.md #34-42, ai-domain-expert.md #20

import { useState } from 'react';
import { Bell, Phone, AlertTriangle, Clock } from 'lucide-react';
import { UniversalPINModal } from './UniversalPINModal';
import type { EscalationStage, Medication, MedicationLog, UserRole } from '../types';

interface EscalationAlertProps {
  medicationLog: MedicationLog;
  medication: Medication;
  userRole: UserRole;
  userName: string;
  userLocation?: { lat: number; lng: number };
  userBattery?: number;
  onConfirmTaken: () => void;
  onSnooze?: () => void;
  onMarkMissed?: () => void;
  onCallUser?: () => void;
  onViewLocation?: () => void;
}

export function EscalationAlert({
  medicationLog,
  medication,
  userRole,
  userName,
  userLocation,
  userBattery,
  onConfirmTaken,
  onSnooze,
  onMarkMissed,
  onCallUser,
  onViewLocation,
}: EscalationAlertProps) {
  const stage = medicationLog.escalationStage;
  const elapsed = Date.now() - medicationLog.scheduledTime;
  const minutesOverdue = Math.floor(elapsed / (60 * 1000));

  // Stage-specific styling and content
  const getStageConfig = () => {
    switch (stage) {
      case 1:
        return {
          bgColor: 'bg-[#FBBF24]',
          borderColor: 'border-[#FBBF24]',
          textColor: 'text-[#0F172A]',
          icon: <Bell className="w-8 h-8" />,
          title: 'Time to Take Medication',
          subtitle: `${minutesOverdue} minutes overdue`,
          urgency: 'Stage 1: Local Nudge',
        };
      case 2:
        return {
          bgColor: 'bg-[#F97316]',
          borderColor: 'border-[#F97316]',
          textColor: 'text-white',
          icon: <Clock className="w-8 h-8" />,
          title: 'OVERDUE: Medication Alert',
          subtitle: `${minutesOverdue} minutes overdue`,
          urgency: 'Stage 2: Family Nudge',
        };
      case 3:
        return {
          bgColor: 'bg-[#FF4444]',
          borderColor: 'border-[#FF4444]',
          textColor: 'text-white',
          icon: <AlertTriangle className="w-8 h-8" />,
          title: 'CRITICAL MEDICATION ALERT',
          subtitle: `${minutesOverdue} minutes overdue`,
          urgency: 'Stage 3: Critical Alert',
        };
      default:
        return {
          bgColor: 'bg-[#334155]',
          borderColor: 'border-[#334155]',
          textColor: 'text-white',
          icon: <Bell className="w-8 h-8" />,
          title: 'Medication Due',
          subtitle: 'Scheduled time',
          urgency: 'Pending',
        };
    }
  };

  const config = getStageConfig();
  const isMonitor = userRole === 'monitor' || userRole === 'family_head';
  const isStage3 = stage === 3;

  // Stage 3 gets full-screen takeover for monitors
  if (isStage3 && isMonitor) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 emergency-strobe">
        <div className="w-full max-w-3xl">
          {/* Critical Alert Header */}
          <div className={`${config.bgColor} p-6 rounded-t-lg`}>
            <div className="flex items-center gap-4 mb-2">
              {config.icon}
              <div className="flex-1">
                <p className="text-white/80 text-sm font-mono uppercase tracking-wide">
                  {config.urgency}
                </p>
                <h2 className="text-white font-bold text-3xl">{config.title}</h2>
              </div>
            </div>
          </div>

          {/* Alert Content */}
          <div className="bg-[#1E293B] p-6 rounded-b-lg border-4 border-[#FF4444]">
            {/* User Info */}
            <div className="mb-6">
              <p className="text-[#94A3B8] text-sm mb-1">Protected User</p>
              <p className="text-white font-bold text-2xl mb-4">{userName}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-[#0F172A] rounded-lg">
                  <p className="text-[#94A3B8] text-xs mb-1">Battery Level</p>
                  <p className="text-white font-bold text-xl">{userBattery ?? 'Unknown'}%</p>
                </div>
                <div className="p-3 bg-[#0F172A] rounded-lg">
                  <p className="text-[#94A3B8] text-xs mb-1">Overdue</p>
                  <p className="text-[#FF4444] font-bold text-xl">{minutesOverdue} min</p>
                </div>
              </div>
            </div>

            {/* Medication Details */}
            <div className="mb-6 p-4 bg-[#0F172A] rounded-lg border border-[#334155]">
              <p className="text-[#94A3B8] text-sm mb-1">Medication</p>
              <p className="text-white font-bold text-xl mb-2">{medication.name}</p>
              <p className="text-[#94A3B8] text-base">
                Dosage: <span className="text-white">{medication.dosage}</span>
              </p>
            </div>

            {/* Action Buttons - 60px height (Grandparent Law) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {onCallUser && (
                <button
                  onClick={onCallUser}
                  className="h-[60px] bg-[#84CC16] text-[#0F172A] rounded-lg font-bold text-xl flex items-center justify-center gap-3 hover:bg-[#9FE63C] transition-colors"
                >
                  <Phone className="w-6 h-6" />
                  Call {userName.split(' ')[0]} Now
                </button>
              )}

              {onViewLocation && userLocation && (
                <button
                  onClick={onViewLocation}
                  className="h-[60px] bg-[#334155] text-white rounded-lg font-bold text-xl hover:bg-[#475569] transition-colors"
                >
                  View Last Location
                </button>
              )}

              <button
                onClick={onConfirmTaken}
                className="h-[60px] bg-[#0F172A] text-white border-2 border-[#84CC16] rounded-lg font-bold text-xl hover:bg-[#84CC16] hover:text-[#0F172A] transition-colors"
              >
                Confirmed Taken
              </button>

              {onMarkMissed && (
                <button
                  onClick={onMarkMissed}
                  className="h-[60px] bg-[#0F172A] text-white border-2 border-[#FF4444] rounded-lg font-bold text-xl hover:bg-[#FF4444] transition-colors"
                >
                  Mark as Missed
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Standard alert card for Stage 1, 2 or user view
  return (
    <div className={`rounded-lg border-4 ${config.borderColor} overflow-hidden mb-4`}>
      {/* Header */}
      <div className={`${config.bgColor} ${config.textColor} p-4`}>
        <div className="flex items-center gap-3">
          {config.icon}
          <div className="flex-1">
            <p className="text-xs font-mono uppercase tracking-wide opacity-80">
              {config.urgency}
            </p>
            <h3 className="font-bold text-xl">{config.title}</h3>
            <p className="text-sm opacity-90">{config.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-[#1E293B] p-4">
        {/* Medication Info */}
        <div className="mb-4">
          <p className="text-[#94A3B8] text-sm mb-1">Medication</p>
          <p className="text-white font-bold text-lg">{medication.name}</p>
          <p className="text-[#94A3B8] text-sm">Dosage: {medication.dosage}</p>
        </div>

        {/* Action Buttons - 56px height (Standard Mode) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            onClick={onConfirmTaken}
            className="h-[56px] bg-[#84CC16] text-[#0F172A] rounded-lg font-bold text-lg hover:bg-[#9FE63C] transition-colors"
          >
            I've Taken It
          </button>

          {onSnooze && stage < 3 && (
            <button
              onClick={onSnooze}
              className="h-[56px] bg-[#334155] text-white rounded-lg font-bold text-lg hover:bg-[#475569] transition-colors"
            >
              Snooze 15 min
            </button>
          )}

          {isMonitor && onCallUser && (
            <button
              onClick={onCallUser}
              className="h-[56px] bg-[#0F172A] text-white border-2 border-[#84CC16] rounded-lg font-bold text-lg hover:bg-[#84CC16] hover:text-[#0F172A] transition-colors flex items-center justify-center gap-2"
            >
              <Phone className="w-5 h-5" />
              Call User
            </button>
          )}

          {isMonitor && onMarkMissed && (
            <button
              onClick={onMarkMissed}
              className="h-[56px] bg-[#0F172A] text-white border-2 border-[#FF4444] rounded-lg font-bold text-lg hover:bg-[#FF4444] transition-colors"
            >
              Mark Missed
            </button>
          )}
        </div>

        {/* Monitor-only info */}
        {isMonitor && (
          <div className="mt-3 pt-3 border-t border-[#334155] grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-[#64748B]">User:</p>
              <p className="text-white font-mono">{userName}</p>
            </div>
            {userBattery !== undefined && (
              <div>
                <p className="text-[#64748B]">Battery:</p>
                <p className="text-white font-mono">{userBattery}%</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}