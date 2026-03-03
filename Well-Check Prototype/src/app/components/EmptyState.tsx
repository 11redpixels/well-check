// 🛡️ V8.7.1 EMERGENCY HOTFIX: EmptyState Component
// Purpose: Display helpful empty states instead of blank pages
// Reference: EMERGENCY HOTFIX DIRECTIVE V8.7.1 - Visibility Restoration

interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-16 px-6">
      {/* Large Icon */}
      <div 
        className="text-9xl mb-8 animate-bounce-slow"
        role="img" 
        aria-label={icon}
      >
        {icon}
      </div>

      {/* Title */}
      <h2 className="text-3xl font-bold text-white mb-4 text-center">
        {title}
      </h2>

      {/* Message */}
      <p className="text-lg text-[#94A3B8] text-center mb-8 max-w-md leading-relaxed">
        {message}
      </p>

      {/* Action Buttons */}
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-col gap-4 w-full max-w-sm">
          {/* Primary Action Button (72px height per V8.7.1 spec) */}
          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className="h-[72px] w-full bg-[#84CC16] text-[#0F172A] rounded-lg font-bold text-lg hover:bg-[#A3E635] active:scale-95 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
            >
              <span className="text-2xl">+</span>
              <span>{actionLabel}</span>
            </button>
          )}

          {/* Secondary Action Button (Optional) */}
          {secondaryActionLabel && onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              className="h-[64px] w-full bg-[#334155] text-white rounded-lg font-bold text-base hover:bg-[#475569] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>{secondaryActionLabel}</span>
            </button>
          )}
        </div>
      )}

      {/* Helper Text (Optional) */}
      {actionLabel && (
        <p className="text-sm text-[#64748B] mt-6 text-center">
          Get started by adding your first item
        </p>
      )}
    </div>
  );
}

// Custom bounce animation (slower, more gentle)
// Add to global CSS if not already present:
/*
@keyframes bounce-slow {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-bounce-slow {
  animation: bounce-slow 3s ease-in-out infinite;
}
*/
