import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertTriangle, Sparkles, ShieldCheck } from 'lucide-react';
import { cn } from '../../utils/formatters';

export function StatusBadge({ status, type = 'status', className = '' }) {
  if (!status) return null;

  const normalized = String(status).toLowerCase().trim();

  // Verification status
  if (normalized === 'verified') {
    return (
      <span className={cn('badge bg-[#E2EBE5] text-[#0F3D2E] border border-[#1F5D46]/40', className)}>
        <CheckCircle2 className="w-3.5 h-3.5 text-[#0F3D2E] shrink-0" />
        <span>Verified</span>
      </span>
    );
  }

  if (normalized === 'pending' || normalized === 'pending verification') {
    return (
      <span className={cn('badge bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]', className)}>
        <Clock className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
        <span>Pending Review</span>
      </span>
    );
  }

  if (normalized === 'rejected') {
    return (
      <span className={cn('badge bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA]', className)}>
        <XCircle className="w-3.5 h-3.5 text-[#DC2626] shrink-0" />
        <span>Rejected</span>
      </span>
    );
  }

  // Impact level
  if (normalized === 'high' || normalized === 'high impact') {
    return (
      <span className={cn('badge bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA]', className)}>
        <AlertTriangle className="w-3.5 h-3.5 text-[#DC2626] shrink-0" />
        <span>High Impact</span>
      </span>
    );
  }

  if (normalized === 'medium' || normalized === 'medium impact') {
    return (
      <span className={cn('badge bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]', className)}>
        <AlertTriangle className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
        <span>Medium Impact</span>
      </span>
    );
  }

  if (normalized === 'low' || normalized === 'low impact') {
    return (
      <span className={cn('badge bg-[#EDF3F0] text-[#1F5D46] border border-[#C5D7CC]', className)}>
        <ShieldCheck className="w-3.5 h-3.5 text-[#1F5D46] shrink-0" />
        <span>Low Impact</span>
      </span>
    );
  }

  // AI tag
  if (type === 'ai' || normalized.includes('ai') || normalized.includes('estimated')) {
    return (
      <span className={cn('badge bg-[#E8DEC9] text-[#17352B] border border-[#D8CBB4]', className)}>
        <Sparkles className="w-3 h-3 text-[#0F3D2E] shrink-0" />
        <span>{status}</span>
      </span>
    );
  }

  // Tier tag
  if (normalized.startsWith('tier')) {
    return (
      <span className={cn('badge bg-[#E8DEC9] text-[#17352B] border border-[#D8CBB4] font-semibold', className)}>
        {status}
      </span>
    );
  }

  // Generic fallback
  return (
    <span className={cn('badge bg-[#E8DEC9] text-[#17352B] border border-[#D8CBB4]', className)}>
      {status}
    </span>
  );
}
