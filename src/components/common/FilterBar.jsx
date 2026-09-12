import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { cn } from '../../utils/formatters';

export function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filters = [],
  onReset,
  totalCount,
  filteredCount,
  className = '',
}) {
  const hasActiveFilters = Boolean(
    search || filters.some((f) => f.value && f.value !== 'All' && f.value !== '')
  );

  return (
    <div className={cn('card-base p-3.5 mb-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3', className)}>
      <div className="flex flex-wrap items-center gap-2.5 flex-1">
        {/* Search Input */}
        {onSearchChange && (
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
            />
          </div>
        )}

        {/* Dropdowns */}
        {filters.map((filter, idx) => (
          <div key={filter.key || idx} className="flex items-center gap-1.5">
            {filter.label && (
              <span className="text-xs font-medium text-slate-500 hidden sm:inline">{filter.label}:</span>
            )}
            <select
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 cursor-pointer transition-colors"
            >
              {filter.options.map((opt) => (
                <option key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.value}>
                  {typeof opt === 'string' ? opt : opt.label}
                </option>
              ))}
            </select>
          </div>
        ))}

        {/* Reset */}
        {hasActiveFilters && onReset && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors"
            title="Reset filters"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Counts */}
      {totalCount !== undefined && (
        <div className="text-xs text-slate-500 shrink-0 self-end md:self-center font-medium">
          Showing <span className="font-semibold text-slate-800">{filteredCount ?? totalCount}</span> of {totalCount} records
        </div>
      )}
    </div>
  );
}
