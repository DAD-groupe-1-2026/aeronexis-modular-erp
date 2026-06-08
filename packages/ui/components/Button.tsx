import { ComponentProps, forwardRef } from 'react';
import { cn } from '../utils/cn';

interface ButtonProps extends ComponentProps<'button'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 border border-transparent",
      secondary: "bg-white/10 hover:bg-white/15 text-white border border-white/10 backdrop-blur-md",
      outline: "bg-transparent hover:bg-white/5 text-slate-200 border border-white/20",
      ghost: "bg-transparent hover:bg-white/5 text-slate-300 border border-transparent",
      danger: "bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30",
    };

    const sizes = {
      sm: "py-1.5 px-3 text-xs rounded-lg",
      md: "py-2.5 px-4 text-sm rounded-xl",
      lg: "py-3.5 px-6 text-base rounded-xl",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
