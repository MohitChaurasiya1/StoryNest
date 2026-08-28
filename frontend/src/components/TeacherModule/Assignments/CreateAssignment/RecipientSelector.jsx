import React, { useState, useEffect } from 'react';
import teacherClassroomService from '../../../../services/teacherClassroomService';
import { FiUsers, FiUserCheck, FiSearch, FiCheck } from 'react-icons/fi';

const RecipientSelector = ({ data, updateData, onNext }) => {
  const [classrooms, setClassrooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Load active classrooms
  useEffect(() => {
    const fetchClassrooms = async () => {
      setLoading(true);
      try {
        const results = await teacherClassroomService.getClassrooms({ status: 'active' });
        setClassrooms(results || []);
      } catch (err) {
        console.error('Failed to load classrooms:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchClassrooms();
  }, []);

  // 2. Load students when classroom or target_type changes
  useEffect(() => {
    if (data.classroom_id) {
      const fetchStudents = async () => {
        setLoadingStudents(true);
        try {
          const results = await teacherClassroomService.getStudents(data.classroom_id);
          setStudents(results || []);
        } catch (err) {
          console.error('Failed to load students:', err);
          setStudents([]);
        } finally {
          setLoadingStudents(false);
        }
      };
      fetchStudents();
    } else {
      setStudents([]);
    }
  }, [data.classroom_id]);

  const handleClassroomChange = (classroomId) => {
    const classroom = classrooms.find((c) => c.id === parseInt(classroomId));
    updateData({
      classroom_id: parseInt(classroomId),
      classroom_name: classroom ? classroom.name : '',
      student_ids: [] // reset students on classroom change
    });
  };

  const handleTargetTypeChange = (type) => {
    updateData({ target_type: type, student_ids: [] });
  };

  const toggleStudent = (studentId) => {
    const current = data.student_ids || [];
    if (current.includes(studentId)) {
      updateData({ student_ids: current.filter((id) => id !== studentId) });
    } else {
      updateData({ student_ids: [...current, studentId] });
    }
  };

  const toggleAllStudents = () => {
    if (data.student_ids?.length === filteredStudents.length) {
      updateData({ student_ids: [] });
    } else {
      updateData({ student_ids: filteredStudents.map((s) => s.id) });
    }
  };

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isValid =
    data.classroom_id &&
    (data.target_type === 'classroom' || (data.target_type === 'student' && data.student_ids?.length > 0));

  const renderStudentAvatar = (student) => {
    if (student.avatar_url && (student.avatar_url.startsWith('http') || student.avatar_url.startsWith('/'))) {
      return (
        <img
          src={student.avatar_url}
          alt={student.name}
          className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 bg-white shadow-2xs shrink-0"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      );
    }
    return (
      <div className="w-10 h-10 rounded-full bg-coral-50 dark:bg-coral-950/40 text-coral-600 flex items-center justify-center text-xl shrink-0">
        {student.avatar || '🧑‍🎓'}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white">Choose Recipients</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Select which classroom or students should receive this learning assignment.
        </p>
      </div>

      {/* Classroom Selection */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Select Classroom
        </label>
        {loading ? (
          <div className="text-xs text-slate-500 py-2">Loading classrooms...</div>
        ) : (
          <select
            value={data.classroom_id || ''}
            onChange={(e) => handleClassroomChange(e.target.value)}
            className="w-full text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 bg-slate-50 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-[#FF6B6B] transition-all"
          >
            <option value="" disabled>
              Select a classroom...
            </option>
            {classrooms.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.student_count} student{c.student_count !== 1 ? 's' : ''})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Assign To: Entire Classroom vs Individual Students */}
      {data.classroom_id && (
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Assign To
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Entire Classroom Option */}
            <div
              onClick={() => handleTargetTypeChange('classroom')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                data.target_type === 'classroom'
                  ? 'border-[#FF6B6B] bg-gradient-to-br from-coral-50/60 to-orange-50/40 dark:from-coral-950/30 dark:to-orange-950/20 shadow-xs'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 ${
                  data.target_type === 'classroom'
                    ? 'border-[#FF6B6B] bg-[#FF6B6B] text-white'
                    : 'border-slate-300 dark:border-slate-600'
                }`}
              >
                {data.target_type === 'classroom' && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <FiUsers className={`w-4 h-4 ${data.target_type === 'classroom' ? 'text-[#FF6B6B]' : 'text-slate-400'}`} />
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Entire Classroom
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Automatically assigns to all active students in {data.classroom_name || 'this class'}.
                </p>
              </div>
            </div>

            {/* Individual Students Option */}
            <div
              onClick={() => handleTargetTypeChange('student')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                data.target_type === 'student'
                  ? 'border-[#FF6B6B] bg-gradient-to-br from-coral-50/60 to-orange-50/40 dark:from-coral-950/30 dark:to-orange-950/20 shadow-xs'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 ${
                  data.target_type === 'student'
                    ? 'border-[#FF6B6B] bg-[#FF6B6B] text-white'
                    : 'border-slate-300 dark:border-slate-600'
                }`}
              >
                {data.target_type === 'student' && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <FiUserCheck className={`w-4 h-4 ${data.target_type === 'student' ? 'text-[#FF6B6B]' : 'text-slate-400'}`} />
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Individual Students
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Pick specific students who need targeted practice or interventions.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Individual Students Selection Grid */}
      {data.classroom_id && data.target_type === 'student' && (
        <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Select Students
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-coral-50 text-[#FF6B6B] border border-coral-200/60">
                {data.student_ids?.length || 0} selected
              </span>
            </div>

            <div className="flex items-center gap-2">
              {students.length > 0 && (
                <button
                  type="button"
                  onClick={toggleAllStudents}
                  className="text-xs font-bold text-[#FF6B6B] hover:text-[#e05656] px-3 py-1 rounded-lg bg-coral-50 dark:bg-coral-950/30 transition-colors"
                >
                  {data.student_ids?.length === filteredStudents.length && filteredStudents.length > 0
                    ? 'Deselect All'
                    : 'Select All'}
                </button>
              )}
            </div>
          </div>

          {/* Search student within classroom */}
          {students.length > 4 && (
            <div className="relative">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search student by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-[#FF6B6B]"
              />
            </div>
          )}

          {/* Students Grid */}
          <div className="max-h-72 overflow-y-auto pr-1">
            {loadingStudents ? (
              <div className="p-8 text-xs text-slate-500 text-center flex items-center justify-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-[#FF6B6B] border-t-transparent rounded-full"></div>
                Loading classroom students...
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  {students.length === 0 ? 'No active students enrolled in this classroom.' : 'No students match your search.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredStudents.map((student) => {
                  const isSelected = data.student_ids?.includes(student.id);

                  return (
                    <div
                      key={student.id}
                      onClick={() => toggleStudent(student.id)}
                      className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-[#FF6B6B] bg-gradient-to-r from-coral-50/80 to-orange-50/50 dark:from-coral-950/40 dark:to-orange-950/20 shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {renderStudentAvatar(student)}
                        <div className="truncate">
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {student.name}
                          </p>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                            <span>{student.grade || 'Grade 2'}</span>
                            {student.reading_level && (
                              <>
                                <span>•</span>
                                <span className="text-slate-500 font-semibold">{student.reading_level}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                          isSelected
                            ? 'bg-[#FF6B6B] border-[#FF6B6B] text-white shadow-2xs'
                            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'
                        }`}
                      >
                        {isSelected && <FiCheck className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-700/60">
        <button
          type="button"
          onClick={onNext}
          disabled={!isValid}
          className="btn btn-primary disabled:opacity-40 disabled:cursor-not-allowed text-sm font-bold px-6 py-2.5 shadow-md"
        >
          Next Step: Assignment Details →
        </button>
      </div>
    </div>
  );
};

export default RecipientSelector;
