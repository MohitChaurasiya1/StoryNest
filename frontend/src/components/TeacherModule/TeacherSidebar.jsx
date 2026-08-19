import {
  FaBookOpen,
  FaCertificate,
  FaChartLine,
  FaCog,
  FaHome,
  FaMagic,
  FaMedal,
  FaQuestionCircle,
  FaTimes,
  FaUser,
  FaCheckCircle,
  FaBullseye,
  FaBell,
  FaHistory,
  FaHeart,
  FaUsers,
  FaCalendarAlt,
  FaSearch,
  FaFileDownload,
  FaChalkboardTeacher,
  FaEnvelope,
  FaLayerGroup,
  FaTasks
} from "react-icons/fa";
import { useRef, useLayoutEffect } from "react";
import { useLocation, NavLink } from "react-router-dom";

const navigationItems = [
  { name: "Dashboard", path: "/teacher", icon: FaHome },
  { name: "Classrooms", path: "/teacher/classrooms", icon: FaChalkboardTeacher },
  { name: "All Students", path: "/teacher/students", icon: FaUsers },
  { name: "Assignments", path: "/teacher/assignments", icon: FaTasks },
  { name: "Lessons", path: "/teacher/lessons", icon: FaLayerGroup },
  { name: "Teaching Schedule", path: "/teacher/schedule", icon: FaCalendarAlt },
  { name: "Story Library", path: "/teacher/library", icon: FaBookOpen },
  { name: "Reading Progress", path: "/teacher/progress", icon: FaChartLine },
  { name: "Quiz Reports", path: "/teacher/quizzes", icon: FaQuestionCircle },
  { name: "Learning Goals", path: "/teacher/goals", icon: FaBullseye },
  { name: "Achievements", path: "/teacher/achievements", icon: FaMedal },
  { name: "Certificates", path: "/teacher/certificates", icon: FaCertificate },
  { name: "Analytics", path: "/teacher/analytics", icon: FaChartLine },
  { name: "AI Insights", path: "/teacher/insights", icon: FaMagic },
  { name: "Recommendations", path: "/teacher/recommendations", icon: FaBookOpen },
  { name: "Student Comparison", path: "/teacher/comparison", icon: FaUsers },
  { name: "Reports", path: "/teacher/reports", icon: FaFileDownload },
  { name: "Messages", path: "/teacher/messages", icon: FaEnvelope },
  { name: "Notifications", path: "/teacher/notifications", icon: FaBell },
  { name: "Resources", path: "/teacher/resources", icon: FaBookOpen },
  { name: "Settings", path: "/teacher/settings", icon: FaCog },
];

function TeacherSidebar({ isOpen = false, onClose = () => {} }) {
  const location = useLocation();
  const navRef = useRef(null);

  useLayoutEffect(() => {
    const savedScroll = sessionStorage.getItem("teacher_sidebar_scroll");
    if (navRef.current) {
      if (savedScroll !== null) {
        navRef.current.scrollTop = Number(savedScroll);
      } else {
        const activeEl = navRef.current.querySelector('[aria-current="page"]');
        if (activeEl) {
          activeEl.scrollIntoView({ block: "nearest" });
        }
      }
    }
  }, [location.pathname]);

  const handleNavScroll = (e) => {
    sessionStorage.setItem("teacher_sidebar_scroll", e.target.scrollTop);
  };

  const getLinkClasses = ({ isActive }) =>
    [
      "flex items-center gap-3.5 rounded-2xl px-4 py-3 text-sm font-bold",
      "transition-all duration-300",
      isActive
        ? "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white shadow-lg shadow-blue-500/20 translate-x-1"
        : "text-black hover:bg-blue-50 hover:text-blue-600 dark:text-white dark:hover:bg-slate-800/60 dark:hover:text-blue-400",
    ].join(" ");

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close teacher sidebar overlay"
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-md lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={[
          "fixed left-0 top-0 z-50 h-screen w-72 border-r border-blue-100/80 dark:border-slate-800",
          "bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-5 py-6 shadow-2xl transition-transform duration-300",
          "lg:translate-x-0 lg:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-1">
            <NavLink
              to="/teacher"
              className="flex items-center gap-3 group"
              onClick={onClose}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-500 via-orange-500 to-amber-400 text-xl font-bold text-white shadow-md shadow-rose-500/30 group-hover:scale-105 transition-transform duration-300">
                <FaMagic className="animate-pulse" />
              </div>

              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-black dark:text-white flex items-center gap-1">
                  StoryNest
                  <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300 font-bold">
                    Teacher
                  </span>
                </h1>
                <p className="text-xs font-semibold text-black/70 dark:text-white/80">
                  AI Magical Storybook
                </p>
              </div>
            </NavLink>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close sidebar"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-black dark:text-white transition hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            >
              <FaTimes />
            </button>
          </div>

          <div className="my-5 border-t border-slate-100 dark:border-slate-800" />

          <nav
            ref={navRef}
            onScroll={handleNavScroll}
            className="flex-1 space-y-1.5 overflow-y-auto pr-1"
            aria-label="Teacher navigation"
          >
            {navigationItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/teacher"}
                  className={getLinkClasses}
                  onClick={onClose}
                >
                  <Icon className="text-lg flex-shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}

          </nav>

          <div className="mt-4 rounded-3xl bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-200/50 dark:border-slate-800 p-4 relative overflow-hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-500 to-purple-500 text-white shadow-md mb-2">
              <FaLayerGroup className="text-sm" />
            </div>

            <h2 className="font-extrabold text-black dark:text-white text-sm">
              Classroom Management ✨
            </h2>

            <p className="mt-1 text-xs leading-relaxed text-black/80 dark:text-white">
              Guide your students' learning journey efficiently.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

export default TeacherSidebar;
