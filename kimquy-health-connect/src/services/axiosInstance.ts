/* ═══════════════════════════════════════
   Axios Instance – Kết nối API
   ═══════════════════════════════════════ */
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v2',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Tự động gắn JWT vào mỗi request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Tự động refresh token khi 401
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post(
          `${axiosInstance.defaults.baseURL}/auth/refresh`,
          { token: refreshToken }
        );
        const token = data?.result?.token;
        if (!token) throw new Error('No refreshed token');
        localStorage.setItem('accessToken', token);
        original.headers.Authorization = `Bearer ${token}`;
        return axiosInstance(original);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
