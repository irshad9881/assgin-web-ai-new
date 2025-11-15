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
    try {
      const response = await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      // Mock response for demo
      console.log('Using mock API response');
      return {
        success: true,
        document: {
          id: 'demo-' + Date.now(),
          title: formData.get('file')?.name || 'Demo Document',
          category: 'campaign',
          team: 'marketing',
          project: 'demo-project',
          tags: ['demo', 'marketing'],
          createdAt: new Date().toISOString()
        }
      };
    }
  },

  // Search documents
  searchDocuments: async (params) => {
    try {
      const response = await api.get('/documents/search', { params });
      return response.data;
    } catch (error) {
      // Mock response for demo
      console.log('Using mock search response');
      return {
        query: params.query || '',
        results: [
          {
            id: 'demo-1',
            title: 'Marketing Campaign Strategy.pdf',
            category: 'campaign',
            team: 'marketing',
            project: 'brand-refresh',
            tags: ['strategy', 'campaign', 'marketing'],
            similarity: 0.95,
            matchType: 'semantic',
            preview: 'This document outlines our comprehensive marketing campaign strategy for Q1 2024...',
            createdAt: '2024-01-15T10:30:00Z'
          },
          {
            id: 'demo-2',
            title: 'Brand Guidelines.docx',
            category: 'brand',
            team: 'creative',
            project: 'brand-refresh',
            tags: ['brand', 'guidelines', 'design'],
            similarity: 0.87,
            matchType: 'text',
            preview: 'Complete brand guidelines including logo usage, color palette, typography...',
            createdAt: '2024-01-10T14:20:00Z'
          }
        ],
        total: 2
      };
    }
  },

  // Get document details
  getDocument: async (id) => {
    try {
      const response = await api.get(`/documents/${id}`);
      return response.data;
    } catch (error) {
      // Mock response for demo
      console.log('Using mock document response');
      return {
        id: id,
        title: 'Demo Document.pdf',
        category: 'campaign',
        team: 'marketing',
        project: 'demo-project',
        tags: ['demo', 'marketing'],
        content: 'This is a demo document for the marketing search tool...',
        createdAt: new Date().toISOString()
      };
    }
  },

  // Get categories and metadata
  getCategories: async () => {
    try {
      const response = await api.get('/documents/meta/categories');
      return response.data;
    } catch (error) {
      // Mock response for demo
      console.log('Using mock categories response');
      return {
        categories: ['campaign', 'brand', 'social-media', 'email', 'content', 'analytics', 'strategy', 'creative'],
        teams: ['marketing', 'creative', 'content', 'analytics', 'social'],
        projects: ['brand-refresh', 'q1-campaign', 'product-launch', 'holiday-promo', 'demo-project']
      };
    }
  },

  // Get file URL
  getFileUrl: (id) => {
    return `${API_BASE_URL}/documents/file/${id}`;
  },

  // Preview document
  previewDocument: async (id) => {
    try {
      const response = await api.get(`/documents/preview/${id}`);
      return response.data;
    } catch (error) {
      // Mock response for demo
      console.log('Using mock preview response');
      return {
        content: 'This is a demo document preview. In a real implementation, this would show the actual document content extracted from the uploaded file. The marketing search tool uses AI to analyze and categorize documents automatically.',
        title: 'Demo Document Preview'
      };
    }
  },
};

export default api;