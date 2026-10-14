import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  currentCount?: number;
  className?: string;
}

function getPages(current: number, totalPages: number): (number | string)[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (current <= 3) {
    return [1, 2, 3, '...', totalPages];
  }
  if (current >= totalPages - 2) {
    return [1, '...', totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, '...', current, '...', totalPages];
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  total,
  limit,
  onPageChange,
  currentCount,
  className = '',
}) => {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const count = currentCount ?? Math.max(0, Math.min(limit, total - (currentPage - 1) * limit));
  const pages = getPages(currentPage, totalPages);

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-3 select-none ${className}`}>
      <span className="text-sm text-neutral-600">
        <span className="font-semibold text-neutral-900">{count}</span> of{' '}
        <span className="font-semibold text-neutral-900">{total}</span> entries
      </span>

      <div className="flex items-center gap-1.5 text-neutral-700">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-100 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1">
          {pages.map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`dots-${idx}`} className="px-1 text-neutral-400 select-none">
                  ...
                </span>
              );
            }

            const isCurrent = p === currentPage;
            return (
              <React.Fragment key={p}>
                <button
                  type="button"
                  onClick={() => onPageChange(Number(p))}
                  className={`min-w-8 h-8 px-2 flex items-center justify-center text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-black text-white shadow-xs'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  {p}
                </button>
                {typeof p === 'number' && typeof pages[idx + 1] === 'number' && (
                  <span className="text-neutral-300">,</span>
                )}
              </React.Fragment>
            );
          })}
        </div>

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-100 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
