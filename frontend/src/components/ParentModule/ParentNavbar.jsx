import { useState, useEffect } from "react";
import { FaBars, FaCog, FaSearch, FaUserCircle, FaSun, FaMoon } from "react-icons/fa";
import { Link } from "react-router-dom";
import NotificationBell from "./NotificationBell";

function ParentNavbar({
  title = "Parent Dashboard",
  subtitle = "Monitor your children's learning journey",
  parentName = "Parent",
  onMenuClick,
}) {
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains("dark");
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("storynest-parent-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("storynest-parent-theme", "light");
    }
  };

  return (
<<<<<<< HEAD
    <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
=======
    <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
>>>>>>> 46cc902dcc87df4e0ab32b3e8c1b8da7ddc67a20
      <div className="flex h-20 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
<<<<<<< HEAD
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 lg:hidden"
=======
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-black dark:text-white lg:hidden"
>>>>>>> 46cc902dcc87df4e0ab32b3e8c1b8da7ddc67a20
          >
            <FaBars />
          </button>

          <div>
<<<<<<< HEAD
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {title}
            </h1>

            <p className="text-sm text-slate-500 dark:text-slate-400">
=======
            <h1 className="text-2xl font-bold text-black dark:text-white">
              {title}
            </h1>

            <p className="text-sm font-medium text-black/80 dark:text-white/90">
>>>>>>> 46cc902dcc87df4e0ab32b3e8c1b8da7ddc67a20
              {subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/parent/search"
<<<<<<< HEAD
            className="hidden lg:flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 w-80 text-slate-400 dark:text-slate-500 hover:border-rose-500 dark:hover:border-rose-400 transition"
=======
            className="hidden lg:flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 w-80 text-black/70 dark:text-white/80 hover:border-rose-500 transition"
>>>>>>> 46cc902dcc87df4e0ab32b3e8c1b8da7ddc67a20
          >
            <FaSearch />
            <span className="text-sm">Search children, stories, goals...</span>
          </Link>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-amber-500 dark:text-amber-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            {isDark ? <FaSun className="text-lg" /> : <FaMoon className="text-lg" />}
          </button>

          <NotificationBell />

          <Link
            to="/parent/settings"
<<<<<<< HEAD
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
=======
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-black dark:text-white transition"
>>>>>>> 46cc902dcc87df4e0ab32b3e8c1b8da7ddc67a20
          >
            <FaCog />
          </Link>

          <Link
            to="/parent/profile"
<<<<<<< HEAD
            className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800"
=======
            className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
>>>>>>> 46cc902dcc87df4e0ab32b3e8c1b8da7ddc67a20
          >
            <FaUserCircle className="text-3xl text-rose-500" />

            <div className="hidden md:block">
<<<<<<< HEAD
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {parentName}
              </p>

              <p className="text-xs text-slate-500 dark:text-slate-400">
=======
              <p className="text-sm font-bold text-black dark:text-white">
                {parentName}
              </p>

              <p className="text-xs font-semibold text-black/70 dark:text-white/80">
>>>>>>> 46cc902dcc87df4e0ab32b3e8c1b8da7ddc67a20
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

