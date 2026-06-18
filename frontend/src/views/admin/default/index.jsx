import React, { useState, useEffect } from "react";
import axios from "axios";
import Chart from "react-apexcharts";
import { MdPeople, MdTrendingUp, MdWarning, MdCheckCircle, MdArrowDropUp, MdArrowDropDown } from "react-icons/md";
import { IoStatsChart } from "react-icons/io5";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8002";

// ── Shared styles ─────────────────────────────────────────────────────────────
const CLAY  = "#CC5833";
const MOSS  = "#2E4036";
const AMBER = "#e8956e";
const TEAL  = "#4a7060";

const GlassCard = ({ children, className = "", glow = false }) => (
  <div
    className={`rounded-[2rem] border border-[#2E4036]/10 dark:border-white/5 backdrop-blur-sm transition-all duration-300 hover:border-[#2E4036]/20 dark:hover:border-white/10 ${className} bg-white/60 dark:bg-[#0d0d12]/45`}
    style={{
      boxShadow: glow ? `0 0 40px rgba(204,88,51,0.08)` : "none",
    }}
  >
    {children}
  </div>
);

const SectionLabel = ({ text }) => (
  <span className="inline-block font-mono text-[10px] uppercase tracking-widest px-3 py-1 rounded-full mb-2"
    style={{ color: CLAY, background: "rgba(204,88,51,0.08)", border: "1px solid rgba(204,88,51,0.15)" }}>
    {text}
  </span>
);

// ── KPI Card ──────────────────────────────────────────────────────────────────
const KpiCard = ({ icon, label, value, sub, trend, accent }) => (
  <GlassCard className="p-5 flex items-start gap-4" glow={accent}>
    <div className="h-11 w-11 flex-shrink-0 rounded-xl flex items-center justify-center bg-[#2E4036]/5 dark:bg-white/5 border border-[#2E4036]/10 dark:border-white/10"
      style={{
        borderColor: accent ? "rgba(204,88,51,0.2)" : undefined,
        background: accent ? "rgba(204,88,51,0.1)" : undefined
      }}>
      <span className={`${accent ? "text-[#CC5833]" : "text-[#2E4036]/60 dark:text-white/40"}`}>{icon}</span>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] uppercase tracking-widest font-mono mb-1 text-[#2E4036]/70 dark:text-white/60">{label}</p>
      <p className="text-2xl font-bold text-[#1A1A1A] dark:text-white truncate" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{value}</p>
      {sub && (
        <div className="flex items-center gap-1 mt-1">
          {trend === "up" ? <MdArrowDropUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> :
           trend === "down" ? <MdArrowDropDown className="h-4 w-4 text-[#CC5833]" /> : null}
          <p className={`text-xs font-mono ${trend === "up" ? "text-emerald-600 dark:text-emerald-400" : trend === "down" ? "text-[#CC5833]" : "text-[#2E4036]/60 dark:text-white/50"}`}>{sub}</p>
        </div>
      )}
    </div>
  </GlassCard>
);

// ── Feature Risk Table ────────────────────────────────────────────────────────
const impactColor = { Cao: CLAY, "Trung bình": AMBER, Thấp: TEAL };

