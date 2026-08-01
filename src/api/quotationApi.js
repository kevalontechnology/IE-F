import axiosClient from './axiosClient';

export const quotationApi = {
  getQuotations: (params) => axiosClient.get('/quotations', { params }),
  getQuotationById: (id) => axiosClient.get(`/quotations/${id}`),
  createQuotation: (data) => axiosClient.post('/quotations', data),
  updateQuotation: (id, data) => axiosClient.put(`/quotations/${id}`, data),
  updateStatus: (id, data) => axiosClient.patch(`/quotations/${id}/status`, data),
  convertToShipment: (id, data) => axiosClient.post(`/quotations/${id}/convert-to-shipment`, data),
  deleteQuotation: (id) => axiosClient.delete(`/quotations/${id}`),
};
