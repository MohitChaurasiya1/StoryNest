import React from 'react';
import { FiBookOpen as BookOpen, FiCheckCircle as CheckCircle, FiChevronRight as ChevronRight } from 'react-icons/fi';

const RecentActivity = ({ activities = [] }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="card">
        <h2 className="text-lg font-bold mb-4">Recent Activity</h2>
        <div className="empty-card" style={{ padding: '2rem' }}>
          <p className="text-muted text-center py-4">No recent classroom activity yet.</p>
        </div>
      </div>
    );
  }

  const getTimeAgo = (timestamp) => {
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " mins ago";
    return "Just now";
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold">Recent Activity</h2>
        <button className="text-sm font-bold text-[var(--coral)] hover:underline">View All</button>
      </div>
      
      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-[2px] before:bg-gradient-to-b before:from-transparent before:via-[var(--border-color)] before:to-transparent">
        {activities.map((activity, index) => {
          const isQuiz = activity.activity_type === 'QUIZ_COMPLETED';
          const Icon = isQuiz ? CheckCircle : BookOpen;
          
          return (
            <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-[3px] border-[var(--surface-color)] bg-[var(--sky-light)] text-[var(--sky)] shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <Icon size={16} />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-[var(--radius-sm)] border border-[var(--border-color)] bg-[var(--surface-color)] transition-shadow hover:shadow-sm">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-[var(--text-primary)]">{activity.student_name}</span>
                  <span className="text-xs font-bold text-muted">{getTimeAgo(activity.timestamp)}</span>
                </div>
                <p className="text-sm text-muted">
                  {isQuiz ? 'completed a quiz on ' : 'finished reading '}
                  <span className="font-bold text-[var(--text-primary)]">"{activity.related_content}"</span>
                </p>
                <div className="mt-2 text-xs font-bold text-[var(--orange)] bg-[var(--orange-light)] inline-block px-2 py-1 rounded-full">
                  {activity.classroom_name}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentActivity;
