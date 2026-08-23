import React, { useState, useEffect, useCallback } from 'react';
import teacherLibraryService from '../../../services/teacherLibraryService';
import LibraryHeader from './LibraryHeader';
import LibraryFilters from './LibraryFilters';
import ContentGrid from './ContentGrid';
import ContentPreviewModal from './ContentPreviewModal';
import { FaSpinner, FaExclamationTriangle } from 'react-icons/fa';

const LibraryPage = () => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters State
  const [filters, setFilters] = useState({
    type: 'all',
    search: '',
    grade: '',
    created_by_me: false,
  });
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  
  // Modal State
  const [previewItem, setPreviewItem] = useState(null);

  const fetchLibraryContent = useCallback(async (isLoadMore = false) => {
    try {
      if (!isLoadMore) {
        setLoading(true);
      }
      
      const currentFilters = {
        type: filters.type,
        search: filters.search,
        grade: filters.grade,
        created_by_me: filters.created_by_me
      };
      
      const response = await teacherLibraryService.getContent(currentFilters, page);
      
      if (isLoadMore) {
        setContent(prev => [...prev, ...response.results]);
      } else {
        setContent(response.results);
      }
      
      setHasMore(!!response.next);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load library content.');
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchLibraryContent(page > 1);
  }, [fetchLibraryContent, page]);

  // Reset page when filters change
  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  const handleSearchChange = (searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
    setPage(1);
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
      <LibraryHeader />
      
      <LibraryFilters 
        filters={filters} 
        onFilterChange={handleFilterChange} 
        onSearchChange={handleSearchChange} 
      />
      
      {error && (
        <div className="card error-banner mb-6">
          <FaExclamationTriangle className="error-icon" />
          <div>
            <h4>Could not load library</h4>
            <p>{error}</p>
            <button onClick={() => fetchLibraryContent(false)} className="btn btn-secondary mt-2">
              Retry
            </button>
          </div>
        </div>
      )}
      
      {!error && (
        <ContentGrid 
          content={content} 
          loading={loading && page === 1} 
          onPreview={(item) => setPreviewItem(item)} 
        />
      )}
      
      {!loading && !error && hasMore && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => setPage(p => p + 1)}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
      
      {loading && page > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
          <FaSpinner className="spinner-icon" />
        </div>
      )}

      {previewItem && (
        <ContentPreviewModal 
          item={previewItem} 
          onClose={() => setPreviewItem(null)} 
        />
      )}
    </div>
  );
};

export default LibraryPage;
