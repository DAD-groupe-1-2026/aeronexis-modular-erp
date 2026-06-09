import React from 'react';
import { cn } from '../utils/cn';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label?: string;
  };
  className?: string;
}

export function MetricCard({ title, value, icon, trend, className }: MetricCardProps) {
  const isPositive = trend && trend.value >= 0;

  return (
    <div className={cn("rounded-2xl border border-white/10 bg-[#0a0a0c]/80 backdrop-blur-2xl shadow-xl p-5 flex flex-col", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-400">{title}</h3>
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-300">
            {icon}
          </div>
        )}
      </div>
      <div className="mt-auto">
        <div className="text-3xl font-bold text-white mb-1">{value}</div>
        {trend && (
          <div className={cn(
            "text-sm font-medium flex items-center gap-1.5",
            isPositive ? "text-emerald-400" : "text-red-400"
          )}>
            <span>{isPositive ? '+' : ''}{trend.value}%</span>
            {trend.label && <span className="text-slate-500 font-normal">{trend.label}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
