import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSpinner, FaArrowLeft, FaExclamationTriangle, FaFire, FaBookOpen, FaChartLine } from 'react-icons/fa';
import teacherClassroomService from '../../../../services/teacherClassroomService';

const StudentProfilePage = () => {
  const { id: classroomId, studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        const data = await teacherClassroomService.getStudentSummary(classroomId, studentId);
        setStudent(data);
      } catch (err) {
        setError(err.message || 'Failed to load student details.');
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [classroomId, studentId]);

  if (loading) {
    return (
      <div className="dashboard-loading-state">
        <FaSpinner className="spinner-icon" />
        <p>Loading student profile...</p>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="card error-banner">
        <FaExclamationTriangle className="error-icon" />
        <div>
          <h4>Student Not Found</h4>
          <p>{error}</p>
          <button onClick={() => navigate(`/teacher/classrooms/${classroomId}`)} className="btn btn-secondary mt-2">
            Back to Classroom
          </button>
        </div>
      </div>
    );
  }

  const { stats, recent_reads, recent_quizzes } = student;

  return (
    <div className="animate-fade-in">
      <button 
        className="flex items-center gap-2 text-muted hover:text-[var(--text-primary)] font-bold mb-4 transition-colors"
        onClick={() => navigate(`/teacher/classrooms/${classroomId}`)}
      >
        <FaArrowLeft size={14} /> Back to {student.classroom_name}
      </button>

      {/* Hero Header */}
      <div className="parent-header parent-hero-card mb-8">
        <div className="parent-header-left flex items-center gap-6">
          <img 
            src={student.avatar_url || "https://api.dicebear.com/7.x/fun-emoji/svg?seed=" + student.name} 
            alt={student.name} 
            className="w-24 h-24 rounded-full bg-white object-cover border-4 border-white/20 shadow-lg"
          />
          <div>
            <h2 className="serif-heading text-white">{student.name}</h2>
            <p className="text-white/85 mt-2 font-bold flex items-center gap-2" style={{ fontSize: '0.95rem' }}>
              <span>Student Profile</span>
              <span className="opacity-50">•</span>
              <span>Joined {new Date(student.joined_at).toLocaleDateString()}</span>
            </p>
          </div>
        </div>
      </div>

      {/* High-Level Stats */}
      <div className="grid-3 mb-8">
        <div className="card text-center flex flex-col items-center justify-center p-6 border-t-4 border-t-[var(--coral)]">
          <div className="w-12 h-12 rounded-full bg-[var(--coral-light)] text-[var(--coral)] flex items-center justify-center mb-3">
            <FaFire size={20} />
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats.reading_streak} <span className="text-lg text-muted font-normal">Days</span></h3>
          <p className="font-bold text-muted uppercase text-xs">Current Streak</p>
        </div>
        
        <div className="card text-center flex flex-col items-center justify-center p-6 border-t-4 border-t-[var(--purple)]">
          <div className="w-12 h-12 rounded-full bg-[var(--purple-light)] text-[var(--purple)] flex items-center justify-center mb-3">
            <FaBookOpen size={20} />
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats.stories_completed}</h3>
          <p className="font-bold text-muted uppercase text-xs">Stories Completed</p>
        </div>

        <div className="card text-center flex flex-col items-center justify-center p-6 border-t-4 border-t-[var(--mint)]">
          <div className="w-12 h-12 rounded-full bg-[var(--mint-light)] text-[var(--mint)] flex items-center justify-center mb-3">
            <FaChartLine size={20} />
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats.average_quiz}%</h3>
          <p className="font-bold text-muted uppercase text-xs">Avg. Quiz Score</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Reading */}
        <div className="card">
          <h3 className="font-bold text-lg mb-4 border-b border-[var(--border-color)] pb-3">Recent Reading</h3>
          {recent_reads.length === 0 ? (
            <div className="text-center text-muted p-6">No reading logs found for this student.</div>
          ) : (
            <div className="space-y-4">
              {recent_reads.map(read => (
                <div key={read.id} className="flex justify-between items-center p-3 hover:bg-[var(--bg-color)] rounded-[var(--radius-sm)] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${read.completed ? 'bg-[var(--mint-light)] text-[var(--mint)]' : 'bg-slate-100 text-slate-400'}`}>
                      <FaBookOpen size={12} />
                    </div>
                    <div>
                      <div className="font-bold">{read.title}</div>
                      <div className="text-xs text-muted">{new Date(read.timestamp).toLocaleDateString()}</div>
                    </div>
                  </div>
                  {read.completed ? (
                    <span className="pill pill-green text-xs">Completed</span>
                  ) : (
                    <span className="pill pill-grey text-xs">In Progress</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Quizzes */}
        <div className="card">
          <h3 className="font-bold text-lg mb-4 border-b border-[var(--border-color)] pb-3">Recent Quizzes</h3>
          {recent_quizzes.length === 0 ? (
            <div className="text-center text-muted p-6">No quizzes completed yet.</div>
          ) : (
            <div className="space-y-4">
              {recent_quizzes.map(quiz => (
                <div key={quiz.id} className="flex justify-between items-center p-3 hover:bg-[var(--bg-color)] rounded-[var(--radius-sm)] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--purple-light)] text-[var(--purple)] flex items-center justify-center">
                      <FaChartLine size={12} />
                    </div>
                    <div>
                      <div className="font-bold">{quiz.title}</div>
                      <div className="text-xs text-muted">{new Date(quiz.timestamp).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className={`font-bold ${quiz.percentage >= 80 ? 'text-[var(--mint)]' : quiz.percentage < 60 ? 'text-[var(--danger-color)]' : 'text-[var(--text-primary)]'}`}>
                    {quiz.percentage}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePage;
