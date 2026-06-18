import BarChart from "components/charts/BarChart";
import { barChartDataDailyTraffic, barChartOptionsDailyTraffic } from "variables/charts";
import { MdArrowDropUp } from "react-icons/md";
import Card from "components/card";

const DailyTraffic = () => {
  return (
    <Card extra="pb-6 p-5 hover:border-[#CC5833]/20 transition-all duration-300">
      {/* Header */}
      <div className="flex flex-row justify-between mb-1">
        <div>
          <p className="text-[10px] uppercase tracking-widest font-mono mb-1" style={{ color: "rgba(255,255,255,0.25)" }}>
            Daily Traffic
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold" style={{ color: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              2,579
            </p>
            <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>Visitors</span>
          </div>
        </div>
        <div className="flex items-center gap-1 mt-2">
          <MdArrowDropUp className="h-5 w-5" style={{ color: "#4ade80" }} />
          <p className="text-sm font-bold font-mono" style={{ color: "#4ade80" }}>+2.45%</p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[240px] w-full pt-6">
        <BarChart chartData={barChartDataDailyTraffic} chartOptions={barChartOptionsDailyTraffic} />
      </div>
    </Card>
  );
};

export default DailyTraffic;
