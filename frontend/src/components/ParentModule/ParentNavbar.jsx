import { FaBars, FaBell, FaCog, FaSearch, FaUserCircle } from "react-icons/fa";
import { Link } from "react-router-dom";

function ParentNavbar({
  title = "Parent Dashboard",
  subtitle = "Monitor your children's learning journey",
  parentName = "Parent",
  onMenuClick,
}) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="flex h-20 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-100 lg:hidden"
          >
            <FaBars />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {title}
            </h1>

            <p className="text-sm text-slate-500">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-2 w-80">
            <FaSearch className="text-slate-400" />

            <input
              type="text"
              placeholder="Search children, stories..."
              className="w-full bg-transparent outline-none text-sm"
            />
          </div>

          <button className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-100">
            <FaBell />

            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500"></span>
          </button>

          <Link
            to="/parent/settings"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-100"
          >
            <FaCog />
          </Link>

          <Link
            to="/parent/profile"
            className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 hover:bg-slate-50"
          >
            <FaUserCircle className="text-3xl text-indigo-600" />

            <div className="hidden md:block">
              <p className="text-sm font-semibold text-slate-900">
                {parentName}
              </p>

              <p className="text-xs text-slate-500">
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
