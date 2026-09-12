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
    <div className={cn('card-base p-12 text-center flex flex-col items-center justify-center', className)}>
      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3 border border-slate-200/60">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      <p className="mt-1 text-xs text-slate-500 max-w-sm">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function LoadingState({ message = 'Loading carbon intelligence...', className = '' }) {
  return (
    <div className={cn('p-12 text-center flex flex-col items-center justify-center gap-3', className)}>
      <Loader2 className="w-7 h-7 text-emerald-600 animate-spin" />
      <p className="text-xs font-medium text-slate-500">{message}</p>
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
    <div className={cn('card-base p-8 text-center border-rose-200 bg-rose-50/20 flex flex-col items-center justify-center', className)}>
      <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mb-3">
        <AlertCircle className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-xs text-slate-500 max-w-md">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 px-3.5 py-1.5 text-xs font-medium text-rose-700 bg-white border border-rose-300 rounded-lg hover:bg-rose-50 transition-colors shadow-sm"
        >
          Retry Request
        </button>
      )}
    </div>
  );
}
