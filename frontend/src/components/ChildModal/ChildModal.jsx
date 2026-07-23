import React, { useState, useEffect } from 'react';
import { FaTimes, FaChild, FaCheck } from 'react-icons/fa';
import './ChildModal.css';

const AVATARS = ['🦁', '🦊', '🦄', '🐼', '🐯', '🐻', '🐰', '🚀', '⭐', '🐉'];
const GRADES = ['Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'];
const LANGUAGES = ['Bilingual (EN/HI)', 'English', 'Hindi'];

export default function ChildModal({ isOpen, onClose, onSave, childToEdit = null }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState(7);
  const [gender, setGender] = useState('boy');
  const [gradeLevel, setGradeLevel] = useState('Grade 2');
  const [preferredLanguage, setPreferredLanguage] = useState('Bilingual (EN/HI)');
  const [avatar, setAvatar] = useState('🦁');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (childToEdit) {
      setName(childToEdit.name || '');
      setAge(childToEdit.age || 7);
      setGender(childToEdit.gender || 'boy');
      setGradeLevel(childToEdit.grade_level || 'Grade 2');
      setPreferredLanguage(childToEdit.preferred_language || 'Bilingual (EN/HI)');
      setAvatar(childToEdit.avatar || '🦁');
    } else {
      setName('');
      setAge(7);
      setGender('boy');
      setGradeLevel('Grade 2');
      setPreferredLanguage('Bilingual (EN/HI)');
      setAvatar('🦁');
    }
    setError(null);
  }, [childToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter child\'s name.');
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      await onSave({
        name: name.trim(),
        age: parseInt(age, 10),
        gender,
        grade_level: gradeLevel,
        preferred_language: preferredLanguage,
        avatar
      });
      onClose();
    } catch (err) {
      console.error('Child save error:', err);
      setError('Failed to save child profile. Please check inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop animate-fade-in">
      <div className="modal-card">
        <div className="modal-header">
          <h3>{childToEdit ? 'Edit Child Profile' : 'Add New Child'}</h3>
          <button onClick={onClose} className="btn-close"><FaTimes /></button>
        </div>

        {error && <div className="modal-error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Avatar Emoji</label>
            <div className="avatar-grid">
              {AVATARS.map((av) => (
                <button
                  type="button"
                  key={av}
                  className={`avatar-option ${avatar === av ? 'selected' : ''}`}
                  onClick={() => setAvatar(av)}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Child's Name *</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Leo, Aarav, Ananya"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Age (years)</label>
              <input
                type="number"
                min="1"
                max="18"
                className="form-input"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Gender</label>
              <select
                className="form-input"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="boy">Boy</option>
                <option value="girl">Girl</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Grade Level</label>
              <select
                className="form-input"
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
              >
                {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Reading Language</label>
              <select
                className="form-input"
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
              >
                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Saving...' : (childToEdit ? 'Update Profile' : 'Create Profile')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
