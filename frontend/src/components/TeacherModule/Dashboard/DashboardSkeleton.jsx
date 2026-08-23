import React from 'react';

const SkeletonCard = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 ${className}`}>
    {children}
  </div>
);

const DashboardSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div>
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-64 mb-2"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-96"></div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonCard key={i} className="flex flex-col">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24 mb-4"></div>
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
          </SkeletonCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Actions */}
          <SkeletonCard>
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-32 mb-4"></div>
            <div className="flex gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
              ))}
            </div>
          </SkeletonCard>

          {/* Attention Section */}
          <SkeletonCard>
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-40 mb-6"></div>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex justify-between items-center p-4 border border-slate-100 dark:border-slate-700 rounded-xl">
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-48"></div>
                  </div>
                  <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
                </div>
              ))}
            </div>
          </SkeletonCard>
          
          {/* Classroom Overview */}
          <SkeletonCard>
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="p-4 border border-slate-100 dark:border-slate-700 rounded-xl">
                  <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-24 mb-4"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-4/5"></div>
                </div>
              ))}
            </div>
          </SkeletonCard>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Upcoming */}
          <SkeletonCard>
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </SkeletonCard>

          {/* Activity */}
          <SkeletonCard>
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-32 mb-6"></div>
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-2 h-2 mt-2 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </SkeletonCard>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
