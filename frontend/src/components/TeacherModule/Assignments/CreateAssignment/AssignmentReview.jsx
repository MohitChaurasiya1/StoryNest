
import React from 'react';
import { FiBookOpen as BookOpen, FiHelpCircle as FileQuestion, FiPlayCircle as MonitorPlay, FiUsers as Users, FiCalendar as Calendar, FiAlignLeft as AlignLeft } from 'react-icons/fi';

const AssignmentReview = ({ data, isSubmitting, onSaveDraft, onPublish }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'story': return <BookOpen className="w-5 h-5" />;
      case 'quiz': return <FileQuestion className="w-5 h-5" />;
      case 'lesson': return <MonitorPlay className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Review Assignment</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Please review the details before publishing.</p>
      </div>

      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-6">
        
        {/* Title & Content */}
        <div className="flex items-start gap-4 pb-6 border-b border-slate-200 dark:border-slate-700">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
            {getIcon(data.content_type)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{data.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">
              {data.content_type} • {data.content_title}
            </p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Recipients</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {data.classroom_name}
                  <br/>
                  {data.target_type === 'classroom' 
                    ? 'All active students' 
                    : `${data.student_ids?.length || 0} selected student(s)`}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Timeline</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Available: {formatDate(data.start_date)}
                  <br/>
                  Due: {formatDate(data.due_date)}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <AlignLeft className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Instructions</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 whitespace-pre-wrap">
                  {data.instructions || 'No instructions provided.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
        <button
          onClick={onSaveDraft}
          disabled={isSubmitting}
          className="btn btn-outline disabled:opacity-50"
        >
          Save Draft
        </button>
        <button
          onClick={onPublish}
          disabled={isSubmitting}
          className="btn btn-primary disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Publishing...
            </span>
          ) : 'Publish Assignment'}
        </button>
      </div>
    </div>
  );
};

export default AssignmentReview;
