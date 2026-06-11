'use client';

import { AlertTriangle } from 'lucide-react';

interface StockCardProps {
  title: string;
  quantity: number | string;
  unit: string;
  type?: string;
  isLow?: boolean;
  threshold?: number;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
}

export default function StockCard({
  title,
  quantity,
  unit,
  type,
  isLow,
  threshold,
  icon,
  children,
  onClick,
  active,
}: StockCardProps) {
  return (
    <div
      onClick={onClick}
      className={`card p-2.5 sm:p-4 lg:p-5 transition-all duration-200 ${
        onClick ? 'cursor-pointer select-none hover:border-leather-tan/50 hover:shadow-md' : ''
      } ${
        active
          ? 'border-leather-tan ring-2 ring-leather-tan/30 bg-leather-tan/5 shadow-sm scale-[1.02]'
          : isLow
          ? 'border-error/40 bg-error/5 hover:bg-error/[0.08]'
          : 'border-outline-variant/30 hover:bg-surface-container-low'
      }`}
    >
      <div className="flex items-start justify-between mb-1.5 sm:mb-3">
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
          {icon && <div className="text-leather-tan shrink-0 hidden sm:block">{icon}</div>}
          <div className="min-w-0">
            <h3 className="font-semibold text-xs sm:text-sm md:text-base text-on-surface truncate">{title}</h3>
            {type && (
              <p className="text-[10px] sm:text-xs text-on-surface-variant truncate">Type: {type}</p>
            )}
          </div>
        </div>
        {isLow && (
          <div className="flex items-center gap-0.5 text-error text-[10px] sm:text-xs font-medium shrink-0" title="Low Stock">
            <AlertTriangle size={12} className="sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">LOW</span>
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-1 sm:gap-1.5">
        <span className="text-base sm:text-xl md:text-2xl font-semibold text-on-surface">{quantity}</span>
        <span className="text-[10px] sm:text-xs md:text-sm text-on-surface-variant">{unit}</span>
      </div>

      {threshold !== undefined && (
        <p className="text-[10px] sm:text-xs text-on-surface-variant mt-0.5 sm:mt-1 truncate">
          <span className="inline sm:hidden">Min: {threshold} {unit}</span>
          <span className="hidden sm:inline">Threshold: {threshold} {unit}</span>
        </p>
      )}

      {children && <div className="mt-2 pt-2 sm:mt-3 sm:pt-3 border-t border-outline-variant/30">{children}</div>}
    </div>
  );
}
