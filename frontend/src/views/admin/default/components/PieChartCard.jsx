import PieChart from "components/charts/PieChart";
import { pieChartData, pieChartOptions } from "variables/charts";
import Card from "components/card";

const PieChartCard = () => {
  const segments = [
    { label: "Churned",  pct: "23%", color: "#CC5833" },
    { label: "Retained", pct: "63%", color: "#2E4036" },
    { label: "At-Risk",  pct: "14%", color: "#e8956e" },
  ];

  return (
    <Card extra="rounded-2xl p-5 hover:border-[#CC5833]/20 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[10px] uppercase tracking-widest font-mono mb-0.5" style={{ color: "rgba(255,255,255,0.25)" }}>
            Breakdown
          </p>
          <h4 className="text-base font-bold" style={{ color: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Churn Distribution
          </h4>
        </div>
        <select
          className="text-xs font-mono rounded-lg px-2 py-1 outline-none"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}
        >
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
          <option value="weekly">Weekly</option>
        </select>
      </div>

      {/* Donut chart */}
      <div className="flex h-[180px] w-full items-center justify-center">
        <PieChart options={pieChartOptions} series={pieChartData} />
      </div>

      {/* Legend stats */}
      <div
        className="mt-3 flex flex-row justify-between rounded-xl px-4 py-3"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
      >
        {segments.map((s, i) => (
          <div key={s.label} className={`flex flex-col items-center ${i > 0 ? "border-l border-white/5 pl-4" : ""}`}>
            <div className="flex items-center gap-1 mb-1">
              <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
              <p className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.35)" }}>{s.label}</p>
            </div>
            <p className="text-lg font-bold" style={{ color: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.pct}</p>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default PieChartCard;
