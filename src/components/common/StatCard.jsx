import React from 'react';
import { cn } from '../../utils/formatters';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function StatCard({
  title,
  value,
  subtext,
  change,
  changeType = 'neutral', // 'positive' (for carbon reduction = green), 'negative' (increase = red), 'neutral'
  icon: Icon,
  badge,
  className = '',
}) {
  return (
    <div className={cn('card-base p-5 flex flex-col justify-between hover:border-slate-300 transition-colors', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{title}</p>
          <div className="text-2xl font-bold tracking-tight text-slate-900">{value}</div>
        </div>
        {Icon && (
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-700 shrink-0">
            <Icon className="w-5 h-5 text-emerald-700" />
          </div>
        )}
      </div>

      {(subtext || change || badge) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 font-medium">
            {change && (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px]',
                  changeType === 'positive' && 'bg-emerald-50 text-emerald-700',
                  changeType === 'negative' && 'bg-rose-50 text-rose-700',
                  changeType === 'neutral' && 'bg-slate-100 text-slate-600'
                )}
              >
                {changeType === 'positive' && <TrendingDown className="w-3 h-3 text-emerald-600" />}
                {changeType === 'negative' && <TrendingUp className="w-3 h-3 text-rose-600" />}
                {changeType === 'neutral' && <Minus className="w-3 h-3" />}
                {change}
              </span>
            )}
            <span>{subtext}</span>
          </div>
          {badge && <div>{badge}</div>}
        </div>
      )}
    </div>
  );
}
