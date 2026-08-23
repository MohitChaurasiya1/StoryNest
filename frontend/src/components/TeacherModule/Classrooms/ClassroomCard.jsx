import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaEllipsisV, FaUsers, FaArchive } from 'react-icons/fa';
import teacherClassroomService from '../../../services/teacherClassroomService';

const ClassroomCard = ({ classroom, onUpdate }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleArchive = async () => {
    if (window.confirm(`Are you sure you want to archive ${classroom.name}?`)) {
      setArchiving(true);
      try {
        await teacherClassroomService.archiveClassroom(classroom.id);
        onUpdate();
      } catch (e) {
        alert("Failed to archive classroom");
        setArchiving(false);
      }
    }
  };

  return (
    <div className="card flex flex-col h-full relative group">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-xl">{classroom.name}</h3>
        <div className="relative" ref={menuRef}>
          <button 
            className="p-2 text-muted hover:bg-[var(--bg-color)] rounded-full transition-colors"
            onClick={() => setShowMenu(!showMenu)}
          >
            <FaEllipsisV size={14} />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-10 w-48 bg-[var(--surface-color)] border border-[var(--border-color)] shadow-[var(--shadow-md)] rounded-[var(--radius-sm)] z-20 py-2">
              <Link 
                to={`/teacher/classrooms/${classroom.id}`}
                className="block px-4 py-2 text-sm hover:bg-[var(--bg-color)] transition-colors"
              >
                Open Classroom
              </Link>
              <button 
                className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--bg-color)] transition-colors"
              >
                Edit Details
              </button>
              {classroom.status === 'active' && (
                <button 
                  onClick={handleArchive}
                  disabled={archiving}
                  className="w-full text-left px-4 py-2 text-sm text-[var(--danger-color)] hover:bg-[var(--danger-light)] transition-colors flex justify-between items-center"
                >
                  Archive Classroom
                  {archiving && <span className="animate-spin text-xs">↻</span>}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      
      <p className="text-sm font-bold text-muted mb-6">
        {classroom.grade_level} {classroom.section && `· ${classroom.section}`}
      </p>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-[var(--purple-light)] text-[var(--purple)] flex items-center justify-center">
            <FaUsers size={18} />
          </div>
          <div>
            <div className="text-lg font-bold">{classroom.student_count}</div>
            <div className="text-xs font-bold text-muted uppercase">Students</div>
          </div>
        </div>
        
        {classroom.status === 'archived' && (
          <span className="pill pill-gold flex items-center gap-1">
            <FaArchive size={10} /> Archived
          </span>
        )}
      </div>

      <div className="mt-auto">
        <div className="flex justify-between text-xs font-bold text-muted mb-1.5">
          <span>Avg. Progress</span>
          <span className="text-[var(--text-primary)]">85%</span>
        </div>
        <div className="h-2 w-full bg-[var(--border-color)] rounded-full overflow-hidden mb-6">
          <div className="h-full bg-[var(--mint)] rounded-full transition-all duration-500" style={{ width: '85%' }}></div>
        </div>

        <Link 
          to={`/teacher/classrooms/${classroom.id}`} 
          className="btn btn-secondary w-full"
        >
          Open Classroom
        </Link>
      </div>
    </div>
  );
};

export default ClassroomCard;
