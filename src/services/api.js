import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const documentAPI = {
  // Upload document
  uploadDocument: async (formData) => {
    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Search documents
  searchDocuments: async (params) => {
    const response = await api.get('/documents/search', { params });
    return response.data;
  },

  // Get document details
  getDocument: async (id) => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  // Get categories and metadata
  getCategories: async () => {
    const response = await api.get('/documents/meta/categories');
    return response.data;
  },

  // Get file URL
  getFileUrl: (id) => {
    return `${API_BASE_URL}/documents/file/${id}`;
  },

  // Preview document
  previewDocument: async (id) => {
    const response = await api.get(`/documents/preview/${id}`);
    return response.data;
  },
};

export default api;