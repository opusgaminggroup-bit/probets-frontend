import axios from 'axios';
import { clearToken, getToken } from './auth';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE || '',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const currentPath = typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : '/admin/dashboard';

    if (status === 401 && typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin/login')) {
      clearToken();
      const next = encodeURIComponent(currentPath);
      window.location.href = `/admin/login?next=${next}`;
    }

    return Promise.reject(error);
  },
);

export default api;
