const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true,
    enum: ['pdf', 'docx', 'txt', 'xlsx', 'pptx', 'jpg', 'jpeg', 'png', 'gif']
  },
  fileSize: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['campaign', 'brand', 'social-media', 'email', 'content', 'analytics', 'strategy', 'creative']
  },
  team: {
    type: String,
    required: true
  },
  project: {
    type: String,
    default: 'general'
  },
  tags: [{
    type: String,
    trim: true
  }],
  embedding: [{
    type: Number
  }],
  metadata: {
    author: String,
    createdDate: Date,
    lastModified: Date,
    version: {
      type: String,
      default: '1.0'
    }
  },
  searchCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for efficient searching
documentSchema.index({ title: 'text', content: 'text', tags: 'text' });
documentSchema.index({ category: 1, team: 1 });
documentSchema.index({ project: 1 });
documentSchema.index({ createdAt: -1 });

// Virtual for file URL
documentSchema.virtual('fileUrl').get(function() {
  return `/api/documents/file/${this._id}`;
});

// Method to increment search count
documentSchema.methods.incrementSearchCount = function() {
  this.searchCount += 1;
  return this.save();
};

module.exports = mongoose.model('Document', documentSchema);