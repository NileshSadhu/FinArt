import apiConfig from './apiConfig';
import { ApiPath } from './apiPath';

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export const authService = {
  /**
   * Initiates Google OAuth flow by redirecting browser to backend
   */
  redirectToGoogle: () => {
    window.location.href = ApiPath.auth.googleRedirectUrl;
  },

  /**
   * Fetch current authenticated user
   */
  getMe: async (): Promise<User> => {
    const res = await apiConfig.get<{ data: User }>(ApiPath.auth.me);
    return res.data.data;
  },

  /**
   * Signs out current user and clears session cookie
   */
  signOut: async () => {
    const res = await apiConfig.post(ApiPath.auth.signOut);
    return res.data;
  },
};

export default authService;
