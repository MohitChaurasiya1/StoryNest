import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaUserPlus, FaPlus, FaTimes, FaSpinner } from 'react-icons/fa';
import teacherClassroomService from '../../../../services/teacherClassroomService';
import AddStudentsModal from './AddStudentsModal';
import CreateStudentModal from '../CreateStudentModal';

const ClassroomStudents = ({ classroomId, onUpdate }) => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCreateStudentModalOpen, setIsCreateStudentModalOpen] = useState(false);

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
        onUpdate();
      } catch (err) {
        alert(err.message || "Failed to remove student");
      }
    }
  };

  const handleStudentCreated = () => {
    setIsCreateStudentModalOpen(false);
    fetchStudents();
    onUpdate();
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
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button 
            className="btn btn-secondary w-full sm:w-auto"
            onClick={() => setIsAddModalOpen(true)}
          >
            <FaUserPlus /> Enroll Existing
          </button>
          <button 
            className="btn btn-primary w-full sm:w-auto" 
            onClick={() => setIsCreateStudentModalOpen(true)}
          >
            <FaPlus /> Create Student
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center text-muted">
          <FaSpinner className="animate-spin text-3xl text-rose-500" />
        </div>
      ) : students.length === 0 ? (
        <div className="empty-card border-2 border-dashed border-[var(--border-color)] bg-transparent my-4 py-12 text-center">
          <h4 className="font-bold mb-2">No students enrolled yet</h4>
          <p className="text-muted mb-6">Create a new student or enroll existing learners into this classroom.</p>
          <div className="flex justify-center gap-3">
            <button className="btn btn-secondary" onClick={() => setIsAddModalOpen(true)}>
              <FaUserPlus /> Enroll Existing
            </button>
            <button className="btn btn-primary" onClick={() => setIsCreateStudentModalOpen(true)}>
              <FaPlus /> Create Student
            </button>
          </div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Grade / Age</th>
                <th>Joined Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.id}>
                  <td>
                    <div 
                      className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => navigate(`/teacher/classrooms/${classroomId}/students/${student.id}`)}
                    >
                      <img 
                        src={student.avatar_url || "https://api.dicebear.com/7.x/fun-emoji/svg?seed=" + student.name} 
                        alt={student.name} 
                        className="w-10 h-10 rounded-full bg-white object-cover shadow-sm border border-slate-200 dark:border-slate-700"
                      />
                      <div>
                        <div className="font-bold text-[var(--text-primary)] hover:text-[var(--coral)]">{student.name}</div>
                        <div className="text-xs text-muted">ID: #{student.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="pill">{student.grade || 'Grade 2'} • Age {student.age || 7}</span>
                  </td>
                  <td className="text-muted">
                    {student.enrolled_at ? new Date(student.enrolled_at).toLocaleDateString() : 'Active'}
                  </td>
                  <td>
                    <button 
                      className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-full transition-colors"
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

      {isCreateStudentModalOpen && (
        <CreateStudentModal 
          initialClassroomId={classroomId}
          onClose={() => setIsCreateStudentModalOpen(false)}
          onSuccess={handleStudentCreated}
        />
      )}
    </div>
  );
};

export default ClassroomStudents;
