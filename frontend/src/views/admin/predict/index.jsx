import React, { useState } from "react";
import axios from "axios";
import Chart from "react-apexcharts";
import { MdPerson, MdSettings, MdAttachMoney, MdCheckCircle, MdWarning, MdErrorOutline, MdInfoOutline } from "react-icons/md";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8002";

const CLAY = "#CC5833";

const Card = ({ children, className = "" }) => (
  <div
    className={`rounded-3xl border border-white/10 backdrop-blur-md transition-all duration-300 hover:border-white/20 ${className}`}
    style={{ background: "rgba(255, 255, 255, 0.03)" }}
  >
    {children}
  </div>
);

const Tag = ({ t, c = CLAY }) => (
  <span
    className="inline-block font-mono text-[10px] uppercase tracking-widest px-3 py-1 rounded-full mb-3"
    style={{ color: c, background: `${c}15`, border: `1px solid ${c}35` }}
  >
    {t}
  </span>
);

const labelCls = "block text-xs font-semibold text-white/80 mb-1.5";
const selectCls = "w-full rounded-xl border border-white/15 bg-white/5 p-2.5 text-sm text-white/95 outline-none focus:border-[#CC5833] focus:ring-1 focus:ring-[#CC5833]/50 transition-all font-mono cursor-pointer";
const inputCls = "w-full rounded-xl border border-white/15 bg-white/5 p-2.5 text-sm text-white/95 placeholder-white/30 outline-none focus:border-[#CC5833] focus:ring-1 focus:ring-[#CC5833]/50 transition-all font-mono";
const optCls = "bg-[#1C1C1E] text-white";

