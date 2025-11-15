import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { Search, Upload, FileText, Zap } from 'lucide-react';

import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import UploadModal from './components/UploadModal';
import { useSearch } from './hooks/useSearch';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const { searchParams, searchResults, isLoading, search, clearSearch } = useSearch();

  const handleSearch = (newParams) => {
    search(newParams);
  };

  const handleClearFilters = () => {
    clearSearch();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-600 rounded-lg">
                <Search className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Marketing Search
                </h1>
                <p className="text-sm text-gray-500">
                  AI-powered document discovery
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              <Upload className="w-4 h-4" />
              Upload Document
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        {!searchParams.query && (
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Zap className="w-8 h-8 text-primary-600" />
              <h2 className="text-3xl font-bold text-gray-900">
                Smart Document Search
              </h2>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Find marketing documents instantly with AI-powered semantic search.
              Upload, organize, and discover your content with intelligent categorization.
            </p>
            
            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">AI-Powered Search</h3>
                <p className="text-gray-600 text-sm">
                  Semantic search understands context and meaning, not just keywords
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Auto-Categorization</h3>
                <p className="text-gray-600 text-sm">
                  Documents are automatically organized by topic, team, and project
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Multi-Format Support</h3>
                <p className="text-gray-600 text-sm">
                  PDF, DOCX, XLSX, PPTX, TXT, and image files supported
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search Interface */}
        <div className="mb-8">
          <SearchBar
            onSearch={handleSearch}
            searchParams={searchParams}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Search Results */}
        <SearchResults
          results={searchResults?.results}
          isLoading={isLoading}
          query={searchParams.query}
        />
      </main>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;