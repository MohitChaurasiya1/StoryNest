import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';

const LibraryFilters = ({ filters, onFilterChange, onSearchChange }) => {
  const [localSearch, setLocalSearch] = useState(filters.search);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.search) {
        onSearchChange(localSearch);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch, filters.search, onSearchChange]);

  const tabs = [
    { id: 'all', label: 'All Content' },
    { id: 'story', label: 'Stories' },
    { id: 'lesson', label: 'Lessons' },
    { id: 'quiz', label: 'Quizzes' }
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

  return (
    <div className="card mb-6" style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Search */}
        <div style={{ flex: '1 1 250px', position: 'relative' }}>
          <FaSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Search stories, lessons, quizzes..." 
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '0.75rem 1rem 0.75rem 2.5rem', 
              borderRadius: '999px',
              border: '1px solid #e2e8f0',
              outline: 'none'
            }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <select 
            value={filters.grade || 'All Grades'} 
            onChange={(e) => onFilterChange({ grade: e.target.value === 'All Grades' ? '' : e.target.value })}
            style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white' }}
          >
            {grades.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-color)' }}>
            <input 
              type="checkbox" 
              checked={filters.created_by_me} 
              onChange={(e) => onFilterChange({ created_by_me: e.target.checked })}
            />
            My Content Only
          </label>
        </div>
      </div>

      {/* Type Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onFilterChange({ type: tab.id })}
            style={{
              padding: '0.75rem 1rem',
              background: 'transparent',
              border: 'none',
              borderBottom: filters.type === tab.id ? '2px solid var(--primary-color)' : '2px solid transparent',
              color: filters.type === tab.id ? 'var(--primary-color)' : 'var(--text-light)',
              fontWeight: filters.type === tab.id ? '600' : '400',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LibraryFilters;
