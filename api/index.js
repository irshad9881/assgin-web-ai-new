// Vercel serverless function entry point
require('dotenv').config();
const mongoose = require('mongoose');
const multer = require('multer');
const { processDocument } = require('../backend/src/services/documentProcessor');
const { searchDocuments, categorizeDocument } = require('../backend/src/services/aiService');
const Document = require('../backend/src/models/Document');

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Connect to MongoDB
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
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
    
    // Categories endpoint - get from database
    if (url === '/api/documents/meta/categories') {
      const categories = await Document.distinct('category');
      const teams = await Document.distinct('team');
      const projects = await Document.distinct('project');
      
      return res.json({
        categories: categories.length ? categories : ['campaign', 'brand', 'social-media', 'email', 'content', 'analytics', 'strategy', 'creative'],
        teams: teams.length ? teams : ['marketing', 'creative', 'content', 'analytics', 'social'],
        projects: projects.length ? projects : ['brand-refresh', 'q1-campaign', 'product-launch', 'holiday-promo']
      });
    }
    
    // Upload endpoint
    if (url === '/api/documents/upload' && method === 'POST') {
      return new Promise((resolve) => {
        upload.single('file')(req, res, async (err) => {
          if (err) {
            return res.status(400).json({ error: 'File upload error', message: err.message });
          }
          
          try {
            const { team, project, category } = req.body;
            const file = req.file;
            
            if (!file) {
              return res.status(400).json({ error: 'No file uploaded' });
            }
            
            // Process document
            const content = await processDocument(file);
            
            // AI categorization
            const aiCategory = category || await categorizeDocument(content, file.originalname);
            
            // Create document
            const document = new Document({
              title: file.originalname,
              content,
              category: aiCategory,
              team: team || 'marketing',
              project: project || 'general',
              tags: [],
              filePath: `/uploads/${file.filename}`,
              fileSize: file.size,
              mimeType: file.mimetype
            });
            
            await document.save();
            
            res.json({
              success: true,
              document: {
                id: document._id,
                title: document.title,
                category: document.category,
                team: document.team,
                project: document.project,
                tags: document.tags,
                createdAt: document.createdAt
              }
            });
            resolve();
          } catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({ error: 'Upload failed', message: error.message });
            resolve();
          }
        });
      });
    }
    
    // Search endpoint
    if (url.startsWith('/api/documents/search')) {
      const query = new URL(url, 'http://localhost').searchParams.get('query') || '';
      const category = new URL(url, 'http://localhost').searchParams.get('category');
      const team = new URL(url, 'http://localhost').searchParams.get('team');
      const project = new URL(url, 'http://localhost').searchParams.get('project');
      
      const results = await searchDocuments({
        query,
        category,
        team,
        project
      });
      
      return res.json(results);
    }
    
    // Document details endpoint
    if (url.match(/\/api\/documents\/[^/]+$/) && method === 'GET') {
      const docId = url.split('/').pop();
      const document = await Document.findById(docId);
      
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }
      
      return res.json(document);
    }
    
    // Document preview endpoint
    if (url.match(/\/api\/documents\/preview\/[^/]+$/) && method === 'GET') {
      const docId = url.split('/').pop();
      const document = await Document.findById(docId);
      
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }
      
      return res.json({
        content: document.content || 'No content available',
        title: document.title
      });
    }
    
    // Default response
    console.log('Unhandled endpoint:', url, method);
    res.status(404).json({ error: 'Endpoint not found', url, method });
    
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};