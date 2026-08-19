import { useState } from "react";
import { Outlet } from "react-router-dom";
import TeacherSidebar from "./TeacherSidebar";
import TeacherNavbar from "./TeacherNavbar";

function TeacherLayout({ title = "Teacher Dashboard", subtitle = "Manage your classrooms and students" }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      <TeacherSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen max-w-full">
        <TeacherNavbar 
          title={title} 
          subtitle={subtitle} 
          onMenuClick={() => setSidebarOpen(true)} 
        />
        
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default TeacherLayout;
