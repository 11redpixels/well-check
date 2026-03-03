// 🛡️ Medication Alerts View - V12.0: Route Hardening
// Mandate: No more "buttons to nowhere" - Command Center link now functional
// Reference: V12.0 Audit - Chief Architect identified missing route

import { Bell, Pill, AlertTriangle, Clock, CheckCircle, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface MedicationAlert {
  id: string;
  userId: string;
  userName: string;
  medication: string;
  scheduledTime: string;
  status: 'missed' | 'pending' | 'taken' | 'late';
  priority: 1 | 2 | 3 | 4 | 5;
  minutesLate?: number;
}

export function MedicationAlertsView() {
  const { familyMembers } = useApp();

  // V12.0: Mock medication alerts (TODO: Replace with real data from Guardian Health Score)
  const mockAlerts: MedicationAlert[] = [
    {
      id: 'alert-001',
      userId: 'user-003',
      userName: 'Grandma Helen',
      medication: 'Metformin 500mg',
      scheduledTime: '8:00 AM',
      status: 'missed',
      priority: 1,
      minutesLate: 120,
    },
    {
      id: 'alert-002',
      userId: 'user-003',
      userName: 'Grandma Helen',
      medication: 'Lisinopril 10mg',
      scheduledTime: '8:00 AM',
      status: 'late',
      priority: 2,
      minutesLate: 45,
    },
    {
      id: 'alert-003',
      userId: 'user-002',
      userName: 'Dad (Protected)',
      medication: 'Aspirin 81mg',
      scheduledTime: '12:00 PM',
      status: 'pending',
      priority: 3,
    },
    {
      id: 'alert-004',
      userId: 'user-003',
      userName: 'Grandma Helen',
      medication: 'Vitamin D 1000IU',
      scheduledTime: '6:00 PM',
      status: 'taken',
      priority: 4,
    },
  ];

  const getStatusBadge = (status: MedicationAlert['status']) => {
    switch (status) {
      case 'missed':
        return {
          bg: 'bg-[#DC2626]',
          text: 'text-white',
          label: 'MISSED',
          icon: AlertTriangle,
        };
      case 'late':
        return {
          bg: 'bg-[#F59E0B]',
          text: 'text-[#0F172A]',
          label: 'LATE',
          icon: Clock,
        };
      case 'pending':
        return {
          bg: 'bg-[#3B82F6]',
          text: 'text-white',
          label: 'PENDING',
          icon: Clock,
        };
      case 'taken':
        return {
          bg: 'bg-[#65A30D]',
          text: 'text-white',
          label: 'TAKEN',
          icon: CheckCircle,
        };
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1:
        return 'border-l-[#DC2626]'; // Critical
      case 2:
        return 'border-l-[#F59E0B]'; // High
      case 3:
        return 'border-l-[#3B82F6]'; // Medium
      case 4:
        return 'border-l-[#65A30D]'; // Low
      case 5:
        return 'border-l-[#64748B]'; // Very Low
    }
  };

  const missedCount = mockAlerts.filter((a) => a.status === 'missed').length;
  const lateCount = mockAlerts.filter((a) => a.status === 'late').length;
  const pendingCount = mockAlerts.filter((a) => a.status === 'pending').length;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="w-8 h-8 text-[#3B82F6]" />
            <h1 className="text-[var(--color-text-primary)] font-bold text-3xl">
              Medication Alerts
            </h1>
          </div>
          <p className="text-[var(--color-text-secondary)] text-base">
            Real-time medication adherence monitoring across your family
          </p>
        </div>

        {/* Alert Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Missed Doses */}
          <div className="bg-[var(--color-card-bg)] border-2 border-[#DC2626] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-8 h-8 text-[#DC2626]" />
              <span className="text-[#DC2626] font-bold text-3xl">{missedCount}</span>
            </div>
            <h3 className="text-[var(--color-text-primary)] font-bold text-lg">Missed Doses</h3>
            <p className="text-[var(--color-text-tertiary)] text-sm mt-1">
              Critical: Immediate action required
            </p>
          </div>

          {/* Late Doses */}
          <div className="bg-[var(--color-card-bg)] border-2 border-[#F59E0B] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-[#F59E0B]" />
              <span className="text-[#F59E0B] font-bold text-3xl">{lateCount}</span>
            </div>
            <h3 className="text-[var(--color-text-primary)] font-bold text-lg">Late Doses</h3>
            <p className="text-[var(--color-text-tertiary)] text-sm mt-1">
              Take as soon as possible
            </p>
          </div>

          {/* Pending Doses */}
          <div className="bg-[var(--color-card-bg)] border-2 border-[#3B82F6] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-[#3B82F6]" />
              <span className="text-[#3B82F6] font-bold text-3xl">{pendingCount}</span>
            </div>
            <h3 className="text-[var(--color-text-primary)] font-bold text-lg">Pending</h3>
            <p className="text-[var(--color-text-tertiary)] text-sm mt-1">
              Upcoming in next 2 hours
            </p>
          </div>
        </div>

        {/* Alert List */}
        <div className="bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-2xl p-6">
          <h2 className="text-[var(--color-text-primary)] font-bold text-xl mb-6">
            Active Alerts
          </h2>

          <div className="space-y-4">
            {mockAlerts.map((alert) => {
              const statusBadge = getStatusBadge(alert.status);
              const StatusIcon = statusBadge.icon;

              return (
                <div
                  key={alert.id}
                  className={`
                    bg-[var(--color-bg)] border-l-4 ${getPriorityColor(alert.priority)} 
                    rounded-lg p-4 flex items-center gap-4
                    hover:shadow-md transition-shadow
                  `}
                >
                  {/* User Avatar */}
                  <div className="w-12 h-12 bg-[#3B82F6] rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-white" />
                  </div>

                  {/* Alert Details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-[var(--color-text-primary)] font-bold text-base">
                        {alert.userName}
                      </h3>
                      <span
                        className={`
                          ${statusBadge.bg} ${statusBadge.text} 
                          px-2 py-1 rounded-full text-xs font-bold
                        `}
                      >
                        {statusBadge.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <Pill className="w-4 h-4 text-[var(--color-text-tertiary)]" />
                      <p className="text-[var(--color-text-secondary)] text-sm font-medium">
                        {alert.medication}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[var(--color-text-tertiary)]" />
                      <p className="text-[var(--color-text-tertiary)] text-sm">
                        Scheduled: {alert.scheduledTime}
                        {alert.minutesLate && ` (${alert.minutesLate} min late)`}
                      </p>
                    </div>
                  </div>

                  {/* Status Icon */}
                  <StatusIcon className="w-8 h-8" style={{ color: statusBadge.bg.replace('bg-', '') }} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Guardian Health Score Integration (Coming Soon) */}
        <div className="mt-6 p-6 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-center">
          <Bell className="w-8 h-8 text-[var(--color-text-tertiary)] mx-auto mb-2" />
          <p className="text-[var(--color-text-tertiary)] text-sm">
            <strong>Coming Soon:</strong> Real-time alerts integrated with Guardian Health Score (WHO 80% adherence threshold)
          </p>
        </div>
      </div>
    </div>
  );
}
