import React from 'react';
import { Inbox, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '../../utils/formatters';

export function EmptyState({
  title = 'No records found',
  description = 'Try adjusting your filters or search query to find what you are looking for.',
  action,
  icon: Icon = Inbox,
  className = '',
}) {
  return (
    <div className={cn('card-base p-12 text-center flex flex-col items-center justify-center border border-[#D8CBB4]', className)}>
      <div className="w-12 h-12 rounded-xl bg-[#E8DEC9] flex items-center justify-center text-[#0F3D2E] mb-3 border border-[#D8CBB4]">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-[#17352B]">{title}</h3>
      <p className="mt-1 text-xs text-[#687266] max-w-sm">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function LoadingState({ message = 'Calculating Scope 3 enterprise emissions...', className = '' }) {
  return (
    <div className={cn('p-12 text-center flex flex-col items-center justify-center gap-3', className)}>
      <Loader2 className="w-8 h-8 text-[#0F3D2E] animate-spin" />
      <p className="text-xs font-semibold text-[#17352B]">{message}</p>
    </div>
  );
}

export function ErrorState({
  title = 'Failed to load data',
  message = 'An unexpected error occurred while communicating with the carbon calculation service.',
  onRetry,
  className = '',
}) {
  return (
    <div className={cn('card-base p-8 text-center border-[#FECACA] bg-[#FEF2F2]/60 flex flex-col items-center justify-center', className)}>
      <div className="w-10 h-10 rounded-full bg-[#FEE2E2] flex items-center justify-center text-[#991B1B] mb-3">
        <AlertCircle className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-bold text-[#17352B]">{title}</h3>
      <p className="mt-1 text-xs text-[#687266] max-w-md">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 px-3.5 py-1.5 text-xs font-semibold text-[#991B1B] bg-white border border-[#FECACA] rounded-lg hover:bg-[#FEE2E2] transition-colors shadow-subtle"
        >
          Retry Request
        </button>
      )}
    </div>
  );
}
