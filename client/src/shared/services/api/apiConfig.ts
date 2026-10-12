import axios from 'axios';

export const API_BASE_URL = '/api/v1';

const apiConfig = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiConfig.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;

        if (status === 401) {
            console.warn('Unauthorized or session expired.');
        }

        return Promise.reject(error);
    }
);

export default apiConfig;
