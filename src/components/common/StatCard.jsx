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
    <div className={cn('card-base p-6 flex flex-col justify-between hover:border-[#C8B89E] hover:shadow-natural transition-all duration-200', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-[#687266]">{title}</p>
          <div className="text-3xl font-extrabold tracking-tight text-[#17352B]">{value}</div>
        </div>
        {Icon && (
          <div className="p-3 rounded-xl bg-[#E8DEC9]/70 border border-[#D8CBB4] text-[#0F3D2E] shrink-0 shadow-subtle">
            <Icon className="w-5.5 h-5.5 text-[#0F3D2E]" />
          </div>
        )}
      </div>

      {(subtext || change || badge) && (
        <div className="mt-4 pt-3 border-t border-[#D8CBB4]/60 flex items-center justify-between text-sm text-[#687266]">
          <div className="flex items-center gap-1.5 font-medium">
            {change && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold text-xs',
                  changeType === 'positive' && 'bg-[#E2EBE5] text-[#0F3D2E]',
                  changeType === 'negative' && 'bg-[#FEE2E2] text-[#991B1B]',
                  changeType === 'neutral' && 'bg-[#E8DEC9] text-[#17352B]'
                )}
              >
                {changeType === 'positive' && <TrendingDown className="w-3.5 h-3.5 text-[#0F3D2E]" />}
                {changeType === 'negative' && <TrendingUp className="w-3.5 h-3.5 text-[#991B1B]" />}
                {changeType === 'neutral' && <Minus className="w-3.5 h-3.5 text-[#687266]" />}
                {change}
              </span>
            )}
            <span className="truncate">{subtext}</span>
          </div>
          {badge && <div>{badge}</div>}
        </div>
      )}
    </div>
  );
}
