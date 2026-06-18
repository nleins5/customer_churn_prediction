import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Chart from "react-apexcharts";
import { MdGridOn, MdWarning, MdAnalytics, MdCheckCircle, MdBarChart, MdBubbleChart, MdTableChart, MdCompareArrows } from "react-icons/md";
import { IoDocuments } from "react-icons/io5";

const API = process.env.REACT_APP_API_URL || "http://localhost:8002";
const ax = "rgba(255,255,255,0.85)", gr = "rgba(255,255,255,0.06)";
const base = { chart: { background: "transparent", toolbar: { show: false }, animations: { enabled: true, easing: "easeinout", speed: 600 } }, grid: { borderColor: gr, strokeDashArray: 4 }, tooltip: { theme: "dark" } };

const TABS = [
  { id: "overview", label: "Tổng quan", icon: MdGridOn, c: "#CC5833" },
  { id: "sanity", label: "Kiểm tra Logic", icon: MdCheckCircle, c: "#6ea87a" },
  { id: "stats", label: "Thống kê mô tả", icon: MdTableChart, c: "#e8956e" },
  { id: "univariate", label: "Phân tích đơn biến", icon: MdBarChart, c: "#CC5833" },
  { id: "correlation", label: "Ma trận tương quan", icon: MdBubbleChart, c: "#4a9e6e" },
  { id: "bivariate", label: "Phân tích hai biến", icon: MdCompareArrows, c: "#e8956e" },
];

const Card = ({ children, className = "" }) => (<div className={`rounded-2xl border border-white/10 backdrop-blur-sm ${className}`} style={{ background: "rgba(255,255,255,0.03)" }}>{children}</div>);
const Tag = ({ t, c = "#CC5833" }) => <span className="inline-block font-mono text-[10px] uppercase tracking-widest px-3 py-1 rounded-full mb-3" style={{ color: c, background: `${c}18`, border: `1px solid ${c}40` }}>{t}</span>;
const H = ({ children }) => <h3 className="text-lg font-bold text-white mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{children}</h3>;
const Spin = () => <div className="flex h-[300px] items-center justify-center"><div className="h-8 w-8 rounded-full border-2 border-t-[#CC5833] border-white/5 animate-spin" /></div>;
const selCls = "rounded-xl border border-white/20 px-3 py-2 text-sm text-white/80 font-mono focus:outline-none focus:border-[#CC5833]/50 transition-colors";
const selSt = { background: "rgba(255,255,255,0.06)" };

