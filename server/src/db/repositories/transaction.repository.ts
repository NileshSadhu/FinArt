import type {
  Prisma,
  Transaction,
  TransactionType,
} from "../../generated/prisma/client.js";
import { prisma } from "../client.js";

// ── Types ────────────────────────────────────────────────────────────────────

export interface TransactionFilters {
  userId: string;
  type?: TransactionType;
  categoryId?: string;
  /** ISO date string – inclusive lower bound on transactionDate */
  fromDate?: Date;
  /** ISO date string – inclusive upper bound on transactionDate */
  toDate?: Date;
}

export interface TransactionEntryInput {
  accountId: string;
  /** Positive for debit, negative for credit (use your domain convention) */
  amount: Prisma.Decimal | number | string;
}

export interface CreateTransactionInput {
  userId: string;
  categoryId?: string | null;
  transactionDate: Date;
  description: string;
  type: TransactionType;
  reference?: string | null;
  notes?: string | null;
  /** At least one entry is required. */
  entries: TransactionEntryInput[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const defaultInclude = {
  category: true,
  entries: { include: { account: true } },
  receipts: true,
} satisfies Prisma.TransactionInclude;

function buildTransactionWhere(
  filters: TransactionFilters,
): Prisma.TransactionWhereInput {
  const { userId, type, categoryId, fromDate, toDate } = filters;
  return {
    userId,
    ...(type ? { type } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(fromDate || toDate
      ? {
          transactionDate: {
            ...(fromDate ? { gte: fromDate } : {}),
            ...(toDate ? { lte: toDate } : {}),
          },
        }
      : {}),
  };
}

// ── Repository ───────────────────────────────────────────────────────────────

export const transactionRepository = {
  /** Paginated list of transactions for a user with optional filters. */
  findMany(
    filters: TransactionFilters,
    options: { skip?: number; take?: number } = {},
  ) {
    const where = buildTransactionWhere(filters);
    return prisma.transaction.findMany({
      where,
      include: defaultInclude,
      orderBy: [{ transactionDate: "desc" }, { createdAt: "desc" }],
      skip: options.skip ?? 0,
      take: options.take ?? 50,
    });
  },

  /** Count transactions matching the same filters (for pagination). */
  count(filters: TransactionFilters): Promise<number> {
    const where = buildTransactionWhere(filters);
    return prisma.transaction.count({
      where,
    });
  },

  /** Find a single transaction by id, scoped to the owning user. */
  findByIdAndUser(id: string, userId: string) {
    return prisma.transaction.findUnique({
      where: { id, userId },
      include: defaultInclude,
    });
  },

  /**
   * Create a transaction together with its double-entry records atomically.
   * Uses a Prisma interactive transaction so either everything succeeds or
   * nothing is written.
   */
  create(input: CreateTransactionInput) {
    const { entries, ...txData } = input;
    return prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          ...txData,
          entries: {
            create: entries.map((e) => ({
              accountId: e.accountId,
              amount: e.amount,
            })),
          },
        },
        include: defaultInclude,
      });
      return transaction;
    });
  },

  /** Update mutable fields of a transaction (does not touch entries). */
  update(
    id: string,
    userId: string,
    data: Prisma.TransactionUncheckedUpdateInput,
  ): Promise<Transaction> {
    return prisma.transaction.update({ where: { id, userId }, data });
  },

  /** Delete a transaction and cascade its entries/receipts via DB constraints. */
  delete(id: string, userId: string): Promise<Transaction> {
    return prisma.transaction.delete({ where: { id, userId } });
  },
} as const;
