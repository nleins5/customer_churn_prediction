import React from "react";
import Chart from "react-apexcharts";

const BarChart = ({ chartData, chartOptions }) => {
  const merged = {
    ...chartOptions,
    chart: { ...(chartOptions?.chart || {}), background: "transparent" },
    theme: { mode: "dark" },
  };

  return (
    <Chart options={merged} series={chartData} type="bar" width="100%" height="100%" />
  );
};

export default BarChart;
