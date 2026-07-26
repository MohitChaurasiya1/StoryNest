import {
  FaBookOpen,
  FaCertificate,
  FaChartLine,
  FaChild,
  FaCog,
  FaMedal,
  FaQuestionCircle,
  FaTimes,
  FaUser,
} from "react-icons/fa";
import { NavLink } from "react-router-dom";

const navigationItems = [
  {
    name: "Children",
    path: "/parent/children",
    icon: FaChild,
  },
  {
    name: "Story Library",
    path: "/parent/library",
    icon: FaBookOpen,
  },
  {
    name: "Progress",
    path: "/parent/progress",
    icon: FaChartLine,
  },
  {
    name: "Quiz Reports",
    path: "/parent/quizzes",
    icon: FaQuestionCircle,
  },
  {
    name: "Achievements",
    path: "/parent/achievements",
    icon: FaMedal,
  },
  {
    name: "Certificates",
    path: "/parent/certificates",
    icon: FaCertificate,
  },
  {
    name: "Profile",
    path: "/parent/profile",
    icon: FaUser,
  },
  {
    name: "Settings",
    path: "/parent/settings",
    icon: FaCog,
  },
];

function ParentSidebar({ isOpen = false, onClose = () => {} }) {
  const getLinkClasses = ({ isActive }) =>
    [
      "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold",
      "transition-all duration-200",
      isActive
        ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
        : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700",
    ].join(" ");

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close parent sidebar overlay"
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={[
          "fixed left-0 top-0 z-50 h-screen w-72 border-r border-slate-200",
          "bg-white px-4 py-5 shadow-xl transition-transform duration-300",
          "lg:translate-x-0 lg:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-2">
            <NavLink
              to="/parent/children"
              className="flex items-center gap-3"
              onClick={onClose}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-xl font-bold text-white shadow-lg shadow-indigo-200">
                S
              </div>

              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                  StoryNest
                </h1>
                <p className="text-xs font-medium text-slate-500">
                  Parent Portal
                </p>
              </div>
            </NavLink>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close sidebar"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden"
            >
              <FaTimes />
            </button>
          </div>

          <div className="my-6 border-t border-slate-200" />

          <nav
            className="flex-1 space-y-2 overflow-y-auto pr-1"
            aria-label="Parent navigation"
          >
            {navigationItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={getLinkClasses}
                  onClick={onClose}
                >
                  <Icon className="text-lg" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
              <FaBookOpen />
            </div>

            <h2 className="font-bold text-slate-900">
              Read together
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-600">
              Track stories, quizzes, reading progress and achievements for
              every child.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

export default ParentSidebar;
