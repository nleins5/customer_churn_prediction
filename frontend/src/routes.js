import React from "react";

// Admin Imports
import MainDashboard from "views/admin/default";

// Custom Admin Sub-Dashboards
import EDADashboard from "views/admin/eda";
import ChurnPrediction from "views/admin/predict";
import ModelComparison from "views/admin/comparison";

// Icon Imports
import {
  MdHome,
  MdAnalytics,
  MdOnlinePrediction,
  MdLeaderboard,
} from "react-icons/md";

const routes = [
  {
    name: "Main Dashboard",
    layout: "/admin",
    path: "default",
    icon: <MdHome className="h-6 w-6" />,
    component: <MainDashboard />,
  },
  {
    name: "EDA Dashboard",
    layout: "/admin",
    path: "eda",
    icon: <MdAnalytics className="h-6 w-6" />,
    component: <EDADashboard />,
  },
  {
    name: "Churn Prediction",
    layout: "/admin",
    path: "predict",
    icon: <MdOnlinePrediction className="h-6 w-6" />,
    component: <ChurnPrediction />,
  },
  {
    name: "Model Comparison",
    layout: "/admin",
    path: "comparison",
    icon: <MdLeaderboard className="h-6 w-6" />,
    component: <ModelComparison />,
  },
];

export default routes;
