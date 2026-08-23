import React, { useState, useEffect } from 'react';
import { FaTimes, FaSearch, FaCheck, FaSpinner } from 'react-icons/fa';
import teacherClassroomService from '../../../services/teacherClassroomService';
import { useNavigate } from 'react-router-dom';

const DashboardAddStudentModal = ({ onClose, onSuccess }) => {
  const navigate = useNavigate();
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState('');
  const [loadingClassrooms, setLoadingClassrooms] = useState(true);
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Fetch teacher's classrooms
  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        setLoadingClassrooms(true);
        const data = await teacherClassroomService.getClassrooms({ status: 'active' });
        setClassrooms(data);
        if (data.length > 0) {
          setSelectedClassroomId(data[0].id);
        }
      } catch (err) {
        setError('Failed to load classrooms.');
      } finally {
        setLoadingClassrooms(false);
      }
    };
    fetchClassrooms();
  }, []);

  // Search students
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
    if (selectedIds.size === 0 || !selectedClassroomId) return;
    
    setSaving(true);
    setError(null);
    try {
      await teacherClassroomService.addStudents(selectedClassroomId, Array.from(selectedIds));
      
      const classroomName = classrooms.find(c => c.id.toString() === selectedClassroomId.toString())?.name;
      const count = selectedIds.size;
      
      setSuccessMsg(`✓ Successfully added ${count} student${count > 1 ? 's' : ''} to ${classroomName}.`);
      
      // Auto close after 1.5s
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to add students.');
      setSaving(false);
    }
  };

  if (loadingClassrooms) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
        <div className="card w-full max-w-lg shadow-2xl flex items-center justify-center p-12">
           <FaSpinner className="animate-spin text-3xl text-muted" />
        </div>
      </div>
    );
  }

  // Handle case where teacher has no classrooms
  if (classrooms.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
        <div className="card w-full max-w-lg shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Add Student</h2>
            <button onClick={onClose} className="p-2 hover:bg-[var(--bg-color)] rounded-full transition-colors text-muted">
              <FaTimes />
            </button>
          </div>
          <div className="text-center py-8">
            <h3 className="font-bold mb-2">You don't have any classrooms yet.</h3>
            <p className="text-muted mb-6">Create a classroom first to add students.</p>
            <div className="flex justify-center gap-3">
              <button onClick={onClose} className="btn btn-outline">Cancel</button>
              <button onClick={() => { onClose(); navigate('/teacher/classrooms'); }} className="btn btn-primary">Go to Classrooms</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="card w-full max-w-lg shadow-2xl flex flex-col max-h-[85vh]">
        <div className="flex justify-between items-center mb-6 shrink-0">
          <div>
            <h2 className="text-xl font-bold">Add Student</h2>
            <p className="text-sm text-muted">Add a student to one of your classrooms.</p>
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
        
        {successMsg && (
          <div className="p-3 mb-4 text-sm font-bold bg-[var(--mint-light)] text-[var(--mint)] rounded-[var(--radius-sm)] shrink-0 animate-fade-in">
            {successMsg}
          </div>
        )}

        <div className="form-group shrink-0">
          <label className="form-label">Classroom</label>
          <select 
            className="form-control"
            value={selectedClassroomId}
            onChange={(e) => setSelectedClassroomId(e.target.value)}
            disabled={saving || successMsg}
          >
            {classrooms.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="relative mb-4 shrink-0 mt-2">
          <label className="form-label">Search Student</label>
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input 
              type="text" 
              placeholder="Search by name..." 
              className="form-control pl-10"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={saving || successMsg}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto mb-4 border border-[var(--border-color)] rounded-[var(--radius-sm)] bg-[var(--bg-color)] min-h-[150px]">
          {searching ? (
            <div className="p-8 flex justify-center text-muted">
              <FaSpinner className="animate-spin text-2xl" />
            </div>
          ) : query.trim().length < 2 ? (
            <div className="p-8 text-center text-muted text-sm">
              Type at least 2 characters to search for a student.
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-muted text-sm">
              No students found matching "{query}".<br/>Try searching with a different name.
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-color)]">
              {results.map(student => (
                <div 
                  key={student.id} 
                  className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${selectedIds.has(student.id) ? 'bg-[var(--coral-light)]' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                  onClick={() => !saving && !successMsg && toggleSelect(student.id)}
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
            {selectedIds.size > 0 ? `Selected: ${selectedIds.size}` : ''}
          </div>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="btn btn-outline"
              disabled={saving}
            >
              Cancel
            </button>
            <button 
              onClick={handleAddStudents}
              className="btn btn-primary"
              disabled={saving || selectedIds.size === 0 || successMsg}
            >
              {saving ? 'Adding...' : selectedIds.size > 1 ? `Add ${selectedIds.size} Students` : 'Add Student'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAddStudentModal;
