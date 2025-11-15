// Document categories
export const DOCUMENT_CATEGORIES = [
  'campaign',
  'brand', 
  'social-media',
  'email',
  'content',
  'analytics',
  'strategy',
  'creative'
];

// File types supported
export const SUPPORTED_FILE_TYPES = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'text/plain': 'txt',
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/gif': 'image'
};

// Search result structure
export const SearchResult = {
  id: '',
  title: '',
  category: '',
  team: '',
  project: '',
  tags: [],
  fileType: '',
  fileSize: 0,
  createdAt: '',
  similarity: 0,
  matchType: '', // 'semantic' | 'text'
  preview: '',
  searchCount: 0
};

// Document structure
export const Document = {
  id: '',
  title: '',
  content: '',
  category: '',
  team: '',
  project: '',
  tags: [],
  fileType: '',
  fileSize: 0,
  filePath: '',
  embedding: [],
  metadata: {
    author: '',
    createdDate: '',
    lastModified: '',
    version: ''
  },
  createdAt: '',
  updatedAt: '',
  searchCount: 0,
  isActive: true
};

// API Response structures
export const ApiResponse = {
  success: true,
  data: null,
  error: null,
  message: ''
};

export const SearchResponse = {
  query: '',
  results: [],
  total: 0,
  filters: {
    category: '',
    team: '',
    project: ''
  }
};

export const CategoriesResponse = {
  categories: [],
  teams: [],
  projects: []
};