// 🗄️ PILLAR 2: Notification Center (90-Day Vault with Monitor Lock)
// Mandate: No event left behind. Critical events stay "Glow-Red" until Monitor acknowledges.

import { useState } from 'react';
import type { NotificationEvent, UserRole } from '../types';

interface NotificationCenterProps {
  events: NotificationEvent[];
  currentUserId: string;
  currentUserRole: UserRole;
  onAcknowledge: (eventId: string) => void;
  onClose: () => void;
}

export function NotificationCenter({
  events,
  currentUserId,
  currentUserRole,
  onAcknowledge,
  onClose,
}: NotificationCenterProps) {
  const [filter, setFilter] = useState<'all' | 'critical' | 'unread'>('all');

  // Sort events by timestamp (newest first)
  const sortedEvents = [...events].sort((a, b) => b.timestamp - a.timestamp);

  // Filter events
  const filteredEvents = sortedEvents.filter((event) => {
    if (filter === 'critical') {
      return event.severity === 'critical';
    }
    if (filter === 'unread') {
      if (currentUserRole === 'monitor') {
        // Show events requiring acknowledgement that this monitor hasn't acknowledged
        return (
          event.requiresAcknowledgement &&
          !event.acknowledgedBy.some((ack) => ack.monitorId === currentUserId)
        );
      }
      return false;
    }
    return true;
  });

  // Check if current user is a monitor who can acknowledge
  const isMonitor = currentUserRole === 'monitor' || currentUserRole === 'family_head';

  const getEventIcon = (type: NotificationEvent['eventType']) => {
    const icons: Record<typeof type, string> = {
      panic: '🚨',
      medication_missed: '💊',
      medication_confirmed: '✓',
      geofence_late: '⏰',
      geofence_arrived: '📍',
      doctor_visit: '🏥',
      ping_sent: '📤',
      ping_received: '📥',
      status_update: 'ℹ️',
      asset_moved: '🔑',
    };
    return icons[type] || 'ℹ️';
  };

  const getSeverityColor = (severity: NotificationEvent['severity']) => {
    const colors = {
      critical: 'border-[#FF4444] bg-[#FF4444]/10',
      high: 'border-[#FBBF24] bg-[#FBBF24]/10',
      medium: 'border-[#84CC16] bg-[#84CC16]/10',
      low: 'border-[#64748B] bg-[#64748B]/10',
    };
    return colors[severity];
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = Date.now();
    const diff = now - timestamp;

    // Less than 1 hour: "X minutes ago"
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes}m ago`;
    }

    // Less than 24 hours: "X hours ago"
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}h ago`;
    }

    // Less than 7 days: "X days ago"
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `${days}d ago`;
    }

    // Older: Show date
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  };

  const getDaysUntilExpiration = (expiresAt: number) => {
    const diff = expiresAt - Date.now();
    return Math.floor(diff / 86400000);
  };

  return (
    <div className="fixed inset-0 bg-[#0F172A] z-50 flex flex-col">
      {/* Header */}
      <div className="bg-[#1E293B] border-b border-[#334155] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <span>🗄️</span>
              <span>90-Day Vault</span>
            </h1>
            <p className="text-sm text-[#94A3B8] mt-1">
              All family events for the past 90 days
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

        {/* Filter Tabs */}
        <div className="flex gap-2 mt-4">
          {[
            { key: 'all', label: 'All Events' },
            { key: 'critical', label: 'Critical' },
            { key: 'unread', label: 'Unread' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                filter === tab.key
                  ? 'bg-[#84CC16] text-[#0F172A]'
                  : 'bg-[#334155] text-[#94A3B8] hover:bg-[#475569]'
              }`}
            >
              {tab.label}
              {tab.key === 'unread' && isMonitor && (
                <span className="ml-2 px-2 py-0.5 bg-[#FF4444] text-white rounded-full text-xs">
                  {
                    filteredEvents.filter(
                      (e) =>
                        e.requiresAcknowledgement &&
                        !e.acknowledgedBy.some((ack) => ack.monitorId === currentUserId)
                    ).length
                  }
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Event List */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📭</div>
            <div className="text-xl text-[#94A3B8]">No events to display</div>
            <div className="text-sm text-[#64748B] mt-2">
              {filter === 'unread'
                ? 'All critical events have been acknowledged'
                : 'Events will appear here as they occur'}
            </div>
          </div>
        ) : (
          filteredEvents.map((event) => {
            const requiresMyAck =
              isMonitor &&
              event.requiresAcknowledgement &&
              !event.acknowledgedBy.some((ack) => ack.monitorId === currentUserId);

            const daysRemaining = getDaysUntilExpiration(event.expiresAt);

            return (
              <div
                key={event.id}
                className={`bg-[#1E293B] rounded-lg p-4 border-2 transition-all ${
                  requiresMyAck
                    ? 'border-[#FF4444] shadow-[0_0_20px_rgba(255,68,68,0.3)] animate-glow'
                    : getSeverityColor(event.severity)
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="text-3xl flex-shrink-0">
                    {getEventIcon(event.eventType)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Title */}
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-lg font-bold text-white">
                        {event.title}
                      </h3>
                      <span className="text-xs text-[#64748B] whitespace-nowrap">
                        {formatTimestamp(event.timestamp)}
                      </span>
                    </div>

                    {/* Body */}
                    <p className="text-sm text-[#94A3B8] mb-3">{event.body}</p>

                    {/* Metadata */}
                    {event.metadata && Object.keys(event.metadata).length > 0 && (
                      <div className="bg-[#0F172A] rounded px-3 py-2 text-xs text-[#64748B] mb-3">
                        {JSON.stringify(event.metadata, null, 2)}
                      </div>
                    )}

                    {/* Monitor Lock Badge */}
                    {event.requiresAcknowledgement && (
                      <div className="flex items-center gap-2 mb-3">
                        <div className="px-2 py-1 bg-[#FF4444]/20 border border-[#FF4444] rounded text-xs font-bold text-[#FF4444]">
                          🔒 MONITOR LOCK
                        </div>
                        {event.isFullyAcknowledged ? (
                          <div className="text-xs text-[#84CC16]">
                            ✓ Acknowledged by all monitors
                          </div>
                        ) : (
                          <div className="text-xs text-[#FBBF24]">
                            {event.acknowledgedBy.length}/{event.targetUserIds.length}{' '}
                            acknowledged
                          </div>
                        )}
                      </div>
                    )}

                    {/* Acknowledge Button (for Monitors) */}
                    {requiresMyAck && (
                      <button
                        onClick={() => onAcknowledge(event.id)}
                        className="w-full h-[56px] bg-[#FF4444] text-white text-base font-bold rounded-lg hover:bg-[#FF5555] active:scale-98 transition-all flex items-center justify-center gap-2"
                      >
                        <span>✓</span>
                        <span>Acknowledge Event</span>
                      </button>
                    )}

                    {/* Acknowledged Badge (if already acknowledged) */}
                    {isMonitor &&
                      event.requiresAcknowledgement &&
                      event.acknowledgedBy.some((ack) => ack.monitorId === currentUserId) && (
                        <div className="w-full h-[56px] bg-[#84CC16]/20 border border-[#84CC16] rounded-lg flex items-center justify-center gap-2 text-[#84CC16] text-base font-bold">
                          <span>✓</span>
                          <span>You Acknowledged This</span>
                        </div>
                      )}

                    {/* Expiration Warning */}
                    {daysRemaining <= 7 && (
                      <div className="mt-2 text-xs text-[#FBBF24]">
                        ⚠️ Expires in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Stats */}
      <div className="bg-[#1E293B] border-t border-[#334155] px-6 py-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-white">{events.length}</div>
            <div className="text-xs text-[#64748B]">Total Events</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#FF4444]">
              {events.filter((e) => e.severity === 'critical').length}
            </div>
            <div className="text-xs text-[#64748B]">Critical</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#FBBF24]">
              {isMonitor
                ? events.filter(
                    (e) =>
                      e.requiresAcknowledgement &&
                      !e.acknowledgedBy.some((ack) => ack.monitorId === currentUserId)
                  ).length
                : 0}
            </div>
            <div className="text-xs text-[#64748B]">Unread</div>
          </div>
        </div>
      </div>

      {/* Glow Animation for Unacknowledged Events */}
      <style jsx>{`
        @keyframes glow {
          0%,
          100% {
            box-shadow: 0 0 20px rgba(255, 68, 68, 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(255, 68, 68, 0.6);
          }
        }

        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
