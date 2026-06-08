import React from 'react';
import { cn } from '../lib/utils';

export function Card({ className, children }: { className?: string, children: React.ReactNode }) {
  return (
    <div className={cn('bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden', className)}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: { className?: string, children: React.ReactNode }) {
  return (
    <div className={cn('px-6 py-4 border-b border-slate-100 bg-slate-50/50', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children }: { className?: string, children: React.ReactNode }) {
  return (
    <h3 className={cn('text-lg font-semibold text-slate-900', className)}>
      {children}
    </h3>
  );
}

export function CardContent({ className, children }: { className?: string, children: React.ReactNode }) {
  return (
    <div className={cn('px-6 py-4', className)}>
      {children}
    </div>
  );
}
