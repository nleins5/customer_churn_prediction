import Chart from "react-apexcharts";

const LineChart = (props) => {
  const { series, options } = props;
  const merged = {
    ...options,
    chart: { ...(options?.chart || {}), background: "transparent" },
    theme: { mode: "dark" },
  };

  return (
    <Chart options={merged} type="area" width="100%" height="100%" series={series} />
  );
};

export default LineChart;
