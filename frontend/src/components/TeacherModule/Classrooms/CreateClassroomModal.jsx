import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import teacherClassroomService from '../../../services/teacherClassroomService';

const CreateClassroomModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    grade: 'Grade 1',
    section: '',
    subject: 'Reading & Literature',
    academic_year: '2026-2027',
    description: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await teacherClassroomService.createClassroom(formData);
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to create classroom');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="card w-full max-w-lg shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Create Classroom</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-[var(--bg-color)] rounded-full transition-colors text-muted"
          >
            <FaTimes />
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 text-sm font-bold bg-[var(--danger-light)] text-[var(--danger-color)] rounded-[var(--radius-sm)]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Classroom Name *</label>
            <input 
              type="text" 
              name="name"
              className="form-control" 
              placeholder="e.g., Class 5-A"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Grade</label>
              <select 
                name="grade" 
                className="form-control"
                value={formData.grade}
                onChange={handleChange}
              >
                <option value="Pre-K">Pre-K</option>
                <option value="Kindergarten">Kindergarten</option>
                <option value="Grade 1">Grade 1</option>
                <option value="Grade 2">Grade 2</option>
                <option value="Grade 3">Grade 3</option>
                <option value="Grade 4">Grade 4</option>
                <option value="Grade 5">Grade 5</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Section (Optional)</label>
              <input 
                type="text" 
                name="section"
                className="form-control" 
                placeholder="e.g., A"
                value={formData.section}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Subject</label>
              <select 
                name="subject" 
                className="form-control"
                value={formData.subject}
                onChange={handleChange}
              >
                <option value="Reading & Literature">Reading & Literature</option>
                <option value="English">English</option>
                <option value="General">General</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Academic Year</label>
              <input 
                type="text" 
                name="academic_year"
                className="form-control" 
                value={formData.academic_year}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description (Optional)</label>
            <textarea 
              name="description"
              className="form-control" 
              rows="2"
              placeholder="A short note about this classroom..."
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button 
              type="button" 
              onClick={onClose}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Classroom'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClassroomModal;
