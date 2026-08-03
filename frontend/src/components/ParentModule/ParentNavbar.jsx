import { FaBars, FaCog, FaSearch, FaUserCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import NotificationBell from "./NotificationBell";

function ParentNavbar({
  title = "Parent Dashboard",
  subtitle = "Monitor your children's learning journey",
  parentName = "Parent",
  onMenuClick,
}) {
  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <div className="flex h-20 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 lg:hidden"
          >
            <FaBars />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {title}
            </h1>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/parent/search"
            className="hidden lg:flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 w-80 text-slate-400 dark:text-slate-500 hover:border-rose-500 dark:hover:border-rose-400 transition"
          >
            <FaSearch />
            <span className="text-sm">Search children, stories, goals...</span>
          </Link>

          <NotificationBell />


          <Link
            to="/parent/settings"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <FaCog />
          </Link>

          <Link
            to="/parent/profile"
            className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <FaUserCircle className="text-3xl text-rose-500" />

            <div className="hidden md:block">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {parentName}
              </p>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Parent Account
              </p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default ParentNavbar;
