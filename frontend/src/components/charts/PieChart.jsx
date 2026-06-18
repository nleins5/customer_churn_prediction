import Chart from "react-apexcharts";

const PieChart = ({ series, options }) => {
  const merged = {
    ...options,
    chart: { ...(options?.chart || {}), background: "transparent" },
    theme: { mode: "dark" },
  };

  return (
    <Chart options={merged} type="donut" width="100%" height="100%" series={series} />
  );
};

export default PieChart;
