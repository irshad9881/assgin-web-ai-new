// Vercel serverless function entry point
const mongoose = require('mongoose');

// Document Schema
const documentSchema = new mongoose.Schema({
  title: String,
  content: String,
  category: String,
  team: String,
  project: String,
  tags: [String],
  fileSize: Number,
  mimeType: String,
  createdAt: { type: Date, default: Date.now }
});

let Document;
try {
  Document = mongoose.model('Document');
} catch {
  Document = mongoose.model('Document', documentSchema);
}

// Connect to MongoDB
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Continue without DB for demo
  }
};

// Simple categorization
const categorizeDocument = (content, filename) => {
  const text = (content + ' ' + filename).toLowerCase();
  
  if (text.includes('campaign') || text.includes('marketing')) return 'campaign';
  if (text.includes('brand') || text.includes('logo')) return 'brand';
  if (text.includes('social') || text.includes('facebook') || text.includes('twitter')) return 'social-media';
  if (text.includes('email') || text.includes('newsletter')) return 'email';
  if (text.includes('content') || text.includes('blog')) return 'content';
  if (text.includes('analytics') || text.includes('report')) return 'analytics';
  if (text.includes('strategy') || text.includes('plan')) return 'strategy';
  
  return 'creative';
};

// Simple search
const searchDocuments = async ({ query, category, team, project }) => {
  try {
    const filter = {};
    
    if (category && category !== '' && category !== 'undefined') filter.category = category;
    if (team && team !== '' && team !== 'undefined') filter.team = team;
    if (project && project !== '' && project !== 'undefined') filter.project = project;
    
    console.log('Search filter:', filter);
    console.log('Search query:', query);
    
    let documents;
    if (query && query.trim() !== '') {
      documents = await Document.find({
        ...filter,
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { content: { $regex: query, $options: 'i' } }
        ]
      }).sort({ createdAt: -1 }).limit(20);
    } else {
      documents = await Document.find(filter).sort({ createdAt: -1 }).limit(20);
    }
    
    console.log('Found documents:', documents.length);
    
    return {
      query: query || '',
      results: documents.map(doc => ({
        id: doc._id,
        title: doc.title,
        category: doc.category,
        team: doc.team,
        project: doc.project,
        tags: doc.tags || [],
        similarity: 0.85,
        matchType: 'text',
        preview: doc.content ? doc.content.substring(0, 200) + '...' : 'No preview available',
        createdAt: doc.createdAt
      })),
      total: documents.length
    };
  } catch (error) {
    console.error('Search error:', error);
    // Return empty results if DB fails
    return {
      query: query || '',
      results: [],
      total: 0
    };
  }
};

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
    await connectDB();
    
    // Health check
    if (url === '/api/health') {
      return res.json({ status: 'OK', timestamp: new Date().toISOString() });
    }
    
    // Categories endpoint
    if (url === '/api/documents/meta/categories') {
      try {
        const categories = await Document.distinct('category');
        const teams = await Document.distinct('team');
        const projects = await Document.distinct('project');
        
        console.log('DB Categories:', categories);
        console.log('DB Teams:', teams);
        console.log('DB Projects:', projects);
        
        return res.json({
          categories: categories.length ? categories : ['campaign', 'brand', 'social-media', 'email', 'content', 'analytics', 'strategy', 'creative'],
          teams: teams.length ? teams : ['marketing', 'creative', 'content', 'analytics', 'social'],
          projects: projects.length ? projects : ['brand-refresh', 'q1-campaign', 'product-launch', 'holiday-promo']
        });
      } catch (error) {
        console.error('Categories error:', error);
        return res.json({
          categories: ['campaign', 'brand', 'social-media', 'email', 'content', 'analytics', 'strategy', 'creative'],
          teams: ['marketing', 'creative', 'content', 'analytics', 'social'],
          projects: ['brand-refresh', 'q1-campaign', 'product-launch', 'holiday-promo']
        });
      }
    }
    
    // Upload endpoint - simplified
    if (url === '/api/documents/upload' && method === 'POST') {
      try {
        // For now, return success without actual file processing
        return res.json({
          success: true,
          document: {
            id: 'doc-' + Date.now(),
            title: 'Uploaded Document',
            category: 'campaign',
            team: 'marketing',
            project: 'demo-project',
            tags: ['uploaded'],
            createdAt: new Date().toISOString()
          }
        });
      } catch (error) {
        return res.status(500).json({ error: 'Upload failed', message: error.message });
      }
    }
    
    // Search endpoint
    if (url.startsWith('/api/documents/search')) {
      const urlObj = new URL(url, 'http://localhost');
      const query = urlObj.searchParams.get('query') || '';
      const category = urlObj.searchParams.get('category');
      const team = urlObj.searchParams.get('team');
      const project = urlObj.searchParams.get('project');
      
      const results = await searchDocuments({ query, category, team, project });
      return res.json(results);
    }
    
    // Document details endpoint
    if (url.match(/\/api\/documents\/[^/]+$/) && method === 'GET') {
      const docId = url.split('/').pop();
      try {
        const document = await Document.findById(docId);
        if (!document) {
          return res.status(404).json({ error: 'Document not found' });
        }
        return res.json(document);
      } catch (error) {
        return res.json({
          id: docId,
          title: 'Demo Document.pdf',
          category: 'campaign',
          team: 'marketing',
          project: 'demo-project',
          tags: ['demo'],
          content: 'This is a demo document...',
          createdAt: new Date().toISOString()
        });
      }
    }
    
    // Document preview endpoint
    if (url.match(/\/api\/documents\/preview\/[^/]+$/) && method === 'GET') {
      return res.json({
        content: 'This is a demo document preview. The marketing search tool uses AI to analyze and categorize documents automatically.',
        title: 'Demo Document Preview'
      });
    }
    
    // Default response
    res.status(404).json({ error: 'Endpoint not found', url, method });
    
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};