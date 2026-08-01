import {
  FaBookOpen,
  FaCertificate,
  FaChartLine,
  FaChild,
  FaCog,
  FaHome,
  FaMagic,
  FaMedal,
  FaQuestionCircle,
  FaTimes,
  FaUser,
  FaStickyNote,
  FaCheckCircle,
  FaBullseye,
  FaBell,
  FaHistory,
  FaHeart,
  FaFire,
  FaUsers,
  FaCalendarAlt,
  FaStore,
  FaSearch,
  FaFileDownload,
} from "react-icons/fa";
import { NavLink } from "react-router-dom";

const navigationItems = [
  { name: "Dashboard", path: "/parent", icon: FaHome },
  { name: "All Children", path: "/parent/children", icon: FaChild },
  { name: "Parent Notes", path: "/parent/notes", icon: FaStickyNote },
  { name: "Story Approvals", path: "/parent/approvals", icon: FaCheckCircle },
  { name: "Story Library", path: "/parent/library", icon: FaBookOpen },
  { name: "Favorites", path: "/parent/favorites", icon: FaHeart },
  { name: "Reading Analytics", path: "/parent/analytics", icon: FaChartLine },
  { name: "Learning Goals", path: "/parent/goals", icon: FaBullseye },
  { name: "Notifications", path: "/parent/notifications", icon: FaBell },
  { name: "Activity Timeline", path: "/parent/timeline", icon: FaHistory },
  { name: "Reading Streak", path: "/parent/streak", icon: FaFire },
  { name: "Growth Report", path: "/parent/growth", icon: FaMagic },
  { name: "Child Comparison", path: "/parent/comparison", icon: FaUsers },
  { name: "AI Insights", path: "/parent/ai-insights", icon: FaMagic },
  { name: "Recommendations", path: "/parent/recommendations", icon: FaBookOpen },
  { name: "Reading Schedule", path: "/parent/schedule", icon: FaCalendarAlt },
  { name: "Rewards Shop", path: "/parent/rewards", icon: FaStore },
  { name: "Global Search", path: "/parent/search", icon: FaSearch },
  { name: "Export Reports", path: "/parent/reports", icon: FaFileDownload },
  { name: "Progress", path: "/parent/progress", icon: FaChartLine },
  { name: "Quiz Reports", path: "/parent/quizzes", icon: FaQuestionCircle },
  { name: "Achievements", path: "/parent/achievements", icon: FaMedal },
  { name: "Certificates", path: "/parent/certificates", icon: FaCertificate },
  { name: "Profile", path: "/parent/profile", icon: FaUser },
  { name: "Settings", path: "/parent/settings", icon: FaCog },
];



function ParentSidebar({ isOpen = false, onClose = () => {} }) {

  const getLinkClasses = ({ isActive }) =>
    [
      "flex items-center gap-3.5 rounded-2xl px-4 py-3 text-sm font-bold",
      "transition-all duration-300",
      isActive
        ? "bg-gradient-to-r from-orange-500 via-rose-500 to-purple-600 text-white shadow-lg shadow-rose-500/20 translate-x-1"
        : "text-slate-600 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-rose-400",
    ].join(" ");

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close parent sidebar overlay"
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-md lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={[
          "fixed left-0 top-0 z-50 h-screen w-72 border-r border-rose-100/80 dark:border-slate-800",
          "bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-5 py-6 shadow-2xl transition-transform duration-300",
          "lg:translate-x-0 lg:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-1">
            <NavLink
              to="/parent"
              className="flex items-center gap-3 group"
              onClick={onClose}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-500 via-orange-500 to-amber-400 text-xl font-bold text-white shadow-md shadow-rose-500/30 group-hover:scale-105 transition-transform duration-300">
                <FaMagic className="animate-pulse" />
              </div>

              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
                  StoryNest
                  <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-300 font-bold">
                    Parent
                  </span>
                </h1>
                <p className="text-xs font-semibold text-slate-400">
                  AI Magical Storybook
                </p>
              </div>
            </NavLink>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close sidebar"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            >
              <FaTimes />
            </button>
          </div>

          <div className="my-5 border-t border-slate-100 dark:border-slate-800" />

          <nav
            className="flex-1 space-y-1.5 overflow-y-auto pr-1"
            aria-label="Parent navigation"
          >
            {navigationItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/parent"}
                  className={getLinkClasses}
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    onClose();
                  }}
                >
                  <Icon className="text-lg flex-shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}

          </nav>

          <div className="mt-4 rounded-3xl bg-gradient-to-br from-rose-500/10 via-purple-500/10 to-sky-500/10 border border-rose-200/50 dark:border-slate-800 p-4 relative overflow-hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white shadow-md mb-2">
              <FaBookOpen className="text-sm" />
            </div>

            <h2 className="font-extrabold text-slate-900 dark:text-white text-sm">
              Magic Reading Nest ✨
            </h2>

            <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Track stories, quizzes, reading progress and achievements for your kids.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

export default ParentSidebar;
