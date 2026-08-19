import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FaUsers, FaArrowLeft, FaChartPie, FaTasks } from "react-icons/fa";

function TeacherClassroomDetails() {
  const { id } = useParams();
  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadClassroomData();
  }, [id]);

  const loadClassroomData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/teacher/classrooms/${id}/students/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      if (!res.ok) throw new Error('Failed to load classroom');
      const data = await res.json();
      setClassroom(data);
    } catch (err) {
      setError("Unable to load classroom details.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-xl">
        <Link to="/teacher/classrooms" className="flex items-center gap-2 mb-4 hover:underline">
          <FaArrowLeft /> Back to Classrooms
        </Link>
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/teacher/classrooms" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition font-medium text-sm">
        <FaArrowLeft /> Back to Classrooms
      </Link>

      <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">
            {classroom?.classroom_name || 'Classroom'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400">Classroom Roster & Overview</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-white px-4 py-2 rounded-xl transition font-medium">
            <FaTasks /> Assign Work
          </button>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition font-medium">
            <FaChartPie /> View Analytics
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <FaUsers className="text-blue-500" /> Students ({classroom?.students?.length || 0})
          </h3>
        </div>
        
        {classroom?.students?.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No students enrolled in this classroom yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                  <th className="px-6 py-3 font-semibold">Student</th>
                  <th className="px-6 py-3 font-semibold">Grade</th>
                  <th className="px-6 py-3 font-semibold">Reading Level</th>
                  <th className="px-6 py-3 font-semibold text-center">Stories Read</th>
                  <th className="px-6 py-3 font-semibold text-center">Quiz Avg</th>
                  <th className="px-6 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {classroom?.students?.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                          {student.avatar || student.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 dark:text-white">{student.name}</div>
                          <div className="text-xs text-slate-500">{student.age} years old</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                      {student.grade_level}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-semibold">
                        {student.reading_level}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium text-slate-700 dark:text-slate-300">
                      {student.stories_read || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <span className={`font-bold ${
                        student.quiz_average >= 80 ? 'text-green-600 dark:text-green-400' :
                        student.quiz_average >= 60 ? 'text-amber-600 dark:text-amber-400' :
                        'text-red-600 dark:text-red-400'
                      }`}>
                        {student.quiz_average}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/teacher/students/${student.id}`} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                        View Profile
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeacherClassroomDetails;
