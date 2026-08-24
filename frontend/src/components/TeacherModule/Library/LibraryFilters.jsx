import React, { useState, useEffect } from 'react';
import { 
  FaSearch, FaTimes, FaUser, 
  FaLayerGroup, FaBook, FaListAlt, FaQuestionCircle, FaFilter 
} from 'react-icons/fa';

const LibraryFilters = ({ filters, onFilterChange, onSearchChange }) => {
  const [localSearch, setLocalSearch] = useState(filters.search);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.search) {
        onSearchChange(localSearch);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [localSearch, filters.search, onSearchChange]);

  const tabs = [
    { id: 'all', label: 'All Content', icon: FaLayerGroup },
    { id: 'story', label: 'Stories', icon: FaBook },
    { id: 'lesson', label: 'Lessons', icon: FaListAlt },
    { id: 'quiz', label: 'Quizzes', icon: FaQuestionCircle }
  ];

  const grades = [
    'All Grades',
    'Preschool',
    'Kindergarten',
    'Grade 1',
    'Grade 2',
    'Grade 3',
    'Grade 4',
    'Grade 5'
  ];

  const hasActiveFilters = Boolean(
    filters.search || 
    filters.grade || 
    filters.created_by_me || 
    filters.type !== 'all'
  );

  const handleClearAll = () => {
    setLocalSearch('');
    onFilterChange({
      type: 'all',
      grade: '',
      created_by_me: false,
      search: ''
    });
    onSearchChange('');
  };

  return (
    <div className="space-y-4 mb-6">
      {/* 1. Cohesive Search & Filters Toolbar Card */}
      <div className="card p-4 sm:p-5 shadow-sm border border-slate-200/80 dark:border-slate-800">
        <div className="flex flex-col md:flex-row gap-3.5 items-stretch md:items-center justify-between">
          
          {/* Search Bar */}
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm" />
            <input 
              type="text" 
              placeholder="Search stories, lessons, quizzes by title or keyword..." 
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-11 pr-10 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
            />
            {localSearch && (
              <button 
                type="button"
                onClick={() => {
                  setLocalSearch('');
                  onSearchChange('');
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center text-xs hover:bg-slate-300 transition-colors"
                title="Clear search"
              >
                <FaTimes />
              </button>
            )}
          </div>

          {/* Controls: Grade Filter & My Content Switch */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Grade Filter */}
            <div className="relative min-w-[150px]">
              <select 
                value={filters.grade || 'All Grades'} 
                onChange={(e) => onFilterChange({ grade: e.target.value === 'All Grades' ? '' : e.target.value })}
                className="w-full pl-3.5 pr-8 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer appearance-none transition-all"
              >
                {grades.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                ▼
              </div>
            </div>

            {/* My Content Only Toggle Pill */}
            <button
              type="button"
              onClick={() => onFilterChange({ created_by_me: !filters.created_by_me })}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold border transition-all cursor-pointer select-none ${
                filters.created_by_me
                  ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 shadow-sm'
                  : 'bg-slate-50/70 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <FaUser className="text-xs" />
              <span>My Content Only</span>
              {filters.created_by_me && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>

            {/* Clear Filters Reset Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs font-bold text-slate-500 hover:text-rose-500 px-2 py-1 transition-colors"
                title="Reset all filters"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* 2. Type Tabs: Filled StoryNest Accent / Pill Background with Explicit Styles */}
        <div className="flex flex-wrap gap-2.5 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = filters.type === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onFilterChange({ type: tab.id })}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-extrabold transition-all cursor-pointer select-none"
                style={isActive ? {
                  background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
                  color: '#FFFFFF',
                  boxShadow: '0 4px 14px rgba(255, 107, 107, 0.35)',
                  transform: 'translateY(-1px)',
                  border: '1.5px solid transparent'
                } : {
                  background: 'var(--surface-color, #F8FAFC)',
                  color: 'var(--text-secondary, #475569)',
                  border: '1.5px solid var(--border-color, #E2E8F0)'
                }}
              >
                <Icon style={{ color: isActive ? '#FFFFFF' : '#94A3B8', fontSize: '0.9rem' }} />
                <span style={{ color: isActive ? '#FFFFFF' : 'inherit' }}>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LibraryFilters;
