// 🛡️ StateAwarenessIndicators - Ping Cooling-Off & Pulse Freshness Decay
// Coder: Visual feedback for temporal state (5m cooldown, 15m freshness)
// Reference: prd.md #17 (Ping Cooling-Off), #18 (Pulse Freshness Decay)

import { useState, useEffect } from 'react';
import { Clock, Zap, AlertCircle } from 'lucide-react';

interface PingCooldownIndicatorProps {
  lastPingSentAt: number;
  cooldownMinutes?: number;
  onCooldownComplete?: () => void;
}

export function PingCooldownIndicator({
  lastPingSentAt,
  cooldownMinutes = 5,
  onCooldownComplete,
}: PingCooldownIndicatorProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - lastPingSentAt;
      const cooldownMs = cooldownMinutes * 60 * 1000;
      const remaining = Math.max(0, Math.ceil((cooldownMs - elapsed) / 1000));

      setRemainingSeconds(remaining);

      if (remaining === 0 && onCooldownComplete) {
        onCooldownComplete();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastPingSentAt, cooldownMinutes, onCooldownComplete]);

  if (remainingSeconds === 0) return null;

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const percentage = (remainingSeconds / (cooldownMinutes * 60)) * 100;

  return (
    <div className="bg-[#FBBF24]/10 border-2 border-[#FBBF24] rounded-lg p-4">
      <div className="flex items-center gap-3 mb-3">
        <Clock className="w-5 h-5 text-[#FBBF24]" />
        <div className="flex-1">
          <p className="text-white font-bold text-base">Ping Cooling-Off Period</p>
          <p className="text-[#94A3B8] text-sm">
            Wait {minutes}:{seconds.toString().padStart(2, '0')} before next ping
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-[#0F172A] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#FBBF24] transition-all duration-1000"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="text-[#64748B] text-xs mt-2">
        ⚖️ Cooling-off prevents spam and respects user boundaries (prd.md #17)
      </p>
    </div>
  );
}

interface PulseFreshnessIndicatorProps {
  pulseTimestamp: number;
  freshnessMinutes?: number;
  userName: string;
}

export function PulseFreshnessIndicator({
  pulseTimestamp,
  freshnessMinutes = 15,
  userName,
}: PulseFreshnessIndicatorProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isStale, setIsStale] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - pulseTimestamp;
      const seconds = Math.floor(elapsed / 1000);
      const freshnessMs = freshnessMinutes * 60 * 1000;

      setElapsedSeconds(seconds);
      setIsStale(elapsed >= freshnessMs);
    }, 1000);

    return () => clearInterval(interval);
  }, [pulseTimestamp, freshnessMinutes]);

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const percentage = Math.min(100, (elapsedSeconds / (freshnessMinutes * 60)) * 100);

  // Freshness categories
  const getFreshnessStatus = () => {
    if (percentage < 50) {
      return {
        label: 'Fresh',
        color: 'text-[#84CC16]',
        bgColor: 'bg-[#84CC16]/10',
        borderColor: 'border-[#84CC16]',
        icon: <Zap className="w-5 h-5 text-[#84CC16]" />,
      };
    } else if (percentage < 100) {
      return {
        label: 'Aging',
        color: 'text-[#FBBF24]',
        bgColor: 'bg-[#FBBF24]/10',
        borderColor: 'border-[#FBBF24]',
        icon: <Clock className="w-5 h-5 text-[#FBBF24]" />,
      };
    } else {
      return {
        label: 'Stale',
        color: 'text-[#FF4444]',
        bgColor: 'bg-[#FF4444]/10',
        borderColor: 'border-[#FF4444]',
        icon: <AlertCircle className="w-5 h-5 text-[#FF4444]" />,
      };
    }
  };

  const status = getFreshnessStatus();

  return (
    <div className={`${status.bgColor} border-2 ${status.borderColor} rounded-lg p-4`}>
      <div className="flex items-center gap-3 mb-3">
        {status.icon}
        <div className="flex-1">
          <p className="text-white font-bold text-base">
            {userName}'s Last Pulse: <span className={status.color}>{status.label}</span>
          </p>
          <p className="text-[#94A3B8] text-sm">
            {minutes}:{seconds.toString().padStart(2, '0')} ago
            {isStale && ' (Consider sending a check-in ping)'}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-[#0F172A] rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ${
            percentage < 50
              ? 'bg-[#84CC16]'
              : percentage < 100
              ? 'bg-[#FBBF24]'
              : 'bg-[#FF4444]'
          }`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>

      {isStale && (
        <p className="text-[#FF4444] text-xs mt-2 font-mono">
          ⚠️ Pulse is stale (>{freshnessMinutes}m). Consider checking on {userName}.
        </p>
      )}
    </div>
  );
}

interface StateBadgeProps {
  lastPingSentAt?: number;
  lastPulseAt?: number;
  userName?: string;
}

export function StateBadge({ lastPingSentAt, lastPulseAt, userName }: StateBadgeProps) {
  const [showCooldown, setShowCooldown] = useState(false);
  const [showStale, setShowStale] = useState(false);

  useEffect(() => {
    if (lastPingSentAt) {
      const elapsed = Date.now() - lastPingSentAt;
      setShowCooldown(elapsed < 5 * 60 * 1000);
    } else {
      setShowCooldown(false);
    }
  }, [lastPingSentAt]);

  useEffect(() => {
    if (lastPulseAt) {
      const elapsed = Date.now() - lastPulseAt;
      setShowStale(elapsed >= 15 * 60 * 1000);
    } else {
      setShowStale(false);
    }
  }, [lastPulseAt]);

  if (!showCooldown && !showStale) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {showCooldown && (
        <div className="inline-flex items-center gap-2 px-3 py-2 bg-[#FBBF24]/20 border border-[#FBBF24] rounded-full">
          <Clock className="w-4 h-4 text-[#FBBF24]" />
          <span className="text-[#FBBF24] text-xs font-mono font-bold">Ping Cooldown Active</span>
        </div>
      )}

      {showStale && userName && (
        <div className="inline-flex items-center gap-2 px-3 py-2 bg-[#FF4444]/20 border border-[#FF4444] rounded-full">
          <AlertCircle className="w-4 h-4 text-[#FF4444]" />
          <span className="text-[#FF4444] text-xs font-mono font-bold">
            {userName}'s Pulse Stale (15m+)
          </span>
        </div>
      )}
    </div>
  );
}
