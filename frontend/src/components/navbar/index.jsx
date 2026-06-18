import React from "react";
import { Link } from "react-router-dom";
import { FiAlignJustify, FiSearch, FiHome, FiUser } from "react-icons/fi";
import { IoMdNotificationsOutline } from "react-icons/io";
import { RiSunFill, RiMoonFill } from "react-icons/ri";

const Navbar = (props) => {
  const { onOpenSidenav, brandText } = props;

  const [isDark, setIsDark] = React.useState(() => {
    const saved = localStorage.getItem("theme");
    return saved !== null ? saved === "dark" : true;
  });

  React.useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  return (
    <nav
      className="sticky top-4 z-40 flex flex-row flex-wrap items-center justify-between rounded-2xl p-3 mb-4 bg-white/60 dark:bg-[#0d0d12]/45 backdrop-blur-md border border-[#2E4036]/10 dark:border-white/10"
    >
      {/* Breadcrumb + title */}
      <div className="ml-2">
        <p className="text-[11px] font-mono text-[#2E4036]/60 dark:text-white/60 uppercase tracking-widest mb-0.5">
          Platform / <span className="text-[#CC5833]">{brandText}</span>
        </p>
        <h1 className="text-xl font-bold text-[#1A1A1A] dark:text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {brandText}
        </h1>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2 xl:w-[200px] bg-[#2E4036]/5 dark:bg-white/5 border border-[#2E4036]/10 dark:border-white/10"
        >
          <FiSearch className="h-3.5 w-3.5 flex-shrink-0 text-[#2E4036]/45 dark:text-white/25" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-sm outline-none w-full text-[#1A1A1A] dark:text-white placeholder-[#2E4036]/40 dark:placeholder-white/30"
            style={{ caretColor: "#CC5833" }}
          />
        </div>

        {/* Back to Homepage */}
        <Link
          to="/"
          className="h-9 w-9 flex items-center justify-center rounded-xl transition-all duration-200 bg-[#2E4036]/5 dark:bg-white/5 border border-[#2E4036]/10 dark:border-white/10 text-[#2E4036] dark:text-white hover:scale-105 active:scale-95"
          title="Về Trang Chủ"
        >
          <FiHome className="h-4 w-4" />
        </Link>

        {/* Theme Toggle */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="h-9 w-9 flex items-center justify-center rounded-xl transition-all duration-200 bg-[#2E4036]/5 dark:bg-white/5 border border-[#2E4036]/10 dark:border-white/10 text-[#2E4036] dark:text-white hover:scale-105 active:scale-95"
          aria-label="Toggle Theme"
        >
          {isDark ? <RiSunFill className="h-4 w-4 text-yellow-400" /> : <RiMoonFill className="h-4 w-4 text-indigo-600" />}
        </button>

        {/* Notification bell */}
        <button
          className="h-9 w-9 flex items-center justify-center rounded-xl transition-all duration-200 bg-[#2E4036]/5 dark:bg-white/5 border border-[#2E4036]/10 dark:border-white/10"
        >
          <IoMdNotificationsOutline className="h-4 w-4 text-[#2E4036]/60 dark:text-white/40" />
        </button>

        {/* Hamburger (mobile) */}
        <button
          className="xl:hidden h-9 w-9 flex items-center justify-center rounded-xl transition-all duration-200 bg-[#2E4036]/5 dark:bg-white/5 border border-[#2E4036]/10 dark:border-white/10"
          onClick={onOpenSidenav}
        >
          <FiAlignJustify className="h-4 w-4 text-[#2E4036]/60 dark:text-white/40" />
        </button>

        {/* User Profile Icon */}
        <div
          className="h-8 w-8 rounded-full flex items-center justify-center bg-[#2E4036]/5 dark:bg-white/5 border border-[#2E4036]/15 dark:border-white/15 text-[#2E4036]/70 dark:text-white/70"
          style={{ outline: "2px solid rgba(204,88,51,0.2)", outlineOffset: "2px" }}
        >
          <FiUser className="h-4 w-4" />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
