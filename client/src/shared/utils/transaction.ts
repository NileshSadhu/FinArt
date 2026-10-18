import {
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  HandCoins,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Transaction, TransactionType, CreateTransactionPayload } from '../services/api/transactionService';

// ── Type metadata ──────────────────────────────────────────────────────────────

export interface TransactionTypeMeta {
  label: string;
  color: string;
  bg: string;
  icon: LucideIcon;
}

export const TRANSACTION_TYPE_META: Record<TransactionType, TransactionTypeMeta> = {
  INCOME: {
    label: 'Income',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-200',
    icon: ArrowDownLeft,
  },
  EXPENSE: {
    label: 'Expense',
    color: 'text-red-700',
    bg: 'bg-red-50 border-red-200',
    icon: ArrowUpRight,
  },
  TRANSFER: {
    label: 'Transfer',
    color: 'text-blue-700',
    bg: 'bg-blue-50 border-blue-200',
    icon: ArrowLeftRight,
  },
  LEND: {
    label: 'Lend',
    color: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200',
    icon: HandCoins,
  },
  REPAYMENT: {
    label: 'Repayment',
    color: 'text-violet-700',
    bg: 'bg-violet-50 border-violet-200',
    icon: RotateCcw,
  },
  ADJUSTMENT: {
    label: 'Adjustment',
    color: 'text-neutral-700',
    bg: 'bg-neutral-100 border-neutral-300',
    icon: SlidersHorizontal,
  },
};

// ── Type classification helpers ────────────────────────────────────────────────

/** INCOME and EXPENSE support an optional category. */
export const typeNeedsCategory = (type: TransactionType): boolean =>
  type === 'INCOME' || type === 'EXPENSE';

/** TRANSFER, LEND, REPAYMENT require a second (destination) account. */
export const typeNeedsSecondAccount = (type: TransactionType): boolean =>
  type === 'TRANSFER' || type === 'LEND' || type === 'REPAYMENT';

/** Types that produce exactly one journal entry (amount sign handled by helper). */
export const typeIsSingleEntry = (type: TransactionType): boolean =>
  type === 'INCOME' || type === 'EXPENSE' || type === 'ADJUSTMENT';

/** Returns true when a transaction has been cancelled or is itself a reversal. */
export const isCancelledTransaction = (tx: Pick<Transaction, 'notes' | 'reference'>): boolean =>
  Boolean(tx.notes?.includes('[CANCELLED]') || tx.reference?.startsWith('REVERSAL_OF:'));

// ── Entry builder ──────────────────────────────────────────────────────────────

/**
 * Converts the form's flat amount + account selection into the `entries[]`
 * array that the API expects.
 *
 * - INCOME  → single positive entry on the destination account
 * - EXPENSE → single negative entry on the source account
 * - ADJUSTMENT → single signed entry (sign preserved from user input)
 * - TRANSFER / LEND / REPAYMENT → two entries that sum to zero
 */
export function buildTransactionEntries(
  type: TransactionType,
  accountId: string,
  amount: number,
  toAccountId: string,
): CreateTransactionPayload['entries'] {
  if (typeIsSingleEntry(type)) {
    const finalAmount =
      type === 'EXPENSE'
        ? -Math.abs(amount)
        : type === 'INCOME'
        ? Math.abs(amount)
        : amount; // ADJUSTMENT keeps the user-entered sign
    return [{ accountId, amount: finalAmount }];
  }
  // Two-entry: source (negative) → destination (positive), conserving funds
  return [
    { accountId, amount: -Math.abs(amount) },
    { accountId: toAccountId, amount: Math.abs(amount) },
  ];
}

// ── Display helpers ────────────────────────────────────────────────────────────

/**
 * Picks the representative amount and currency from a transaction's entries.
 * Prefers a positive entry (the "receiving" side) when one exists.
 */
export function getTransactionDisplayAmount(tx: Transaction): {
  amount: number;
  currency: string;
} {
  if (!tx.entries.length) return { amount: 0, currency: 'INR' };
  const positiveEntry = tx.entries.find((e) => Number(e.amount) > 0);
  const entry = positiveEntry ?? tx.entries[0];
  return {
    amount: Math.abs(Number(entry.amount)),
    currency: entry.account?.currency ?? 'INR',
  };
}
