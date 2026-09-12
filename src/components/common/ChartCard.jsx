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
    <div className={cn('card-base p-6 flex flex-col', className)}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-bold text-[#17352B] tracking-tight">{title}</h2>
          {subtitle && (
            <p className="text-sm text-[#687266] mt-0.5">{subtitle}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      <div className={cn('w-full flex-1 flex flex-col justify-center', minHeight)}>
        {children}
      </div>

      {footer && (
        <div className="mt-4 pt-3 border-t border-[#D8CBB4]/60 text-sm text-[#687266]">
          {footer}
        </div>
      )}
    </div>
  );
}
