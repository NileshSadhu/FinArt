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

export interface CreateCategoryPayload {
  name: string;
  type: CategoryType;
  icon?: string | null;
}

export interface UpdateCategoryPayload {
  name?: string;
  type?: CategoryType;
  icon?: string | null;
}

export const categoryService = {
  getCategories: async (type?: CategoryType): Promise<Category[]> => {
    const res = await apiConfig.get<{ data: Category[] }>(ApiPath.categories.base, {
      params: type ? { type } : undefined,
    });
    return res.data.data;
  },

  getCategory: async (id: string): Promise<Category> => {
    const res = await apiConfig.get<{ data: Category }>(ApiPath.categories.byId(id));
    return res.data.data;
  },

  createCategory: async (payload: CreateCategoryPayload): Promise<Category> => {
    const res = await apiConfig.post<{ data: Category }>(ApiPath.categories.base, payload);
    return res.data.data;
  },

  updateCategory: async (id: string, payload: UpdateCategoryPayload): Promise<Category> => {
    const res = await apiConfig.put<{ data: Category }>(ApiPath.categories.byId(id), payload);
    return res.data.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await apiConfig.delete(ApiPath.categories.byId(id));
  },
};

export default categoryService;
