import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaPlus, FaUsers, FaChartLine, FaChalkboardTeacher } from "react-icons/fa";
import { teacherAPI } from "../../services/api";

function TeacherClassrooms() {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadClassrooms();
  }, []);

  const loadClassrooms = async () => {
    try {
      setLoading(true);
      // Using an implicit fetch or assuming teacherAPI.getClassrooms() exists
      // I'll need to add it to api.js if it doesn't
      const res = await fetch('/api/teacher/classrooms/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      if (!res.ok) throw new Error('Failed to load classrooms');
      const data = await res.json();
      setClassrooms(data);
    } catch (err) {
      setError("Unable to load classrooms. Please try again.");
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">My Classrooms</h2>
          <p className="text-slate-500 dark:text-slate-400">Manage your classes and students</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition font-medium">
          <FaPlus />
          <span>New Classroom</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl">
          {error}
        </div>
      )}

      {classrooms.length === 0 && !error ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <FaChalkboardTeacher className="mx-auto text-5xl text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">No Classrooms Yet</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2 mb-6">Create your first classroom to get started.</p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition">
            Create Classroom
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {classrooms.map((cls) => (
            <Link 
              key={cls.id} 
              to={`/teacher/classrooms/${cls.id}`}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                  <FaChalkboardTeacher />
                </div>
                <span className="text-xs font-semibold px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg">
                  {cls.academic_year || 'Current'}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1 group-hover:text-blue-600 transition-colors">
                {cls.name}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                {cls.grade_level}
              </p>

              <div className="flex gap-4 border-t border-slate-100 dark:border-slate-700 pt-4">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <FaUsers className="text-blue-500" />
                  <span className="font-semibold">{cls.enrolled_count || 0}</span> students
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <FaChartLine className="text-green-500" />
                  <span className="font-semibold">View Stats</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default TeacherClassrooms;
