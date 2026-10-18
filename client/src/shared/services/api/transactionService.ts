import apiConfig from './apiConfig';
import { ApiPath } from './apiPath';

// ── Types ─────────────────────────────────────────────────────────────────────

export const TRANSACTION_TYPES = [
  'INCOME',
  'EXPENSE',
  'TRANSFER',
  'LEND',
  'REPAYMENT',
  'ADJUSTMENT',
] as const;

export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export interface TransactionEntry {
  id: string;
  transactionId: string;
  accountId: string;
  amount: number;
  createdAt: string;
  account: {
    id: string;
    name: string;
    type: string;
    currency: string;
  };
}

export interface Transaction {
  id: string;
  userId: string;
  categoryId: string | null;
  transactionDate: string;
  description: string;
  type: TransactionType;
  reference: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    type: string;
    icon: string | null;
  } | null;
  entries: TransactionEntry[];
  receipts: unknown[];
}

export interface PaginatedTransactions {
  transactions: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateTransactionEntryPayload {
  accountId: string;
  amount: number;
}

export interface CreateTransactionPayload {
  categoryId?: string | null;
  transactionDate: string;
  description: string;
  type: TransactionType;
  reference?: string | null;
  notes?: string | null;
  entries: CreateTransactionEntryPayload[];
}

export interface UpdateTransactionPayload {
  categoryId?: string | null;
  transactionDate?: string;
  description?: string;
  type?: TransactionType;
  reference?: string | null;
  notes?: string | null;
}

export interface TransactionFilters {
  type?: TransactionType;
  categoryId?: string;
  accountId?: string;
  fromDate?: string;
  toDate?: string;
}

// ── Service ───────────────────────────────────────────────────────────────────

export const transactionService = {
  getTransactions: async (
    page = 1,
    limit = 10,
    filters?: TransactionFilters,
  ): Promise<PaginatedTransactions> => {
    const params: Record<string, string | number> = { page, limit };
    if (filters?.type) params.type = filters.type;
    if (filters?.accountId) params.accountId = filters.accountId;
    if (filters?.categoryId) params.categoryId = filters.categoryId;
    if (filters?.fromDate) params.fromDate = filters.fromDate;
    if (filters?.toDate) params.toDate = filters.toDate;

    const res = await apiConfig.get<{ data: PaginatedTransactions }>(
      ApiPath.transactions.base,
      { params },
    );
    return res.data.data;
  },

  getTransaction: async (id: string): Promise<Transaction> => {
    const res = await apiConfig.get<{ data: Transaction }>(
      ApiPath.transactions.byId(id),
    );
    return res.data.data;
  },

  createTransaction: async (
    payload: CreateTransactionPayload,
  ): Promise<Transaction> => {
    const res = await apiConfig.post<{ data: Transaction }>(
      ApiPath.transactions.base,
      payload,
    );
    return res.data.data;
  },

  updateTransaction: async (
    id: string,
    payload: UpdateTransactionPayload,
  ): Promise<Transaction> => {
    const res = await apiConfig.patch<{ data: Transaction }>(
      ApiPath.transactions.byId(id),
      payload,
    );
    return res.data.data;
  },

  cancelTransaction: async (id: string): Promise<Transaction> => {
    const res = await apiConfig.post<{ data: Transaction }>(
      ApiPath.transactions.cancel(id),
    );
    return res.data.data;
  },

  deleteTransaction: async (id: string): Promise<void> => {
    await apiConfig.delete(ApiPath.transactions.byId(id));
  },
};

export default transactionService;
