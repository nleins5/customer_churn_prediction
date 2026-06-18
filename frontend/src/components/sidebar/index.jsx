/* eslint-disable */
import React from "react";
import { HiX } from "react-icons/hi";
import Links from "./components/Links";
import routes from "routes.js";

const Sidebar = ({ open, onClose }) => {
  const [isDark, setIsDark] = React.useState(() => {
    return document.documentElement.classList.contains("dark");
  });

  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`sm:none duration-175 linear fixed !z-50 flex min-h-full flex-col pb-10 shadow-2xl transition-all md:!z-50 lg:!z-50 xl:!z-0 bg-gradient-to-b from-[#F2F0E9] to-[#FAF8F5] dark:from-[#0a0a0f] dark:via-[#0d0f0d] dark:to-[#0a0a0f] border-r border-[#2E4036]/10 dark:border-white/5 ${
        open ? "translate-x-0" : "-translate-x-96"
      }`}
      style={{
        width: "280px",
      }}
    >
      <span
        className="absolute top-4 right-4 block cursor-pointer xl:hidden text-[#2E4036]/40 dark:text-white/40 hover:text-[#2E4036] dark:hover:text-white transition-colors"
        onClick={onClose}
      >
        <HiX size={18} />
      </span>

      {/* Logo */}
      <div className="mx-[32px] mt-[44px] flex items-center gap-3">
        <div className="relative h-8 w-8 flex-shrink-0">
          <div className="h-full w-full rounded-full bg-[#CC5833]/20 border border-[#CC5833]/40 flex items-center justify-center">
            <span className="h-2.5 w-2.5 rounded-full bg-[#CC5833] animate-pulse block" />
          </div>
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-[17px] font-bold tracking-tight text-[#1A1A1A] dark:text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Churn<span className="text-[#CC5833]">Pulse</span>
          </span>
          <span className="text-[9px] uppercase tracking-[0.2em] text-[#2E4036]/40 dark:text-white/30 font-mono mt-0.5">Analytics Platform</span>
        </div>
      </div>

      {/* Divider */}
      <div className="mt-8 mb-6 mx-[32px] h-px bg-gradient-to-r from-transparent via-[#2E4036]/10 dark:via-white/10 to-transparent" />

      {/* Nav items */}
      <ul className="mb-auto pt-1 px-3">
        <Links routes={routes} />
      </ul>

      {/* System Status */}
      <div className="mx-5 mb-2 rounded-2xl border border-[#2E4036]/10 dark:border-white/5 p-4 bg-[#2E4036]/5 dark:bg-white/5">
        <div className="flex items-center gap-2 mb-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-mono text-[#2E4036]/60 dark:text-white/40 uppercase tracking-widest">System Status</span>
        </div>
        <div className="space-y-1.5">
          {[
            { label: "Backend API", status: "Online" },
            { label: "ML Model", status: "Active" },
            { label: "Data Pipeline", status: "Ready" },
          ].map((item) => (
            <div key={item.label} className="flex justify-between items-center">
              <span className="text-[11px] text-[#2E4036]/50 dark:text-white/30 font-mono">{item.label}</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">{item.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
