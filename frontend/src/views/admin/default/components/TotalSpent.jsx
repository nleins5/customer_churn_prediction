import React from "react";
import { MdArrowDropUp, MdOutlineCalendarToday } from "react-icons/md";
import Card from "components/card";
import { lineChartDataTotalSpent, lineChartOptionsTotalSpent } from "variables/charts";
import LineChart from "components/charts/LineChart";

const TotalSpent = () => {
  return (
    <Card extra="!p-6 hover:border-[#CC5833]/20 transition-all duration-300">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <button
          className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs transition-all duration-200"
          style={{
            background: "rgba(204,88,51,0.08)",
            border: "1px solid rgba(204,88,51,0.15)",
            color: "rgba(255,255,255,0.5)",
            fontFamily: "'IBM Plex Mono', monospace",
          }}
        >
          <MdOutlineCalendarToday className="h-3.5 w-3.5" style={{ color: "#CC5833" }} />
          This month
        </button>

        <div
          className="rounded-xl p-2"
          style={{ background: "rgba(204,88,51,0.06)", border: "1px solid rgba(204,88,51,0.12)" }}
        >
          <div className="flex gap-3 items-center">
            <span className="flex items-center gap-1 text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.4)" }}>
              <span className="h-2 w-2 rounded-full" style={{ background: "#CC5833" }} /> Revenue
            </span>
            <span className="flex items-center gap-1 text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.4)" }}>
              <span className="h-2 w-2 rounded-full" style={{ background: "#4a7060" }} /> Retained
            </span>
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className="flex items-baseline gap-3 mb-1">
        <p className="text-4xl font-bold" style={{ color: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          $37.5K
        </p>
        <div className="flex items-center gap-1">
          <MdArrowDropUp className="h-5 w-5" style={{ color: "#4ade80" }} />
          <p className="text-sm font-bold font-mono" style={{ color: "#4ade80" }}>+2.45%</p>
        </div>
      </div>
      <p className="text-xs font-mono mb-5" style={{ color: "rgba(255,255,255,0.3)" }}>Total Spent · vs last month</p>

      {/* Chart */}
      <div className="h-[220px] w-full">
        <LineChart options={lineChartOptionsTotalSpent} series={lineChartDataTotalSpent} />
      </div>
    </Card>
  );
};

export default TotalSpent;
