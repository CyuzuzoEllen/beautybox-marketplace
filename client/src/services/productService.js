import api from './api';

const productService = {
  // Get all products (with optional search, category, etc.)
  getProducts: async (params = {}) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  // Get a single product by ID
  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Get categories
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  }
};

export default productService;
