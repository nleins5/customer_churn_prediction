import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import axios from "axios";

import RtlLayout from "layouts/rtl";
import AdminLayout from "layouts/admin";
import AuthLayout from "layouts/auth";
import LandingPage from "views/LandingPage";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8002";

const App = () => {
  useEffect(() => {
    // Initialize theme from localStorage
    const saved = localStorage.getItem("theme");
    const isDarkTheme = saved !== null ? saved === "dark" : true;
    if (isDarkTheme) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Immediate ping to wake up the server if it's sleeping
    const pingServer = async () => {
      try {
        console.log("Pinging backend at:", API_BASE);
        await axios.get(`${API_BASE}/`);
        console.log("Backend ping successful");
      } catch (err) {
        console.warn("Backend ping failed:", err.message);
      }
    };

    pingServer();

    // Periodic ping every 2 minutes (120000ms) to keep it awake on free tiers
    const interval = setInterval(pingServer, 120000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Routes>
      <Route path="auth/*" element={<AuthLayout />} />
      <Route path="admin/*" element={<AdminLayout />} />
      <Route path="rtl/*" element={<RtlLayout />} />
      <Route path="/" element={<LandingPage />} />
    </Routes>
  );
};

export default App;
