import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSpinner, FaArrowLeft, FaExclamationTriangle, FaLayerGroup, FaUserGraduate } from 'react-icons/fa';
import teacherClassroomService from '../../../../services/teacherClassroomService';
import ClassroomOverview from './ClassroomOverview';
import ClassroomStudents from './ClassroomStudents';

const ClassroomDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('students'); // default to students or overview

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
      <div className="dashboard-loading-state py-20 flex flex-col items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-rose-500 mb-3" />
        <p className="font-bold text-slate-600 dark:text-slate-300">Loading classroom...</p>
      </div>
    );
  }

  if (error || !classroom) {
    return (
      <div className="card error-banner max-w-xl mx-auto my-12 p-6">
        <FaExclamationTriangle className="error-icon text-2xl" />
        <div>
          <h4 className="font-bold text-lg">Classroom Not Found</h4>
          <p className="text-sm mt-1">{error}</p>
          <button onClick={() => navigate('/teacher/classrooms')} className="btn btn-secondary mt-4">
            Back to Classrooms
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-6xl mx-auto pb-16">
      <button 
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold mb-4 transition-colors text-sm cursor-pointer"
        onClick={() => navigate('/teacher/classrooms')}
      >
        <FaArrowLeft size={12} /> Back to Classrooms
      </button>

      <div className="parent-header parent-hero-card mb-8">
        <div className="parent-header-left">
          <h2 className="serif-heading text-white">{classroom.name}</h2>
          <p className="text-white/85 mt-2" style={{ fontSize: '0.95rem' }}>
            {classroom.grade_level} {classroom.section && `· Section ${classroom.section}`} · {classroom.academic_year}
          </p>
        </div>
      </div>

      {/* Modern StoryNest Tab Navigation */}
      <div className="flex flex-wrap items-center gap-3 mb-8 border-b border-slate-200 dark:border-slate-800 pb-3">
        {[
          { id: 'overview', label: 'Overview', icon: FaLayerGroup },
          { id: 'students', label: `Students (${classroom.stats?.student_count || 0})`, icon: FaUserGraduate },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2.5 px-6 py-2.5 rounded-full text-sm font-extrabold transition-all cursor-pointer select-none"
              style={isActive ? {
                background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
                color: '#FFFFFF',
                boxShadow: '0 4px 14px rgba(255, 107, 107, 0.35)',
                transform: 'translateY(-1px)'
              } : {
                background: 'var(--surface-color, #F8FAFC)',
                color: 'var(--text-secondary, #475569)',
                border: '1.5px solid var(--border-color, #E2E8F0)'
              }}
            >
              <Icon style={{ color: isActive ? '#FFFFFF' : '#94A3B8' }} />
              <span style={{ color: isActive ? '#FFFFFF' : 'inherit' }}>{tab.label}</span>
            </button>
          );
        })}
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
