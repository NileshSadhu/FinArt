import React from "react";
import { XCircle, Trash2, ArrowRight } from "lucide-react";
import Skeleton from "./Skeleton";
import type { Transaction as TxItem } from "../../services/api/transactionService";
import { formatDate } from "../../utils/validation";
import {
  TRANSACTION_TYPE_META,
  getTransactionAmountStyle,
  isCancelledTransaction,
} from "../../utils/transaction";
import { getCategoryIconOption } from "../../utils/categoryIcons";

export interface TransactionCardProps {
  transaction: TxItem;
  isOpen: boolean;
  onToggle: () => void;
  onCancel: (tx: TxItem) => void;
  onDelete: (tx: TxItem) => void;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction: tx,
  isOpen,
  onToggle,
  onCancel,
  onDelete,
}) => {
  const cancelled = isCancelledTransaction(tx);
  const meta = TRANSACTION_TYPE_META[tx.type];
  const { formattedAmount, colorClass } = getTransactionAmountStyle(tx);

  // Category Icon if present, otherwise Type icon
  const iconOption = tx.category ? getCategoryIconOption(tx.category.icon) : null;
  const CategoryIcon = iconOption?.Icon;
  const TypeIcon = meta.icon;

  const formattedDate = formatDate(tx.transactionDate);

  // Accounts summary
  const renderAccountsSummary = () => {
    if (!tx.entries.length) return null;
    if (tx.entries.length === 1) {
      return (
        <span className="truncate max-w-[130px] text-neutral-600">
          {tx.entries[0].account?.name ?? tx.entries[0].accountId}
        </span>
      );
    }
    const sourceEntry = tx.entries.find((e) => Number(e.amount) < 0);
    const destEntry = tx.entries.find((e) => Number(e.amount) > 0);
    if (sourceEntry && destEntry) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] text-neutral-600 truncate max-w-[150px]">
          <span className="truncate">{sourceEntry.account?.name ?? "Source"}</span>
          <ArrowRight className="w-3 h-3 shrink-0 text-neutral-400" />
          <span className="truncate">{destEntry.account?.name ?? "Dest"}</span>
        </span>
      );
    }
    return (
      <span className="truncate max-w-[130px] text-neutral-600">
        {tx.entries.map((e) => e.account?.name).filter(Boolean).join(", ")}
      </span>
    );
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-neutral-100/90 border border-neutral-200/80 select-none shadow-xs">
      {/* Background Action Slider (Positioned on the right side) */}
      <div
        className={`absolute inset-y-0 right-0 flex items-center gap-2 pr-3 z-0 transition-all duration-300 ease-out ${
          isOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-6 pointer-events-none"
        }`}
      >
        {!cancelled && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onCancel(tx);
            }}
            className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 active:scale-95 transition-all flex items-center justify-center border border-amber-300/70 shadow-xs cursor-pointer"
            title="Cancel transaction"
            aria-label="Cancel transaction"
          >
            <XCircle className="w-4 h-4" />
          </button>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(tx);
          }}
          className="w-10 h-10 rounded-xl bg-red-500/10 text-red-600 hover:bg-red-500/20 active:scale-95 transition-all flex items-center justify-center border border-red-300/70 shadow-xs cursor-pointer"
          title="Delete transaction"
          aria-label="Delete transaction"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Foreground Interactive Card (Shifts inward to the left on click) */}
      <div
        onClick={onToggle}
        className={`relative z-10 bg-white rounded-2xl p-3.5 flex items-center gap-3 transition-all duration-300 ease-out cursor-pointer select-none active:scale-[0.99] ${
          isOpen
            ? `${cancelled ? "-translate-x-16" : "-translate-x-28"} scale-[0.985] shadow-md border-r border-neutral-300`
            : "translate-x-0 hover:bg-neutral-50/50"
        }`}
      >
        {/* Leading Icon with Type styling */}
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border shadow-xs ${meta.bg} ${meta.color}`}
        >
          {CategoryIcon ? (
            <CategoryIcon className={`w-5 h-5 ${iconOption.color}`} />
          ) : (
            <TypeIcon className="w-5 h-5" />
          )}
        </div>

        {/* Vertical Divider */}
        <div className="w-px self-stretch bg-neutral-200/80 my-0.5 shrink-0" />

        {/* Content Container */}
        <div className="flex-1 min-w-0 flex flex-col justify-between gap-1">
          {/* Row 1: Description & Type Badge */}
          <div className="flex items-center justify-between gap-2">
            <span
              className={`font-semibold text-sm truncate ${
                cancelled ? "line-through text-neutral-400" : "text-neutral-900"
              }`}
              title={tx.description}
            >
              {tx.description}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border shrink-0 ${meta.bg} ${meta.color}`}
            >
              <TypeIcon className="w-2.5 h-2.5" />
              {meta.label}
            </span>
          </div>

          {/* Row 2: Amount & Accounts */}
          <div className="flex items-baseline justify-between gap-2 text-sm tabular-nums">
            <span
              className={`font-bold ${
                cancelled ? "line-through text-neutral-400" : colorClass
              }`}
            >
              {formattedAmount}
            </span>
            <div className="text-xs shrink-0">{renderAccountsSummary()}</div>
          </div>

          {/* Row 3: Category / Reference & Created Date */}
          <div className="flex items-center justify-between gap-2 text-[11px] text-neutral-400 tabular-nums">
            <span className="truncate max-w-[160px] text-neutral-500 font-medium">
              {tx.category?.name ?? (tx.reference ? `Ref: ${tx.reference}` : "No category")}
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              {cancelled && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-red-100 text-red-600">
                  CANCELLED
                </span>
              )}
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TransactionCardSkeleton: React.FC = () => (
  <div className="bg-white border border-neutral-200/80 rounded-2xl p-3.5 flex items-center gap-3 shadow-xs">
    <Skeleton width={44} height={44} borderRadius={12} className="shrink-0" />
    <div className="w-px self-stretch bg-neutral-200/80 my-0.5 shrink-0" />
    <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
      <div className="flex items-center justify-between gap-2">
        <Skeleton width="50%" height={14} borderRadius={4} />
        <Skeleton width="20%" height={12} borderRadius={9999} />
      </div>
      <div className="flex items-center justify-between gap-2">
        <Skeleton width="35%" height={16} borderRadius={4} />
        <Skeleton width="30%" height={12} borderRadius={4} />
      </div>
      <div className="flex items-center justify-between gap-2">
        <Skeleton width="30%" height={11} borderRadius={4} />
        <Skeleton width="25%" height={11} borderRadius={4} />
      </div>
    </div>
  </div>
);

export default TransactionCard;
