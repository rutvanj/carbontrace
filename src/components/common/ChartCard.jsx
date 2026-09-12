import React from 'react';
import { cn } from '../../utils/formatters';

export function ChartCard({
  title,
  subtitle,
  action,
  children,
  footer,
  className = '',
  minHeight = 'h-72',
}) {
  return (
    <div className={cn('card-base p-5 flex flex-col', className)}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-800 tracking-tight">{title}</h2>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      <div className={cn('w-full flex-1 flex flex-col justify-center', minHeight)}>
        {children}
      </div>

      {footer && (
        <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400">
          {footer}
        </div>
      )}
    </div>
  );
}
