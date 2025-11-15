import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, File, CheckCircle, AlertCircle } from 'lucide-react';
import { useMutation, useQueryClient } from 'react-query';
import { documentAPI } from '../services/api';
import toast from 'react-hot-toast';

const UploadModal = ({ isOpen, onClose }) => {
  const [uploadData, setUploadData] = useState({
    team: '',
    project: '',
    category: ''
  });

  const queryClient = useQueryClient();

  const uploadMutation = useMutation(documentAPI.uploadDocument, {
    onSuccess: (data) => {
      toast.success('Document uploaded successfully!');
      queryClient.invalidateQueries('categories');
      onClose();
      setUploadData({ team: '', project: '', category: '' });
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Upload failed');
    }
  });

  const { getRootProps, getInputProps, acceptedFiles, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'text/plain': ['.txt'],
      'image/*': ['.jpg', '.jpeg', '.png', '.gif']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (acceptedFiles.length === 0) {
      toast.error('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('document', acceptedFiles[0]);
    formData.append('team', uploadData.team);
    formData.append('project', uploadData.project);
    formData.append('category', uploadData.category);

    uploadMutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Upload Document</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Drop Zone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document File
              </label>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                {isDragActive ? (
                  <p className="text-primary-600">Drop the file here...</p>
                ) : (
                  <div>
                    <p className="text-gray-600 mb-2">
                      Drag & drop a document here, or click to select
                    </p>
                    <p className="text-sm text-gray-500">
                      Supports PDF, DOCX, XLSX, PPTX, TXT, and images (max 10MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Selected File */}
              {acceptedFiles.length > 0 && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <p className="font-medium text-green-900">
                      {acceptedFiles[0].name}
                    </p>
                    <p className="text-sm text-green-700">
                      {(acceptedFiles[0].size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Metadata Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team
                </label>
                <input
                  type="text"
                  value={uploadData.team}
                  onChange={(e) => setUploadData(prev => ({ ...prev, team: e.target.value }))}
                  placeholder="e.g., Creative, Content, Social"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project
                </label>
                <input
                  type="text"
                  value={uploadData.project}
                  onChange={(e) => setUploadData(prev => ({ ...prev, project: e.target.value }))}
                  placeholder="e.g., Q4 Campaign, Brand Refresh"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category (Optional)
              </label>
              <select
                value={uploadData.category}
                onChange={(e) => setUploadData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Auto-detect category</option>
                <option value="campaign">Campaign</option>
                <option value="brand">Brand</option>
                <option value="social-media">Social Media</option>
                <option value="email">Email</option>
                <option value="content">Content</option>
                <option value="analytics">Analytics</option>
                <option value="strategy">Strategy</option>
                <option value="creative">Creative</option>
              </select>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Smart Processing</p>
                  <p>
                    Your document will be automatically processed with AI to extract content,
                    generate searchable embeddings, and categorize based on content analysis.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploadMutation.isLoading || acceptedFiles.length === 0}
                className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {uploadMutation.isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload Document
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;