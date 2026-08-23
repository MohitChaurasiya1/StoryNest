import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaUserPlus, FaEllipsisV, FaSpinner, FaTimes } from 'react-icons/fa';
import teacherClassroomService from '../../../../services/teacherClassroomService';
import AddStudentsModal from './AddStudentsModal';

const ClassroomStudents = ({ classroomId, onUpdate }) => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await teacherClassroomService.getStudents(classroomId, { search: searchQuery });
      setStudents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchStudents();
    }, 300);
    return () => clearTimeout(timer);
  }, [classroomId, searchQuery]);

  const handleRemoveStudent = async (studentId, studentName) => {
    if (window.confirm(`Are you sure you want to remove ${studentName} from this classroom? Their reading history will not be deleted.`)) {
      try {
        await teacherClassroomService.removeStudent(classroomId, studentId);
        fetchStudents();
        onUpdate(); // Update header stats
      } catch (err) {
        alert(err.message || "Failed to remove student");
      }
    }
  };

  return (
    <div className="card animate-fade-in p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input 
            type="text" 
            placeholder="Search students in class..." 
            className="form-control pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="btn btn-primary w-full sm:w-auto" onClick={() => setIsAddModalOpen(true)}>
          <FaUserPlus /> Add Students
        </button>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center text-muted">
          <FaSpinner className="animate-spin text-3xl" />
        </div>
      ) : students.length === 0 ? (
        <div className="empty-card border-2 border-dashed border-[var(--border-color)] bg-transparent my-4">
          <h4 className="font-bold mb-2">No students found</h4>
          <p className="text-muted mb-4">Add students to start tracking their progress.</p>
          <button className="btn btn-outline" onClick={() => setIsAddModalOpen(true)}>
            <FaUserPlus /> Add Students
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)]">
                <th className="p-3 text-sm font-bold text-muted uppercase">Student</th>
                <th className="p-3 text-sm font-bold text-muted uppercase">Reading Streak</th>
                <th className="p-3 text-sm font-bold text-muted uppercase">Stories Completed</th>
                <th className="p-3 text-sm font-bold text-muted uppercase">Avg. Score</th>
                <th className="p-3 text-sm font-bold text-muted uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-color)] transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/teacher/classrooms/${classroomId}/students/${student.id}`)}>
                      <img 
                        src={student.avatar_url || "https://api.dicebear.com/7.x/fun-emoji/svg?seed=" + student.name} 
                        alt={student.name} 
                        className="w-10 h-10 rounded-full bg-[var(--purple-light)] object-cover"
                      />
                      <div>
                        <div className="font-bold text-[var(--text-primary)]">{student.name}</div>
                        <div className="text-xs text-muted">Joined {new Date(student.enrolled_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 font-bold">{student.reading_streak} Days</td>
                  <td className="p-3 font-bold">{student.stories_completed}</td>
                  <td className="p-3 font-bold">
                    <span className={student.average_progress >= 80 ? 'text-[var(--mint)]' : student.average_progress < 60 ? 'text-[var(--danger-color)]' : ''}>
                      {student.average_progress}%
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button 
                      className="btn btn-outline text-xs px-3 py-1 mr-2"
                      onClick={() => navigate(`/teacher/classrooms/${classroomId}/students/${student.id}`)}
                    >
                      View
                    </button>
                    <button 
                      className="p-2 text-muted hover:text-[var(--danger-color)] hover:bg-[var(--danger-light)] rounded-full transition-colors"
                      title="Remove from class"
                      onClick={() => handleRemoveStudent(student.id, student.name)}
                    >
                      <FaTimes />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isAddModalOpen && (
        <AddStudentsModal 
          classroomId={classroomId}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            setIsAddModalOpen(false);
            fetchStudents();
            onUpdate();
          }}
        />
      )}
    </div>
  );
};

export default ClassroomStudents;
