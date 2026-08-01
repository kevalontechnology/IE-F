import axiosClient from './axiosClient';

export const masterApi = {
  // Company
  getCompany: () => axiosClient.get('/masters/company'),
  updateCompany: (data) => axiosClient.put('/masters/company', data),

  // Customers
  getCustomers: (params) => axiosClient.get('/customers', { params }),
  getCustomerById: (id) => axiosClient.get(`/customers/${id}`),
  createCustomer: (data) => axiosClient.post('/customers', data),
  updateCustomer: (id, data) => axiosClient.put(`/customers/${id}`, data),
  deleteCustomer: (id) => axiosClient.delete(`/customers/${id}`),

  // Products
  getProducts: (params) => axiosClient.get('/products', { params }),
  getProductById: (id) => axiosClient.get(`/products/${id}`),
  createProduct: (data) => axiosClient.post('/products', data),
  updateProduct: (id, data) => axiosClient.put(`/products/${id}`, data),
  deleteProduct: (id) => axiosClient.delete(`/products/${id}`),

  // Supporting Masters
  getFactories: () => axiosClient.get('/masters/factories'),
  createFactory: (data) => axiosClient.post('/masters/factories', data),
  getShippingLines: () => axiosClient.get('/masters/shipping-lines'),
  createShippingLine: (data) => axiosClient.post('/masters/shipping-lines', data),
  getPorts: () => axiosClient.get('/masters/ports'),
  createPort: (data) => axiosClient.post('/masters/ports', data),
  getCountries: () => axiosClient.get('/masters/countries'),
  getCurrencies: () => axiosClient.get('/masters/currencies'),
};
