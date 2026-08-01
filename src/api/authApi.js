import axiosClient from './axiosClient';

export const authApi = {
  register: (data) => axiosClient.post('/auth/register', data),
  login: (data) => axiosClient.post('/auth/login', data),
  logout: () => axiosClient.post('/auth/logout'),
  getProfile: () => axiosClient.get('/auth/profile'),
  getUsers: (params) => axiosClient.get('/users', { params }),
  updateUserStatus: (id, data) => axiosClient.patch(`/users/${id}/status`, data),
};
