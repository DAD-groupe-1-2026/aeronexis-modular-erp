import { ComponentProps, forwardRef } from 'react';
import { cn } from '../utils/cn';

export const Card = forwardRef<HTMLDivElement, ComponentProps<'div'>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "bg-[#0a0a0c]/80 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-2xl overflow-hidden",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';
