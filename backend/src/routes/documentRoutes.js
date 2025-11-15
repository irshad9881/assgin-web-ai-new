const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const upload = require('../config/multer');
const { validateSearch, validateUpload } = require('../middleware/validation');

// Upload document
router.post('/upload', 
  upload.single('document'), 
  validateUpload,
  documentController.uploadDocument
);

// Search documents
router.get('/search', 
  validateSearch,
  documentController.searchDocuments
);

// Get document details
router.get('/:id', documentController.getDocument);

// Get categories, teams, and projects
router.get('/meta/categories', documentController.getCategories);

// Serve file
router.get('/file/:id', documentController.getFile);

// Preview document
router.get('/preview/:id', documentController.previewDocument);

module.exports = router;