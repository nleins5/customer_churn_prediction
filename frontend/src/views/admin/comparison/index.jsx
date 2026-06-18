import React, { useState, useEffect } from "react";
import axios from "axios";
import Card from "components/card";
import Widget from "components/widget/Widget";
import { MdTrendingUp, MdTimer, MdCompareArrows, MdAnalytics, MdHistory, MdPlayArrow } from "react-icons/md";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8002";

const ModelComparison = () => {
  // UI & Training States
  const [modelType, setModelType] = useState("lightgbm");
  const [testSize, setTestSize] = useState(0.2);
  const [sampleSize, setSampleSize] = useState(30000);
  const [hyperparams, setHyperparams] = useState({
    n_estimators: 100,
    max_depth: 7,
    learning_rate: 0.1,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentResult, setCurrentResult] = useState(null);
  const [history, setHistory] = useState([]);

  // Reset hyperparams when modelType changes to keep defaults clean
  useEffect(() => {
    switch (modelType) {
      case "logistic_regression":
        setHyperparams({ C: 1.0, max_iter: 1000 });
        break;
      case "decision_tree":
        setHyperparams({ max_depth: 5 });
        break;
      case "random_forest":
        setHyperparams({ n_estimators: 100, max_depth: 10 });
        break;
      case "xgboost":
        setHyperparams({ n_estimators: 100, max_depth: 6, learning_rate: 0.1 });
        break;
      case "lightgbm":
        setHyperparams({ n_estimators: 100, max_depth: 7, learning_rate: 0.1 });
        break;
      default:
        break;
    }
  }, [modelType]);

  const handleParamChange = (name, value, isFloat = false) => {
    setHyperparams((prev) => ({
      ...prev,
      [name]: isFloat ? parseFloat(value) || 0.0 : parseInt(value) || 0,
    }));
  };

  const handleTrain = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      model_type: modelType,
      hyperparameters: hyperparams,
      test_size: testSize,
      sample_size: sampleSize,
    };

    try {
      const response = await axios.post(`${API_BASE}/api/train`, payload);
      const resData = response.data;
      setCurrentResult(resData);

      // Add to session history
      setHistory((prev) => [
        {
          id: Date.now(),
          model_type: resData.model_type,
          hyperparameters: JSON.stringify(hyperparams),
          sample_size: sampleSize,
          accuracy: resData.accuracy,
          precision: resData.precision,
          recall: resData.recall,
          f1_score: resData.f1_score,
          roc_auc: resData.roc_auc,
          training_time_seconds: resData.training_time_seconds,
        },
        ...prev,
      ]);
    } catch (err) {
      console.error("Training failed:", err);
      setError(
        err.response?.data?.detail ||
        "Huấn luyện mô hình thất bại. Hãy kiểm tra kết nối với Backend hoặc các tham số truyền vào."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderHyperparamsFields = () => {
    switch (modelType) {
      case "logistic_regression":
        return (
          <>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Hằng số phạt C (Regularization)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="10.0"
                value={hyperparams.C || 1.0}
                onChange={(e) => handleParamChange("C", e.target.value, true)}
                className="w-full rounded-xl border border-gray-200 bg-white/0 p-2 text-sm outline-none focus:border-brand-500 dark:border-white/10 dark:bg-navy-800 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Số vòng lặp tối đa (max_iter)</label>
              <input
                type="number"
                min="100"
                max="5000"
                value={hyperparams.max_iter || 1000}
                onChange={(e) => handleParamChange("max_iter", e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white/0 p-2 text-sm outline-none focus:border-brand-500 dark:border-white/10 dark:bg-navy-800 dark:text-white"
              />
            </div>
          </>
        );
      case "decision_tree":
        return (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Độ sâu tối đa cây (max_depth: {hyperparams.max_depth || 5})</label>
            <input
              type="range"
              min="1"
              max="20"
              value={hyperparams.max_depth || 5}
              onChange={(e) => handleParamChange("max_depth", e.target.value)}
              className="w-full accent-brand-500"
            />
          </div>
        );
      case "random_forest":
        return (
          <>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Số lượng cây quyết định (n_estimators)</label>
              <input
                type="number"
                min="10"
                max="500"
                value={hyperparams.n_estimators || 100}
                onChange={(e) => handleParamChange("n_estimators", e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white/0 p-2 text-sm outline-none focus:border-brand-500 dark:border-white/10 dark:bg-navy-800 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Độ sâu tối đa cây (max_depth: {hyperparams.max_depth || 10})</label>
              <input
                type="range"
                min="3"
                max="25"
                value={hyperparams.max_depth || 10}
                onChange={(e) => handleParamChange("max_depth", e.target.value)}
                className="w-full accent-brand-500"
              />
            </div>
          </>
        );
      case "xgboost":
      case "lightgbm":
        return (
          <>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Số lượng cây quyết định (n_estimators)</label>
              <input
                type="number"
                min="10"
                max="500"
                value={hyperparams.n_estimators || 100}
                onChange={(e) => handleParamChange("n_estimators", e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white/0 p-2 text-sm outline-none focus:border-brand-500 dark:border-white/10 dark:bg-navy-800 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Tốc độ học (learning_rate: {hyperparams.learning_rate || 0.1})</label>
              <input
                type="range"
                min="0.01"
                max="0.5"
                step="0.01"
                value={hyperparams.learning_rate || 0.1}
                onChange={(e) => handleParamChange("learning_rate", e.target.value, true)}
                className="w-full accent-brand-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Độ sâu tối đa cây (max_depth: {hyperparams.max_depth || 7})</label>
              <input
                type="range"
                min="2"
                max="15"
                value={hyperparams.max_depth || 7}
                onChange={(e) => handleParamChange("max_depth", e.target.value)}
                className="w-full accent-brand-500"
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  // Extract Confusion Matrix values safely
  const cm = currentResult?.confusion_matrix || [[0, 0], [0, 0]];
  const tn = cm[0][0];
  const fp = cm[0][1];
  const fn = cm[1][0];
  const tp = cm[1][1];
  const totalVal = tn + fp + fn + tp || 1;

  const toPercent = (val) => `${((val / totalVal) * 100).toFixed(1)}%`;

  return (
    <div className="space-y-6 pt-5">
      {/* 2 Column Top Row: Training Panel & Performance metrics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column: training panel */}
        <Card extra="p-6 bg-white dark:bg-navy-800 shadow-xl lg:col-span-1">
          <div className="mb-5">
            <h4 className="text-lg font-bold text-navy-700 dark:text-white">
              Cấu hình mô hình
            </h4>
            <p className="text-xs text-gray-500">
              Chọn thuật toán và điều chỉnh siêu tham số
            </p>
          </div>

          <form onSubmit={handleTrain} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Thuật toán phân loại</label>
              <select
                value={modelType}
                onChange={(e) => setModelType(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white/0 p-2.5 text-sm outline-none focus:border-brand-500 dark:border-white/10 dark:bg-navy-800 dark:text-white"
              >
                <option value="logistic_regression">Hồi quy Logistic (Logistic Regression)</option>
                <option value="decision_tree">Cây quyết định (Decision Tree)</option>
                <option value="random_forest">Rừng ngẫu nhiên (Random Forest)</option>
                <option value="xgboost">XGBoost Classifier</option>
                <option value="lightgbm">LightGBM Classifier</option>
              </select>
            </div>

            {/* Hyperparameters parameters */}
            <div className="border-t border-b py-3 dark:border-white/10 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Siêu tham số (Hyperparameters)</span>
              {renderHyperparamsFields()}
            </div>

            {/* Sample & test sizes */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Tùy chọn tập mẫu</span>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Tỷ lệ tập validation (test_size: {testSize})</label>
                <input
                  type="range"
                  min="0.1"
                  max="0.5"
                  step="0.05"
                  value={testSize}
                  onChange={(e) => setTestSize(parseFloat(e.target.value))}
                  className="w-full accent-brand-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Số lượng mẫu huấn luyện ({sampleSize.toLocaleString()})</label>
                <input
                  type="range"
                  min="5000"
                  max="50000"
                  step="5000"
                  value={sampleSize}
                  onChange={(e) => setSampleSize(parseInt(e.target.value))}
                  className="w-full accent-brand-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-brand-500 py-3 text-sm font-bold text-white hover:bg-brand-600 disabled:bg-gray-400 flex items-center justify-center gap-1 transition"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Đang huấn luyện...
                </>
              ) : (
                <>
                  <MdPlayArrow className="h-5 w-5" />
                  Huấn luyện & Đánh giá
                </>
              )}
            </button>
          </form>
        </Card>

        {/* Right column: metrics dashboard and confusion matrix */}
        <Card extra="p-6 bg-white dark:bg-navy-800 shadow-xl lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="mb-6">
              <h4 className="text-lg font-bold text-navy-700 dark:text-white">
                Bảng đánh giá hiệu năng
              </h4>
              <p className="text-xs text-gray-500">
                Hiệu suất chi tiết của mô hình hiện tại sau khi chạy thử nghiệm
              </p>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 p-4 text-red-600 dark:text-red-400 mb-6 text-sm">
                {error}
              </div>
            )}

            {!currentResult && !error && (
              <div className="flex flex-col items-center justify-center py-24 text-center text-gray-400">
                <MdCompareArrows className="h-16 w-16 mb-3 text-gray-300 dark:text-gray-600 animate-pulse" />
                <p className="text-sm font-medium">Chưa có thông tin huấn luyện</p>
                <p className="text-xs text-gray-500 max-w-sm mt-1">
                  Chọn cấu hình thuật toán và nhấn "Huấn luyện & Đánh giá" để bắt đầu phân tích hiệu năng
                </p>
              </div>
            )}

            {currentResult && (
              <div className="space-y-6 animate-fade-in">
                {/* 5 columns KPI widget row */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 2xl:grid-cols-5">
                  <Widget
                    icon={<MdAnalytics className="h-6 w-6" />}
                    title="Accuracy"
                    subtitle={`${(currentResult.accuracy * 100).toFixed(1)}%`}
                  />
                  <Widget
                    icon={<MdAnalytics className="h-6 w-6 text-emerald-500" />}
                    title="Precision"
                    subtitle={`${(currentResult.precision * 100).toFixed(1)}%`}
                  />
                  <Widget
                    icon={<MdAnalytics className="h-6 w-6 text-indigo-500" />}
                    title="Recall"
                    subtitle={`${(currentResult.recall * 100).toFixed(1)}%`}
                  />
                  <Widget
                    icon={<MdAnalytics className="h-6 w-6 text-amber-500" />}
                    title="F1-Score"
                    subtitle={`${(currentResult.f1_score * 100).toFixed(1)}%`}
                  />
                  <Widget
                    icon={<MdTrendingUp className="h-6 w-6 text-red-500" />}
                    title="ROC-AUC"
                    subtitle={`${(currentResult.roc_auc * 100).toFixed(1)}%`}
                  />
                </div>

                {/* Confusion Matrix Section */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="flex flex-col justify-between">
                    <div>
                      <h5 className="font-bold text-navy-700 dark:text-white text-sm mb-2">
                        Ma trận nhầm lẫn (Confusion Matrix)
                      </h5>
                      <p className="text-xs text-gray-500 leading-relaxed mb-4">
                        Ma trận hiển thị số mẫu phân loại đúng và sai của tập validation. Trục dọc đại diện cho Nhãn Thực tế (Actual), trục ngang đại diện cho Nhãn Dự báo (Predicted).
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 dark:bg-navy-700 p-3 rounded-xl font-mono">
                      <MdTimer className="h-4 w-4 shrink-0 text-brand-500" />
                      <span>Thời gian huấn luyện: {currentResult.training_time_seconds.toFixed(4)} giây</span>
                    </div>
                  </div>

                  {/* 2x2 grid diagram */}
                  <div className="flex flex-col justify-center items-center">
                    <div className="grid grid-cols-2 gap-2 w-full max-w-[280px]">
                      {/* True Negative */}
                      <div className="aspect-square bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 p-3 rounded-xl flex flex-col justify-between hover:scale-105 transition-transform">
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">TN (True Negative)</span>
                        <div className="text-center my-auto">
                          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block">{tn}</span>
                          <span className="text-[10px] text-gray-400 font-mono">{toPercent(tn)}</span>
                        </div>
                        <span className="text-[9px] text-gray-400 text-center">Thực tế Ở lại &rarr; Dự đoán Ở lại</span>
                      </div>

                      {/* False Positive */}
                      <div className="aspect-square bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 p-3 rounded-xl flex flex-col justify-between hover:scale-105 transition-transform">
                        <span className="text-[10px] text-red-700 dark:text-red-400 font-bold">FP (False Positive)</span>
                        <div className="text-center my-auto">
                          <span className="text-2xl font-black text-red-600 dark:text-red-400 block">{fp}</span>
                          <span className="text-[10px] text-gray-400 font-mono">{toPercent(fp)}</span>
                        </div>
                        <span className="text-[9px] text-gray-400 text-center">Thực tế Ở lại &rarr; Dự đoán Rời đi</span>
                      </div>

                      {/* False Negative */}
                      <div className="aspect-square bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 p-3 rounded-xl flex flex-col justify-between hover:scale-105 transition-transform">
                        <span className="text-[10px] text-red-700 dark:text-red-400 font-bold">FN (False Negative)</span>
                        <div className="text-center my-auto">
                          <span className="text-2xl font-black text-red-600 dark:text-red-400 block">{fn}</span>
                          <span className="text-[10px] text-gray-400 font-mono">{toPercent(fn)}</span>
                        </div>
                        <span className="text-[9px] text-gray-400 text-center">Thực tế Rời đi &rarr; Dự đoán Ở lại</span>
                      </div>

                      {/* True Positive */}
                      <div className="aspect-square bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 p-3 rounded-xl flex flex-col justify-between hover:scale-105 transition-transform">
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">TP (True Positive)</span>
                        <div className="text-center my-auto">
                          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block">{tp}</span>
                          <span className="text-[10px] text-gray-400 font-mono">{toPercent(tp)}</span>
                        </div>
                        <span className="text-[9px] text-gray-400 text-center">Thực tế Rời đi &rarr; Dự đoán Rời đi</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {currentResult && (
            <div className="border-t pt-4 mt-6 dark:border-white/10 text-[10px] text-gray-400 font-mono flex justify-between">
              <span>Validation samples: {totalVal.toLocaleString()}</span>
              <span>Backend status: OK</span>
            </div>
          )}
        </Card>
      </div>

      {/* Leaderboard panel */}
      <Card extra="p-6 bg-white dark:bg-navy-800 shadow-xl overflow-x-auto">
        <div className="mb-5 flex items-center gap-2">
          <MdHistory className="h-5 w-5 text-brand-500" />
          <div>
            <h4 className="text-lg font-bold text-navy-700 dark:text-white">
              Bảng xếp hạng mô hình (Leaderboard)
            </h4>
            <p className="text-xs text-gray-500">
              Lịch sử các lần chạy huấn luyện của phiên làm việc hiện tại
            </p>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">
            Chưa có lịch sử huấn luyện nào được ghi nhận. Hãy chạy thử nghiệm phía trên.
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b dark:border-white/10 text-gray-500 dark:text-gray-400 text-sm">
                <th className="py-3 font-semibold">Thời gian</th>
                <th className="py-3 font-semibold">Thuật toán</th>
                <th className="py-3 font-semibold">Siêu tham số (Hyperparameters)</th>
                <th className="py-3 font-semibold">Số lượng mẫu</th>
                <th className="py-3 font-semibold">Accuracy</th>
                <th className="py-3 font-semibold">F1-Score</th>
                <th className="py-3 font-semibold">ROC-AUC</th>
                <th className="py-3 font-semibold">Thời gian chạy</th>
              </tr>
            </thead>
            <tbody>
              {history.map((row, idx) => (
                <tr
                  key={row.id}
                  className={`border-b dark:border-white/5 hover:bg-gray-50 dark:hover:bg-navy-700 text-sm ${
                    idx === 0 ? "bg-brand-50/20 dark:bg-brand-950/10 font-medium" : ""
                  }`}
                >
                  <td className="py-3 text-xs text-gray-400">
                    {new Date(row.id).toLocaleTimeString()}
                  </td>
                  <td className="py-3 font-bold text-navy-700 dark:text-white capitalize">
                    {row.model_type.replace("_", " ")}
                  </td>
                  <td className="py-3 text-xs max-w-[250px] truncate font-mono" title={row.hyperparameters}>
                    {row.hyperparameters}
                  </td>
                  <td className="py-3">{row.sample_size.toLocaleString()}</td>
                  <td className="py-3 font-mono">{(row.accuracy * 100).toFixed(2)}%</td>
                  <td className="py-3 font-mono">{(row.f1_score * 100).toFixed(2)}%</td>
                  <td className="py-3 font-mono">{(row.roc_auc * 100).toFixed(2)}%</td>
                  <td className="py-3 font-mono text-xs text-gray-500">
                    {row.training_time_seconds.toFixed(4)}s
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
};

export default ModelComparison;
