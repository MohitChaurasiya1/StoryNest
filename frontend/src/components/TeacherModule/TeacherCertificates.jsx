import { useState } from "react";
import { FaCertificate, FaPlus, FaChevronDown } from "react-icons/fa";

function TeacherCertificates() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-1">
            <FaCertificate className="text-blue-500" /> Certificates
          </h2>
          <p className="text-slate-500 dark:text-slate-400">Manage and issue certificates to celebrate student progress.</p>
        </div>
        
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition font-medium whitespace-nowrap">
          <FaPlus /> Issue Certificate
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Recent Certificates</h3>
          <button className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 bg-slate-50 dark:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600">
            All Classes <FaChevronDown className="text-xs" />
          </button>
        </div>
        
        <div className="text-center py-12 text-slate-500 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
          Certificate templates and issued certificates will appear here.
        </div>
      </div>
    </div>
  );
}

export default TeacherCertificates;
