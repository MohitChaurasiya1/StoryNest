import React, { useState, useEffect } from 'react';
import { FaTimes, FaSearch, FaCheck, FaSpinner } from 'react-icons/fa';
import teacherClassroomService from '../../../../services/teacherClassroomService';

const AddStudentsModal = ({ classroomId, onClose, onSuccess }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const searchStudents = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }
      
      try {
        setSearching(true);
        const data = await teacherClassroomService.searchStudents(query);
        setResults(data);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setSearching(false);
      }
    };

    const timer = setTimeout(() => {
      searchStudents();
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const toggleSelect = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleAddStudents = async () => {
    if (selectedIds.size === 0) return;
    
    setSaving(true);
    setError(null);
    try {
      await teacherClassroomService.addStudents(classroomId, Array.from(selectedIds));
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to add students.');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="card w-full max-w-lg shadow-2xl flex flex-col max-h-[85vh]">
        <div className="flex justify-between items-center mb-6 shrink-0">
          <div>
            <h2 className="text-xl font-bold">Add Students</h2>
            <p className="text-sm text-muted">Search by student name across the platform</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-[var(--bg-color)] rounded-full transition-colors text-muted"
          >
            <FaTimes />
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 text-sm font-bold bg-[var(--danger-light)] text-[var(--danger-color)] rounded-[var(--radius-sm)] shrink-0">
            {error}
          </div>
        )}

        <div className="relative mb-4 shrink-0">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input 
            type="text" 
            placeholder="Type a student's name..." 
            className="form-control pl-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>

        <div className="flex-1 overflow-y-auto mb-4 border border-[var(--border-color)] rounded-[var(--radius-sm)] bg-[var(--bg-color)]">
          {searching ? (
            <div className="p-8 flex justify-center text-muted">
              <FaSpinner className="animate-spin text-2xl" />
            </div>
          ) : query.trim().length < 2 ? (
            <div className="p-8 text-center text-muted">
              Type at least 2 characters to search.
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-muted">
              No students found matching "{query}".
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-color)]">
              {results.map(student => (
                <div 
                  key={student.id} 
                  className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${selectedIds.has(student.id) ? 'bg-[var(--coral-light)]' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                  onClick={() => toggleSelect(student.id)}
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={student.avatar_url || "https://api.dicebear.com/7.x/fun-emoji/svg?seed=" + student.name} 
                      alt={student.name} 
                      className="w-10 h-10 rounded-full bg-white object-cover shadow-sm"
                    />
                    <div className="font-bold text-[var(--text-primary)]">{student.name}</div>
                  </div>
                  
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedIds.has(student.id) ? 'border-[var(--coral)] bg-[var(--coral)] text-white' : 'border-[var(--border-color)] text-transparent'}`}>
                    <FaCheck size={10} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center shrink-0 pt-4 border-t border-[var(--border-color)]">
          <div className="text-sm font-bold text-muted">
            {selectedIds.size} student{selectedIds.size !== 1 ? 's' : ''} selected
          </div>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button 
              onClick={handleAddStudents}
              className="btn btn-primary"
              disabled={saving || selectedIds.size === 0}
            >
              {saving ? 'Adding...' : 'Add to Class'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddStudentsModal;
