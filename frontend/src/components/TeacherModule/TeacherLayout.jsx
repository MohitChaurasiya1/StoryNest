import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';

const TeacherLayout = () => {
  return (
    <div className="h-screen w-screen bg-gradient-to-b from-rose-50/40 via-purple-50/20 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative overflow-hidden flex flex-col">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-30 dark:opacity-10">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-rose-400 blur-3xl" />
        <div className="absolute top-1/3 -left-32 h-96 w-96 rounded-full bg-amber-300 blur-3xl" />
        <div className="absolute -bottom-32 right-1/4 h-96 w-96 rounded-full bg-purple-400 blur-3xl" />
      </div>

      <div className="dashboard-layout relative z-10 flex-1 flex h-full overflow-hidden">
        <Sidebar role="teacher" />

        <main className="dashboard-content flex-1 h-full overflow-y-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TeacherLayout;
