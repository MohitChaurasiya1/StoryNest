import React, { useState, useEffect } from 'react';
import { teacherAPI } from '../../services/api';
import { FaBookOpen, FaPlus, FaChevronRight, FaTimes, FaCheckCircle, FaClock, FaCalendarAlt } from 'react-icons/fa';
import AddEventModal from './AddEventModal';
import './TeacherModule.css';

export default function TeacherLessons() {
  const [lessons, setLessons] = useState([]);
  const [selectedTab, setSelectedTab] = useState('all');
  const [loading, setLoading] = useState(true);

  // New Lesson Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [newLesson, setNewLesson] = useState({
    title: '',
    grade: 'Grade 2',
    due_date: 'Due Tomorrow',
    status: 'active',
    description: '',
    total_students: 24
  });

  // Submissions Modal state
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [activeSubmissionsData, setActiveSubmissionsData] = useState(null);

  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = async () => {
    try {
      setLoading(true);
      const res = await teacherAPI.getLessons();
      setLessons(res || []);
    } catch (err) {
      console.error('Error loading lessons:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLesson = async (e) => {
    e.preventDefault();
    if (!newLesson.title) {
      alert('Please enter a lesson title.');
      return;
    }

    try {
      await teacherAPI.createLesson(newLesson);
      alert('New lesson assigned successfully!');
      setShowCreateModal(false);
      setNewLesson({ title: '', grade: 'Grade 2', due_date: 'Due Tomorrow', status: 'active', description: '', total_students: 24 });
      loadLessons();
    } catch (err) {
      console.error('Error creating lesson:', err);
      alert('Failed to create lesson.');
    }
  };

  const handleViewSubmissions = async (lessonId) => {
    try {
      const res = await teacherAPI.getLessonSubmissions(lessonId);
      setActiveSubmissionsData(res);
      setShowSubmissionsModal(true);
    } catch (err) {
      console.error('Error loading submissions:', err);
      alert('Could not fetch student completion details.');
    }
  };

  const filteredLessons = selectedTab === 'all'
    ? lessons
    : lessons.filter(l => l.status === selectedTab);

  const getLessonStatusStyle = (status) => {
    switch (status) {
      case 'active': return { bg: '#E0F2FE', color: '#0284C7', label: 'Active' };
      case 'upcoming': return { bg: '#FEF3C7', color: '#D97706', label: 'Upcoming' };
      case 'completed': return { bg: '#F1F5F9', color: '#64748B', label: 'Done' };
      default: return { bg: '#F1F5F9', color: '#64748B', label: status };
    }
  };

  return (
    <div className="teacher-view-container animate-fade-in">
      <div className="teacher-view-header">
        <div>
          <h3>Lesson Assignments & Curriculum</h3>
          <p>Create, manage, and track student completion across assigned reading modules.</p>
        </div>
        <button 
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#7C3AED', color: '#FFF', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}
          onClick={() => setShowCreateModal(true)}
        >
          <FaPlus /> + Create New Lesson
        </button>
      </div>

      {/* Tabs */}
      <div className="lessons-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ margin: 0, fontWeight: '800' }}>Assignments ({filteredLessons.length})</h4>
        <div className="lessons-tabs" style={{ display: 'flex', gap: '0.5rem' }}>
          {['all', 'active', 'upcoming', 'completed'].map(tab => (
            <button
              key={tab}
              className={`lesson-tab ${selectedTab === tab ? 'active' : ''}`}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                background: selectedTab === tab ? '#7C3AED' : '#FFF',
                color: selectedTab === tab ? '#FFF' : '#475569',
                fontWeight: '700',
                cursor: 'pointer'
              }}
              onClick={() => setSelectedTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Lessons List */}
      {loading ? (
        <p className="text-muted">Loading lessons...</p>
      ) : filteredLessons.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
          <p>No lessons found under the '{selectedTab}' tab.</p>
        </div>
      ) : (
        <div className="lessons-grid">
          {filteredLessons.map((lesson) => {
            const statusStyle = getLessonStatusStyle(lesson.status);
            const total = lesson.total_students || 24;
            const completed = lesson.students_completed || lesson.studentsCompleted || 0;
            const pct = Math.round((completed / total) * 100);

            return (
              <div key={lesson.id} className="teacher-lesson-card">
                <div>
                  <div className="lesson-card-top">
                    <div>
                      <div className="lesson-card-title">{lesson.title}</div>
                      <div className="lesson-card-grade">{lesson.grade} · {lesson.due_date || lesson.dueDate}</div>
                    </div>
                    <span 
                      style={{ 
                        backgroundColor: statusStyle.bg, 
                        color: statusStyle.color,
                        padding: '0.25rem 0.65rem',
                        borderRadius: '999px',
                        fontSize: '0.78rem',
                        fontWeight: '800'
                      }}
                    >
                      {statusStyle.label}
                    </span>
                  </div>
                  {lesson.description && (
                    <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1rem' }}>
                      {lesson.description}
                    </p>
                  )}
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: '700', color: '#475569', marginBottom: '0.4rem' }}>
                    <span>Completion Rate</span>
                    <span>{completed}/{total} Students ({pct}%)</span>
                  </div>
                  <div style={{ height: '8px', background: '#F1F5F9', borderRadius: '999px', overflow: 'hidden', marginBottom: '1.25rem' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: '#7C3AED', borderRadius: '999px' }} />
                  </div>

                  <div className="flex gap-2">
                    <button 
                      style={{
                        flex: 1,
                        padding: '0.6rem',
                        borderRadius: '10px',
                        border: '1.5px solid #E2E8F0',
                        background: '#F8FAFC',
                        fontWeight: '700',
                        fontSize: '0.82rem',
                        color: '#334155',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.3rem'
                      }}
                      onClick={() => handleViewSubmissions(lesson.id)}
                    >
                      Progress <FaChevronRight style={{ fontSize: '0.75rem' }} />
                    </button>
                    <button 
                      style={{
                        flex: 1,
                        padding: '0.6rem',
                        borderRadius: '10px',
                        border: '1.5px solid #7C3AED',
                        background: '#7C3AED',
                        fontWeight: '800',
                        fontSize: '0.82rem',
                        color: '#FFFFFF',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.3rem'
                      }}
                      onClick={() => setIsAddEventOpen(true)}
                    >
                      <FaCalendarAlt /> Schedule
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isAddEventOpen && (
        <AddEventModal
          onClose={() => setIsAddEventOpen(false)}
          onCreated={() => loadLessons()}
        />
      )}

      {/* Create Lesson Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in">
            <div className="modal-header">
              <h4>Create New Lesson Assignment</h4>
              <button className="close-modal-btn" onClick={() => setShowCreateModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleCreateLesson}>
              <div className="form-field">
                <label>Lesson Title</label>
                <input
                  type="text"
                  placeholder="e.g. The Brave Little Acorn"
                  value={newLesson.title}
                  onChange={e => setNewLesson({ ...newLesson, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group-row">
                <div className="form-field">
                  <label>Target Grade</label>
                  <select
                    value={newLesson.grade}
                    onChange={e => setNewLesson({ ...newLesson, grade: e.target.value })}
                  >
                    <option value="Grade 1">Grade 1</option>
                    <option value="Grade 2">Grade 2</option>
                    <option value="Grade 3">Grade 3</option>
                    <option value="Grade 4">Grade 4</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Status</label>
                  <select
                    value={newLesson.status}
                    onChange={e => setNewLesson({ ...newLesson, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="form-field">
                <label>Due Date Label</label>
                <input
                  type="text"
                  placeholder="e.g. Due Tomorrow or Jul 24"
                  value={newLesson.due_date}
                  onChange={e => setNewLesson({ ...newLesson, due_date: e.target.value })}
                />
              </div>
              <div className="form-field">
                <label>Description & Instructions</label>
                <textarea
                  rows="4"
                  placeholder="Provide reading guidelines or comprehension focus..."
                  value={newLesson.description}
                  onChange={e => setNewLesson({ ...newLesson, description: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button 
                  type="button" 
                  className="btn" 
                  style={{ background: '#E2E8F0', padding: '0.65rem 1.25rem', borderRadius: '10px', border: 'none', cursor: 'pointer' }}
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn" 
                  style={{ background: '#7C3AED', color: '#FFF', padding: '0.65rem 1.25rem', borderRadius: '10px', border: 'none', fontWeight: '700', cursor: 'pointer' }}
                >
                  Create & Assign Lesson
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submissions Detail Modal */}
      {showSubmissionsModal && activeSubmissionsData && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <div>
                <h4>{activeSubmissionsData.lesson_title}</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>Student Completion Details</p>
              </div>
              <button className="close-modal-btn" onClick={() => setShowSubmissionsModal(false)}>
                <FaTimes />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto' }}>
              {activeSubmissionsData.submissions?.length === 0 ? (
                <p style={{ padding: '1rem', color: '#64748B' }}>No submission records found yet.</p>
              ) : (
                activeSubmissionsData.submissions.map(sub => (
                  <div key={sub.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.95rem', color: '#0F172A' }}>{sub.child_name}</strong>
                      <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                        {sub.status === 'completed' ? `Completed · Score: ${sub.score}%` : sub.status === 'in_progress' ? `In Progress (${sub.completion_percentage}%)` : 'Assigned (Not Started)'}
                      </span>
                    </div>
                    <span 
                      style={{ 
                        padding: '0.2rem 0.6rem', 
                        borderRadius: '999px', 
                        fontSize: '0.78rem', 
                        fontWeight: '700',
                        backgroundColor: sub.status === 'completed' ? '#DCFCE7' : sub.status === 'in_progress' ? '#FEF3C7' : '#F1F5F9',
                        color: sub.status === 'completed' ? '#16A34A' : sub.status === 'in_progress' ? '#D97706' : '#64748B'
                      }}
                    >
                      {sub.status.toUpperCase()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
