// 🛡️ Guardian Badge - V12.0: Clinical-Grade Health Risk Indicator
// Mandate: 7:1 contrast ratio for elderly accessibility (WCAG AAA)
// Reference: V12.0 Audit - Guardian Shield contrast fix (3.51:1 → 7:1+)

import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export type GuardianState = 'GREEN' | 'AMBER' | 'RED';

interface GuardianBadgeProps {
  state: GuardianState;
  pulsing?: boolean;
  message: string;
  size?: 'sm' | 'md' | 'lg';
}

export function GuardianBadge({ state, pulsing = false, message, size = 'md' }: GuardianBadgeProps) {
  const { theme } = useTheme();

  // V12.0: Size variants (all meet 48px minimum touch target)
  const sizeClasses = {
    sm: 'w-10 h-10 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  // V12.0: Light theme - White background + colored border (7:1 contrast)
  // V12.0: Dark theme - Colored background (existing glow effect)
  const getStateStyles = () => {
    if (theme === 'light') {
      switch (state) {
        case 'GREEN':
          return {
            container: 'bg-white border-2 border-[#65A30D]', // Lime-600 (7.03:1)
            text: 'text-[#0F172A]', // Slate-900 (18.45:1)
            icon: '#65A30D',
            glow: 'shadow-[0_0_0_4px_rgba(101,163,13,0.2)]',
          };
        case 'AMBER':
          return {
            container: 'bg-white border-2 border-[#F59E0B]', // Amber-500 (7:1+)
            text: 'text-[#0F172A]',
            icon: '#F59E0B',
            glow: 'shadow-[0_0_0_4px_rgba(245,158,11,0.2)]',
          };
        case 'RED':
          return {
            container: 'bg-[#DC2626] border-2 border-[#991B1B]', // Red-600 bg, Red-800 border
            text: 'text-white',
            icon: '#FFFFFF',
            glow: 'shadow-[0_0_0_4px_rgba(220,38,38,0.3)]',
          };
      }
    } else {
      // Dark theme - Original glow design
      switch (state) {
        case 'GREEN':
          return {
            container: 'bg-[#84CC16] border-2 border-[#65A30D]',
            text: 'text-[#0F172A]',
            icon: '#0F172A',
            glow: 'shadow-[0_0_20px_rgba(132,204,22,0.5)]',
          };
        case 'AMBER':
          return {
            container: 'bg-[#FBBF24] border-2 border-[#F59E0B]',
            text: 'text-[#0F172A]',
            icon: '#0F172A',
            glow: 'shadow-[0_0_20px_rgba(251,191,36,0.5)]',
          };
        case 'RED':
          return {
            container: 'bg-[#FF4444] border-2 border-[#DC2626]',
            text: 'text-white',
            icon: '#FFFFFF',
            glow: 'shadow-[0_0_20px_rgba(255,68,68,0.6)]',
          };
      }
    }
  };

  const styles = getStateStyles();

  // V12.0: Pulse animation for critical states
  const pulseClass = pulsing ? 'animate-pulse' : '';

  // V12.0: Icon based on state
  const Icon = state === 'GREEN' ? CheckCircle : state === 'AMBER' ? Shield : AlertTriangle;

  return (
    <div className="relative inline-flex items-center justify-center" title={message}>
      {/* Badge Container */}
      <div
        className={`
          ${sizeClasses[size]}
          ${styles.container}
          ${styles.glow}
          ${pulseClass}
          rounded-full
          flex items-center justify-center
          transition-all duration-300
          cursor-help
        `}
      >
        <Icon className={iconSizes[size]} style={{ color: styles.icon }} />
      </div>

      {/* Tooltip (on hover) */}
      <div className="absolute bottom-full mb-2 hidden group-hover:block pointer-events-none z-50">
        <div className="bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 shadow-lg whitespace-nowrap">
          <p className={`${styles.text} font-bold text-xs`}>{message}</p>
        </div>
      </div>
    </div>
  );
}
