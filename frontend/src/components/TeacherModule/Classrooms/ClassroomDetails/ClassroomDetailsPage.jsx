import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSpinner, FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';
import teacherClassroomService from '../../../../services/teacherClassroomService';
import ClassroomOverview from './ClassroomOverview';
import ClassroomStudents from './ClassroomStudents';

const ClassroomDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchClassroomDetails = async () => {
    try {
      setLoading(true);
      const data = await teacherClassroomService.getClassroom(id);
      setClassroom(data);
    } catch (err) {
      setError(err.message || 'Failed to load classroom details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassroomDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="dashboard-loading-state">
        <FaSpinner className="spinner-icon" />
        <p>Loading classroom...</p>
      </div>
    );
  }

  if (error || !classroom) {
    return (
      <div className="card error-banner">
        <FaExclamationTriangle className="error-icon" />
        <div>
          <h4>Classroom Not Found</h4>
          <p>{error}</p>
          <button onClick={() => navigate('/teacher/classrooms')} className="btn btn-secondary mt-2">
            Back to Classrooms
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <button 
        className="flex items-center gap-2 text-muted hover:text-[var(--text-primary)] font-bold mb-4 transition-colors"
        onClick={() => navigate('/teacher/classrooms')}
      >
        <FaArrowLeft size={14} /> Back to Classrooms
      </button>

      <div className="parent-header parent-hero-card mb-8">
        <div className="parent-header-left">
          <h2 className="serif-heading text-white">{classroom.name}</h2>
          <p className="text-white/85 mt-2" style={{ fontSize: '0.95rem' }}>
            {classroom.grade_level} {classroom.section && `· Section ${classroom.section}`} · {classroom.academic_year}
          </p>
        </div>
      </div>

      <div className="card mb-6 p-0 border-b-0 rounded-b-none bg-[var(--surface-color)] z-10 relative">
        <div className="flex px-4 pt-2">
          <button 
            className={`px-6 py-4 font-bold transition-colors border-b-2 ${activeTab === 'overview' ? 'border-[var(--coral)] text-[var(--coral)]' : 'border-transparent text-muted hover:text-[var(--text-primary)]'}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`px-6 py-4 font-bold transition-colors border-b-2 ${activeTab === 'students' ? 'border-[var(--coral)] text-[var(--coral)]' : 'border-transparent text-muted hover:text-[var(--text-primary)]'}`}
            onClick={() => setActiveTab('students')}
          >
            Students ({classroom.stats?.student_count || 0})
          </button>
        </div>
      </div>

      <div className="mt-[-2px]">
        {activeTab === 'overview' && (
          <ClassroomOverview classroom={classroom} onTabChange={setActiveTab} />
        )}
        
        {activeTab === 'students' && (
          <ClassroomStudents classroomId={classroom.id} onUpdate={fetchClassroomDetails} />
        )}
      </div>
    </div>
  );
};

export default ClassroomDetailsPage;
