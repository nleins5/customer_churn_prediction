import React from "react";
import { MdGridOn, MdCheckCircle, MdBarChart, MdBubbleChart, MdTableChart, MdCompareArrows } from "react-icons/md";

const TABS = [
  { id: "overview", label: "Tổng quan", icon: MdGridOn, color: "#CC5833" },
  { id: "sanity", label: "Kiểm tra Logic", icon: MdCheckCircle, color: "#6ea87a" },
  { id: "stats", label: "Thống kê", icon: MdTableChart, color: "#e8956e" },
  { id: "univariate", label: "Đơn biến", icon: MdBarChart, color: "#CC5833" },
  { id: "correlation", label: "Tương quan", icon: MdBubbleChart, color: "#4a9e6e" },
  { id: "bivariate", label: "Hai biến", icon: MdCompareArrows, color: "#e8956e" },
];

const EdaTabs = ({ active, onChange }) => (
  <div className="flex flex-wrap gap-2 mb-6">
    {TABS.map((tab, i) => {
      const Icon = tab.icon;
      const isActive = active === tab.id;
      return (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className="group relative"
          style={{
            perspective: "600px",
          }}
        >
          <div
            className="flex items-center gap-2 px-5 py-3 rounded-2xl border text-sm font-semibold transition-all duration-500 cursor-pointer"
            style={{
              background: isActive
                ? `linear-gradient(135deg, ${tab.color}22, ${tab.color}08)`
                : "rgba(255,255,255,0.02)",
              borderColor: isActive ? `${tab.color}44` : "rgba(255,255,255,0.05)",
              color: isActive ? tab.color : "rgba(255,255,255,0.4)",
              transform: isActive
                ? "translateY(-2px) scale(1.03)"
                : "translateY(0) scale(1)",
              boxShadow: isActive
                ? `0 8px 32px ${tab.color}18, 0 0 0 1px ${tab.color}15`
                : "none",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            <Icon size={16} />
            <span>{tab.label}</span>
            {isActive && (
              <span
                className="absolute -bottom-1 left-1/2 h-0.5 rounded-full"
                style={{
                  width: "60%",
                  transform: "translateX(-50%)",
                  background: `linear-gradient(90deg, transparent, ${tab.color}, transparent)`,
                }}
              />
            )}
          </div>
        </button>
      );
    })}
  </div>
);

export { TABS };
export default EdaTabs;
