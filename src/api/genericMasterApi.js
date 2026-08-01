import axiosClient from './axiosClient';

export const genericMasterApi = {
  getAll: (type, params) => axiosClient.get(`/masters/generic/${type}`, { params }),
  getById: (type, id) => axiosClient.get(`/masters/generic/${type}/${id}`),
  create: (type, data) => axiosClient.post(`/masters/generic/${type}`, data),
  update: (type, id, data) => axiosClient.put(`/masters/generic/${type}/${id}`, data),
  toggleStatus: (type, id) => axiosClient.patch(`/masters/generic/${type}/${id}/toggle-status`),
  delete: (type, id) => axiosClient.delete(`/masters/generic/${type}/${id}`),
  restore: (type, id) => axiosClient.post(`/masters/generic/${type}/${id}/restore`),
};
