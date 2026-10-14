import type { ReactNode } from 'react';
import Skeleton from './Skeleton';

export interface TableColumn<T> {
  header: ReactNode;
  accessor?: keyof T | string;
  render?: (row: T, index: number) => ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor?: (row: T, index: number) => string | number;
  isLoading?: boolean;
  loadingRows?: number;
  emptyMessage?: ReactNode;
  onRowClick?: (row: T) => void;
  className?: string;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  loadingRows = 5,
  emptyMessage = 'No data available',
  onRowClick,
  className = '',
}: TableProps<T>) {
  const getAlignClass = (align?: 'left' | 'center' | 'right') => {
    if (align === 'right') return 'text-right';
    if (align === 'center') return 'text-center';
    return 'text-left';
  };

  return (
    <div className={`w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs ${className}`}>
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50/80">
              {columns.map((col, idx) => (
                <th
                  key={String(col.accessor ?? idx)}
                  className={`px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-neutral-500 select-none ${getAlignClass(
                    col.align
                  )} ${col.className ?? ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-neutral-100">
            {isLoading ? (
              Array.from({ length: loadingRows }).map((_, rIdx) => (
                <tr key={`skeleton-row-${rIdx}`}>
                  {columns.map((col, cIdx) => (
                    <td key={`skeleton-cell-${cIdx}`} className={`px-5 py-4 ${getAlignClass(col.align)}`}>
                      <Skeleton height={16} borderRadius={6} className="w-3/4 max-w-[140px] inline-block" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-12 text-center text-sm text-neutral-400 select-none">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => {
                const rowKey = keyExtractor
                  ? keyExtractor(row, rowIdx)
                  : ((row as Record<string, unknown>).id as string | number) ?? rowIdx;

                return (
                  <tr
                    key={rowKey}
                    onClick={() => onRowClick?.(row)}
                    className={`transition-colors duration-150 ${
                      onRowClick
                        ? 'cursor-pointer hover:bg-neutral-50/80 active:bg-neutral-100'
                        : 'hover:bg-neutral-50/50'
                    }`}
                  >
                    {columns.map((col, colIdx) => {
                      const cellValue = col.accessor
                        ? (row as Record<string, unknown>)[col.accessor as string]
                        : undefined;
                      const content = col.render ? col.render(row, rowIdx) : (cellValue as ReactNode) ?? null;

                      return (
                        <td
                          key={String(col.accessor ?? colIdx)}
                          className={`px-5 py-3.5 text-neutral-700 whitespace-nowrap ${getAlignClass(col.align)} ${
                            col.className ?? ''
                          }`}
                        >
                          {content}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Table;
