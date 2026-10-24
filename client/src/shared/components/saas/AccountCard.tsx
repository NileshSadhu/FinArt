import React from "react";
import { Landmark, Pencil, Trash2 } from "lucide-react";
import Skeleton from "./Skeleton";
import CurrencyLogo from "./CurrencyLogo";
import type { Account as AccountItem } from "../../services/api/accountService";
import { formatCurrency, formatDate } from "../../utils/validation";

export const getAccountBadgeStyle = (n: number) => {
  const minHue = 175;
  const maxHue = 330;
  const span = maxHue - minHue;

  // Golden ratio conjugate provides optimal, non-repeating hue distribution for any nth account
  const phi = 0.618033988749895;
  const hue = Math.round(minHue + ((Math.abs(n) * phi) % 1) * span);

  return {
    bg: `hsl(${hue}, 85%, 96%)`,
    text: `hsl(${hue}, 75%, 38%)`,
    border: `hsl(${hue}, 60%, 86%)`,
  };
};

export interface AccountCardProps {
  account: AccountItem;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  onEdit: (account: AccountItem) => void;
  onDelete: (account: AccountItem) => void;
}

export const AccountCard: React.FC<AccountCardProps> = ({
  account,
  index,
  isOpen,
  onToggle,
  onEdit,
  onDelete,
}) => {
  const badgeStyle = getAccountBadgeStyle(index);
  const formattedDate = formatDate(account.createdAt);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-neutral-100/90 border border-neutral-200/80 select-none shadow-xs">
      {/* Background Action Slider (Positioned on the right side) */}
      <div
        className={`absolute inset-y-0 right-0 flex items-center gap-2 pr-3 z-0 transition-all duration-300 ease-out ${isOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-6 pointer-events-none"
          }`}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(account);
          }}
          className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 active:scale-95 transition-all flex items-center justify-center border border-amber-300/70 shadow-xs cursor-pointer"
          title="Update account"
          aria-label="Update account"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(account);
          }}
          className="w-10 h-10 rounded-xl bg-red-500/10 text-red-600 hover:bg-red-500/20 active:scale-95 transition-all flex items-center justify-center border border-red-300/70 shadow-xs cursor-pointer"
          title="Delete account"
          aria-label="Delete account"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Foreground Interactive Card (Shifts inward to the left on click) */}
      <div
        onClick={onToggle}
        className={`relative z-10 bg-white rounded-2xl p-3.5 flex items-center gap-3 transition-all duration-300 ease-out cursor-pointer select-none active:scale-[0.99] ${isOpen
          ? "-translate-x-28 scale-[0.985] shadow-md border-r border-neutral-300"
          : "translate-x-0 hover:bg-neutral-50/50"
          }`}
      >
        {/* Bank Icon with nth color (non-red, non-yellow, non-green) */}
        <div
          style={{
            backgroundColor: badgeStyle.bg,
            color: badgeStyle.text,
            borderColor: badgeStyle.border,
          }}
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border shadow-xs"
        >
          <Landmark className="w-5 h-5" />
        </div>

        {/* Vertical Divider */}
        <div className="w-px self-stretch bg-neutral-200/80 my-0.5 shrink-0" />

        {/* Content Container */}
        <div className="flex-1 min-w-0 flex flex-col justify-between gap-1">
          {/* Row 1: Account Name & currency logo / type */}
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-neutral-900 text-sm truncate" title={account.name}>
              {account.name}
            </span>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-neutral-600 uppercase tracking-wide shrink-0">
              <CurrencyLogo
                currency={account.currency}
                className="w-3.5 h-3.5 text-neutral-700"
              />
              <span>/ {account.type}</span>
            </div>
          </div>

          {/* Row 2: current balance in black */}
          <div className="text-sm font-bold text-neutral-900 tabular-nums">
            {formatCurrency(
              account.currentBalance ?? account.openingBalance ?? 0,
              account.currency,
            )}
          </div>

          {/* Row 3: OP (Opening Balance) on left, Created Date on right */}
          <div className="flex items-center justify-between gap-2 text-[11px] tabular-nums">
            <span className="truncate">
              <span className="text-neutral-400 font-medium">OP : </span>
              <span className="text-neutral-600 font-medium">
                {formatCurrency(account.openingBalance ?? 0, account.currency)}
              </span>
            </span>
            <span className="text-neutral-400 shrink-0">
              {formattedDate}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AccountCardSkeleton: React.FC = () => (
  <div className="bg-white border border-neutral-200/80 rounded-2xl p-3.5 flex items-center gap-3 shadow-xs">
    <Skeleton width={44} height={44} borderRadius={12} className="shrink-0" />
    <div className="w-px self-stretch bg-neutral-200/80 my-0.5 shrink-0" />
    <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
      <div className="flex items-center justify-between gap-2">
        <Skeleton width="45%" height={14} borderRadius={4} />
        <Skeleton width="30%" height={12} borderRadius={4} />
      </div>
      <Skeleton width="40%" height={16} borderRadius={4} />
      <div className="flex items-center justify-between gap-2">
        <Skeleton width="35%" height={11} borderRadius={4} />
        <Skeleton width="25%" height={11} borderRadius={4} />
      </div>
    </div>
  </div>
);

export default AccountCard;
