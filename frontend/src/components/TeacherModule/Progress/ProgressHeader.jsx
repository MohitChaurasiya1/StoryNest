import React from 'react';
import { FiDownload } from 'react-icons/fi';

const ProgressHeader = ({ onExport, isExporting }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Progress & Reports</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Understand how your students are learning, growing, and engaging with StoryNest.
        </p>
      </div>

      <button
        onClick={onExport}
        disabled={isExporting}
        className="btn btn-primary disabled:opacity-50"
      >
        <FiDownload className="h-4 w-4" />
        {isExporting ? 'Exporting...' : 'Export Report'}
      </button>
    </div>
  );
};

export default ProgressHeader;
