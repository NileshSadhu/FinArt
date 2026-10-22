import type { FC } from "react";
import { Upload, FileSpreadsheet, Filter, X } from "lucide-react";
import type {
  TransactionFilters,
  TransactionType,
} from "../../services/api/transactionService";
import type { Account } from "../../services/api/accountService";
import type { Category } from "../../services/api/categoryService";
import { TRANSACTION_TYPE_META } from "../../utils/transaction";
import { formatDate } from "../../utils/validation";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface ExportConfirmModalProps {
  isOpen: boolean;
  filters: TransactionFilters;
  accounts: Account[];
  categories: Category[];
  /** Total matching transactions (used for the count badge) */
  total: number;
  isExporting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

// ── Helper (co-located — only used by this modal) ─────────────────────────────

function buildFilterParts(
  filters: TransactionFilters,
  accounts: Account[],
  categories: Category[],
): { label: string; value: string }[] {
  const parts: { label: string; value: string }[] = [];

  if (filters.type) {
    parts.push({
      label: "Type",
      value: TRANSACTION_TYPE_META[filters.type as TransactionType].label,
    });
  }
  if (filters.accountId) {
    const acc = accounts.find((a) => a.id === filters.accountId);
    parts.push({
      label: "Account",
      value: acc ? `${acc.name} (${acc.currency})` : (filters.accountId ?? ""),
    });
  }
  if (filters.categoryId) {
    const cat = categories.find((c) => c.id === filters.categoryId);
    parts.push({ label: "Category", value: cat?.name ?? (filters.categoryId ?? "") });
  }
  if (filters.fromDate) {
    parts.push({ label: "From", value: formatDate(filters.fromDate) });
  }
  if (filters.toDate) {
    parts.push({ label: "To", value: formatDate(filters.toDate) });
  }

  return parts;
}

// ── Component ──────────────────────────────────────────────────────────────────

export const ExportConfirmModal: FC<ExportConfirmModalProps> = ({
  isOpen,
  filters,
  accounts,
  categories,
  total,
  isExporting,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  const filterParts = buildFilterParts(filters, accounts, categories);

  return (
    <div
      onClick={(e) =>
        e.target === e.currentTarget && !isExporting && onClose()
      }
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl border border-neutral-100 overflow-hidden">

        {/* ── Dark header band ── */}
        <div className="bg-gradient-to-r from-neutral-900 to-neutral-700 px-6 pt-6 pb-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white leading-tight">
              Export to Excel
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              FinArt · Transactions Report
            </p>
          </div>
          {!isExporting && (
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-1 text-neutral-400 hover:text-white rounded-full transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ── Body ── */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-neutral-600">
            Do you want to export the transaction data as an Excel file?
          </p>

          {/* Filter summary card */}
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-neutral-200 flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-neutral-500" />
              <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
                {filterParts.length === 0 ? "Export Scope" : "Active Filters"}
              </span>
            </div>

            {filterParts.length === 0 ? (
              <div className="px-4 py-3">
                <p className="text-xs text-neutral-500">
                  All transactions — no filter applied.
                </p>
              </div>
            ) : (
              <div className="px-4 py-3 space-y-2">
                {filterParts.map(({ label, value }) => (
                  <div key={label} className="flex items-center gap-2 text-xs">
                    <span className="font-medium text-neutral-500 w-20 shrink-0">
                      {label}
                    </span>
                    <span className="h-px flex-1 bg-neutral-200" />
                    <span className="font-semibold text-neutral-800 text-right">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Transaction count badge */}
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <p className="text-xs text-emerald-800 font-medium">
              <span className="font-bold">{total.toLocaleString()}</span>{" "}
              {total === 1 ? "transaction" : "transactions"} will be included in
              the export.
            </p>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-6 pb-6 flex items-center gap-2.5">
          <button
            type="button"
            disabled={isExporting}
            onClick={onClose}
            className="flex-1 py-2 px-4 rounded-full text-sm font-medium border border-neutral-200 text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isExporting}
            onClick={onConfirm}
            className="flex-1 py-2 px-4 rounded-full text-sm font-semibold bg-neutral-900 hover:bg-black text-white transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isExporting ? (
              <>
                <svg
                  className="animate-spin w-4 h-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Exporting…
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Export Excel
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportConfirmModal;
