import type { ReactNode } from 'react';
import Skeleton from './Skeleton';

export type TableVariant = 'excel-green' | 'excel-classic' | 'excel-dark';

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
  headerClassName?: string;
  variant?: TableVariant;
  showCellBorders?: boolean;
}

const variantStyles: Record<
  TableVariant,
  {
    containerBorder: string;
    headerBg: string;
    headerText: string;
    headerBorderB: string;
    headerDivider: string;
    rowEvenBg: string;
    rowOddBg: string;
    rowHoverBg: string;
    rowActiveBg: string;
    cellBorderB: string;
    cellDivider: string;
  }
> = {
  'excel-green': {
    containerBorder: 'border-[#cde5d7]',
    headerBg: 'bg-[#107c41]',
    headerText: 'text-white',
    headerBorderB: 'border-b-2 border-[#0c6233]',
    headerDivider: 'border-r border-[#158e4b] last:border-r-0',
    rowEvenBg: 'bg-white',
    rowOddBg: 'bg-[#f2f8f4]',
    rowHoverBg: 'hover:bg-[#e1f3e8]',
    rowActiveBg: 'active:bg-[#d0edd8]',
    cellBorderB: 'border-b border-[#e1ece5]',
    cellDivider: 'border-r border-[#e8efe9] last:border-r-0',
  },
  'excel-classic': {
    containerBorder: 'border-neutral-300',
    headerBg: 'bg-[#eaedf1]',
    headerText: 'text-neutral-800',
    headerBorderB: 'border-b-2 border-[#cbd5e1]',
    headerDivider: 'border-r border-[#cbd5e1] last:border-r-0',
    rowEvenBg: 'bg-white',
    rowOddBg: 'bg-[#f8fafc]',
    rowHoverBg: 'hover:bg-[#edf2f7]',
    rowActiveBg: 'active:bg-[#e2e8f0]',
    cellBorderB: 'border-b border-neutral-200',
    cellDivider: 'border-r border-neutral-200/70 last:border-r-0',
  },
  'excel-dark': {
    containerBorder: 'border-neutral-300',
    headerBg: 'bg-[#18181b]',
    headerText: 'text-white',
    headerBorderB: 'border-b-2 border-black',
    headerDivider: 'border-r border-neutral-700 last:border-r-0',
    rowEvenBg: 'bg-white',
    rowOddBg: 'bg-[#f9fafb]',
    rowHoverBg: 'hover:bg-[#f3f4f6]',
    rowActiveBg: 'active:bg-[#e5e7eb]',
    cellBorderB: 'border-b border-neutral-200',
    cellDivider: 'border-r border-neutral-200/70 last:border-r-0',
  },
};

export function Table<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  loadingRows = 5,
  emptyMessage = 'No data available',
  onRowClick,
  className = '',
  headerClassName = '',
  variant = 'excel-green',
  showCellBorders = true,
}: TableProps<T>) {
  const styles = variantStyles[variant];

  const getAlignClass = (align?: 'left' | 'center' | 'right') => {
    if (align === 'right') return 'text-right';
    if (align === 'center') return 'text-center';
    return 'text-left';
  };

  return (
    <div
      className={`w-full overflow-hidden rounded-2xl border ${styles.containerBorder} bg-white shadow-xs ${className}`}
    >
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className={`${styles.headerBg} ${styles.headerBorderB} ${headerClassName}`}>
              {columns.map((col, idx) => (
                <th
                  key={String(col.accessor ?? idx)}
                  className={`px-5 py-3.5 text-xs font-semibold uppercase tracking-wider ${
                    styles.headerText
                  } select-none ${showCellBorders ? styles.headerDivider : ''} ${getAlignClass(
                    col.align
                  )} ${col.className ?? ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              Array.from({ length: loadingRows }).map((_, rIdx) => {
                const isOdd = rIdx % 2 === 1;
                const rowBg = isOdd ? styles.rowOddBg : styles.rowEvenBg;
                const isLastRow = rIdx === loadingRows - 1;

                return (
                  <tr key={`skeleton-row-${rIdx}`} className={rowBg}>
                    {columns.map((col, cIdx) => (
                      <td
                        key={`skeleton-cell-${cIdx}`}
                        className={`px-5 py-4 ${isLastRow ? '' : styles.cellBorderB} ${
                          showCellBorders ? styles.cellDivider : ''
                        } ${getAlignClass(col.align)}`}
                      >
                        <Skeleton
                          height={16}
                          borderRadius={6}
                          className="w-3/4 max-w-[140px] inline-block"
                        />
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-5 py-12 text-center text-sm text-neutral-500 select-none bg-white"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => {
                const rowKey = keyExtractor
                  ? keyExtractor(row, rowIdx)
                  : ((row as Record<string, unknown>).id as string | number) ?? rowIdx;
                const isOdd = rowIdx % 2 === 1;
                const rowBg = isOdd ? styles.rowOddBg : styles.rowEvenBg;
                const isLastRow = rowIdx === data.length - 1;

                return (
                  <tr
                    key={rowKey}
                    onClick={() => onRowClick?.(row)}
                    className={`transition-colors duration-150 ${rowBg} ${styles.rowHoverBg} ${
                      onRowClick ? `cursor-pointer ${styles.rowActiveBg}` : ''
                    }`}
                  >
                    {columns.map((col, colIdx) => {
                      const cellValue = col.accessor
                        ? (row as Record<string, unknown>)[col.accessor as string]
                        : undefined;
                      const content = col.render
                        ? col.render(row, rowIdx)
                        : (cellValue as ReactNode) ?? null;

                      return (
                        <td
                          key={String(col.accessor ?? colIdx)}
                          className={`px-5 py-3.5 text-neutral-800 whitespace-nowrap ${
                            isLastRow ? '' : styles.cellBorderB
                          } ${showCellBorders ? styles.cellDivider : ''} ${getAlignClass(
                            col.align
                          )} ${col.className ?? ''}`}
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
