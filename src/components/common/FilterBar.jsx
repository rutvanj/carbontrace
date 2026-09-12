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
    <div className={cn('card-base p-3.5 mb-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border border-[#D8CBB4]', className)}>
      <div className="flex flex-wrap items-center gap-2.5 flex-1">
        {/* Search Input */}
        {onSearchChange && (
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C998B]" />
            <input
              type="text"
              value={search || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-white border border-[#D8CBB4] rounded-lg text-[#17352B] placeholder-[#8C998B] focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20 focus:border-[#0F3D2E] transition-all"
            />
          </div>
        )}

        {/* Dropdowns */}
        {filters.map((filter, idx) => (
          <div key={filter.key || idx} className="flex items-center gap-1.5">
            {filter.label && (
              <span className="text-xs font-semibold text-[#687266] hidden sm:inline">{filter.label}:</span>
            )}
            <select
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white hover:bg-[#F3EBDD] border border-[#D8CBB4] rounded-lg text-[#17352B] font-medium focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20 focus:border-[#0F3D2E] cursor-pointer transition-colors"
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
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#17352B] hover:text-[#0F3D2E] bg-[#E8DEC9] hover:bg-[#D8CBB4] rounded-lg transition-colors"
            title="Reset filters"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Counts */}
      {totalCount !== undefined && (
        <div className="text-xs text-[#687266] shrink-0 self-end md:self-center font-medium">
          Showing <span className="font-bold text-[#17352B]">{filteredCount ?? totalCount}</span> of {totalCount} records
        </div>
      )}
    </div>
  );
}
