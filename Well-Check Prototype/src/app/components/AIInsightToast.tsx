// 🛡️ AIInsightToast - V9.4: AI Pattern Detection Alerts
// Mandate: Non-intrusive pattern detection alerts (missed med, abnormal shift, etc.)
// Reference: V9.4 Directive - "AI Integration" for Elderly Interface

import { useState, useEffect } from 'react';
import { X, AlertTriangle, Calendar, TrendingUp, MapPin, Battery } from 'lucide-react';

export interface AIInsight {
  id: string;
  type: 'medication-missed' | 'doctor-visit-due' | 'abnormal-pattern' | 'geofence-breach' | 'battery-low';
  priority: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  actions?: { label: string; action: () => void }[];
  icon?: any;
  timestamp: number;
}

interface AIInsightToastProps {
  insight: AIInsight | null;
  onDismiss: () => void;
}

export function AIInsightToast({ insight, onDismiss }: AIInsightToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (insight) {
      // Fade in
      setIsVisible(true);

      // Auto-dismiss based on priority
      const dismissDelay = insight.priority === 'critical' ? 15000 : insight.priority === 'warning' ? 8000 : 5000;
      const timer = setTimeout(() => {
        handleDismiss();
      }, dismissDelay);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [insight]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss();
    }, 200); // Wait for fade-out animation
  };

  if (!insight) return null;

  // Map icon based on type
  const getIcon = () => {
    if (insight.icon) return insight.icon;

    switch (insight.type) {
      case 'medication-missed':
        return AlertTriangle;
      case 'doctor-visit-due':
        return Calendar;
      case 'abnormal-pattern':
        return TrendingUp;
      case 'geofence-breach':
        return MapPin;
      case 'battery-low':
        return Battery;
      default:
        return AlertTriangle;
    }
  };

  const Icon = getIcon();

  // Color based on priority
  const getBorderColor = () => {
    switch (insight.priority) {
      case 'critical':
        return '#FF4444'; // Emergency Red
      case 'warning':
        return '#F59E0B'; // Amber
      case 'info':
        return '#3B82F6'; // Blue
      default:
        return '#94A3B8'; // Gray
    }
  };

  const getIconColor = () => {
    switch (insight.priority) {
      case 'critical':
        return 'text-[#FF4444]';
      case 'warning':
        return 'text-[#F59E0B]';
      case 'info':
        return 'text-[#3B82F6]';
      default:
        return 'text-[#94A3B8]';
    }
  };

  return (
    <div
      className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4 transition-all duration-200 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
      style={{
        animation: insight.priority === 'critical' ? 'pulse 2s infinite' : 'none',
      }}
    >
      <div
        className="bg-[#1E293B] rounded-lg shadow-2xl border-2 p-4"
        style={{
          borderColor: getBorderColor(),
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 bg-[#0F172A] rounded-lg flex items-center justify-center flex-shrink-0">
              <Icon className={`w-6 h-6 ${getIconColor()}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-[#94A3B8] uppercase">🤖 AI Insight</span>
              </div>
              <h3 className="text-white font-bold text-base">{insight.title}</h3>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="w-8 h-8 rounded-lg bg-[#0F172A] border border-[#334155] hover:border-[#84CC16] flex items-center justify-center transition-all duration-200 flex-shrink-0"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4 text-[#94A3B8] hover:text-[#84CC16]" />
          </button>
        </div>

        {/* Message */}
        <p className="text-[#94A3B8] text-sm mb-4">{insight.message}</p>

        {/* Actions */}
        {insight.actions && insight.actions.length > 0 && (
          <div className="flex gap-2">
            {insight.actions.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  action.action();
                  handleDismiss();
                }}
                className="px-4 py-2 bg-[#84CC16] hover:bg-[#65A30D] text-[#0F172A] font-bold text-sm rounded-lg transition-all duration-200"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: translateX(-50%) scale(1);
          }
          50% {
            transform: translateX(-50%) scale(1.02);
          }
        }
      `}</style>
    </div>
  );
}

// Example usage:
/*
const exampleInsight: AIInsight = {
  id: 'insight-001',
  type: 'medication-missed',
  priority: 'critical',
  title: 'Pattern Detected: Medication Missed',
  message: 'John missed 2 doses of Aspirin (81mg) today.',
  actions: [
    { label: 'View Details', action: () => navigate('/medication') },
    { label: 'Remind Now', action: () => sendPushNotification('john', 'Take Aspirin') }
  ],
  timestamp: Date.now(),
};
*/
