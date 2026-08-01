import axiosClient from './axiosClient';

export const documentApi = {
  generateDocument: (data) => axiosClient.post('/documents/generate', data),
  getHistory: (params) => axiosClient.get('/documents/history', { params }),
  getDocuments: (params) => axiosClient.get('/documents', { params }),
};