const FeatureRiskTable = ({ data = [] }) => (
  <GlassCard className="p-6 w-full">
    <SectionLabel text="Top Risk Features" />
    <h3 className="text-lg font-bold text-[#1A1A1A] dark:text-white mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      Yếu tố ảnh hưởng Churn
    </h3>
    <table className="w-full">
      <thead>
        <tr className="border-b border-[#2E4036]/10 dark:border-white/5">
          {["Feature", "Mức ảnh hưởng", "Hướng tác động", "Risk Score"].map(h => (
            <th key={h} className="py-2.5 pr-4 text-left text-[10px] uppercase tracking-widest font-mono text-[#2E4036]/70 dark:text-white/60">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i} className="border-b border-[#2E4036]/5 dark:border-white/4 hover:bg-[#2E4036]/5 dark:hover:bg-white/[0.02] transition-colors">
            <td className="py-3 pr-4">
              <span className="text-sm font-mono font-semibold" style={{ color: AMBER }}>{row.feature}</span>
            </td>
            <td className="py-3 pr-4">
              <span className="text-xs font-mono px-2 py-0.5 rounded-full border font-medium"
                style={{ color: impactColor[row.impact] || AMBER, borderColor: `${impactColor[row.impact] || AMBER}30`, background: `${impactColor[row.impact] || AMBER}10` }}>
                {row.impact}
              </span>
            </td>
            <td className="py-3 pr-4">
              <span className="text-xs text-[#2E4036]/80 dark:text-white/80">{row.direction}</span>
            </td>
            <td className="py-3">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-[#2E4036]/10 dark:bg-white/6">
                  <div className="h-1.5 rounded-full" style={{ width: `${row.risk}%`, background: `linear-gradient(to right, ${CLAY}, ${AMBER})` }} />
                </div>
                <span className="text-xs font-mono w-8 text-right text-[#2E4036]/80 dark:text-white/80">{row.risk}%</span>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </GlassCard>
);

const riskBadge = {
  High:   { color: CLAY, bg: "rgba(204,88,51,0.12)", border: "rgba(204,88,51,0.25)" },
  Medium: { color: AMBER, bg: "rgba(232,149,110,0.12)", border: "rgba(232,149,110,0.25)" },
  Low:    { color: "#4ade80", bg: "rgba(74,222,128,0.08)", border: "rgba(74,222,128,0.2)" },
};

const PredictionLogTable = ({ data = [] }) => (
  <GlassCard className="p-6 w-full">
    <SectionLabel text="Prediction Log" />
    <h3 className="text-lg font-bold text-[#1A1A1A] dark:text-white mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      Dự đoán gần đây
    </h3>
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px]">
        <thead>
          <tr className="border-b border-[#2E4036]/10 dark:border-white/5">
            {["Customer ID", "Contract", "Tenure", "Monthly Charges", "Risk Level", "Churn Prob"].map(h => (
              <th key={h} className="py-2.5 pr-4 text-left text-[10px] uppercase tracking-widest font-mono text-[#2E4036]/70 dark:text-white/60">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => {
            const badge = riskBadge[row.risk] || riskBadge.Medium;
            return (
              <tr key={i} className="border-b border-[#2E4036]/5 dark:border-white/4 hover:bg-[#2E4036]/5 dark:hover:bg-white/[0.02] transition-colors">
                <td className="py-3 pr-4 font-mono text-sm" style={{ color: AMBER }}>{row.id}</td>
                <td className="py-3 pr-4 text-sm font-mono text-[#2E4036]/80 dark:text-white/80">{row.contract}</td>
                <td className="py-3 pr-4 text-sm font-mono text-[#2E4036]/80 dark:text-white/80">{row.tenure} tháng</td>
                <td className="py-3 pr-4 text-sm font-mono text-[#2E4036]/80 dark:text-white/80">{row.charges}</td>
                <td className="py-3 pr-4">
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full border font-medium"
                    style={{ color: badge.color, background: badge.bg, borderColor: badge.border }}>
                    {row.risk}
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-[#2E4036]/10 dark:bg-white/6">
                      <div className="h-1.5 rounded-full" style={{ width: row.prob, background: `linear-gradient(to right, ${TEAL}, ${CLAY})` }} />
                    </div>
                    <span className="text-xs font-mono text-[#2E4036]/80 dark:text-white/80">{row.prob}</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </GlassCard>
);

// ── Main Dashboard ────────────────────────────────────────────────────────────
const Dashboard = () => {
  const [overview, setOverview] = useState(null);
  const [churnDist, setChurnDist] = useState(null);

  const [contractCategories, setContractCategories] = useState(["Month-to-month", "One year", "Two year"]);
  const [contractChurnSeries, setContractChurnSeries] = useState([
    { name: "Churn Rate (%)", data: [42.7, 11.3, 2.8], color: CLAY },
    { name: "Retain Rate (%)", data: [57.3, 88.7, 97.2], color: TEAL },
  ]);

  const [internetServiceSeries, setInternetServiceSeries] = useState([44.0, 34.1, 21.9]);
  const [internetServiceLabels, setInternetServiceLabels] = useState(["Fiber Optic", "DSL", "No Internet"]);

  const [tenureCategories, setTenureCategories] = useState(["0-12", "13-24", "25-36", "37-48", "49-60", "61-72"]);
  const [tenureSeries, setTenureSeries] = useState([
    { name: "Churn", data: [31.6, 26.8, 22.1, 18.4, 15.2, 10.5], color: CLAY },
    { name: "Retain", data: [68.4, 73.2, 77.9, 81.6, 84.8, 89.5], color: TEAL },
  ]);

  const [riskFeatures, setRiskFeatures] = useState([
    { feature: "Loại hợp đồng (Contract)",        impact: "Cao",    direction: "Month-to-month → rời mạng nhiều nhất", risk: 90 },
    { feature: "Thời gian sử dụng (Tenure)",      impact: "Cao",    direction: "Tenure thấp → rủi ro cao",             risk: 85 },
    { feature: "Dịch vụ Internet (Internet Service)", impact: "Trung bình", direction: "Fiber Optic → churn cao hơn",      risk: 62 },
    { feature: "Cước phí hàng tháng (Monthly Charges)",  impact: "Trung bình", direction: "Cước cao → tỷ lệ churn tăng",      risk: 58 },
    { feature: "Hỗ trợ kỹ thuật (Tech Support)",     impact: "Thấp",   direction: "Không có hỗ trợ kỹ thuật",             risk: 35 },
  ]);

  const [recentPredictions, setRecentPredictions] = useState([
    { id: "CUS-7091", contract: "Month-to-month", tenure: 4,  charges: "$89.45", risk: "High",   prob: "78%"  },
    { id: "CUS-3842", contract: "Two year",        tenure: 52, charges: "$55.20", risk: "Low",    prob: "4%"   },
    { id: "CUS-5517", contract: "One year",         tenure: 13, charges: "$71.30", risk: "Medium", prob: "34%"  },
    { id: "CUS-9024", contract: "Month-to-month", tenure: 2,  charges: "$102.60", risk: "High",  prob: "85%"  },
    { id: "CUS-1183", contract: "Two year",        tenure: 68, charges: "$48.90", risk: "Low",    prob: "2%"   },
  ]);
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains("dark");
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  // Options variables inside component context:
  const chartTextColor = isDark ? "rgba(255,255,255,0.85)" : "#1A1A1A";
  const chartGridColor = isDark ? "rgba(255,255,255,0.04)" : "rgba(46,64,54,0.1)";
  const chartTooltipTheme = isDark ? "dark" : "light";
  const strokeColor = isDark ? "#0d0d12" : "#FAF8F5";

  const contractChurnOptions = {
    chart: { background: "transparent", toolbar: { show: false }, dropShadow: { enabled: true, blur: 10, opacity: 0.25, color: [CLAY, TEAL] } },
    theme: { mode: chartTooltipTheme },
    plotOptions: { bar: { borderRadius: 8, columnWidth: "45%", distributed: false } },
    xaxis: { categories: contractCategories,
      labels: { style: { colors: chartTextColor, fontSize: "11px", fontFamily: "'IBM Plex Mono', monospace" } },
      axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { labels: { style: { colors: chartTextColor, fontSize: "10px" } } },
    grid: { borderColor: chartGridColor, strokeDashArray: 4 },
    dataLabels: { enabled: true, style: { colors: [isDark ? "#fff" : "#1a1a1a"], fontSize: "11px", fontFamily: "'IBM Plex Mono', monospace" },
      formatter: (val) => `${val}%` },
    tooltip: { theme: chartTooltipTheme },
    fill: { type: "gradient", gradient: { type: "vertical", shadeIntensity: 0.5, opacityFrom: 1, opacityTo: 0.7, colorStops: [
      [{ offset: 0, color: CLAY, opacity: 1 }, { offset: 100, color: AMBER, opacity: 0.6 }],
      [{ offset: 0, color: TEAL, opacity: 1 }, { offset: 100, color: MOSS, opacity: 0.6 }],
    ]}},
    legend: { show: true, position: "top", labels: { colors: chartTextColor }, fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px" },
  };

  const internetDonutOptions = {
    chart: { background: "transparent", dropShadow: { enabled: true, blur: 12, opacity: 0.3 } },
    theme: { mode: chartTooltipTheme },
    labels: internetServiceLabels.map(l => l === "No" ? "No Internet" : l === "Fiber optic" ? "Fiber Optic" : l),
    colors: [CLAY, AMBER, TEAL],
    fill: { type: "gradient", gradient: { shade: chartTooltipTheme, type: "horizontal", shadeIntensity: 0.5, opacityFrom: 1, opacityTo: 0.8 }, colors: [CLAY, AMBER, TEAL] },
    stroke: { width: 3, colors: [strokeColor] },
    legend: { show: false },
    dataLabels: { enabled: false },
    plotOptions: { pie: { donut: { size: "70%", labels: { show: true,
      total: { show: true, label: "Internet", color: chartTextColor, fontFamily: "'Plus Jakarta Sans', sans-serif",
        formatter: () => "Service" } } } } },
    tooltip: { theme: chartTooltipTheme },
  };

  const tenureOptions = {
    chart: { background: "transparent", toolbar: { show: false }, type: "area",
      dropShadow: { enabled: true, blur: 14, opacity: 0.35, color: [CLAY, TEAL] } },
    theme: { mode: chartTooltipTheme },
    stroke: { curve: "smooth", width: 2 },
    fill: { type: "gradient", gradient: { type: "vertical", shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.02 }, colors: [CLAY, TEAL] },
    xaxis: { categories: tenureCategories,
      labels: { style: { colors: chartTextColor, fontSize: "11px", fontFamily: "'IBM Plex Mono', monospace" } },
      axisBorder: { show: false }, axisTicks: { show: false },
      title: { text: "Tenure (tháng)", style: { color: chartTextColor, fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px" } } },
    yaxis: { labels: { style: { colors: chartTextColor } } },
    grid: { borderColor: chartGridColor, strokeDashArray: 4 },
    dataLabels: { enabled: false },
    tooltip: { theme: chartTooltipTheme },
    markers: { size: 4, colors: [CLAY, TEAL], strokeColors: strokeColor, strokeWidth: 2, hover: { size: 7 } },
    legend: { show: true, position: "top", labels: { colors: chartTextColor }, fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px" },
  };

  useEffect(() => {
    axios.get(`${API_BASE}/api/v1/eda/overview`)
      .then(r => setOverview(r.data))
      .catch(() => {});
    // Get churn distribution from categorical endpoint
    axios.get(`${API_BASE}/api/v1/eda/distribution/categorical/Churn`)
      .then(r => setChurnDist(r.data))
      .catch(() => {});

    // Fetch contract vs churn bivariate analysis
    axios.get(`${API_BASE}/api/v1/eda/bivariate/Contract`)
      .then(r => {
        if (r.data && r.data.type === "categorical") {
          const index = r.data.index;
          const values = r.data.values;
          const churnData = [];
          const retainData = [];
          index.forEach((cat, idx) => {
            const row = values[idx] || [0, 0];
            const noVal = row[0] || 0;
            const yesVal = row[1] || 0;
            const total = noVal + yesVal;
            const churnPct = total > 0 ? Number(((yesVal / total) * 100).toFixed(1)) : 0;
            const retainPct = total > 0 ? Number(((noVal / total) * 100).toFixed(1)) : 0;
            churnData.push(churnPct);
            retainData.push(retainPct);
          });
          setContractCategories(index);
          setContractChurnSeries([
            { name: "Churn Rate (%)", data: churnData, color: CLAY },
            { name: "Retain Rate (%)", data: retainData, color: TEAL }
          ]);
        }
      })
      .catch((err) => console.error("Error fetching Contract bivariate:", err));

    // Fetch InternetService distribution
    axios.get(`${API_BASE}/api/v1/eda/distribution/categorical/InternetService`)
      .then(r => {
        if (r.data && r.data.percentages && r.data.labels) {
          setInternetServiceSeries(r.data.percentages);
          setInternetServiceLabels(r.data.labels);
        }
      })
      .catch((err) => console.error("Error fetching InternetService distribution:", err));

    // Fetch tenure binned
    axios.get(`${API_BASE}/api/v1/eda/tenure-binned`)
      .then(r => {
        if (r.data && r.data.categories) {
          setTenureCategories(r.data.categories);
          setTenureSeries([
            { name: "Churn", data: r.data.churn_percentages, color: CLAY },
            { name: "Retain", data: r.data.retain_percentages, color: TEAL }
          ]);
        }
      })
      .catch((err) => console.error("Error fetching tenure binned:", err));

    // Fetch risk features
    axios.get(`${API_BASE}/api/v1/eda/risk-features`)
      .then(r => {
        if (r.data && r.data.risk_features) {
          setRiskFeatures(r.data.risk_features);
        }
      })
      .catch((err) => console.error("Error fetching risk features:", err));

    // Fetch recent predictions
    axios.get(`${API_BASE}/api/recent-logs?limit=5`)
      .then(r => {
        if (r.data && Array.isArray(r.data)) {
          setRecentPredictions(r.data);
        }
      })
      .catch((err) => console.error("Error fetching recent logs:", err));
  }, []);

  const totalSamples   = overview?.shape?.rows        ?? 7043;
  const totalFeatures  = (overview?.shape?.columns ?? 21) - 1; // exclude target
  const missingValues  = overview?.missing_values_count ?? 0;

  // Compute churn count from API distribution data, or fall back to 26.5%
  let churnCount = Math.round(totalSamples * 0.265);
  if (churnDist && churnDist.labels && churnDist.counts) {
    const yesIndex = churnDist.labels.indexOf("Yes");
    if (yesIndex !== -1) {
      churnCount = churnDist.counts[yesIndex];
    }
  }
  const retainCount = totalSamples - churnCount;
  const churnPct = ((churnCount / totalSamples) * 100).toFixed(1);
  const retainPct = ((retainCount / totalSamples) * 100).toFixed(1);

  return (
    <div className="pt-5 pb-10 space-y-5 text-[#1A1A1A] dark:text-[#FAF8F5] transition-colors duration-300">

      {/* ── Page title ───────────────────────────────────────────────── */}
      <div>
        <SectionLabel text="Main Dashboard" />
        <h1 className="text-2xl font-bold text-[#1A1A1A] dark:text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Tổng quan hệ thống
        </h1>
        <p className="text-sm font-mono mt-1 text-[#2E4036]/80 dark:text-white/80">
          Telco Customer Churn — IBM Sample Dataset · {totalSamples.toLocaleString()} khách hàng
        </p>
      </div>

      {/* ── KPI Row ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 2xl:grid-cols-5">
        <KpiCard accent icon={<MdWarning size={20} />}    label="Tổng khách churn"    value={churnCount.toLocaleString()} sub={`${churnPct}% tổng dataset`} trend="down" />
        <KpiCard icon={<MdPeople size={20} />}            label="Tổng khách hàng"     value={totalSamples.toLocaleString()} sub="Telco dataset" />
        <KpiCard icon={<MdCheckCircle size={20} />}       label="Khách hàng trung thành" value={retainCount.toLocaleString()} sub={`${retainPct}% retention`} trend="up" />
        <KpiCard icon={<IoStatsChart size={18} />}        label="Số thuộc tính"       value={totalFeatures} sub="Features in model" />
        <KpiCard icon={<MdTrendingUp size={20} />}        label="Giá trị khuyết"      value={missingValues} sub={missingValues === 0 ? "Dữ liệu sạch ✓" : "Cần xử lý"} trend={missingValues === 0 ? "up" : "down"} />
      </div>

      {/* ── Charts row 1 ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Contract vs Churn — bar */}
        <GlassCard className="p-6 lg:col-span-2">
          <SectionLabel text="Bivariate Analysis" />
          <h3 className="text-lg font-bold text-[#1A1A1A] dark:text-white mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Churn Rate theo Loại Hợp đồng
          </h3>
          <div className="h-[260px]">
            <Chart options={contractChurnOptions} series={contractChurnSeries} type="bar" height="100%" />
          </div>
        </GlassCard>

        {/* Internet Service donut */}
        <GlassCard className="p-6">
          <SectionLabel text="Distribution" />
          <h3 className="text-lg font-bold text-[#1A1A1A] dark:text-white mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Dịch vụ Internet
          </h3>
          <div className="h-[200px]">
            <Chart options={internetDonutOptions} series={internetServiceSeries} type="donut" height="100%" />
          </div>
          <div className="flex justify-around mt-3">
            {internetServiceLabels.map((label, idx) => {
              const displayLabel = label === "No" ? "No Internet" : label === "Fiber optic" ? "Fiber Optic" : label;
              const pct = internetServiceSeries[idx] !== undefined ? `${Number(internetServiceSeries[idx]).toFixed(1)}%` : "0.0%";
              const colors = [CLAY, AMBER, TEAL];
              const color = colors[idx] || TEAL;
              return (
                <div key={label} className="flex flex-col items-center gap-0.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: color }} />
                  <p className="text-[9px] font-mono text-[#2E4036]/80 dark:text-white/80">{displayLabel}</p>
                  <p className="text-sm font-bold text-[#1A1A1A] dark:text-white">{pct}</p>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>

      {/* ── Tenure chart ─────────────────────────────────────────────── */}
      <GlassCard className="p-6">
        <SectionLabel text="Tenure Analysis" />
        <h3 className="text-lg font-bold text-[#1A1A1A] dark:text-white mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Churn Rate theo Tenure (số tháng sử dụng)
        </h3>
        <div className="h-[220px]">
          <Chart options={tenureOptions} series={tenureSeries} type="area" height="100%" />
        </div>
      </GlassCard>

      {/* ── Tables ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <FeatureRiskTable data={riskFeatures} />
        <PredictionLogTable data={recentPredictions} />
      </div>
    </div>
  );
};

export default Dashboard;
