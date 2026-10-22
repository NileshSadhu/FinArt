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

  exportTransactions: async (filters?: TransactionFilters): Promise<void> => {
    const params: Record<string, string> = {};
    if (filters?.type) params.type = filters.type;
    if (filters?.accountId) params.accountId = filters.accountId;
    if (filters?.categoryId) params.categoryId = filters.categoryId;
    if (filters?.fromDate) params.fromDate = filters.fromDate;
    if (filters?.toDate) params.toDate = filters.toDate;

    const res = await apiConfig.get(ApiPath.transactions.export, {
      params,
      responseType: 'blob',
    });

    // Build a friendly filename from the Content-Disposition header or a fallback
    const disposition = res.headers['content-disposition'] as string | undefined;
    let filename = `transactions_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    if (disposition) {
      const match = disposition.match(/filename="?([^"]+)"?/);
      if (match?.[1]) filename = match[1];
    }

    const url = URL.createObjectURL(new Blob([res.data as BlobPart]));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  importTransactions: async (
    fileBase64: string,
    fileName: string,
    defaultAccountId: string,
  ): Promise<{
    importedCount: number;
    skippedCount: number;
    errors: string[];
  }> => {
    const res = await apiConfig.post<{
      data: {
        importedCount: number;
        skippedCount: number;
        errors: string[];
      };
    }>(ApiPath.transactions.import, {
      fileBase64,
      fileName,
      defaultAccountId,
    });
    return res.data.data;
  },

  downloadSampleCsv: (): void => {
    const today = new Date().toISOString().split('T')[0];
    const csvContent =
      'Date,Description,Type,Category,Account,Amount,Reference,Notes\n' +
      `${today},Grocery Shopping,EXPENSE,Food,,1250.00,REF-001,Weekly groceries\n` +
      `${today},Monthly Salary,INCOME,Salary,,45000.00,SAL-001,Direct deposit\n` +
      `${today},Electricity Bill,EXPENSE,Utilities,,1800.00,BILL-001,Monthly power bill\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'finart_transactions_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};

export default transactionService;
