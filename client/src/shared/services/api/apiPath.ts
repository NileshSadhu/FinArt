import { API_BASE_URL } from './apiConfig';

export const ApiPath = {
    auth: {
        googleRedirectUrl: `${API_BASE_URL}/auth/google`,

        googleInit: '/auth/google',
        me: '/auth/me',
        signOut: '/auth/signout',
    },
    accounts: {
        base: '/accounts',
        byId: (id: string) => `/accounts/${id}`,
    },
    transactions: {
        base: '/transactions',
        export: '/transactions/export',
        import: '/transactions/import',
        byId: (id: string) => `/transactions/${id}`,
        cancel: (id: string) => `/transactions/${id}/cancel`,
    },
    categories: {
        base: '/categories',
        byId: (id: string) => `/categories/${id}`,
    },
} as const;
