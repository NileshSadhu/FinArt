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

export const accountService = {
  getAccounts: async (page = 1, limit = 10, includeInactive = false): Promise<PaginatedAccounts> => {
    const res = await apiConfig.get<{ data: PaginatedAccounts }>(ApiPath.accounts.base, {
      params: { page, limit, includeInactive },
    });
    return res.data.data;
  },
};

export default accountService;
