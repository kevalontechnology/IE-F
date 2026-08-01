import axiosClient from './axiosClient';

export const dashboardApi = {
  getStats: () => axiosClient.get('/dashboard/stats'),
};

export const searchApi = {
  search: (q) => axiosClient.get('/search', { params: { q } }),
};

export const auditApi = {
  getLogs: (params) => axiosClient.get('/audit/logs', { params }),
  getLoginHistory: (params) => axiosClient.get('/audit/logins', { params }),
  exportBackup: () => window.open((import.meta.env.VITE_API_BASE_URL || 'https://ie-b.onrender.com/api/v1') + '/backup/export', '_blank'),
};
