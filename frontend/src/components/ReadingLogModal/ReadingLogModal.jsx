import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaBook, FaClock, FaStar } from 'react-icons/fa';
import '../ChildModal/ChildModal.css';
import './ReadingLogModal.css';

export default function ReadingLogModal({ isOpen, onClose, onSave, childName = "Child", stories = [] }) {
  const [storyTitle, setStoryTitle] = useState('');
  const [selectedStoryId, setSelectedStoryId] = useState('');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
  const [readDate, setReadDate] = useState(new Date().toISOString().split('T')[0]);
  const [readingTimeMinutes, setReadingTimeMinutes] = useState(20);
  const [pagesRead, setPagesRead] = useState(5);
  const [completed, setCompleted] = useState(true);
  const [rating, setRating] = useState(5);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStorySelect = (e) => {
    const sId = e.target.value;
    setSelectedStoryId(sId);
    if (sId) {
      const storyObj = stories.find(s => String(s.id) === String(sId));
      if (storyObj) {
        setStoryTitle(storyObj.title_en || storyObj.title || '');
        setPagesRead(storyObj.num_pages || storyObj.pages || 5);
        if (storyObj.assignment_id || storyObj.is_assignment) {
          setSelectedAssignmentId(storyObj.assignment_id || storyObj.id);
        } else {
          setSelectedAssignmentId(null);
        }
      }
    } else {
      setSelectedAssignmentId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!storyTitle.trim()) {
      setError('Please enter or select a story title.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onSave({
        story: selectedStoryId ? parseInt(selectedStoryId, 10) : null,
        assignment_id: selectedAssignmentId ? parseInt(selectedAssignmentId, 10) : null,
        story_title: storyTitle.trim(),
        read_date: readDate,
        reading_time_minutes: parseInt(readingTimeMinutes, 10) || 15,
        pages_read: parseInt(pagesRead, 10) || 1,
        completed,
        rating: parseInt(rating, 10) || 5,
        notes: notes.trim()
      });

      // Reset form
      setStoryTitle('');
      setSelectedStoryId('');
      setSelectedAssignmentId(null);
      setReadingTimeMinutes(20);
      setPagesRead(5);
      setNotes('');
      onClose();
    } catch (err) {
      console.error('Log creation error:', err);
      setError('Failed to log reading session.');
    } finally {
      setSubmitting(false);
    }
  };

  // Group stories if category is provided
  const assignmentsList = stories.filter(s => s.is_assignment || s.category === 'assignment');
  const libraryList = stories.filter(s => s.category === 'library' || (!s.is_assignment && s.category !== 'recent'));
  const recentList = stories.filter(s => s.category === 'recent');
  const hasCategories = assignmentsList.length > 0 || recentList.length > 0;

  return createPortal(
    <div 
      className="modal-backdrop animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-card">
        <div className="modal-header">
          <h3><FaBook style={{ color: 'var(--coral)', marginRight: '8px' }} /> Log Reading Session for {childName}</h3>
          <button onClick={onClose} className="btn-close" aria-label="Close modal"><FaTimes /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="modal-error-banner">{error}</div>}
          {stories.length > 0 && (
            <div className="form-group">
              <label>Select Assigned Task or Story (Optional)</label>
              <select className="form-input" value={selectedStoryId} onChange={handleStorySelect}>
                <option value="">-- Choose existing story or assignment --</option>
                {hasCategories ? (
                  <>
                    {assignmentsList.length > 0 && (
                      <optgroup label="📋 Assigned to Student">
                        {assignmentsList.map(s => (
                          <option key={`asg-${s.id}`} value={s.id}>
                            {s.title_en || s.title} {s.due_date ? `(Due ${new Date(s.due_date).toLocaleDateString()})` : ''}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {libraryList.length > 0 && (
                      <optgroup label="📚 Classroom & Library Stories">
                        {libraryList.map(s => (
                          <option key={`lib-${s.id}`} value={s.id}>
                            {s.title_en || s.title} {s.language ? `(${s.language})` : ''}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {recentList.length > 0 && (
                      <optgroup label="📖 Recent Reads">
                        {recentList.map(s => (
                          <option key={`rec-${s.id}`} value={s.id}>
                            {s.title_en || s.title}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </>
                ) : (
                  stories.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.title_en || s.title} {s.language ? `(${s.language})` : ''}
                    </option>
                  ))
                )}
              </select>
            </div>
          )}

          <div className="form-group">
            <label>Story Title *</label>
            <input
              type="text"
              className="form-input"
              value={storyTitle}
              onChange={(e) => setStoryTitle(e.target.value)}
              placeholder="e.g. The Brave Little Acorn"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Reading Date</label>
              <input
                type="date"
                className="form-input"
                value={readDate}
                onChange={(e) => setReadDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Time Spent (minutes)</label>
              <input
                type="number"
                min="1"
                max="300"
                className="form-input"
                value={readingTimeMinutes}
                onChange={(e) => setReadingTimeMinutes(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Pages Read</label>
              <input
                type="number"
                min="1"
                className="form-input"
                value={pagesRead}
                onChange={(e) => setPagesRead(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Rating</label>
              <select className="form-input" value={rating} onChange={(e) => setRating(e.target.value)}>
                <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
                <option value="4">⭐⭐⭐⭐ Great</option>
                <option value="3">⭐⭐⭐ Good</option>
                <option value="2">⭐⭐ Okay</option>
                <option value="1">⭐ Hard</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={completed}
                onChange={(e) => setCompleted(e.target.checked)}
              />
              <span>Story Completed</span>
            </label>
          </div>

          <div className="form-group">
            <label>Notes / Reflections (Optional)</label>
            <textarea
              className="form-input"
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Really loved the animal characters and Hindi vocabulary!"
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Saving Log...' : 'Save Reading Log'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