const ChurnPrediction = () => {
  const [formData, setFormData] = useState({
    gender: "Female",
    SeniorCitizen: 0,
    Partner: "No",
    Dependents: "No",
    tenure: 12,
    PhoneService: "Yes",
    MultipleLines: "No",
    InternetService: "Fiber optic",
    OnlineSecurity: "No",
    OnlineBackup: "Yes",
    DeviceProtection: "No",
    TechSupport: "No",
    StreamingTV: "Yes",
    StreamingMovies: "Yes",
    Contract: "Month-to-month",
    PaperlessBilling: "Yes",
    PaymentMethod: "Electronic check",
    MonthlyCharges: 89.5,
    TotalCharges: 1074.0,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedData = { ...formData };

    if (name === "SeniorCitizen" || name === "tenure") {
      updatedData[name] = parseInt(value) || 0;
    } else if (name === "MonthlyCharges" || name === "TotalCharges") {
      updatedData[name] = parseFloat(value) || 0.0;
    } else {
      updatedData[name] = value;
    }

    // Conditional constraints logic
    if (name === "InternetService" && value === "No") {
      updatedData.OnlineSecurity = "No internet service";
      updatedData.OnlineBackup = "No internet service";
      updatedData.DeviceProtection = "No internet service";
      updatedData.TechSupport = "No internet service";
      updatedData.StreamingTV = "No internet service";
      updatedData.StreamingMovies = "No internet service";
    } else if (name === "InternetService" && formData.InternetService === "No" && value !== "No") {
      updatedData.OnlineSecurity = "No";
      updatedData.OnlineBackup = "No";
      updatedData.DeviceProtection = "No";
      updatedData.TechSupport = "No";
      updatedData.StreamingTV = "No";
      updatedData.StreamingMovies = "No";
    }

    if (name === "PhoneService" && value === "No") {
      updatedData.MultipleLines = "No phone service";
    } else if (name === "PhoneService" && formData.PhoneService === "No" && value !== "No") {
      updatedData.MultipleLines = "No";
    }

    // Auto-calculate TotalCharges as a convenient helper
    if (name === "MonthlyCharges" || name === "tenure") {
      const tenureVal = name === "tenure" ? parseInt(value) || 0 : parseInt(updatedData.tenure) || 0;
      const monthlyVal = name === "MonthlyCharges" ? parseFloat(value) || 0.0 : parseFloat(updatedData.MonthlyCharges) || 0.0;
      updatedData.TotalCharges = parseFloat((tenureVal * monthlyVal).toFixed(2));
    }

    setFormData(updatedData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post(`${API_BASE}/api/predict`, formData);
      setResult(response.data);
    } catch (err) {
      console.error("Error calling predict API:", err);
      setError(
        err.response?.data?.detail || 
        "Dự đoán thất bại. Hãy chắc chắn Backend đang hoạt động và mô hình ML đã được huấn luyện thành công."
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper to determine risk level
  const getRiskStatus = (probability) => {
    const pct = probability * 100;
    if (pct < 40) {
      return { 
        label: "Rủi ro thấp", 
        color: "#6ea87a", 
        bg: "rgba(110, 168, 122, 0.12)", 
        border: "rgba(110, 168, 122, 0.3)", 
        action: "Khách hàng ổn định. Tiếp tục duy trì các ưu đãi và chiến dịch CSKH tiêu chuẩn." 
      };
    }
    if (pct < 70) {
      return { 
        label: "Rủi ro trung bình", 
        color: "#e8956e", 
        bg: "rgba(232, 149, 110, 0.12)", 
        border: "rgba(232, 149, 110, 0.3)", 
        action: "Khách hàng có dấu hiệu dao động. Đề xuất khảo sát ý kiến hoặc gửi ưu đãi cá nhân hóa." 
      };
    }
    return { 
      label: "Rủi ro cao", 
      color: CLAY, 
      bg: "rgba(204, 88, 51, 0.12)", 
      border: "rgba(204, 88, 51, 0.3)", 
      action: "Nguy cơ rời mạng lớn! Đề xuất CSKH liên hệ trực tiếp, tặng gói cước ưu đãi hoặc chiết khấu đặc biệt." 
    };
  };

  const risk = result ? getRiskStatus(result.churn_probability) : null;

  // Chart configuration for gauge
  const gaugeSeries = result ? [Math.round(result.churn_probability * 100)] : [];
  const gaugeOptions = {
    chart: {
      type: "radialBar",
      sparkline: { enabled: true },
      background: "transparent"
    },
    theme: { mode: "dark" },
    plotOptions: {
      radialBar: {
        startAngle: -95,
        endAngle: 95,
        track: {
          background: "rgba(255, 255, 255, 0.08)",
          strokeWidth: "90%",
          margin: 5,
        },
        dataLabels: {
          name: { show: false },
          value: {
            offsetY: -3,
            fontSize: "26px",
            fontWeight: "bold",
            color: "#ffffff",
            formatter: (val) => `${val}%`
          }
        }
      }
    },
    grid: { padding: { top: -10, bottom: -10 } },
    fill: {
      colors: [
        ({ value }) => {
          if (value < 40) return "#6ea87a";
          if (value < 70) return "#e8956e";
          return CLAY;
        }
      ]
    },
    labels: ["Xác suất"],
  };

  const hasInternet = formData.InternetService !== "No";
  const hasPhone = formData.PhoneService === "Yes";

  return (
    <div className="space-y-6 pt-5 pb-10" style={{ color: "#fff" }}>
      {/* Page Header */}
      <div>
        <Tag t="AI churn prediction" />
        <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Dự báo rủi ro rời mạng
        </h1>
        <p className="text-sm text-white/50 font-mono">
          Nhập hồ sơ khách hàng để nhận kết quả phân tích xác suất rời mạng theo thời gian thực
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Form panel */}
        <Card className="p-6 lg:col-span-2 shadow-2xl">
          <div className="mb-6 border-b border-white/5 pb-4">
            <h4 className="text-lg font-bold text-white mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Thông tin chi tiết khách hàng
            </h4>
            <p className="text-xs text-white/50 font-mono">
              Cung cấp các thông tin liên quan đến nhân khẩu học, dịch vụ đang sử dụng và tài chính
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-3">
              {/* Column 1: Demographic */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                  <MdPerson className="h-4.5 w-4.5 text-[#CC5833]" />
                  <h5 className="font-bold text-white text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Nhân khẩu học</h5>
                </div>

                <div className="space-y-1">
                  <label className={labelCls}>Giới tính</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={selectCls}
                  >
                    <option value="Male" className={optCls}>Nam (Male)</option>
                    <option value="Female" className={optCls}>Nữ (Female)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className={labelCls}>Người cao tuổi</label>
                  <select
                    name="SeniorCitizen"
                    value={formData.SeniorCitizen}
                    onChange={handleChange}
                    className={selectCls}
                  >
                    <option value={0} className={optCls}>Không (No)</option>
                    <option value={1} className={optCls}>Có (Yes)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className={labelCls}>Có bạn đời (Partner)</label>
                  <select
                    name="Partner"
                    value={formData.Partner}
                    onChange={handleChange}
                    className={selectCls}
                  >
                    <option value="No" className={optCls}>Không (No)</option>
                    <option value="Yes" className={optCls}>Có (Yes)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className={labelCls}>Người phụ thuộc</label>
                  <select
                    name="Dependents"
                    value={formData.Dependents}
                    onChange={handleChange}
                    className={selectCls}
                  >
                    <option value="No" className={optCls}>Không (No)</option>
                    <option value="Yes" className={optCls}>Có (Yes)</option>
                  </select>
                </div>
              </div>

              {/* Column 2: Services */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                  <MdSettings className="h-4.5 w-4.5 text-[#6ea87a]" />
                  <h5 className="font-bold text-white text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Dịch vụ sử dụng</h5>
                </div>

                <div className="space-y-1">
                  <label className={labelCls}>Dịch vụ thoại (Phone)</label>
                  <select
                    name="PhoneService"
                    value={formData.PhoneService}
                    onChange={handleChange}
                    className={selectCls}
                  >
                    <option value="No" className={optCls}>Không (No)</option>
                    <option value="Yes" className={optCls}>Có (Yes)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className={labelCls}>Nhiều đường dây</label>
                  <select
                    name="MultipleLines"
                    value={formData.MultipleLines}
                    onChange={handleChange}
                    disabled={!hasPhone}
                    className={`${selectCls} disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    {!hasPhone && <option value="No phone service" className={optCls}>Không có dịch vụ thoại</option>}
                    {hasPhone && (
                      <>
                        <option value="No" className={optCls}>Không (No)</option>
                        <option value="Yes" className={optCls}>Có (Yes)</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className={labelCls}>Dịch vụ Internet</label>
                  <select
                    name="InternetService"
                    value={formData.InternetService}
                    onChange={handleChange}
                    className={selectCls}
                  >
                    <option value="DSL" className={optCls}>Cáp đồng (DSL)</option>
                    <option value="Fiber optic" className={optCls}>Cáp quang (Fiber optic)</option>
                    <option value="No" className={optCls}>Không sử dụng (No)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className={labelCls}>Bảo mật (OnlineSecurity)</label>
                  <select
                    name="OnlineSecurity"
                    value={formData.OnlineSecurity}
                    onChange={handleChange}
                    disabled={!hasInternet}
                    className={`${selectCls} disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    {!hasInternet && <option value="No internet service" className={optCls}>Không có Internet</option>}
                    {hasInternet && (
                      <>
                        <option value="No" className={optCls}>Không (No)</option>
                        <option value="Yes" className={optCls}>Có (Yes)</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className={labelCls}>Sao lưu (OnlineBackup)</label>
                  <select
                    name="OnlineBackup"
                    value={formData.OnlineBackup}
                    onChange={handleChange}
                    disabled={!hasInternet}
                    className={`${selectCls} disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    {!hasInternet && <option value="No internet service" className={optCls}>Không có Internet</option>}
                    {hasInternet && (
                      <>
                        <option value="No" className={optCls}>Không (No)</option>
                        <option value="Yes" className={optCls}>Có (Yes)</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className={labelCls}>Bảo hiểm thiết bị</label>
                  <select
                    name="DeviceProtection"
                    value={formData.DeviceProtection}
                    onChange={handleChange}
                    disabled={!hasInternet}
                    className={`${selectCls} disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    {!hasInternet && <option value="No internet service" className={optCls}>Không có Internet</option>}
                    {hasInternet && (
                      <>
                        <option value="No" className={optCls}>Không (No)</option>
                        <option value="Yes" className={optCls}>Có (Yes)</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className={labelCls}>Kỹ thuật (TechSupport)</label>
                  <select
                    name="TechSupport"
                    value={formData.TechSupport}
                    onChange={handleChange}
                    disabled={!hasInternet}
                    className={`${selectCls} disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    {!hasInternet && <option value="No internet service" className={optCls}>Không có Internet</option>}
                    {hasInternet && (
                      <>
                        <option value="No" className={optCls}>Không (No)</option>
                        <option value="Yes" className={optCls}>Có (Yes)</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className={labelCls}>Xem TV (StreamingTV)</label>
                  <select
                    name="StreamingTV"
                    value={formData.StreamingTV}
                    onChange={handleChange}
                    disabled={!hasInternet}
                    className={`${selectCls} disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    {!hasInternet && <option value="No internet service" className={optCls}>Không có Internet</option>}
                    {hasInternet && (
                      <>
                        <option value="No" className={optCls}>Không (No)</option>
                        <option value="Yes" className={optCls}>Có (Yes)</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className={labelCls}>Xem Phim (Movies)</label>
                  <select
                    name="StreamingMovies"
                    value={formData.StreamingMovies}
                    onChange={handleChange}
                    disabled={!hasInternet}
                    className={`${selectCls} disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    {!hasInternet && <option value="No internet service" className={optCls}>Không có Internet</option>}
                    {hasInternet && (
                      <>
                        <option value="No" className={optCls}>Không (No)</option>
                        <option value="Yes" className={optCls}>Có (Yes)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Column 3: Contract & Financials */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                  <MdAttachMoney className="h-4.5 w-4.5 text-[#e8956e]" />
                  <h5 className="font-bold text-white text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Tài chính & Hợp đồng</h5>
                </div>

                <div className="space-y-1">
                  <label className={labelCls}>Loại hợp đồng</label>
                  <select
                    name="Contract"
                    value={formData.Contract}
                    onChange={handleChange}
                    className={selectCls}
                  >
                    <option value="Month-to-month" className={optCls}>Từng tháng (Month-to-month)</option>
                    <option value="One year" className={optCls}>Một năm (One year)</option>
                    <option value="Two year" className={optCls}>Hai năm (Two year)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className={labelCls}>Hóa đơn điện tử</label>
                  <select
                    name="PaperlessBilling"
                    value={formData.PaperlessBilling}
                    onChange={handleChange}
                    className={selectCls}
                  >
                    <option value="No" className={optCls}>Không (No)</option>
                    <option value="Yes" className={optCls}>Có (Yes)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className={labelCls}>Thanh toán</label>
                  <select
                    name="PaymentMethod"
                    value={formData.PaymentMethod}
                    onChange={handleChange}
                    className={selectCls}
                  >
                    <option value="Electronic check" className={optCls}>Electronic check</option>
                    <option value="Mailed check" className={optCls}>Mailed check</option>
                    <option value="Bank transfer (automatic)" className={optCls}>Bank transfer (automatic)</option>
                    <option value="Credit card (automatic)" className={optCls}>Credit card (automatic)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className={labelCls}>Thời gian sử dụng (Tháng)</label>
                  <input
                    type="number"
                    name="tenure"
                    value={formData.tenure}
                    onChange={handleChange}
                    min="0"
                    placeholder="Nhập số tháng"
                    className={inputCls}
                  />
                </div>

                <div className="space-y-1">
                  <label className={labelCls}>Cước hàng tháng ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="MonthlyCharges"
                    value={formData.MonthlyCharges}
                    onChange={handleChange}
                    min="0"
                    placeholder="Cước hàng tháng"
                    className={inputCls}
                  />
                </div>

                <div className="space-y-1">
                  <label className={labelCls}>Cước tích lũy tổng cộng ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="TotalCharges"
                    value={formData.TotalCharges}
                    onChange={handleChange}
                    min="0"
                    placeholder="Tổng cước tích lũy"
                    className={inputCls}
                  />
                  <p className="text-[10px] text-white/40 italic mt-1 font-mono">
                    * Tự động cập nhật = tenure × MonthlyCharges
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-white/5">
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto rounded-xl px-8 py-3 text-sm font-bold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                style={{ background: "linear-gradient(135deg, #CC5833, #a8451e)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                {loading ? "Đang xử lý dự báo..." : "Thực hiện dự báo"}
              </button>
            </div>
          </form>
        </Card>

        {/* Prediction response display */}
        <Card className="p-6 shadow-2xl flex flex-col justify-between h-full min-h-[480px]">
          <div>
            <div className="mb-6 border-b border-white/5 pb-4">
              <h4 className="text-lg font-bold text-white mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Kết quả đánh giá rủi ro
              </h4>
              <p className="text-xs text-white/50 font-mono">
                Xác suất rời mạng được tính từ mô hình dự báo tối ưu
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 rounded-xl border p-4 text-sm leading-relaxed" style={{ background: "rgba(220, 38, 38, 0.1)", borderColor: "rgba(220, 38, 38, 0.2)", color: "#fca5a5" }}>
                <MdErrorOutline className="h-5 w-5 shrink-0 mt-0.5" />
                <div className="font-mono text-xs">
                  <p className="font-bold text-white mb-1">Lỗi xử lý</p>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {!result && !error && (
              <div className="flex flex-col items-center justify-center py-20 text-center text-white/40">
                <MdInfoOutline className="h-16 w-16 mb-4 animate-pulse" style={{ color: "rgba(255,255,255,0.15)" }} />
                <p className="text-sm font-semibold text-white/70">Chưa có kết quả dự đoán</p>
                <p className="text-xs text-white/40 max-w-[200px] mt-2 leading-relaxed font-mono">
                  Điền form bên trái và chọn "Thực hiện dự báo" để bắt đầu phân tích
                </p>
              </div>
            )}

            {result && (
              <div className="space-y-6">
                {/* gauge */}
                <div className="flex flex-col items-center justify-center relative">
                  <div className="w-full max-w-[220px] aspect-square relative flex items-center justify-center">
                    <Chart
                      options={gaugeOptions}
                      series={gaugeSeries}
                      type="radialBar"
                      width="100%"
                    />
                  </div>
                  <div className="text-center mt-[-30px] z-10">
                    <span className="text-2xl font-black uppercase tracking-tight" style={{ color: risk.color }}>
                      {risk.label}
                    </span>
                  </div>
                </div>

                {/* status explanation */}
                <div className="rounded-2xl border p-4 transition-all duration-300" style={{ background: risk.bg, borderColor: risk.border }}>
                  <div className="flex gap-3">
                    {result.churn_prediction === "Yes" ? (
                      <MdWarning className="h-6 w-6 shrink-0" style={{ color: risk.color }} />
                    ) : (
                      <MdCheckCircle className="h-6 w-6 shrink-0" style={{ color: risk.color }} />
                    )}
                    <div className="text-sm leading-relaxed">
                      <p className="font-bold text-white">
                        Hành động đề xuất:
                      </p>
                      <p className="text-xs mt-1.5 text-white/70">
                        {risk.action}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Details Metrics */}
                <div className="space-y-3 border-t border-white/5 pt-4 text-sm font-mono">
                  <div className="flex justify-between items-center">
                    <span className="text-white/50">Quyết định Churn:</span>
                    <span className="font-bold px-2 py-0.5 rounded" style={{ color: result.churn_prediction === "Yes" ? CLAY : "#6ea87a", background: result.churn_prediction === "Yes" ? `${CLAY}15` : "rgba(110, 168, 122, 0.12)" }}>
                      {result.churn_prediction === "Yes" ? "Rời bỏ (Yes)" : "Ở lại (No)"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Xác suất rời mạng:</span>
                    <span className="font-bold text-white font-mono">{(result.churn_probability * 100).toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {result && (
            <div className="border-t border-white/5 pt-4 mt-6 flex items-center justify-between text-xs text-white/30 font-mono">
              <span>Model: LightGBM</span>
              <span>API: /predict</span>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ChurnPrediction;
