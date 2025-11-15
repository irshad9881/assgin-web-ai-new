// Vercel serverless function entry point
require('dotenv').config();

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { url, method } = req;
  
  try {
    // Health check
    if (url === '/api/health') {
      return res.json({ status: 'OK', timestamp: new Date().toISOString() });
    }
    
    // Categories endpoint
    if (url === '/api/documents/meta/categories') {
      return res.json({
        categories: ['campaign', 'brand', 'social-media', 'email', 'content', 'analytics', 'strategy', 'creative'],
        teams: ['marketing', 'creative', 'content', 'analytics', 'social'],
        projects: ['brand-refresh', 'q1-campaign', 'product-launch', 'holiday-promo']
      });
    }
    
    // Upload endpoint
    if (url === '/api/documents/upload' && method === 'POST') {
      return res.json({
        success: true,
        document: {
          id: 'doc-' + Date.now(),
          title: 'Uploaded Document',
          category: 'campaign',
          team: 'marketing',
          project: 'demo-project',
          tags: ['uploaded', 'demo'],
          createdAt: new Date().toISOString()
        }
      });
    }
    
    // Search endpoint
    if (url.startsWith('/api/documents/search')) {
      return res.json({
        query: 'demo search',
        results: [
          {
            id: 'demo-1',
            title: 'Marketing Strategy.pdf',
            category: 'campaign',
            team: 'marketing',
            project: 'brand-refresh',
            tags: ['strategy', 'marketing'],
            similarity: 0.95,
            matchType: 'semantic',
            preview: 'Marketing strategy document...',
            createdAt: new Date().toISOString()
          }
        ],
        total: 1
      });
    }
    
    // Default response
    res.status(404).json({ error: 'Endpoint not found' });
    
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};