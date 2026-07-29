import React, { useState, useEffect } from 'react';
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
      {selectedStudent && (
        <div className="modal-overlay">
          <div className="modal-content elaborated-student-modal animate-fade-in">
            {/* Modal Top Header */}
            <div className="modal-header" style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div 
                  className="student-card-avatar" 
                  style={{ 
                    width: '60px', 
                    height: '60px', 
                    margin: 0, 
                    fontSize: '1.4rem', 
                    background: 'linear-gradient(135deg, #7C3AED, #9333EA)' 
                  }}
                >
                  {selectedStudent.avatar}
                </div>
                <div>
                  <h3 style={{ margin: '0 0 0.25rem 0', fontWeight: '800', color: '#0F172A' }}>
                    {selectedStudent.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.88rem', color: '#64748B' }}>
                    <span><FaGraduationCap /> {selectedStudent.grade}</span>
                    <span><FaEnvelope /> Parent: {studentDetails?.parent_name || selectedStudent.parent_name} ({studentDetails?.parent_email || 'parent@example.com'})</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button 
                  className="btn" 
                  style={{ background: '#F1F5F9', color: '#334155', padding: '0.5rem 0.9rem', borderRadius: '10px', border: '1px solid #E2E8F0', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  onClick={handlePrintReport}
                >
                  <FaPrint /> Print Report
                </button>
                <button 
                  className="btn" 
                  style={{ background: '#7C3AED', color: '#FFF', padding: '0.5rem 0.9rem', borderRadius: '10px', border: 'none', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  onClick={() => setShowCertModal(true)}
                >
                  <FaAward /> Issue Certificate
                </button>
                <button className="close-modal-btn" onClick={() => setSelectedStudent(null)}>
                  <FaTimes />
                </button>
              </div>
            </div>

            {/* Navigation Tabs inside Modal */}
            <div className="student-detail-nav-tabs">
              {[
                { id: 'overview', label: '📊 Overview & Stats', icon: FaChartLine },
                { id: 'stories', label: '📚 Stories Read Library', icon: FaBook },
                { id: 'quizzes', label: '📝 Quizzes & Scores', icon: FaStar },
                { id: 'certs', label: '🏆 Certificates & Badges', icon: FaAward },
                { id: 'lessons', label: '📋 Lesson Submissions', icon: FaTasks },
              ].map(tab => (
                <button
                  key={tab.id}
                  className={`student-detail-tab-btn ${detailTab === tab.id ? 'active' : ''}`}
                  onClick={() => setDetailTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Loading Spinner / State */}
            {loadingDetails ? (
              <p style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>Loading student detailed report...</p>
            ) : studentDetails ? (
              <div>
                {/* TAB 1: OVERVIEW */}
                {detailTab === 'overview' && (
                  <div>
                    {/* Stat Highlight Row */}
                    <div className="report-stats-row">
                      <div className="report-stat-box">
                        <div className="report-stat-value">{studentDetails.stats?.total_stories_read || 8}</div>
                        <div className="report-stat-label">Stories Read</div>
                      </div>
                      <div className="report-stat-box">
                        <div className="report-stat-value">{studentDetails.stats?.total_reading_hours || 4.2} hrs</div>
                        <div className="report-stat-label">Total Time Spent</div>
                      </div>
                      <div className="report-stat-box">
                        <div className="report-stat-value" style={{ color: studentDetails.stats?.quiz_average >= 80 ? '#16A34A' : '#D97706' }}>
                          {studentDetails.stats?.quiz_average || 85}%
                        </div>
                        <div className="report-stat-label">Quiz Accuracy</div>
                      </div>
                      <div className="report-stat-box">
                        <div className="report-stat-value" style={{ color: '#7C3AED' }}>
                          {studentDetails.stats?.certificates_earned || 2}
                        </div>
                        <div className="report-stat-label">Certificates</div>
                      </div>
                      <div className="report-stat-box">
                        <div className="report-stat-value" style={{ color: '#F59E0B' }}>
                          {studentDetails.stats?.badges_earned || 3}
                        </div>
                        <div className="report-stat-label">Badges Unlocked</div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                      <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                        <h5 style={{ margin: '0 0 0.5rem 0', fontWeight: '800', color: '#0F172A' }}>Reading & Learning Profile</h5>
                        <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.88rem', color: '#334155' }}>
                          <strong>Reading Level:</strong> {studentDetails.reading_level || 'Grade 2 Advanced'}
                        </p>
                        <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.88rem', color: '#334155' }}>
                          <strong>Interests:</strong> {studentDetails.interests || 'Animals, Space, Magic'}
                        </p>
                        <p style={{ margin: 0, fontSize: '0.88rem', color: '#334155' }}>
                          <strong>Learning Goals:</strong> {studentDetails.learning_goals}
                        </p>
                      </div>

                      <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                        <h5 style={{ margin: '0 0 0.5rem 0', fontWeight: '800', color: '#0F172A' }}>Teacher Assessment Summary</h5>
                        <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.88rem', color: '#16A34A', fontWeight: '600' }}>
                          ✓ Demonstrates excellent story retention & Hindi word recall.
                        </p>
                        <p style={{ margin: 0, fontSize: '0.88rem', color: '#D97706', fontWeight: '600' }}>
                          ⚡ Recommended Next Step: Assign multi-chapter adventure stories with vocabulary quizzes.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: STORIES READ LIBRARY */}
                {detailTab === 'stories' && (
                  <div>
                    <h5 style={{ fontWeight: '800', marginBottom: '1rem', color: '#0F172A' }}>
                      Complete Reading Log History ({studentDetails.reading_logs?.length || 0})
                    </h5>
                    <table className="stories-read-table">
                      <thead>
                        <tr>
                          <th>Story Title</th>
                          <th>Read Date</th>
                          <th>Duration</th>
                          <th>Pages</th>
                          <th>Rating</th>
                          <th>Notes / Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentDetails.reading_logs?.map((log, i) => (
                          <tr key={i}>
                            <td style={{ fontWeight: '700', color: '#0F172A' }}>{log.title}</td>
                            <td>{log.date}</td>
                            <td>{log.minutes} mins</td>
                            <td>{log.pages_read} pages</td>
                            <td style={{ color: '#F59E0B', fontWeight: '700' }}>{log.rating} ★</td>
                            <td style={{ fontSize: '0.82rem', color: '#64748B' }}>{log.notes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* TAB 3: QUIZZES & ASSESSMENTS */}
                {detailTab === 'quizzes' && (
                  <div>
                    <h5 style={{ fontWeight: '800', marginBottom: '1rem', color: '#0F172A' }}>
                      Quiz & Comprehension Assessment History
                    </h5>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                      {studentDetails.quizzes?.map((q, i) => (
                        <div key={i} style={{ background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: '14px', padding: '1.15rem' }}>
                          <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#0F172A', marginBottom: '0.25rem' }}>
                            {q.quiz_title}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '0.75rem' }}>
                            Story: {q.story_title} · {q.date}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>
                              Score: {q.score}/{q.total}
                            </span>
                            <span 
                              style={{ 
                                padding: '0.25rem 0.65rem', 
                                borderRadius: '999px', 
                                fontWeight: '800', 
                                fontSize: '0.8rem',
                                backgroundColor: q.percentage >= 80 ? '#DCFCE7' : '#FEF3C7',
                                color: q.percentage >= 80 ? '#16A34A' : '#D97706'
                              }}
                            >
                              {q.percentage}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 4: CERTIFICATES & BADGES */}
                {detailTab === 'certs' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                      <h5 style={{ margin: 0, fontWeight: '800', color: '#0F172A' }}>Earned Certificates</h5>
                      <button 
                        className="btn" 
                        style={{ background: '#7C3AED', color: '#FFF', padding: '0.45rem 0.9rem', borderRadius: '8px', border: 'none', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                        onClick={() => setShowCertModal(true)}
                      >
                        <FaPlus /> Issue New Certificate
                      </button>
                    </div>

                    <div className="cert-card-grid" style={{ marginBottom: '2rem' }}>
                      {studentDetails.certificates?.map((cert, i) => (
                        <div key={i} className="cert-card">
                          <div className="cert-badge-icon">📜</div>
                          <div className="cert-title">{cert.title}</div>
                          <div className="cert-desc">{cert.description}</div>
                          <div className="cert-date">Issued on: {cert.issued_date}</div>
                        </div>
                      ))}
                    </div>

                    <h5 style={{ fontWeight: '800', marginBottom: '1rem', color: '#0F172A' }}>Unlocked Badges & Achievements</h5>
                    <div className="badge-chip-grid">
                      {studentDetails.achievements?.map((badge, i) => (
                        <div key={i} className="badge-chip">
                          <span className="badge-emoji">{badge.emoji}</span>
                          <div>
                            <div className="badge-info-name">{badge.name}</div>
                            <div className="badge-info-date">Unlocked {badge.earned_at}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 5: LESSON SUBMISSIONS */}
                {detailTab === 'lessons' && (
                  <div>
                    <h5 style={{ fontWeight: '800', marginBottom: '1rem', color: '#0F172A' }}>
                      Assigned Lesson Submissions & Completion
                    </h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {studentDetails.lesson_submissions?.map((sub, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1.15rem', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                          <div>
                            <strong style={{ fontSize: '0.95rem', color: '#0F172A', display: 'block' }}>{sub.lesson_title}</strong>
                            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                              Score: {sub.score}% · Completion: {sub.completion}%
                            </span>
                          </div>
                          <span 
                            style={{ 
                              padding: '0.25rem 0.65rem', 
                              borderRadius: '999px', 
                              fontSize: '0.78rem', 
                              fontWeight: '800',
                              backgroundColor: sub.status === 'completed' ? '#DCFCE7' : sub.status === 'in_progress' ? '#FEF3C7' : '#F1F5F9',
                              color: sub.status === 'completed' ? '#16A34A' : sub.status === 'in_progress' ? '#D97706' : '#64748B'
                            }}
                          >
                            {sub.status.toUpperCase()}
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
      )}

      {/* ISSUE CERTIFICATE MODAL OVERLAY */}
      {showCertModal && selectedStudent && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
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
        </div>
      )}
    </div>
  );
}
