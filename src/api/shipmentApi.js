import axiosClient from './axiosClient';

export const shipmentApi = {
  getShipments: (params) => axiosClient.get('/shipments', { params }),
  getShipmentById: (id) => axiosClient.get(`/shipments/${id}`),
  createShipment: (data) => axiosClient.post('/shipments', data),
  updateShipment: (id, data) => axiosClient.put(`/shipments/${id}`, data),
  deleteShipment: (id) => axiosClient.delete(`/shipments/${id}`),
};
