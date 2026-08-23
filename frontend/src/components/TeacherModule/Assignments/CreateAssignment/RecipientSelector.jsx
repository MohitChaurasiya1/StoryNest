
import React, { useState, useEffect } from 'react';
import teacherClassroomService from '../../../../services/teacherClassroomService';

const RecipientSelector = ({ data, updateData, onNext }) => {
  const [classrooms, setClassrooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    const fetchClassrooms = async () => {
      setLoading(true);
      try {
        const results = await teacherClassroomService.getClassrooms({ status: 'active' });
        setClassrooms(results);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchClassrooms();
  }, []);

  useEffect(() => {
    if (data.classroom_id && data.target_type === 'student') {
      const fetchStudents = async () => {
        setLoadingStudents(true);
        try {
          const results = await teacherClassroomService.getClassroomStudents(data.classroom_id);
          setStudents(results);
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingStudents(false);
        }
      };
      fetchStudents();
    }
  }, [data.classroom_id, data.target_type]);

  const handleClassroomChange = (classroomId) => {
    const classroom = classrooms.find(c => c.id === parseInt(classroomId));
    updateData({
      classroom_id: parseInt(classroomId),
      classroom_name: classroom ? classroom.name : '',
      student_ids: [] // reset students when class changes
    });
  };

  const handleTargetTypeChange = (type) => {
    updateData({ target_type: type, student_ids: [] });
  };

  const toggleStudent = (studentId) => {
    const current = data.student_ids || [];
    if (current.includes(studentId)) {
      updateData({ student_ids: current.filter(id => id !== studentId) });
    } else {
      updateData({ student_ids: [...current, studentId] });
    }
  };

  const toggleAllStudents = () => {
    if (data.student_ids?.length === students.length) {
      updateData({ student_ids: [] });
    } else {
      updateData({ student_ids: students.map(s => s.id) });
    }
  };

  const isValid = data.classroom_id && (data.target_type === 'classroom' || (data.target_type === 'student' && data.student_ids?.length > 0));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Choose Recipients</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Who should receive this assignment?</p>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Select Classroom
        </label>
        {loading ? (
          <div className="text-sm text-slate-500">Loading classrooms...</div>
        ) : (
          <select
            value={data.classroom_id || ''}
            onChange={(e) => handleClassroomChange(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white"
          >
            <option value="" disabled>Select a classroom...</option>
            {classrooms.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.student_count} students)</option>
            ))}
          </select>
        )}
      </div>

      {data.classroom_id && (
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Assign To
          </label>
          <div className="flex gap-4">
            <label className={`flex-1 flex items-center p-4 border rounded-xl cursor-pointer ${data.target_type === 'classroom' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-700'}`}>
              <input
                type="radio"
                name="target_type"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                checked={data.target_type === 'classroom'}
                onChange={() => handleTargetTypeChange('classroom')}
              />
              <span className="ml-3 block font-medium text-slate-900 dark:text-white">Entire Classroom</span>
            </label>
            <label className={`flex-1 flex items-center p-4 border rounded-xl cursor-pointer ${data.target_type === 'student' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-700'}`}>
              <input
                type="radio"
                name="target_type"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                checked={data.target_type === 'student'}
                onChange={() => handleTargetTypeChange('student')}
              />
              <span className="ml-3 block font-medium text-slate-900 dark:text-white">Individual Students</span>
            </label>
          </div>
        </div>
      )}

      {data.classroom_id && data.target_type === 'student' && (
        <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Select Students ({data.student_ids?.length || 0} selected)
            </label>
            <button
              onClick={toggleAllStudents}
              className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium"
            >
              {data.student_ids?.length === students.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          
          <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-xl divide-y divide-slate-100 dark:divide-slate-800">
            {loadingStudents ? (
              <div className="p-4 text-sm text-slate-500 text-center">Loading students...</div>
            ) : students.length === 0 ? (
              <div className="p-4 text-sm text-slate-500 text-center">No students in this classroom.</div>
            ) : (
              students.map(student => (
                <label key={student.id} className="flex items-center p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                    checked={data.student_ids?.includes(student.id)}
                    onChange={() => toggleStudent(student.id)}
                  />
                  <div className="ml-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-lg">
                      {student.avatar_url || '🧑‍🎓'}
                    </div>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{student.name}</span>
                  </div>
                </label>
              ))
            )}
          </div>
        </div>
      )}

      <div className="flex justify-end pt-4">
        <button
          onClick={onNext}
          disabled={!isValid}
          className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next Step
        </button>
      </div>
    </div>
  );
};

export default RecipientSelector;
