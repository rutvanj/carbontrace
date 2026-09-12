import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertTriangle, Sparkles, ShieldCheck } from 'lucide-react';
import { cn } from '../../utils/formatters';

export function StatusBadge({ status, type = 'status', className = '' }) {
  if (!status) return null;

  const normalized = String(status).toLowerCase().trim();

  // Verification status
  if (normalized === 'verified') {
    return (
      <span className={cn('badge bg-emerald-50 text-emerald-700 border border-emerald-200/80', className)}>
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>Verified</span>
      </span>
    );
  }

  if (normalized === 'pending' || normalized === 'pending verification') {
    return (
      <span className={cn('badge bg-amber-50 text-amber-700 border border-amber-200/80', className)}>
        <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span>Pending Review</span>
      </span>
    );
  }

  if (normalized === 'rejected') {
    return (
      <span className={cn('badge bg-rose-50 text-rose-700 border border-rose-200/80', className)}>
        <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
        <span>Rejected</span>
      </span>
    );
  }

  // Impact level
  if (normalized === 'high' || normalized === 'high impact') {
    return (
      <span className={cn('badge bg-rose-50 text-rose-700 border border-rose-200/70', className)}>
        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
        <span>High Impact</span>
      </span>
    );
  }

  if (normalized === 'medium' || normalized === 'medium impact') {
    return (
      <span className={cn('badge bg-amber-50 text-amber-700 border border-amber-200/70', className)}>
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span>Medium Impact</span>
      </span>
    );
  }

  if (normalized === 'low' || normalized === 'low impact') {
    return (
      <span className={cn('badge bg-slate-100 text-slate-700 border border-slate-200', className)}>
        <ShieldCheck className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        <span>Low Impact</span>
      </span>
    );
  }

  // AI tag
  if (type === 'ai' || normalized.includes('ai') || normalized.includes('estimated')) {
    return (
      <span className={cn('badge bg-indigo-50 text-indigo-700 border border-indigo-200/80', className)}>
        <Sparkles className="w-3 h-3 text-indigo-600 shrink-0" />
        <span>{status}</span>
      </span>
    );
  }

  // Tier tag
  if (normalized.startsWith('tier')) {
    return (
      <span className={cn('badge bg-slate-100 text-slate-800 border border-slate-300 font-medium', className)}>
        {status}
      </span>
    );
  }

  // Generic fallback
  return (
    <span className={cn('badge bg-slate-100 text-slate-700 border border-slate-200', className)}>
      {status}
    </span>
  );
}
