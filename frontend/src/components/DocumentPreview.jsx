import React from 'react';
import { X, Download, Calendar, Users, Tag } from 'lucide-react';
import { documentAPI } from '../services/api';

const DocumentPreview = ({ document, isOpen, onClose }) => {
  if (!isOpen || !document) return null;

  const handleDownload = () => {
    const fileUrl = documentAPI.getFileUrl(document.id);
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = document.title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {document.title}
            </h2>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(document.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {document.team}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(document.category)}`}>
                {document.category}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Tags */}
          {document.tags && document.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {document.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center gap-1"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Document Content */}
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {document.content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreview;