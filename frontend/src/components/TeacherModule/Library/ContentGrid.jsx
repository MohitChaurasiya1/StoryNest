import React from 'react';
import { useNavigate } from 'react-router-dom';
import ContentCard from './ContentCard';
import { FaBookOpen, FaSearch, FaPlus, FaFilter } from 'react-icons/fa';

const ContentGrid = ({ content, loading, onPreview, filters, onClearFilters }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="grid-3">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="card p-0 overflow-hidden flex flex-col h-[320px] animate-pulse">
            <div className="bg-slate-200 dark:bg-slate-800 h-[140px] w-full" />
            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="bg-slate-200 dark:bg-slate-800 h-5 w-3/4 rounded-lg" />
                <div className="bg-slate-100 dark:bg-slate-800/60 h-3.5 w-full rounded-md" />
                <div className="bg-slate-100 dark:bg-slate-800/60 h-3.5 w-2/3 rounded-md" />
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="bg-slate-200 dark:bg-slate-800 h-8 w-24 rounded-xl" />
                <div className="bg-slate-100 dark:bg-slate-800 h-8 w-8 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const hasActiveFilters = Boolean(
    filters?.search || 
    filters?.grade || 
    filters?.created_by_me || 
    (filters?.type && filters?.type !== 'all')
  );

  if (content.length === 0) {
    return (
      <div className="card text-center py-10 px-6 max-w-xl mx-auto shadow-sm border border-slate-200/80 dark:border-slate-800 animate-fade-in">
        <div className="w-14 h-14 rounded-3xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center text-2xl mx-auto mb-3.5 shadow-inner">
          {hasActiveFilters ? <FaSearch /> : <FaBookOpen />}
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">
          {hasActiveFilters ? 'No Matching Content Found' : 'Your Library is Ready for Stories'}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5 leading-relaxed">
          {hasActiveFilters 
            ? 'No stories, lessons, or quizzes match your current filters. Try changing or clearing your search criteria.' 
            : 'Explore, author custom stories with AI, or build lessons for your classroom.'}
        </p>
        <div className="flex justify-center gap-3">
          {hasActiveFilters ? (
            <button 
              type="button"
              className="btn btn-secondary text-sm flex items-center gap-2"
              onClick={onClearFilters}
            >
              <FaFilter /> Clear Filters
            </button>
          ) : (
            <button 
              type="button"
              className="btn btn-primary text-sm flex items-center gap-2"
              onClick={() => navigate('/teacher/library/create-story')}
            >
              <FaPlus /> Create Story
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Content Count Bar */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 px-1">
        <div>
          Showing <span className="text-slate-900 dark:text-white font-extrabold">{content.length}</span> {content.length === 1 ? 'item' : 'items'}
          {filters?.type && filters.type !== 'all' && (
            <span className="ml-1 text-rose-500 capitalize font-bold">({filters.type}s)</span>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid-3">
        {content.map(item => (
          <ContentCard key={`${item.type}-${item.id}`} item={item} onPreview={onPreview} />
        ))}
      </div>
    </div>
  );
};

export default ContentGrid;
