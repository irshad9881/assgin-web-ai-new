import React, { useState } from 'react';
import { FileText, Download, Eye, Calendar, Users, Tag, Zap } from 'lucide-react';
import { documentAPI } from '../services/api';
import DocumentPreview from './DocumentPreview';
import { useDocument } from '../hooks/useSearch';

const SearchResults = ({ results, isLoading, query }) => {
  const [previewDocId, setPreviewDocId] = useState(null);
  const { data: previewDoc } = useDocument(previewDocId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {query ? 'No documents found' : 'Start searching'}
        </h3>
        <p className="text-gray-500">
          {query 
            ? 'Try adjusting your search terms or filters'
            : 'Enter a search query to find marketing documents'
          }
        </p>
      </div>
    );
  }

  const getFileIcon = (fileType) => {
    const icons = {
      pdf: '📄',
      docx: '📝',
      xlsx: '📊',
      pptx: '📊',
      txt: '📄',
      image: '🖼️'
    };
    return icons[fileType] || '📄';
  };

  const getCategoryColor = (category) => {
    const colors = {
      campaign: 'bg-purple-100 text-purple-800',
      brand: 'bg-blue-100 text-blue-800',
      'social-media': 'bg-pink-100 text-pink-800',
      email: 'bg-green-100 text-green-800',
      content: 'bg-yellow-100 text-yellow-800',
      analytics: 'bg-indigo-100 text-indigo-800',
      strategy: 'bg-red-100 text-red-800',
      creative: 'bg-orange-100 text-orange-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handlePreview = (document) => {
    setPreviewDocId(document.id);
  };

  const handleDownload = (document) => {
    const fileUrl = documentAPI.getFileUrl(document.id);
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = document.title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Found {results.length} document{results.length !== 1 ? 's' : ''}
          {query && ` for "${query}"`}
        </p>
      </div>

      {results.map((document) => (
        <div
          key={document.id}
          className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{getFileIcon(document.fileType)}</span>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {document.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(document.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {document.team}
                    </span>
                    <span>{formatFileSize(document.fileSize)}</span>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <p className="text-gray-700 mb-4 leading-relaxed">
                {document.preview}
              </p>

              {/* Tags and Category */}
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(document.category)}`}>
                  {document.category}
                </span>
                {document.project !== 'general' && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                    {document.project}
                  </span>
                )}
                {document.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-50 text-gray-600 rounded text-xs flex items-center gap-1"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>

              {/* Match Info */}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {Math.round(document.similarity * 100)}% match
                </span>
                <span>{document.matchType === 'semantic' ? 'AI Match' : 'Text Match'}</span>
                <span>{document.searchCount} searches</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 ml-4">
              <button
                onClick={() => handlePreview(document)}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <button
                onClick={() => handleDownload(document)}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>
        </div>
      ))}
      
      <DocumentPreview
        document={previewDoc}
        isOpen={!!previewDocId}
        onClose={() => setPreviewDocId(null)}
      />
    </div>
  );
};

export default SearchResults;