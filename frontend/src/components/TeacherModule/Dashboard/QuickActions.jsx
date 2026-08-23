import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus as Plus, FiBookOpen as BookOpen, FiEdit3 as PenTool, FiGrid as LayoutDashboard, FiUserPlus as UserPlus } from 'react-icons/fi';
import CreateClassroomModal from '../Classrooms/CreateClassroomModal';
import DashboardAddStudentModal from './DashboardAddStudentModal';

const ActionButton = ({ icon: Icon, label, colorClass, onClick }) => (
  <button 
    className="btn btn-outline hover:-translate-y-1 transition-transform"
    style={{ padding: '0.8rem 1.2rem', gap: '0.75rem', borderRadius: 'var(--radius-md)' }}
    onClick={onClick}
  >
    <div className={`p-2 rounded-full ${colorClass}`}>
      <Icon size={18} />
    </div>
    <span className="font-bold">
      {label}
    </span>
  </button>
);

const QuickActions = ({ onUpdateDashboard }) => {
  const navigate = useNavigate();
  const [showCreateClassroom, setShowCreateClassroom] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);

  const handleAction = (actionType) => {
    switch (actionType) {
      case 'assignment':
        navigate('/teacher/assignments/create');
        break;
      case 'lesson':
        navigate('/teacher/library/create-lesson');
        break;
      case 'story':
        navigate('/teacher/library/create-story');
        break;
      case 'classroom':
        setShowCreateClassroom(true);
        break;
      case 'student':
        setShowAddStudent(true);
        break;
      default:
        break;
    }
  };

  const handleClassroomCreated = () => {
    setShowCreateClassroom(false);
    if (onUpdateDashboard) onUpdateDashboard();
  };

  const handleStudentAdded = () => {
    setShowAddStudent(false);
    if (onUpdateDashboard) onUpdateDashboard();
  };

  return (
    <div className="card">
      <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
      <div className="flex flex-wrap gap-4">
        <ActionButton 
          icon={PenTool} 
          label="Create Assignment" 
          colorClass="bg-[#E0F4FE] text-[#6BCBF5] dark:bg-[#1A3A4A]" 
          onClick={() => handleAction('assignment')}
        />
        <ActionButton 
          icon={BookOpen} 
          label="Create Lesson" 
          colorClass="bg-[#EDE9FE] text-[#A78BFA] dark:bg-[#2D2550]" 
          onClick={() => handleAction('lesson')}
        />
        <ActionButton 
          icon={Plus} 
          label="Create Story" 
          colorClass="bg-[#DFFBE6] text-[#6BCB77] dark:bg-[#1A3A2A]" 
          onClick={() => handleAction('story')}
        />
        <ActionButton 
          icon={LayoutDashboard} 
          label="New Classroom" 
          colorClass="bg-[#FFF6D5] text-[#D97706] dark:bg-[#3A3520]" 
          onClick={() => handleAction('classroom')}
        />
        <ActionButton 
          icon={UserPlus} 
          label="Add Student" 
          colorClass="bg-[#FCE7F3] text-[#F472B6] dark:bg-[#4A2535]" 
          onClick={() => handleAction('student')}
        />
      </div>

      {showCreateClassroom && (
        <CreateClassroomModal 
          onClose={() => setShowCreateClassroom(false)} 
          onSuccess={handleClassroomCreated} 
        />
      )}

      {showAddStudent && (
        <DashboardAddStudentModal 
          onClose={() => setShowAddStudent(false)} 
          onSuccess={handleStudentAdded} 
        />
      )}
    </div>
  );
};

export default QuickActions;
