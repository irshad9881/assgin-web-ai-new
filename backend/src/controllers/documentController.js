const Document = require('../models/Document');
const aiService = require('../services/aiService');
const documentProcessor = require('../services/documentProcessor');
const mockDatabase = require('../services/mockDatabase');
const fs = require('fs').promises;
const path = require('path');
const mongoose = require('mongoose');

class DocumentController {
  async uploadDocument(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const { team, project, category } = req.body;
      const file = req.file;

      // Extract content from file
      const fileType = path.extname(file.originalname).slice(1).toLowerCase();
      const content = await documentProcessor.extractContent(file.path, fileType);

      // Auto-categorize if not provided
      const finalCategory = category || documentProcessor.categorizeDocument(file.originalname, content);
      const finalTeam = team || documentProcessor.extractTeamFromPath(file.path);
      const tags = documentProcessor.extractTags(content, file.originalname);

      // Generate embedding
      const embedding = await aiService.generateEmbedding(content);

      // Create document record
      const docData = {
        title: file.originalname,
        content,
        filePath: file.path,
        fileType,
        fileSize: file.size,
        category: finalCategory,
        team: finalTeam,
        project: project || 'general',
        tags,
        embedding,
        metadata: {
          createdDate: new Date(),
          lastModified: new Date()
        }
      };

      let document;
      if (mongoose.connection.readyState === 1) {
        // MongoDB is connected
        const mongoDoc = new Document(docData);
        document = await mongoDoc.save();
      } else {
        // Use mock database
        document = await mockDatabase.saveDocument(docData);
      }

      res.status(201).json({
        message: 'Document uploaded and indexed successfully',
        document: {
          id: document._id,
          title: document.title,
          category: document.category,
          team: document.team,
          project: document.project,
          tags: document.tags,
          fileType: document.fileType,
          fileSize: document.fileSize,
          createdAt: document.createdAt
        }
      });

    } catch (error) {
      console.error('Upload error:', error);
      
      // Clean up uploaded file if processing failed
      if (req.file && req.file.path) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.error('Failed to clean up file:', unlinkError);
        }
      }
      
      res.status(500).json({ 
        error: error.message || 'Failed to upload and process document',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  async searchDocuments(req, res) {
    try {
      const { query, category, team, project, limit = 20 } = req.query;
      
      // Debug logging
      console.log('Search request:', { query, category, team, project });

      // Allow search with filters only
      if (!query && !category && !team && !project) {
        return res.status(400).json({ error: 'Search query or filters required' });
      }

      // Enhance query with AI (if query exists)
      const enhancedQuery = query ? await aiService.enhanceSearchQuery(query) : '';
      
      // Generate embedding for search query (if query exists)
      const queryEmbedding = query ? await aiService.generateEmbedding(enhancedQuery) : null;

      // Build filter
      const filter = {};
      if (category) filter.category = category;
      if (team) filter.team = team;
      if (project) filter.project = project;

      // Get documents from database
      let documents;
      if (mongoose.connection.readyState === 1) {
        const mongoFilter = { ...filter, isActive: true };
        documents = await Document.find(mongoFilter)
          .select('title content category team project tags fileType fileSize createdAt embedding searchCount')
          .limit(parseInt(limit) * 2);
      } else {
        documents = await mockDatabase.findDocuments(filter);
      }

      // Find similar documents using AI (only if query exists)
      const similarDocuments = queryEmbedding ? await aiService.findSimilarDocuments(
        queryEmbedding, 
        documents, 
        0.5 // Higher threshold for more precise results
      ) : [];

      // If no query but filters exist, return filtered documents
      if (!query && (category || team || project)) {
        const results = documents.map(doc => ({
          ...doc.toObject ? doc.toObject() : doc,
          similarity: 1.0,
          matchType: 'filter'
        }));

        return res.json({
          query: '',
          results: results.map(doc => ({
            id: doc._id,
            title: doc.title,
            category: doc.category,
            team: doc.team,
            project: doc.project,
            tags: doc.tags,
            fileType: doc.fileType,
            fileSize: doc.fileSize,
            createdAt: doc.createdAt,
            similarity: doc.similarity,
            matchType: doc.matchType,
            preview: doc.content.substring(0, 200) + '...',
            searchCount: doc.searchCount || 0
          })),
          total: results.length
        });
      }

      // Also perform text search as fallback
      let textSearchResults;
      if (mongoose.connection.readyState === 1) {
        textSearchResults = await Document.find({
          ...filter,
          isActive: true,
          $text: { $search: query }
        })
        .select('title content category team project tags fileType fileSize createdAt searchCount')
        .limit(parseInt(limit));
      } else {
        textSearchResults = await mockDatabase.textSearch(query, filter);
      }

      // Combine and deduplicate results
      const combinedResults = new Map();
      
      // Add similarity results
      similarDocuments.slice(0, parseInt(limit)).forEach(item => {
        const docId = item.document._id || item.document.id;
        const docData = item.document.toObject ? item.document.toObject() : item.document;
        combinedResults.set(docId.toString(), {
          ...docData,
          similarity: item.similarity,
          matchType: 'semantic'
        });
      });

      // Add text search results
      textSearchResults.forEach(doc => {
        const docId = doc._id || doc.id;
        const docData = doc.toObject ? doc.toObject() : doc;
        const id = docId.toString();
        if (!combinedResults.has(id)) {
          combinedResults.set(id, {
            ...docData,
            similarity: 0.5,
            matchType: 'text'
          });
        }
      });

      const results = Array.from(combinedResults.values())
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, parseInt(limit));

      // Update search counts (only for MongoDB)
      if (mongoose.connection.readyState === 1) {
        const docIds = results.map(doc => doc._id);
        await Document.updateMany(
          { _id: { $in: docIds } },
          { $inc: { searchCount: 1 } }
        );
      }

      res.json({
        query: enhancedQuery,
        results: results.map(doc => ({
          id: doc._id,
          title: doc.title,
          category: doc.category,
          team: doc.team,
          project: doc.project,
          tags: doc.tags,
          fileType: doc.fileType,
          fileSize: doc.fileSize,
          createdAt: doc.createdAt,
          similarity: doc.similarity,
          matchType: doc.matchType,
          preview: doc.content.substring(0, 200) + '...',
          searchCount: doc.searchCount
        })),
        total: results.length
      });

    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ error: 'Search failed' });
    }
  }

  async getDocument(req, res) {
    try {
      const document = await Document.findById(req.params.id);
      
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      res.json({
        id: document._id,
        title: document.title,
        content: document.content,
        category: document.category,
        team: document.team,
        project: document.project,
        tags: document.tags,
        fileType: document.fileType,
        fileSize: document.fileSize,
        metadata: document.metadata,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
        searchCount: document.searchCount,
        fileUrl: document.fileUrl
      });

    } catch (error) {
      console.error('Get document error:', error);
      res.status(500).json({ error: 'Failed to retrieve document' });
    }
  }

  async getCategories(req, res) {
    try {
      let result;
      if (mongoose.connection.readyState === 1) {
        const categories = await Document.aggregate([
          { $match: { isActive: true } },
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]);

        const teams = await Document.aggregate([
          { $match: { isActive: true } },
          { $group: { _id: '$team', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]);

        const projects = await Document.aggregate([
          { $match: { isActive: true } },
          { $group: { _id: '$project', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]);

        result = {
          categories: categories.map(c => ({ name: c._id, count: c.count })),
          teams: teams.map(t => ({ name: t._id, count: t.count })),
          projects: projects.map(p => ({ name: p._id, count: p.count }))
        };
      } else {
        result = await mockDatabase.getCategories();
      }

      res.json(result);

    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({ error: 'Failed to retrieve categories' });
    }
  }

  async getFile(req, res) {
    try {
      const document = await Document.findById(req.params.id);
      
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      const filePath = document.filePath;
      const stat = await fs.stat(filePath);
      
      res.setHeader('Content-Type', this.getContentType(document.fileType));
      res.setHeader('Content-Length', stat.size);
      res.setHeader('Content-Disposition', `inline; filename="${document.title}"`);
      
      const fileStream = require('fs').createReadStream(filePath);
      fileStream.pipe(res);

    } catch (error) {
      console.error('Get file error:', error);
      res.status(500).json({ error: 'Failed to retrieve file' });
    }
  }

  async previewDocument(req, res) {
    try {
      const document = await Document.findById(req.params.id);
      
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      res.json({
        id: document._id,
        title: document.title,
        content: document.content,
        fileType: document.fileType,
        category: document.category,
        team: document.team,
        project: document.project,
        tags: document.tags,
        createdAt: document.createdAt
      });

    } catch (error) {
      console.error('Preview error:', error);
      res.status(500).json({ error: 'Failed to preview document' });
    }
  }

  getContentType(fileType) {
    const types = {
      'pdf': 'application/pdf',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'txt': 'text/plain',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif'
    };
    return types[fileType] || 'application/octet-stream';
  }
}

module.exports = new DocumentController();