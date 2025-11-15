const validateSearch = (req, res, next) => {
  const { query, limit, category, team, project } = req.query;

  // Allow search with filters only (no query required)
  if (query && query.trim().length === 0) {
    return res.status(400).json({ error: 'Search query cannot be empty' });
  }

  // If no query and no filters, require at least something
  if (!query && !category && !team && !project) {
    return res.status(400).json({ error: 'Search query or filters required' });
  }

  if (query && query.length > 500) {
    return res.status(400).json({ error: 'Search query too long (max 500 characters)' });
  }

  if (limit && (isNaN(limit) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
    return res.status(400).json({ error: 'Limit must be between 1 and 100' });
  }

  next();
};

const validateUpload = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { team, project, category } = req.body;
  
  // Validate category if provided
  const validCategories = ['campaign', 'brand', 'social-media', 'email', 'content', 'analytics', 'strategy', 'creative'];
  if (category && !validCategories.includes(category)) {
    return res.status(400).json({ 
      error: 'Invalid category',
      validCategories 
    });
  }

  // Validate team name if provided
  if (team && (team.length < 2 || team.length > 50)) {
    return res.status(400).json({ error: 'Team name must be between 2 and 50 characters' });
  }

  // Validate project name if provided
  if (project && (project.length < 2 || project.length > 100)) {
    return res.status(400).json({ error: 'Project name must be between 2 and 100 characters' });
  }

  next();
};

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large' });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ error: 'Unexpected file field' });
  }

  // MongoDB errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  // Default error
  res.status(500).json({ error: 'Internal server error' });
};

module.exports = {
  validateSearch,
  validateUpload,
  errorHandler
};