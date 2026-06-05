import React from 'react';
import { cn } from '../lib/utils';

export function Badge({ className, variant = 'default', children }: { 
  className?: string, 
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info', 
  children: React.ReactNode 
}) {
  const variants = {
    default: 'bg-slate-100 text-slate-800',
    success: 'bg-emerald-100 text-emerald-800',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };

  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  );
}
