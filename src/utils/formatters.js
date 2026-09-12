import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatEmissions(kgValue, options = {}) {
  const { compact = false, unit = 'auto' } = options;
  if (kgValue === undefined || kgValue === null || isNaN(kgValue)) return '0 kg CO₂e';

  const num = Number(kgValue);

  if (unit === 't' || (unit === 'auto' && Math.abs(num) >= 1000)) {
    const tons = num / 1000;
    return `${tons.toLocaleString('en-US', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 2,
    })} t CO₂e`;
  }

  return `${num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  })} kg CO₂e`;
}

export function formatNumber(value) {
  if (value === undefined || value === null || isNaN(value)) return '0';
  return Number(value).toLocaleString('en-US');
}

export function formatPercent(value, decimals = 1) {
  if (value === undefined || value === null || isNaN(value)) return '0%';
  return `${Number(value).toFixed(decimals)}%`;
}

export function formatDate(dateString) {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}
