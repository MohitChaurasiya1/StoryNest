import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaSearch, FaUserPlus, FaPlus, FaTrash, FaSpinner, 
  FaBookOpen, FaFire, FaTrophy, FaThLarge, FaList, 
  FaArrowRight, FaUserGraduate, FaSmile
} from 'react-icons/fa';
import teacherClassroomService from '../../../../services/teacherClassroomService';
import AddStudentsModal from './AddStudentsModal';
import CreateStudentModal from '../CreateStudentModal';

const ClassroomStudents = ({ classroomId, onUpdate }) => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCreateStudentModalOpen, setIsCreateStudentModalOpen] = useState(false);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await teacherClassroomService.getStudents(classroomId, { search: searchQuery });
      setStudents(data || []);
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
    <div className="space-y-6 animate-fade-in">
      {/* Search & Actions Toolbar */}
      <div className="card p-4 sm:p-5 shadow-sm border border-slate-200/80 dark:border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input 
              type="text" 
              placeholder="Search students by name, grade, or level..." 
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Right Controls: View Switcher + Action Buttons */}
          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3">
            
            {/* View Mode Toggle */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Grid view"
              >
                <FaThLarge size={12} /> Cards
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Table view"
              >
                <FaList size={12} /> List
              </button>
            </div>

            {/* Action Buttons */}
            <button 
              type="button"
              className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-extrabold text-xs hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              onClick={() => setIsAddModalOpen(true)}
            >
              <FaUserPlus className="text-slate-500" /> Enroll Existing
            </button>
            <button 
              type="button"
              className="px-5 py-2.5 rounded-2xl text-white font-extrabold text-xs shadow-md flex items-center gap-2 transition-all hover:shadow-lg active:scale-95 cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)' }}
              onClick={() => setIsCreateStudentModalOpen(true)}
            >
              <FaPlus /> Create Student
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <FaSpinner className="animate-spin text-4xl text-rose-500 mb-3" />
          <p className="font-bold text-sm text-slate-500">Loading student roster...</p>
        </div>
      ) : students.length === 0 ? (
        /* Empty State */
        <div className="card p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl">
          <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center text-2xl mx-auto mb-4">
            <FaUserGraduate />
          </div>
          <h4 className="font-extrabold text-xl text-slate-900 dark:text-white mb-2">No students enrolled yet</h4>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-md mx-auto mb-6">
            Add learners to this classroom to assign interactive stories, track reading logs, and issue certificates.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button 
              className="btn btn-secondary text-xs px-5 py-2.5" 
              onClick={() => setIsAddModalOpen(true)}
            >
              <FaUserPlus /> Enroll Existing
            </button>
            <button 
              className="btn btn-primary text-xs px-5 py-2.5" 
              onClick={() => setIsCreateStudentModalOpen(true)}
            >
              <FaPlus /> Create Student
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* Modern Cards Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {students.map((student) => {
            const avatarUrl = student.avatar_url || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${student.name}`;
            const streak = student.stats?.reading_streak || student.reading_streak || 0;
            const books = student.stats?.total_books_read || student.total_books_read || 0;
            const quizScore = student.stats?.average_quiz || student.average_quiz || 0;

            return (
              <div 
                key={student.id}
                className="card p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group bg-white dark:bg-slate-900"
              >
                <div>
                  {/* Top Profile Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3.5">
                      <div className="relative">
                        <img 
                          src={avatarUrl} 
                          alt={student.name} 
                          className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-slate-800 object-cover border-2 border-white dark:border-slate-700 shadow-sm"
                        />
                        <span className="absolute -bottom-1 -right-1 text-sm bg-white dark:bg-slate-800 rounded-full px-1 shadow-xs border border-slate-200 dark:border-slate-700 select-none">
                          {student.avatar || '🦁'}
                        </span>
                      </div>

                      <div>
                        <h4 
                          className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white leading-tight group-hover:text-rose-500 transition-colors cursor-pointer"
                          onClick={() => navigate(`/teacher/classrooms/${classroomId}/students/${student.id}`)}
                        >
                          {student.name}
                        </h4>
                        <div className="text-[11px] font-bold text-slate-400 mt-0.5">
                          ID: #{student.id}
                        </div>
                      </div>
                    </div>

                    <button 
                      type="button"
                      className="w-8 h-8 rounded-full text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center transition-colors cursor-pointer"
                      title="Remove from classroom"
                      onClick={() => handleRemoveStudent(student.id, student.name)}
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>

                  {/* Badges / Meta Pills */}
                  <div className="flex items-center gap-2 flex-wrap mb-4">
                    <span className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700">
                      {student.grade || student.grade_level || 'Grade 2'} • Age {student.age || 7}
                    </span>
                    <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/60">
                      {student.reading_level || 'Beginner'}
                    </span>
                  </div>

                  {/* Quick Stats Banner */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 mb-4 text-center">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Streak</div>
                      <div className="font-extrabold text-sm text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1 mt-0.5">
                        <FaFire className="text-rose-500 text-xs" /> {streak}d
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stories</div>
                      <div className="font-extrabold text-sm text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1 mt-0.5">
                        <FaBookOpen className="text-sky-500 text-xs" /> {books}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mastery</div>
                      <div className="font-extrabold text-sm text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1 mt-0.5">
                        <FaTrophy className="text-amber-500 text-xs" /> {quizScore}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Bottom CTA */}
                <button
                  type="button"
                  onClick={() => navigate(`/teacher/classrooms/${classroomId}/students/${student.id}`)}
                  className="w-full py-2.5 px-4 rounded-2xl text-xs font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-rose-500 hover:text-rose-500 dark:hover:bg-rose-500 transition-all duration-200 flex items-center justify-center gap-2 group-hover:border-rose-500 shadow-xs cursor-pointer"
                >
                  <span>View Learning Dashboard</span>
                  <FaArrowRight size={11} className="transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            );
          })}
          
        </div>
      ) : (
        /* Modern Table List View */
        <div className="card p-0 overflow-hidden shadow-sm border border-slate-200/80 dark:border-slate-800 rounded-3xl">
          <div className="table-responsive">
            <table className="table w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                  <th className="py-4 px-6 text-left text-xs font-extrabold uppercase text-slate-400">Student Profile</th>
                  <th className="py-4 px-6 text-left text-xs font-extrabold uppercase text-slate-400">Grade & Age</th>
                  <th className="py-4 px-6 text-left text-xs font-extrabold uppercase text-slate-400">Reading Level</th>
                  <th className="py-4 px-6 text-left text-xs font-extrabold uppercase text-slate-400">Enrolled Date</th>
                  <th className="py-4 px-6 text-right text-xs font-extrabold uppercase text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {students.map((student) => {
                  const avatarUrl = student.avatar_url || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${student.name}`;
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-6">
                        <div 
                          className="flex items-center gap-3.5 cursor-pointer group"
                          onClick={() => navigate(`/teacher/classrooms/${classroomId}/students/${student.id}`)}
                        >
                          <img 
                            src={avatarUrl} 
                            alt={student.name} 
                            className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-slate-800 object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
                          />
                          <div>
                            <div className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-rose-500 transition-colors">
                              {student.name}
                            </div>
                            <div className="text-xs text-slate-400">ID: #{student.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                          {student.grade || student.grade_level || 'Grade 2'} • Age {student.age || 7}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/60">
                          {student.reading_level || 'Beginner'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-500">
                        {student.enrolled_at ? new Date(student.enrolled_at).toLocaleDateString() : 'Active'}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/teacher/classrooms/${classroomId}/students/${student.id}`)}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-rose-500 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <span>Dashboard</span>
                            <FaArrowRight size={10} />
                          </button>
                          <button 
                            type="button"
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                            title="Remove from class"
                            onClick={() => handleRemoveStudent(student.id, student.name)}
                          >
                            <FaTrash size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Existing Students Modal */}
      {isAddModalOpen && (
        <AddStudentsModal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)}
          classroomId={classroomId}
          onSuccess={() => {
            fetchStudents();
            onUpdate();
          }}
        />
      )}

      {/* Create New Student Modal */}
      {isCreateStudentModalOpen && (
        <CreateStudentModal
          isOpen={isCreateStudentModalOpen}
          onClose={() => setIsCreateStudentModalOpen(false)}
          classroomId={classroomId}
          onStudentCreated={handleStudentCreated}
        />
      )}
    </div>
  );
};

export default ClassroomStudents;
