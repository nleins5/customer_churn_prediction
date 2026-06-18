import Card from "components/card";
import BarChart from "components/charts/BarChart";
import { barChartDataWeeklyRevenue, barChartOptionsWeeklyRevenue } from "variables/charts";

const WeeklyRevenue = () => {
  const legend = [
    { label: "Retained", color: "#2E4036" },
    { label: "At-Risk",  color: "#e8956e" },
    { label: "Churned",  color: "#CC5833" },
  ];

  return (
    <Card extra="flex flex-col w-full rounded-2xl py-6 px-4 hover:border-[#CC5833]/20 transition-all duration-300">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between px-2">
        <div>
          <p className="text-[10px] uppercase tracking-widest font-mono mb-1" style={{ color: "rgba(255,255,255,0.25)" }}>Weekly</p>
          <h2 className="text-lg font-bold" style={{ color: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Customer Segments
          </h2>
        </div>
        {/* Mini legend */}
        <div className="flex gap-3">
          {legend.map((l) => (
            <span key={l.label} className="flex items-center gap-1 text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.35)" }}>
              <span className="h-2 w-2 rounded-sm" style={{ background: l.color }} />
              {l.label}
            </span>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-[260px] w-full xl:h-[320px]">
        <BarChart chartData={barChartDataWeeklyRevenue} chartOptions={barChartOptionsWeeklyRevenue} />
      </div>
    </Card>
  );
};

export default WeeklyRevenue;
