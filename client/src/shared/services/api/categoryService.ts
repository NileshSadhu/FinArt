import apiConfig from './apiConfig';
import { ApiPath } from './apiPath';

export type CategoryType = 'INCOME' | 'EXPENSE';

export interface Category {
  id: string;
  userId: string | null;
  name: string;
  type: CategoryType;
  icon: string | null;
  createdAt: string;
  updatedAt: string;
}

export const categoryService = {
  getCategories: async (type?: CategoryType): Promise<Category[]> => {
    const res = await apiConfig.get<{ data: Category[] }>(ApiPath.categories.base, {
      params: type ? { type } : undefined,
    });
    return res.data.data;
  },
};

export default categoryService;
