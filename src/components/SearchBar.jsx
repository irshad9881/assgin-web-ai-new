import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { useCategories } from '../hooks/useSearch';

const SearchBar = ({ onSearch, searchParams, onClearFilters }) => {
  const [query, setQuery] = useState(searchParams.query || '');
  const [showFilters, setShowFilters] = useState(false);
  const { data: categories } = useCategories();

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ 
      query,
      category: searchParams.category,
      team: searchParams.team,
      project: searchParams.project
    });
  };

  const handleFilterChange = (key, value) => {
    onSearch({ [key]: value });
  };

  const hasActiveFilters = searchParams.category || searchParams.team || searchParams.project;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Main Search Bar */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search marketing documents, campaigns, strategies..."
            className="w-full pl-12 pr-20 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200 shadow-sm"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${
                showFilters || hasActiveFilters
                  ? 'bg-primary-100 text-primary-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Filter className="w-5 h-5" />
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Search
            </button>
          </div>
        </div>
      </form>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mt-4 p-4 bg-gray-50 rounded-xl border animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Filters</h3>
            {hasActiveFilters && (
              <button
                onClick={onClearFilters}
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Clear all
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={searchParams.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories?.categories?.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)} ({cat.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Team Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Team
              </label>
              <select
                value={searchParams.team || ''}
                onChange={(e) => handleFilterChange('team', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Teams</option>
                {categories?.teams?.map((team) => (
                  <option key={team.name} value={team.name}>
                    {team.name.charAt(0).toUpperCase() + team.name.slice(1)} ({team.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Project Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project
              </label>
              <select
                value={searchParams.project || ''}
                onChange={(e) => handleFilterChange('project', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Projects</option>
                {categories?.projects?.map((project) => (
                  <option key={project.name} value={project.name}>
                    {project.name.charAt(0).toUpperCase() + project.name.slice(1)} ({project.count})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;