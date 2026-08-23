import React from 'react';
import { FiUsers as Users, FiTrendingUp as TrendingUp, FiBookOpen as BookOpen, FiEdit3 as PenTool, FiChevronRight as ChevronRight } from 'react-icons/fi';
import { FaChalkboardTeacher } from 'react-icons/fa';

const ClassroomOverview = ({ classrooms = [] }) => {
  if (!classrooms || classrooms.length === 0) {
    return (
      <div className="card mb-8">
        <h2 className="text-lg font-bold mb-4">Classroom Overview</h2>
        <div className="empty-card" style={{ padding: '3rem 2rem' }}>
          <FaChalkboardTeacher className="empty-icon text-4xl mb-4" />
          <h4 className="font-bold mb-1">Your classroom journey starts here.</h4>
          <p className="text-muted text-sm mb-4">Create your first classroom and start building meaningful learning experiences.</p>
          <button className="btn btn-primary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem' }}>
            Create Classroom
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold">Classroom Overview</h2>
        <button className="text-sm font-bold text-[var(--coral)] hover:underline flex items-center">
          View All <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid-3">
        {classrooms.map((cls) => (
          <div key={cls.id} className="p-5 border-[1.5px] border-[var(--border-color)] rounded-[var(--radius-sm)] hover:border-[#CBD5E1] hover:shadow-[var(--shadow-sm)] transition-all bg-[var(--surface-color)] flex flex-col">
            <h3 className="font-bold text-lg mb-4">{cls.name}</h3>
            
            <div className="space-y-3 mb-5">
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2 text-muted font-bold">
                  <Users size={16} className="text-[var(--sky)]" /> Students
                </span>
                <span className="font-bold">{cls.student_count}</span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2 text-muted font-bold">
                  <TrendingUp size={16} className="text-[var(--mint)]" /> Progress
                </span>
                <span className="font-bold text-[var(--mint)]">{cls.progress_percentage}%</span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2 text-muted font-bold">
                  <PenTool size={16} className="text-[var(--orange)]" /> Assignments
                </span>
                <span className="font-bold">{cls.assignments_percentage}%</span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2 text-muted font-bold">
                  <BookOpen size={16} className="text-[var(--coral)]" /> Reading
                </span>
                <span className="font-bold">{cls.reading_percentage}%</span>
              </div>
            </div>

            <button className="btn btn-secondary w-full mt-auto" style={{ padding: '0.5rem', fontSize: '0.85rem' }}>
              View Classroom
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClassroomOverview;
