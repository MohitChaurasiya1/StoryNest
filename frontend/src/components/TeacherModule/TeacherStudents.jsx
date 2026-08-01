import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { teacherAPI } from '../../services/api';
import { 
  FaSearch, FaTimes, FaBook, FaCheckCircle, FaStar, 
  FaAward, FaTrophy, FaChartLine, FaClock, FaPlus, 
  FaPrint, FaTasks, FaGraduationCap, FaEnvelope 
} from 'react-icons/fa';
import './TeacherModule.css';

export default function TeacherStudents() {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Elaborated Detail Modal state
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailTab, setDetailTab] = useState('overview'); // overview, stories, quizzes, certs, lessons

  // Issue Certificate Modal state
  const [showCertModal, setShowCertModal] = useState(false);
  const [certForm, setCertForm] = useState({
    title: 'Super Reader Award',
    description: ''
  });

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const res = await teacherAPI.getStudents();
      setStudents(res || []);
    } catch (err) {
      console.error('Error loading students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStudentDetail = async (student) => {
    setSelectedStudent(student);
    setDetailTab('overview');
    try {
      setLoadingDetails(true);
      const res = await teacherAPI.getStudentDetails(student.id);
      setStudentDetails(res);
      setCertForm({
        title: 'Super Reader Certificate',
        description: `Awarded to ${student.name} for outstanding reading dedication and comprehension.`
      });
    } catch (err) {
      console.error('Error loading student details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleIssueCertificateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !certForm.title) return;
    try {
      const res = await teacherAPI.issueCertificate(selectedStudent.id, certForm);
      alert('Certificate issued successfully!');
      setShowCertModal(false);
      // Refresh details
      const updated = await teacherAPI.getStudentDetails(selectedStudent.id);
      setStudentDetails(updated);
    } catch (err) {
      console.error('Error issuing certificate:', err);
      alert('Failed to issue certificate.');
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  const filteredStudents = students.filter(std => {
    const matchesSearch = std.name.toLowerCase().includes(searchTerm.toLowerCase()) || std.grade.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || std.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'On track': return { bg: '#DCFCE7', color: '#16A34A' };
      case 'Needs attention': return { bg: '#FEF3C7', color: '#D97706' };
      case 'Behind': return { bg: '#FEE2E2', color: '#DC2626' };
      default: return { bg: '#F1F5F9', color: '#64748B' };
    }
  };

  const avatarGradients = [
    'linear-gradient(135deg, #7C3AED, #9333EA)',
    'linear-gradient(135deg, #2563EB, #3B82F6)',
    'linear-gradient(135deg, #EC4899, #F43F5E)',
    'linear-gradient(135deg, #10B981, #059669)',
    'linear-gradient(135deg, #F59E0B, #D97706)',
  ];

  return (
    <div className="teacher-view-container animate-fade-in">
      <div className="teacher-view-header">
        <div>
          <h3>Student Performance & Progress Directory</h3>
          <p>Comprehensive individual student analytics, reading histories, certificates, and progress reports.</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search student by name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['all', 'On track', 'Needs attention', 'Behind'].map(st => (
            <button
              key={st}
              style={{
                padding: '0.45rem 0.95rem',
                borderRadius: '999px',
                border: '1px solid #E2E8F0',
                background: statusFilter === st ? '#7C3AED' : '#FFF',
                color: statusFilter === st ? '#FFF' : '#475569',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
              onClick={() => setStatusFilter(st)}
            >
              {st === 'all' ? 'All Students' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Student Cards Grid */}
      {loading ? (
        <p className="text-muted">Loading student directory...</p>
      ) : filteredStudents.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
          <p>No students found matching your criteria.</p>
        </div>
      ) : (
        <div className="students-grid">
          {filteredStudents.map((std, idx) => {
            const statusStyle = getStatusColor(std.status);
            const avatarBg = avatarGradients[idx % avatarGradients.length];

            return (
              <div 
                key={std.id} 
                className="student-card-item"
                onClick={() => handleOpenStudentDetail(std)}
              >
                <div className="student-card-avatar" style={{ background: avatarBg }}>
                  {std.avatar}
                </div>
                <h4 style={{ margin: '0 0 0.25rem 0', fontWeight: '800', fontSize: '1.15rem', color: '#0F172A' }}>
                  {std.name}
                </h4>
                <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: '#64748B', fontWeight: '600' }}>
                  {std.grade} · {std.reading_level || 'Intermediate'}
                </p>

                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '0.3rem' }}>
                    <span>Curriculum Progress</span>
                    <span>{std.progress}%</span>
                  </div>
                  <div style={{ height: '8px', background: '#F1F5F9', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ width: `${std.progress}%`, height: '100%', background: statusStyle.color, borderRadius: '999px' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: '600' }}>
                    <FaBook style={{ marginRight: '0.3rem', color: '#7C3AED' }} /> {std.stories_read || std.stories || 0} Stories
                  </span>
                  <span 
                    style={{
                      padding: '0.2rem 0.65rem',
                      borderRadius: '999px',
                      fontSize: '0.78rem',
                      fontWeight: '800',
                      backgroundColor: statusStyle.bg,
                      color: statusStyle.color
                    }}
                  >
                    {std.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ELABORATED STUDENT DETAILED REPORT MODAL */}
      {selectedStudent && createPortal(
        <div className="modal-overlay student-report-overlay animate-fade-in" onClick={(e) => { if (e.target.classList.contains('modal-overlay')) setSelectedStudent(null); }}>
          <div className="modal-content elaborated-student-modal student-report-modal">
            
            {/* Executive Document Header Bar */}
            <div className="report-modal-top-bar">
              <div className="report-doc-title">
                <span className="report-doc-badge">OFFICIAL REPORT</span>
                <span className="report-doc-sub">StoryNest Student Analytics & Academic Progress</span>
              </div>
              <div className="report-actions-toolbar">
                <button 
                  className="report-btn secondary-btn"
                  onClick={handlePrintReport}
                  title="Print or Save PDF"
                >
                  <FaPrint /> <span>Print Report</span>
                </button>
                <button 
                  className="report-btn primary-btn"
                  onClick={() => setShowCertModal(true)}
                >
                  <FaAward /> <span>Issue Certificate</span>
                </button>
                <button 
                  className="report-close-btn" 
                  onClick={() => setSelectedStudent(null)}
                  title="Close Report"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            {/* Student Profile Hero Banner */}
            <div className="report-hero-card">
              <div className="hero-avatar-wrapper">
                <div className="hero-avatar-circle">
                  {selectedStudent.avatar}
                </div>
                <span className="hero-status-indicator" title="Active Student" />
              </div>

              <div className="hero-details">
                <div className="hero-name-row">
                  <h2>{selectedStudent.name}</h2>
                  <span className="hero-grade-badge">
                    <FaGraduationCap /> {selectedStudent.grade}
                  </span>
                  <span 
                    className="hero-status-pill"
                    style={{
                      backgroundColor: getStatusColor(selectedStudent.status).bg,
                      color: getStatusColor(selectedStudent.status).color
                    }}
                  >
                    {selectedStudent.status}
                  </span>
                </div>

                <div className="hero-meta-row">
                  <span>
                    <strong>Parent:</strong> {studentDetails?.parent_name || selectedStudent.parent_name || 'Parent Account'}
                  </span>
                  <span className="meta-divider">•</span>
                  <span>
                    <FaEnvelope style={{ marginRight: '0.35rem', color: '#64748B' }} />
                    {studentDetails?.parent_email || 'parent@example.com'}
                  </span>
                  <span className="meta-divider">•</span>
                  <span>
                    <strong>Level:</strong> {studentDetails?.reading_level || selectedStudent.reading_level || 'Intermediate'}
                  </span>
                </div>
              </div>
            </div>

            {/* Modern Tab Navigation */}
            <div className="student-report-tabs">
              {[
                { id: 'overview', label: 'Overview & Stats', icon: FaChartLine },
                { id: 'stories', label: 'Reading Log History', icon: FaBook },
                { id: 'quizzes', label: 'Quizzes & Accuracy', icon: FaStar },
                { id: 'certs', label: 'Certificates & Badges', icon: FaAward },
                { id: 'lessons', label: 'Lesson Assignments', icon: FaTasks },
              ].map(tab => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    className={`report-tab-btn ${detailTab === tab.id ? 'active' : ''}`}
                    onClick={() => setDetailTab(tab.id)}
                  >
                    <IconComponent className="tab-icon" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Modal Body / Tab Content */}
            <div className="report-modal-body">
              {loadingDetails ? (
                <div className="report-loading-state">
                  <div className="loading-spinner" />
                  <p>Gathering comprehensive student analytics...</p>
                </div>
              ) : studentDetails ? (
                <div className="tab-content-container">
                  
                  {/* TAB 1: OVERVIEW */}
                  {detailTab === 'overview' && (
                    <div className="tab-overview-view">
                      {/* Metric Cards Row */}
                      <div className="exec-stats-grid">
                        <div className="exec-stat-card purple-accent">
                          <div className="exec-stat-header">
                            <div className="exec-stat-icon purple"><FaBook /></div>
                            <span className="exec-stat-tag">Reading Volume</span>
                          </div>
                          <div className="exec-stat-value">{studentDetails.stats?.total_stories_read || 8}</div>
                          <div className="exec-stat-label">Stories Read</div>
                        </div>

                        <div className="exec-stat-card blue-accent">
                          <div className="exec-stat-header">
                            <div className="exec-stat-icon blue"><FaClock /></div>
                            <span className="exec-stat-tag">Time Engagement</span>
                          </div>
                          <div className="exec-stat-value">{studentDetails.stats?.total_reading_hours || 4.2} <small>hrs</small></div>
                          <div className="exec-stat-label">Total Time Spent</div>
                        </div>

                        <div className="exec-stat-card green-accent">
                          <div className="exec-stat-header">
                            <div className="exec-stat-icon green"><FaChartLine /></div>
                            <span className="exec-stat-tag">Comprehension</span>
                          </div>
                          <div className="exec-stat-value" style={{ color: studentDetails.stats?.quiz_average >= 80 ? '#16A34A' : '#D97706' }}>
                            {studentDetails.stats?.quiz_average || 85}%
                          </div>
                          <div className="exec-stat-label">Quiz Accuracy Score</div>
                        </div>

                        <div className="exec-stat-card amber-accent">
                          <div className="exec-stat-header">
                            <div className="exec-stat-icon amber"><FaTrophy /></div>
                            <span className="exec-stat-tag">Honors & Badges</span>
                          </div>
                          <div className="exec-stat-value">
                            {(studentDetails.stats?.certificates_earned || 2) + (studentDetails.stats?.badges_earned || 3)}
                          </div>
                          <div className="exec-stat-label">Total Awards Unlocked</div>
                        </div>
                      </div>

                      {/* Profile & Assessment Dual Panel */}
                      <div className="report-insights-row">
                        <div className="insight-card">
                          <div className="insight-card-header">
                            <h5>Reading & Learning Profile</h5>
                          </div>
                          <div className="insight-card-body">
                            <div className="profile-detail-item">
                              <span className="detail-label">Reading Proficiency Level</span>
                              <span className="detail-val font-semibold">{studentDetails.reading_level || 'Grade 2 Advanced'}</span>
                            </div>
                            <div className="profile-detail-item">
                              <span className="detail-label">Primary Reading Interests</span>
                              <div className="interest-pills">
                                {(studentDetails.interests || 'Animals, Space, Magic').split(',').map((item, idx) => (
                                  <span key={idx} className="interest-pill">{item.trim()}</span>
                                ))}
                              </div>
                            </div>
                            <div className="profile-detail-item">
                              <span className="detail-label">Active Learning Goals</span>
                              <p className="detail-text">{studentDetails.learning_goals || 'Improve vocabulary retention and attempt multi-chapter comprehension quizzes.'}</p>
                            </div>
                          </div>
                        </div>

                        <div className="insight-card recommendation-card">
                          <div className="insight-card-header">
                            <h5>Teacher Assessment & Next Steps</h5>
                          </div>
                          <div className="insight-card-body">
                            <div className="assessment-callout success-box">
                              <div className="callout-icon">✓</div>
                              <div>
                                <h6>Observed Strengths</h6>
                                <p>Demonstrates excellent story retention, context understanding, and consistent reading habits.</p>
                              </div>
                            </div>

                            <div className="assessment-callout action-box">
                              <div className="callout-icon">⚡</div>
                              <div>
                                <h6>Recommended Focus</h6>
                                <p>Assign multi-chapter adventure stories with enriched vocabulary quizzes to promote deep comprehension.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: STORIES READ */}
                  {detailTab === 'stories' && (
                    <div className="tab-section">
                      <div className="section-title-row">
                        <h5>Reading Log Library ({studentDetails.reading_logs?.length || 0} Stories)</h5>
                      </div>
                      <div className="report-table-wrapper">
                        <table className="report-custom-table">
                          <thead>
                            <tr>
                              <th>Story Title</th>
                              <th>Date Read</th>
                              <th>Duration</th>
                              <th>Pages</th>
                              <th>Rating</th>
                              <th>Teacher Remarks</th>
                            </tr>
                          </thead>
                          <tbody>
                            {studentDetails.reading_logs?.map((log, i) => (
                              <tr key={i}>
                                <td className="font-bold text-dark">{log.title}</td>
                                <td>{log.date}</td>
                                <td><span className="time-chip"><FaClock style={{ fontSize: '0.75rem' }} /> {log.minutes} mins</span></td>
                                <td>{log.pages_read} pages</td>
                                <td>
                                  <span className="rating-stars">
                                    {log.rating} <FaStar style={{ color: '#F59E0B', fontSize: '0.85rem' }} />
                                  </span>
                                </td>
                                <td className="text-muted text-sm">{log.notes || 'Completed smoothly'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: QUIZZES */}
                  {detailTab === 'quizzes' && (
                    <div className="tab-section">
                      <div className="section-title-row">
                        <h5>Comprehension Quiz Evaluations</h5>
                      </div>
                      <div className="quiz-cards-grid">
                        {studentDetails.quizzes?.map((q, i) => (
                          <div key={i} className="quiz-eval-card">
                            <div className="quiz-eval-header">
                              <h6>{q.quiz_title}</h6>
                              <span 
                                className="score-percentage-pill"
                                style={{
                                  backgroundColor: q.percentage >= 80 ? '#DCFCE7' : '#FEF3C7',
                                  color: q.percentage >= 80 ? '#16A34A' : '#D97706'
                                }}
                              >
                                {q.percentage}%
                              </span>
                            </div>
                            <div className="quiz-eval-sub">
                              Story: <strong>{q.story_title}</strong> • {q.date}
                            </div>
                            <div className="quiz-score-bar-wrapper">
                              <div className="quiz-score-meta">
                                <span>Score</span>
                                <span>{q.score} / {q.total} Questions</span>
                              </div>
                              <div className="quiz-progress-track">
                                <div 
                                  className="quiz-progress-fill" 
                                  style={{ 
                                    width: `${q.percentage}%`,
                                    background: q.percentage >= 80 ? 'linear-gradient(90deg, #10B981, #059669)' : 'linear-gradient(90deg, #F59E0B, #D97706)'
                                  }} 
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 4: CERTIFICATES & BADGES */}
                  {detailTab === 'certs' && (
                    <div className="tab-section">
                      <div className="section-title-row flex-between">
                        <h5>Awarded Certificates</h5>
                        <button 
                          className="report-btn primary-btn btn-sm"
                          onClick={() => setShowCertModal(true)}
                        >
                          <FaPlus /> Issue New Certificate
                        </button>
                      </div>

                      <div className="cert-card-grid mb-6">
                        {studentDetails.certificates?.map((cert, i) => (
                          <div key={i} className="cert-card-item">
                            <div className="cert-card-header">
                              <div className="cert-icon-wrapper">📜</div>
                              <span className="cert-issued-tag">Issued {cert.issued_date}</span>
                            </div>
                            <h6 className="cert-item-title">{cert.title}</h6>
                            <p className="cert-item-desc">{cert.description}</p>
                          </div>
                        ))}
                      </div>

                      <div className="section-title-row">
                        <h5>Unlocked Skill Badges & Accomplishments</h5>
                      </div>
                      <div className="badge-chip-grid">
                        {studentDetails.achievements?.map((badge, i) => (
                          <div key={i} className="badge-card-item">
                            <div className="badge-icon-box">{badge.emoji}</div>
                            <div>
                              <div className="badge-name">{badge.name}</div>
                              <div className="badge-date">Unlocked {badge.earned_at}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 5: LESSON SUBMISSIONS */}
                  {detailTab === 'lessons' && (
                    <div className="tab-section">
                      <div className="section-title-row">
                        <h5>Assigned Lessons & Submission Progress</h5>
                      </div>
                      <div className="lesson-submissions-list">
                        {studentDetails.lesson_submissions?.map((sub, i) => (
                          <div key={i} className="lesson-sub-card">
                            <div className="lesson-sub-main">
                              <h6>{sub.lesson_title}</h6>
                              <div className="lesson-sub-meta">
                                <span>Completion Score: <strong>{sub.score}%</strong></span>
                                <span className="meta-divider">•</span>
                                <span>Progress: <strong>{sub.completion}%</strong></span>
                              </div>
                            </div>
                            <span 
                              className="lesson-status-pill"
                              style={{
                                backgroundColor: sub.status === 'completed' ? '#DCFCE7' : sub.status === 'in_progress' ? '#FEF3C7' : '#F1F5F9',
                                color: sub.status === 'completed' ? '#16A34A' : sub.status === 'in_progress' ? '#D97706' : '#64748B'
                              }}
                            >
                              {sub.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              ) : null}
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* ISSUE CERTIFICATE MODAL OVERLAY */}
      {showCertModal && selectedStudent && createPortal(
        <div className="modal-overlay" style={{ zIndex: 1300 }}>
          <div className="modal-content animate-fade-in" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h4>Issue Certificate to {selectedStudent.name}</h4>
              <button className="close-modal-btn" onClick={() => setShowCertModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleIssueCertificateSubmit}>
              <div className="form-field">
                <label>Certificate Title</label>
                <input
                  type="text"
                  placeholder="e.g. Star Reader Award"
                  value={certForm.title}
                  onChange={e => setCertForm({ ...certForm, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-field">
                <label>Description & Citation</label>
                <textarea
                  rows="4"
                  placeholder="Citation for achievement..."
                  value={certForm.description}
                  onChange={e => setCertForm({ ...certForm, description: e.target.value })}
                  required
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button 
                  type="button" 
                  className="btn"
                  style={{ background: '#E2E8F0', padding: '0.65rem 1.25rem', borderRadius: '10px', border: 'none', cursor: 'pointer' }}
                  onClick={() => setShowCertModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn"
                  style={{ background: '#7C3AED', color: '#FFF', padding: '0.65rem 1.25rem', borderRadius: '10px', border: 'none', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <FaAward /> Issue & Award
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
