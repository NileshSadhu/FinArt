import apiConfig from './apiConfig';
import { ApiPath } from './apiPath';

export interface Account {
  id: string;
  name: string;
  type: string;
  currency: string;
  openingBalance: number;
  currentBalance: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedAccounts {
  accounts: Account[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const ACCOUNT_TYPES = ['BANK', 'CASH', 'RECEIVABLE', 'CREDIT'] as const;
export type AccountType = (typeof ACCOUNT_TYPES)[number];

export const SUPPORTED_CURRENCIES = [
  'INR',
  'USD',
  'EUR',
  'GBP',
  'JPY',
  'CAD',
  'AUD',
  'SGD',
  'AED',
  'CHF',
] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export interface CreateAccountPayload {
  name: string;
  type: AccountType;
  currency: SupportedCurrency;
  openingBalance: number;
}

export const accountService = {
  getAccounts: async (page = 1, limit = 10, includeInactive = false): Promise<PaginatedAccounts> => {
    const res = await apiConfig.get<{ data: PaginatedAccounts }>(ApiPath.accounts.base, {
      params: { page, limit, includeInactive },
    });
    return res.data.data;
  },

  createAccount: async (payload: CreateAccountPayload): Promise<Account> => {
    const res = await apiConfig.post<{ data: Account }>(ApiPath.accounts.base, payload);
    return res.data.data;
  },

  updateAccount: async (id: string, payload: Partial<CreateAccountPayload>): Promise<Account> => {
    const res = await apiConfig.patch<{ data: Account }>(ApiPath.accounts.byId(id), payload);
    return res.data.data;
  },

  deleteAccount: async (id: string): Promise<void> => {
    await apiConfig.delete(ApiPath.accounts.byId(id));
  },
};

export default accountService;

