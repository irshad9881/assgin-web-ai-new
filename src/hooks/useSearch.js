import { useState, useCallback } from 'react';
import { useQuery } from 'react-query';
import { documentAPI } from '../services/api';

export const useSearch = () => {
  const [searchParams, setSearchParams] = useState({
    query: '',
    category: '',
    team: '',
    project: '',
    limit: 20
  });

  const {
    data: searchResults,
    isLoading,
    error,
    refetch
  } = useQuery(
    ['search', searchParams],
    () => documentAPI.searchDocuments(searchParams),
    {
      enabled: !!(searchParams.query || searchParams.category || searchParams.team || searchParams.project),
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  const search = useCallback((newParams) => {
    setSearchParams(prev => ({ ...prev, ...newParams }));
  }, []);

  const clearSearch = useCallback(() => {
    setSearchParams({
      query: '',
      category: '',
      team: '',
      project: '',
      limit: 20
    });
  }, []);

  return {
    searchParams,
    searchResults,
    isLoading,
    error,
    search,
    clearSearch,
    refetch
  };
};

export const useCategories = () => {
  return useQuery(
    'categories',
    documentAPI.getCategories,
    {
      staleTime: 30 * 60 * 1000, // 30 minutes
      cacheTime: 60 * 60 * 1000, // 1 hour
    }
  );
};

export const useDocument = (id) => {
  return useQuery(
    ['document', id],
    () => documentAPI.getDocument(id),
    {
      enabled: !!id,
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );
};