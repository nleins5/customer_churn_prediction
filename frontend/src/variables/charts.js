// ─── Organic Tech Palette ────────────────────────────────────────────────────
// Clay   #CC5833  |  Moss    #2E4036  |  Amber #e8956e
// Teal   #4a7060  |  Cream   #F2F0E9  |  Dim   rgba(255,255,255,0.35)

const CLAY   = "#CC5833";
const MOSS   = "#2E4036";
const AMBER  = "#e8956e";
const TEAL   = "#4a7060";
const DIM    = "rgba(255,255,255,0.25)";
const GRID   = "rgba(255,255,255,0.04)";
const TIP_BG = "#111118";

// ─── Shared tooltip style ─────────────────────────────────────────────────────
const sharedTooltip = {
  theme: "dark",
  style: { fontSize: "12px", fontFamily: "'Plus Jakarta Sans', sans-serif", backgroundColor: TIP_BG },
};

// ─── Daily Traffic Bar Chart ─────────────────────────────────────────────────
export const barChartDataDailyTraffic = [
  { name: "Visitors", data: [20, 30, 40, 20, 45, 50, 30] },
];

export const barChartOptionsDailyTraffic = {
  chart: { background: "transparent", toolbar: { show: false }, dropShadow: { enabled: true, blur: 8, opacity: 0.3, color: CLAY } },
  tooltip: sharedTooltip,
  xaxis: {
    categories: ["00", "04", "08", "12", "14", "16", "18"],
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { colors: DIM, fontSize: "12px", fontFamily: "'IBM Plex Mono', monospace" } },
  },
  yaxis: { show: false },
  grid: { show: true, borderColor: GRID, strokeDashArray: 4 },
  fill: {
    type: "gradient",
    gradient: {
      type: "vertical",
      shadeIntensity: 1,
      opacityFrom: 1,
      opacityTo: 0.3,
      colorStops: [
        [{ offset: 0, color: CLAY, opacity: 1 }, { offset: 100, color: AMBER, opacity: 0.4 }],
      ],
    },
  },
  dataLabels: { enabled: false },
  plotOptions: {
    bar: {
      borderRadius: 8,
      columnWidth: "38px",
    },
  },
};

// ─── Pie / Donut Chart ───────────────────────────────────────────────────────
export const pieChartOptions = {
  labels: ["Churned", "Retained", "At-Risk"],
  colors: [CLAY, MOSS, AMBER],
  chart: { background: "transparent", dropShadow: { enabled: true, blur: 12, opacity: 0.4 } },
  fill: {
    colors: [CLAY, MOSS, AMBER],
    type: "gradient",
    gradient: { shade: "dark", type: "horizontal", shadeIntensity: 0.5, opacityFrom: 1, opacityTo: 0.85 },
  },
  stroke: { width: 3, colors: ["#0a0a0f"] },
  states: { hover: { filter: { type: "lighten", value: 0.08 } } },
  legend: {
    show: true,
    position: "bottom",
    labels: { colors: DIM },
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "11px",
  },
  dataLabels: { enabled: false },
  hover: { mode: null },
  plotOptions: { pie: { donut: { size: "68%", labels: { show: true, total: { show: true, label: "Total", color: DIM, fontFamily: "'Plus Jakarta Sans', sans-serif" } } } } },
  tooltip: sharedTooltip,
};

export const pieChartData = [23, 63, 14];

// ─── Weekly Revenue Stacked Bar ──────────────────────────────────────────────
export const barChartDataWeeklyRevenue = [
  { name: "Retained", data: [400, 370, 330, 390, 320, 350, 360, 320, 380], color: MOSS },
  { name: "At-Risk",  data: [120, 90,  110, 80,  140, 100, 95,  130, 100], color: AMBER },
  { name: "Churned",  data: [80,  100, 60,  70,  90,  75,  85,  60,  90],  color: CLAY },
];

export const barChartOptionsWeeklyRevenue = {
  chart: {
    background: "transparent",
    stacked: true,
    toolbar: { show: false },
    dropShadow: { enabled: true, blur: 10, opacity: 0.25, color: [MOSS, AMBER, CLAY] },
  },
  tooltip: sharedTooltip,
  xaxis: {
    categories: ["17", "18", "19", "20", "21", "22", "23", "24", "25"],
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { colors: DIM, fontSize: "12px", fontFamily: "'IBM Plex Mono', monospace" } },
  },
  yaxis: { show: false },
  grid: { show: true, borderColor: GRID, strokeDashArray: 4 },
  fill: {
    type: "gradient",
    gradient: { shade: "dark", type: "vertical", shadeIntensity: 0.4, opacityFrom: 0.95, opacityTo: 0.6 },
    colors: [MOSS, AMBER, CLAY],
  },
  legend: { show: false },
  colors: [MOSS, AMBER, CLAY],
  dataLabels: { enabled: false },
  plotOptions: { bar: { borderRadius: 6, columnWidth: "22px" } },
};

// ─── Total Spent Line Chart ───────────────────────────────────────────────────
export const lineChartDataTotalSpent = [
  { name: "Revenue", data: [50, 64, 48, 66, 49, 68], color: CLAY },
  { name: "Retained", data: [30, 40, 24, 46, 20, 46], color: TEAL },
];

export const lineChartOptionsTotalSpent = {
  legend: { show: false },
  theme: { mode: "dark" },
  chart: {
    background: "transparent",
    type: "area",
    toolbar: { show: false },
    dropShadow: { enabled: true, blur: 14, opacity: 0.35, color: [CLAY, TEAL] },
  },
  dataLabels: { enabled: false },
  stroke: { curve: "smooth", width: 3 },
  fill: {
    type: "gradient",
    gradient: { type: "vertical", shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.02, stops: [0, 90, 100] },
    colors: [CLAY, TEAL],
  },
  tooltip: sharedTooltip,
  grid: { show: true, borderColor: GRID, strokeDashArray: 4 },
  xaxis: {
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { colors: DIM, fontSize: "11px", fontFamily: "'IBM Plex Mono', monospace" } },
    categories: ["SEP", "OCT", "NOV", "DEC", "JAN", "FEB"],
  },
  yaxis: { show: false },
  markers: { size: 4, colors: [CLAY, TEAL], strokeWidth: 2, strokeColors: "#0a0a0f", hover: { size: 7 } },
};
