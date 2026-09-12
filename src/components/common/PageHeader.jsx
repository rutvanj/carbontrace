import React from 'react';
import { cn } from '../../utils/formatters';

export function PageHeader({
  title,
  description,
  badge,
  actions,
  breadcrumbs,
  className = '',
}) {
  return (
    <div className={cn('mb-6 space-y-2', className)}>
      {breadcrumbs && (
        <div className="text-xs text-slate-500 mb-1 flex items-center gap-1.5 font-medium">
          {breadcrumbs}
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
            {badge && <div>{badge}</div>}
          </div>
          {description && (
            <p className="mt-1 text-sm text-slate-500 max-w-3xl leading-relaxed">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
