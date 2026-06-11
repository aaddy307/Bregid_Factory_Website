'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  trend?: 'up' | 'down';
  trendValue?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'leather' | 'warning';
}

export default function StatCard({
  label,
  value,
  sublabel,
  trend,
  trendValue,
  icon,
  variant = 'default',
}: StatCardProps) {
  const variantStyles = {
    default: 'bg-factory-white',
    leather: 'bg-leather-tan/5 border-leather-tan/20',
    warning: 'bg-error/5 border-error/20',
  };

  return (
    <div className={`card p-4 lg:p-5 ${variantStyles[variant]}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="label-caps text-on-surface-variant">{label}</div>
          <div className="text-2xl lg:text-3xl font-semibold text-on-surface">
            {value}
          </div>
          {sublabel && (
            <div className="text-xs text-on-surface-variant">{sublabel}</div>
          )}
          {trend && trendValue && (
            <div className={`flex items-center gap-1 text-xs font-medium mt-1 ${
              trend === 'up' ? 'text-green-600' : 'text-error'
            }`}>
              {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {trendValue}
            </div>
          )}
        </div>
        {icon && (
          <div className="text-on-surface-variant/40">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
