import { ComponentProps, forwardRef } from 'react';
import { cn } from '../utils/cn';

interface BadgeProps extends ComponentProps<'span'> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-emerald-400",
      warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      error: "bg-red-500/10 text-red-400 border-red-500/20",
      info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      default: "bg-white/10 text-slate-300 border-white/10",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';