const EDADashboard = () => {
  const [tab, setTab] = useState("overview");
  const [ov, setOv] = useState(null);
  const [san, setSan] = useState(null);
  const [ns, setNs] = useState(null);
  const [cor, setCor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uniCol, setUniCol] = useState("tenure");
  const [uniD, setUniD] = useState(null);
  const [uniL, setUniL] = useState(false);
  const [biCol, setBiCol] = useState("Contract");
  const [biD, setBiD] = useState(null);
  const [biL, setBiL] = useState(false);
  const [flipDir, setFlipDir] = useState(1);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [o, s, n, c] = await Promise.all([axios.get(`${API}/api/v1/eda/overview`), axios.get(`${API}/api/v1/eda/sanity-check`), axios.get(`${API}/api/v1/eda/numerical-stats`), axios.get(`${API}/api/v1/eda/correlation`)]);
        setOv(o.data); setSan(s.data); setNs(n.data); setCor(c.data); setLoading(false);
      } catch { setError("Không thể kết nối Backend."); setLoading(false); }
    })();
  }, []);

  useEffect(() => {
    if (!ov) return;
    const isNum = ov.feature_roles.numerical.includes(uniCol);
    (async () => {
      try { setUniL(true); const r = await axios.get(isNum ? `${API}/api/v1/eda/distribution/numerical/${uniCol}?bins=15` : `${API}/api/v1/eda/distribution/categorical/${uniCol}`); setUniD({ isNum, data: r.data }); setUniL(false); } catch { setUniL(false); }
    })();
  }, [uniCol, ov]);

  useEffect(() => {
    if (!ov) return;
    (async () => {
      try { setBiL(true); const r = await axios.get(`${API}/api/v1/eda/bivariate/${biCol}`); setBiD(r.data); setBiL(false); } catch { setBiL(false); }
    })();
  }, [biCol, ov]);

  const switchTab = useCallback((id) => {
    const ci = TABS.findIndex(t => t.id === tab), ni = TABS.findIndex(t => t.id === id);
    setFlipDir(ni > ci ? 1 : -1);
    setTab(id);
  }, [tab]);

  if (loading) return <div className="flex h-[80vh] items-center justify-center"><div className="flex flex-col items-center gap-4"><div className="relative h-16 w-16"><div className="absolute inset-0 rounded-full border-2 border-[#CC5833]/20 animate-ping" /><div className="h-16 w-16 rounded-full border-2 border-t-[#CC5833] border-white/5 animate-spin" /></div><p className="text-sm font-mono text-white/40 animate-pulse">Đang tải dữ liệu EDA...</p></div></div>;
  if (error) return <div className="flex h-[80vh] items-center justify-center"><Card className="p-10 max-w-md text-center"><MdWarning className="h-7 w-7 text-red-400 mx-auto mb-4" /><h3 className="text-lg font-bold text-white mb-2">Lỗi kết nối</h3><p className="text-white/40 text-sm mb-6">{error}</p><button onClick={() => window.location.reload()} className="rounded-xl px-6 py-2.5 text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg, #CC5833, #a8451e)" }}>Tải lại</button></Card></div>;

  const nsk = Object.keys(ns || {}).filter(k => k !== "insight");

  // ─── Tab content renderers ────────────────────────────────────
  const renderOverview = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[{ icon: <MdGridOn size={22} />, l: "Số mẫu dữ liệu", v: ov?.shape?.rows?.toLocaleString(), a: false },
          { icon: <IoDocuments size={20} />, l: "Số thuộc tính", v: ov?.shape?.columns, a: false },
          { icon: <MdWarning size={22} />, l: "Bản ghi trùng", v: ov?.duplicates, a: true },
          { icon: <MdAnalytics size={22} />, l: "Giá trị khuyết", v: ov?.missing_values_count?.toLocaleString(), a: true },
        ].map((k, i) => (
          <Card key={i} className="p-5 flex items-center gap-4 hover:border-[#CC5833]/40 transition-all duration-300 hover:-translate-y-1">
            <div className="h-12 w-12 flex-shrink-0 rounded-xl flex items-center justify-center" style={{ background: k.a ? "rgba(204,88,51,0.18)" : "rgba(46,64,54,0.3)", border: "1px solid rgba(255,255,255,0.1)" }}><span style={{ color: k.a ? "#CC5833" : "#6ea87a" }}>{k.icon}</span></div>
            <div><p className="text-[11px] uppercase tracking-widest font-mono text-white/50 mb-0.5">{k.l}</p><p className="text-2xl font-bold text-white" style={{ fontFamily: "'Plus Jakarta Sans'" }}>{k.v}</p></div>
          </Card>
        ))}
      </div>
      <Card className="p-6"><div className="flex items-start gap-3"><div className="h-8 w-8 flex-shrink-0 rounded-lg flex items-center justify-center" style={{ background: "rgba(46,64,54,0.4)", border: "1px solid rgba(110,168,122,0.3)" }}><MdCheckCircle className="h-4 w-4 text-emerald-400" /></div><div><p className="text-xs uppercase tracking-widest font-mono text-white/80 mb-1">Tổng quan dữ liệu</p><p className="text-white/85 text-sm leading-relaxed">{ov?.insight}</p></div></div></Card>
      <Card className="p-6"><Tag t="Feature Roles" c="#6ea87a" /><H>Phân loại thuộc tính</H><div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
        {[{ l: "Numerical", d: ov?.feature_roles?.numerical, c: "#CC5833" }, { l: "Categorical", d: ov?.feature_roles?.categorical, c: "#6ea87a" }, { l: "Target", d: ov?.feature_roles?.target, c: "#e8956e" }].map(g => (
          <div key={g.l} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="text-[10px] uppercase tracking-widest font-mono mb-2" style={{ color: g.c }}>{g.l} ({g.d?.length || 0})</p>
            <div className="flex flex-wrap gap-1.5">{g.d?.map(f => <span key={f} className="text-xs font-mono text-white/80 px-2 py-0.5 rounded-md" style={{ background: `${g.c}15`, border: `1px solid ${g.c}30` }}>{f}</span>)}</div>
          </div>
        ))}
      </div></Card>
    </div>
  );

  const renderSanity = () => (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <Card className="p-6 lg:col-span-1"><Tag t="Sanity Check" c="#6ea87a" /><H>Kiểm tra Logic</H><div className="space-y-3 mt-4">
        {[{ l: "Tenure lỗi (≤ 0)", v: san?.numerical_sanity?.tenure_invalid }, { l: "Cước tháng lỗi (≤ 0)", v: san?.numerical_sanity?.monthly_charges_invalid }, { l: "Cước tổng lỗi (≤ 0)", v: san?.numerical_sanity?.total_charges_invalid }, { l: "Sai logic Internet", v: san?.categorical_sanity?.internet_logic_errors }].map(x => (
          <div key={x.l} className="flex justify-between items-center py-2.5 border-b border-white/10"><span className="text-sm text-white/85 font-mono">{x.l}</span><span className={`text-sm font-bold font-mono ${(x.v || 0) > 0 ? "text-red-400" : "text-emerald-400"}`}>{x.v || 0} dòng</span></div>
        ))}
      </div></Card>
      <Card className="p-6 lg:col-span-2"><Tag t="Data Quality" c="#e8956e" /><H>Nhận xét chất lượng dữ liệu</H><p className="text-white/80 text-sm leading-relaxed mt-3">{san?.insight}</p></Card>
    </div>
  );

  const renderStats = () => (
    <Card className="p-6 overflow-x-auto"><Tag t="Descriptive Statistics" /><H>Thống kê mô tả</H>
      <table className="w-full text-left border-collapse min-w-[800px] mt-4"><thead><tr className="border-b border-white/10">{["Thuộc tính", "Mean", "Min", "Max", "Median", "Variance", "Skewness", "N-Unique"].map(h => <th key={h} className="py-3 pr-4 text-[11px] uppercase tracking-widest font-mono text-white/85">{h}</th>)}</tr></thead>
        <tbody>{nsk.map(k => { const it = ns[k]; return (<tr key={k} className="border-b border-white/[0.08] hover:bg-white/[0.04] transition-colors"><td className="py-3.5 pr-4 font-semibold text-[#e8956e] font-mono text-sm">{k}</td>{[it.mean, it.min, it.max, it.median, it.variance, it.skewness].map((v, i) => <td key={i} className="py-3.5 pr-4 text-white/80 text-sm font-mono">{v?.toFixed(2)}</td>)}<td className="py-3.5 text-white/80 text-sm font-mono">{it.nunique}</td></tr>); })}</tbody></table>
      <div className="mt-5 pt-4 border-t border-white/10"><p className="text-white/85 text-sm leading-relaxed"><span className="text-[#e8956e] font-semibold">Nhận xét:</span> {ns?.insight}</p></div>
    </Card>
  );

  const renderUnivariate = () => {
    const hOpt = { ...base, chart: { ...base.chart, type: "bar" }, plotOptions: { bar: { borderRadius: 5, columnWidth: "70%" } }, xaxis: { categories: uniD?.isNum ? uniD.data.labels : [], labels: { rotate: -45, style: { colors: ax, fontSize: "10px" } } }, yaxis: { labels: { style: { colors: ax } } }, fill: { type: "gradient", gradient: { type: "vertical", gradientToColors: ["#2E4036"], stops: [0, 100] }, colors: ["#CC5833"] }, dataLabels: { enabled: false } };
    const bOpt = { ...base, chart: { ...base.chart, type: "boxPlot" }, colors: ["#CC5833", "#2E4036"], xaxis: { labels: { style: { colors: ax } } }, yaxis: { labels: { style: { colors: ax } } } };
    const pOpt = !uniD || uniD.isNum ? {} : { labels: uniD.data.labels, colors: ["#CC5833", "#2E4036", "#6ea87a", "#e8956e", "#4a7060", "#8c3d22"], chart: { type: "donut", background: "transparent" }, legend: { position: "bottom", labels: { colors: ax } }, dataLabels: { enabled: true, style: { colors: ["#fff"] } }, stroke: { width: 2, colors: ["#0a0a0f"] }, tooltip: { theme: "dark" }, plotOptions: { pie: { donut: { size: "65%", labels: { show: true, total: { show: true, color: ax } } } } } };
    return (
      <Card className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 gap-4">
          <div><Tag t="Univariate Analysis" /><H>Phân tích đơn biến</H><p className="text-white/80 text-xs font-mono">Phân bố giá trị của từng thuộc tính</p></div>
          <select value={uniCol} onChange={e => setUniCol(e.target.value)} className={selCls} style={selSt}>
            <optgroup label="Numerical" style={{ color: "#CC5833" }}>{ov?.feature_roles?.numerical.map(c => <option key={c} value={c}>{c}</option>)}</optgroup>
            <optgroup label="Categorical" style={{ color: "#6ea87a" }}>{ov?.feature_roles?.categorical.map(c => <option key={c} value={c}>{c}</option>)}</optgroup>
          </select>
        </div>
        {uniL ? <Spin /> : uniD ? (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="h-[320px]"><p className="text-[10px] uppercase tracking-widest font-mono text-white/80 mb-2 text-center">{uniD.isNum ? "Histogram" : "Tỷ lệ (%)"}</p>
              {uniD.isNum ? <Chart options={hOpt} series={[{ name: "Count", data: uniD.data.values }]} type="bar" height="90%" /> : <Chart options={pOpt} series={uniD.data.counts} type="donut" height="90%" />}
            </div>
            <div className="flex flex-col gap-4">
              {uniD.isNum ? (<div className="h-[200px]"><p className="text-[10px] uppercase tracking-widest font-mono text-white/80 mb-2 text-center">Boxplot</p><Chart options={bOpt} series={[{ type: "boxPlot", data: [{ x: uniCol, y: [uniD.data.boxplot_data?.min, uniD.data.boxplot_data?.q1, uniD.data.boxplot_data?.median, uniD.data.boxplot_data?.q3, uniD.data.boxplot_data?.max] }] }]} type="boxPlot" height="85%" /></div>
              ) : (<div className="rounded-xl p-4 space-y-2 max-h-[200px] overflow-y-auto" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}><p className="text-[10px] uppercase tracking-widest font-mono text-white/80 mb-2">Bảng tần suất</p>{uniD.data.labels.map((l, i) => <div key={l} className="flex justify-between text-sm"><span className="text-white/85 font-mono">{l}</span><span className="text-white/95 font-mono font-semibold">{uniD.data.counts[i].toLocaleString()} ({uniD.data.percentages[i].toFixed(1)}%)</span></div>)}</div>)}
              <div className="rounded-xl p-4 flex-1" style={{ background: "rgba(204,88,51,0.06)", border: "1px solid rgba(204,88,51,0.18)" }}><p className="text-[10px] uppercase tracking-widest font-mono text-[#e8956e] mb-2">Nhận xét</p><p className="text-white/80 text-sm leading-relaxed">{uniD.data.insight}</p></div>
            </div>
          </div>
        ) : null}
      </Card>
    );
  };

  const renderCorrelation = () => {
    const cOpt = { ...base, chart: { ...base.chart, type: "heatmap" }, dataLabels: { enabled: true, style: { colors: ["#fff"], fontSize: "9px" } }, colors: ["#CC5833"], xaxis: { labels: { style: { colors: ax, fontSize: "9px" }, rotate: -45 } }, yaxis: { labels: { style: { colors: ax, fontSize: "9px" } } } };
    return (
      <Card className="p-6"><Tag t="Correlation Matrix" c="#4a9e6e" /><H>Ma trận tương quan</H><p className="text-white/80 text-xs font-mono mb-4">Độ tương quan tuyến tính giữa các biến định lượng</p>
        <div className="h-[400px]"><Chart options={cOpt} series={cor ? cor.index.map((r, ri) => ({ name: r, data: cor.columns.map((c, ci) => ({ x: c, y: parseFloat(cor.values[ri][ci].toFixed(2)) })) })) : []} type="heatmap" height="100%" /></div>
        <div className="mt-4 rounded-xl p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}><p className="text-white/80 text-sm leading-relaxed"><span className="text-[#e8956e] font-semibold">Tương quan:</span> {cor?.insight}</p></div>
      </Card>
    );
  };

  const renderBivariate = () => {
    const bvOpt = !biD ? {} : biD.type === "categorical" ? { ...base, chart: { ...base.chart, type: "bar", stacked: true }, plotOptions: { bar: { horizontal: false, borderRadius: 4 } }, xaxis: { categories: biD.index, labels: { style: { colors: ax } } }, yaxis: { labels: { style: { colors: ax } } }, colors: ["#2E4036", "#CC5833"], legend: { position: "top", labels: { colors: ax } } } : { ...base, chart: { ...base.chart, type: "boxPlot" }, colors: ["#CC5833", "#2E4036"], xaxis: { labels: { style: { colors: ax } } }, yaxis: { labels: { style: { colors: ax } } } };
    const bvS = !biD ? [] : biD.type === "categorical" ? biD.columns.map((c, ci) => ({ name: `Churn: ${c}`, data: biD.values.map(r => r[ci]) })) : [{ type: "boxPlot", data: [{ x: "No", y: biD.churn_no_stats.boxplot }, { x: "Yes", y: biD.churn_yes_stats.boxplot }] }];
    return (
      <Card className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
          <div><Tag t="Bivariate Analysis" c="#e8956e" /><H>Phân tích hai biến với Churn</H><p className="text-white/80 text-xs font-mono">Ảnh hưởng của từng đặc trưng tới Churn</p></div>
          <select value={biCol} onChange={e => setBiCol(e.target.value)} className={selCls} style={selSt}>
            <optgroup label="Categorical" style={{ color: "#CC5833" }}>{ov?.feature_roles?.categorical.map(c => <option key={c} value={c}>{c}</option>)}</optgroup>
            <optgroup label="Numerical" style={{ color: "#6ea87a" }}>{ov?.feature_roles?.numerical.map(c => <option key={c} value={c}>{c}</option>)}</optgroup>
          </select>
        </div>
        {biL ? <Spin /> : biD ? (<div className="space-y-4"><div className="h-[350px]"><Chart options={bvOpt} series={bvS} type={biD.type === "categorical" ? "bar" : "boxPlot"} height="100%" /></div><div className="rounded-xl p-4" style={{ background: "rgba(46,64,54,0.15)", border: "1px solid rgba(110,168,122,0.2)" }}><p className="text-[10px] uppercase tracking-widest font-mono text-emerald-400 mb-1">Đánh giá</p><p className="text-white/80 text-sm leading-relaxed">{biD.insight}</p></div></div>) : null}
      </Card>
    );
  };

  const panels = { overview: renderOverview, sanity: renderSanity, stats: renderStats, univariate: renderUnivariate, correlation: renderCorrelation, bivariate: renderBivariate };

  return (
    <div className="pt-5 pb-10" style={{ color: "#fff" }}>
      {/* Header */}
      <div className="mb-4"><Tag t="Exploratory Data Analysis" /><H>EDA Dashboard</H><p className="text-white/80 text-sm font-mono">Phân tích toàn diện tập dữ liệu churn khách hàng viễn thông</p></div>

      {/* 3D Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map(t => {
          const Icon = t.icon, active = tab === t.id;
          return (
            <button key={t.id} onClick={() => switchTab(t.id)} style={{ perspective: "800px" }}>
              <div className="flex items-center gap-2 px-5 py-3 rounded-2xl border text-sm font-semibold transition-all duration-500 cursor-pointer relative overflow-hidden" style={{
                background: active ? `linear-gradient(135deg, ${t.c}20, ${t.c}08)` : "rgba(255,255,255,0.02)",
                borderColor: active ? `${t.c}50` : "rgba(255,255,255,0.08)",
                color: active ? "#fff" : "rgba(255,255,255,0.85)",
                transform: active ? "translateY(-3px) scale(1.05) rotateX(2deg)" : "translateY(0) scale(1) rotateX(0deg)",
                boxShadow: active ? `0 12px 40px ${t.c}25, 0 0 0 1px ${t.c}20, inset 0 1px 0 rgba(255,255,255,0.15)` : "0 2px 8px rgba(0,0,0,0.2)",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                transformStyle: "preserve-3d",
              }}>
                {active && <div className="absolute inset-0 rounded-2xl" style={{ background: `linear-gradient(135deg, ${t.c}30, transparent)`, opacity: 0.5 }} />}
                <Icon size={16} style={{ color: active ? t.c : undefined, position: "relative", zIndex: 1 }} />
                <span style={{ position: "relative", zIndex: 1 }}>{t.label}</span>
                {active && <span className="absolute -bottom-0.5 left-1/2 h-[2px] rounded-full" style={{ width: "50%", transform: "translateX(-50%)", background: `linear-gradient(90deg, transparent, ${t.c}, transparent)` }} />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active panel with 3D flip transition */}
      <div style={{ perspective: "1200px" }}>
        <div key={tab} className="eda-panel-enter" style={{ transformStyle: "preserve-3d", animation: "edaPanelIn 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards" }}>
          {panels[tab]()}
        </div>
      </div>

      {/* CSS animation */}
      <style>{`
        @keyframes edaPanelIn {
          0% { opacity: 0; transform: rotateY(${flipDir * 8}deg) translateZ(-30px) scale(0.97); }
          100% { opacity: 1; transform: rotateY(0deg) translateZ(0) scale(1); }
        }
        .eda-panel-enter { will-change: transform, opacity; }
      `}</style>
    </div>
  );
};

export default EDADashboard;
