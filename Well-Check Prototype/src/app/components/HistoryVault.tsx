// 🗄️ PILLAR 2: History Vault (Threaded Conversation View)
// Product Designer Mandate: Threaded view with photos/voice attached to events

import { useState } from 'react';
import type { NotificationEvent, UserRole, EphemeralAsset } from '../types';

interface HistoryVaultProps {
  events: NotificationEvent[];
  ephemeralAssets: EphemeralAsset[];
  currentUserId: string;
  currentUserRole: UserRole;
  onAcknowledge: (eventId: string) => void;
  onClose: () => void;
}

interface ThreadedEvent extends NotificationEvent {
  attachedAssets: EphemeralAsset[];
  replies?: ThreadedEvent[];
}

export function HistoryVault({
  events,
  ephemeralAssets,
  currentUserId,
  currentUserRole,
  onAcknowledge,
  onClose,
}: HistoryVaultProps) {
  const [filter, setFilter] = useState<'all' | 'critical' | 'unread' | 'with_media'>('all');
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set());

  // Build threaded structure
  const threadedEvents: ThreadedEvent[] = events.map((event) => {
    // Find attached ephemeral assets
    const attachedAssets = ephemeralAssets.filter(
      (asset) => asset.relatedEventId === event.id
    );

    return {
      ...event,
      attachedAssets,
      replies: [], // Future: Support reply threads
    };
  });

  // Sort by timestamp (newest first)
  const sortedEvents = [...threadedEvents].sort((a, b) => b.timestamp - a.timestamp);

  // Filter events
  const filteredEvents = sortedEvents.filter((event) => {
    if (filter === 'critical') {
      return event.severity === 'critical';
    }
    if (filter === 'unread') {
      const isMonitor = currentUserRole === 'monitor' || currentUserRole === 'family_head';
      return (
        isMonitor &&
        event.requiresAcknowledgement &&
        !event.acknowledgedBy.some((ack) => ack.monitorId === currentUserId)
      );
    }
    if (filter === 'with_media') {
      return event.attachedAssets.length > 0;
    }
    return true;
  });

  const isMonitor = currentUserRole === 'monitor' || currentUserRole === 'family_head';

  const toggleThread = (eventId: string) => {
    setExpandedThreads((prev) => {
      const next = new Set(prev);
      if (next.has(eventId)) {
        next.delete(eventId);
      } else {
        next.add(eventId);
      }
      return next;
    });
  };

  const getEventIcon = (type: NotificationEvent['eventType']) => {
    const icons: Record<typeof type, string> = {
      panic: '🚨',
      medication_missed: '💊',
      medication_confirmed: '✅',
      geofence_late: '⏰',
      geofence_arrived: '📍',
      doctor_visit: '🏥',
      ping_sent: '📤',
      ping_received: '📥',
      status_update: 'ℹ️',
      asset_moved: '����',
    };
    return icons[type] || 'ℹ️';
  };

  const getSeverityBadge = (severity: NotificationEvent['severity']) => {
    const badges = {
      critical: { bg: 'bg-[#FF4444]', text: 'CRITICAL', icon: '🔴' },
      high: { bg: 'bg-[#FBBF24]', text: 'HIGH', icon: '🟡' },
      medium: { bg: 'bg-[#84CC16]', text: 'MEDIUM', icon: '🟢' },
      low: { bg: 'bg-[#64748B]', text: 'LOW', icon: '⚪' },
    };
    return badges[severity];
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}m ago`;
    }
    if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}h ago`;
    }
    if (diff < 604800000) {
      return `${Math.floor(diff / 86400000)}d ago`;
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  };

  const getTimeUntilExpiry = (expiresAt: number) => {
    const diff = expiresAt - Date.now();
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) {
      return `${hours}h left`;
    }
    return `${Math.floor(hours / 24)}d left`;
  };

  return (
    <div className="fixed inset-0 bg-[#0F172A] z-50 flex flex-col">
      {/* Header */}
      <div className="bg-[#1E293B] border-b border-[#334155] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <span>🗄️</span>
              <span>History Vault</span>
            </h1>
            <p className="text-sm text-[#94A3B8] mt-1">Threaded conversations & moments</p>
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
        <div className="flex gap-2 mt-4 overflow-x-auto">
          {[
            { key: 'all', label: 'All', icon: '📋' },
            { key: 'critical', label: 'Critical', icon: '🔴' },
            { key: 'unread', label: 'Unread', icon: '🔔' },
            { key: 'with_media', label: 'Media', icon: '📸' },
          ].map((tab) => {
            const count =
              tab.key === 'all'
                ? filteredEvents.length
                : tab.key === 'with_media'
                ? sortedEvents.filter((e) => e.attachedAssets.length > 0).length
                : tab.key === 'unread'
                ? sortedEvents.filter(
                    (e) =>
                      isMonitor &&
                      e.requiresAcknowledgement &&
                      !e.acknowledgedBy.some((ack) => ack.monitorId === currentUserId)
                  ).length
                : sortedEvents.filter((e) => e.severity === 'critical').length;

            return (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  filter === tab.key
                    ? 'bg-[#84CC16] text-[#0F172A]'
                    : 'bg-[#334155] text-[#94A3B8] hover:bg-[#475569]'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {count > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-[#FF4444] text-white rounded-full text-xs">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Threaded Event List */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📭</div>
            <div className="text-xl text-[#94A3B8]">No events found</div>
            <div className="text-sm text-[#64748B] mt-2">
              {filter === 'with_media'
                ? 'No events with photos or voice notes'
                : filter === 'unread'
                ? 'All critical events acknowledged'
                : 'Events will appear here as they occur'}
            </div>
          </div>
        ) : (
          filteredEvents.map((event) => {
            const isExpanded = expandedThreads.has(event.id);
            const requiresMyAck =
              isMonitor &&
              event.requiresAcknowledgement &&
              !event.acknowledgedBy.some((ack) => ack.monitorId === currentUserId);
            const badge = getSeverityBadge(event.severity);

            return (
              <div
                key={event.id}
                className={`bg-[#1E293B] rounded-lg overflow-hidden border-2 transition-all ${
                  requiresMyAck
                    ? 'border-[#FF4444] shadow-[0_0_20px_rgba(255,68,68,0.3)] animate-glow'
                    : 'border-[#334155] hover:border-[#475569]'
                }`}
              >
                {/* Thread Header */}
                <div
                  onClick={() => toggleThread(event.id)}
                  className="p-4 cursor-pointer hover:bg-[#334155]/20 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="text-3xl flex-shrink-0">{getEventIcon(event.eventType)}</div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-lg font-bold text-white">{event.title}</h3>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 ${badge.bg} text-[#0F172A] text-xs font-bold rounded`}
                          >
                            {badge.icon} {badge.text}
                          </span>
                          <span className="text-xs text-[#64748B] whitespace-nowrap">
                            {formatTimestamp(event.timestamp)}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-[#94A3B8] mb-2">{event.body}</p>

                      {/* Thread Indicators */}
                      <div className="flex items-center gap-3 text-xs text-[#64748B]">
                        {event.attachedAssets.length > 0 && (
                          <div className="flex items-center gap-1">
                            <span>📎</span>
                            <span>{event.attachedAssets.length} attachment(s)</span>
                          </div>
                        )}
                        {event.requiresAcknowledgement && (
                          <div className="flex items-center gap-1">
                            <span>🔒</span>
                            <span>
                              {event.acknowledgedBy.length}/{event.targetUserIds.length} ack
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <span>{isExpanded ? '▼' : '▶'}</span>
                          <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Thread Content */}
                {isExpanded && (
                  <div className="border-t border-[#334155] bg-[#0F172A] p-4 space-y-4">
                    {/* Metadata */}
                    {event.metadata && Object.keys(event.metadata).length > 0 && (
                      <div className="bg-[#1E293B] rounded p-3 border border-[#334155]">
                        <div className="text-xs font-bold text-[#94A3B8] mb-2">
                          EVENT DETAILS
                        </div>
                        <pre className="text-xs text-[#64748B] overflow-x-auto">
                          {JSON.stringify(event.metadata, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* Attached Ephemeral Assets */}
                    {event.attachedAssets.length > 0 && (
                      <div>
                        <div className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                          <span>📎</span>
                          <span>Attachments ({event.attachedAssets.length})</span>
                        </div>
                        <div className="space-y-3">
                          {event.attachedAssets.map((asset) => (
                            <div
                              key={asset.id}
                              className="bg-[#1E293B] rounded-lg p-3 border border-[#334155]"
                            >
                              <div className="flex items-center gap-3">
                                {/* Asset Type Icon */}
                                <div className="text-3xl">
                                  {asset.assetType === 'photo' ? '📷' : '🎤'}
                                </div>

                                {/* Asset Info */}
                                <div className="flex-1">
                                  <div className="text-sm font-bold text-white">
                                    {asset.assetType === 'photo'
                                      ? 'Photo'
                                      : 'Voice Note'}
                                  </div>
                                  <div className="text-xs text-[#64748B]">
                                    {(asset.assetSize / 1024 / 1024).toFixed(2)} MB
                                  </div>
                                  {/* Ephemeral TTL Warning */}
                                  <div className="text-xs text-[#FBBF24] mt-1">
                                    ⏳ {getTimeUntilExpiry(asset.expiresAt)}
                                  </div>
                                </div>

                                {/* View Button */}
                                <button
                                  onClick={() => window.open(asset.assetUrl, '_blank')}
                                  className="px-4 py-3 bg-[#84CC16] text-[#0F172A] text-sm font-bold rounded hover:bg-[#9DE622] active:scale-95 transition-all"
                                >
                                  {asset.assetType === 'photo' ? '👁️ View' : '▶️ Play'}
                                </button>
                              </div>

                              {/* Photo Preview */}
                              {asset.assetType === 'photo' && (
                                <img
                                  src={asset.assetUrl}
                                  alt="Ephemeral photo"
                                  className="w-full mt-3 rounded border border-[#334155]"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Monitor Lock Actions */}
                    {requiresMyAck && (
                      <button
                        onClick={() => onAcknowledge(event.id)}
                        className="w-full h-[56px] bg-[#FF4444] text-white text-base font-bold rounded-lg hover:bg-[#FF5555] active:scale-98 transition-all flex items-center justify-center gap-2"
                      >
                        <span>✓</span>
                        <span>Acknowledge Event</span>
                      </button>
                    )}

                    {isMonitor &&
                      event.requiresAcknowledgement &&
                      event.acknowledgedBy.some((ack) => ack.monitorId === currentUserId) && (
                        <div className="w-full h-[56px] bg-[#84CC16]/20 border border-[#84CC16] rounded-lg flex items-center justify-center gap-2 text-[#84CC16] text-base font-bold">
                          <span>✓</span>
                          <span>You Acknowledged This</span>
                        </div>
                      )}

                    {/* Expiration Warning */}
                    {Date.now() > event.expiresAt - 7 * 86400000 && (
                      <div className="bg-[#FBBF24]/20 border border-[#FBBF24] rounded-lg p-3 text-sm text-[#FBBF24]">
                        ⚠️ This event will be automatically deleted in{' '}
                        {Math.floor((event.expiresAt - Date.now()) / 86400000)} days (90-day
                        retention)
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Stats */}
      <div className="bg-[#1E293B] border-t border-[#334155] px-6 py-4">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-white">{events.length}</div>
            <div className="text-xs text-[#64748B]">Total</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#FF4444]">
              {events.filter((e) => e.severity === 'critical').length}
            </div>
            <div className="text-xs text-[#64748B]">Critical</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#84CC16]">
              {events.filter((e) => e.attachedAssets?.length > 0).length}
            </div>
            <div className="text-xs text-[#64748B]">With Media</div>
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

      {/* Glow Animation */}
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