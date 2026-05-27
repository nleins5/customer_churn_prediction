# 🎯 Customer Churn Prediction - MLOps Pipeline

Dự án dự đoán khách hàng rời bỏ dịch vụ (Customer Churn) sử dụng Machine Learning với kiến trúc MLOps Pipeline hoàn chỉnh.

**Kaggle Competition**: [Playground Series S6E3](https://www.kaggle.com/competitions/playground-series-s6e3)

---

## 📊 Kết quả đạt được

### 🏆 Mô hình tốt nhất: LightGBM

| Metric | Score |
|--------|-------|
| **ROC AUC** | **93.39%** |
| **Accuracy** | **86.67%** |
| **Precision** | **83.53%** |
| **Recall** | **91.35%** |
| **F1-Score** | **87.26%** |

### 📈 So sánh các mô hình

| Mô hình | ROC AUC | F1-Score | Accuracy | Kết quả |
|---------|---------|----------|----------|---------|
| **LightGBM** | **93.39%** | **87.26%** | **86.67%** | ✅ **Tốt nhất** |
| XGBoost | 93.01% | 86.63% | - | - |

---

## ✨ Highlights

- ✅ **MLOps Pipeline hoàn chỉnh** với 5 stages
- ✅ **Feature Engineering** từ phân tích EDA (9 features mới)
- ✅ **SMOTE** để cân bằng dữ liệu (22.5% → 50%)
- ✅ **GridSearchCV** tối ưu hyperparameters
- ✅ **MLflow** tracking experiments và model registry
- ✅ **ROC AUC 93.39%** trên validation set

---

## 📁 Cấu trúc dự án

```
customer_churn_prediction/
├── config/                          # Các file cấu hình
│   ├── config.yaml                  # Cấu hình đường dẫn cho từng stage
│   ├── schema.yaml                  # Định nghĩa schema của dữ liệu
│   └── params.yaml                  # Hyperparameters cho model training
│
├── src/                             # Source code chính
│   ├── components/                  # Các component xử lý logic (có README)
│   ├── config/                      # Configuration management (có README)
│   ├── entity/                      # Data entities - dataclasses (có README)
│   ├── pipeline/                    # Pipeline wrappers cho từng stage (có README)
│   └── utils/                       # Utility functions
│
├── data/                            # Dữ liệu thô (zip files)
├── artifacts/                       # Outputs từ các stages
├── logs/                            # Log files
├── mlruns/                          # MLflow tracking data
├── EDA/                             # Exploratory Data Analysis notebooks
│
├── main.py                          # Entry point - chạy toàn bộ pipeline
├── requirements.txt                 # Python dependencies
└── README.md                        # Documentation (file này)
```

> **Lưu ý**: Mỗi thư mục trong `src/` đều có file README riêng giải thích chi tiết các file bên trong.

---

## 🚀 Hướng Dẫn Cài Đặt

### 0. Clone Repository

**Lần đầu**:
```bash
git clone https://github.com/Ducdata1808/customer_churn_prediction.git
cd customer_churn_prediction
```

**Các lần sau**:
```bash
git pull origin main
```

### 1. Tạo Môi Trường Ảo (Virtual Environment)

#### Trên Windows (PowerShell):

```powershell
# Tạo môi trường ảo tên "venv"
python -m venv venv

# Kích hoạt môi trường ảo
.\venv\Scripts\Activate.ps1
```

#### Trên macOS/Linux:

```bash
# Tạo môi trường ảo tên "venv"
python3 -m venv venv

# Kích hoạt môi trường ảo
source venv/bin/activate
```

### 2. Cài Đặt Các Thư Viện Cần Thiết

**Sau khi kích hoạt môi trường ảo**, chạy lệnh:

```bash
pip install -r requirements.txt
```

### 3. Xác Nhận Cài Đặt

Để kiểm tra xem các thư viện đã cài đặt thành công chưa:

```bash
pip list
```

---

## 🎬 Bắt đầu

### 1. Chuẩn bị dữ liệu

- Tạo thư mục `data/` trong thư mục gốc
- Tải 3 files data từ Kaggle: https://www.kaggle.com/competitions/playground-series-s6e3/data
- Đặt file `playground-series-s6e3.zip` vào thư mục `data/`

### 2. Đăng ký Jupyter Kernel (nếu dùng notebook)

```bash
python -m ipykernel install --user --name venv_kernel --display-name "Python (venv)"
```

### 3. Chạy Pipeline

#### Chạy toàn bộ pipeline (5 stages):

```bash
python main.py
```

**Thời gian ước tính**: 15-20 phút
- Stage 1-3: ~30 giây
- Stage 4 (Training): ~10-15 phút (GridSearchCV)
- Stage 5 (Evaluation): ~10 giây

#### Chạy từng stage riêng lẻ (để debug):

```bash
# Stage 1: Data Ingestion
python src/pipeline/stage_01_data_ingestion.py

# Stage 2: Data Validation
python src/pipeline/stage_02_data_validation.py

# Stage 3: Data Transformation
python src/pipeline/stage_03_data_transformation.py

# Stage 4: Model Training
python src/pipeline/stage_04_model_trainer.py

# Stage 5: Model Evaluation
python src/pipeline/stage_05_model_evaluation.py
```

### 4. Xem kết quả trong MLflow

```bash
mlflow ui
```

Truy cập: http://localhost:5000

Trong MLflow UI bạn sẽ thấy:
- **Experiments**: Các lần chạy training
- **Runs**: LightGBM_Training, XGBoost_Training, Model_Evaluation
- **Metrics**: ROC AUC, F1-Score, Accuracy, Precision, Recall
- **Parameters**: Hyperparameters của từng mô hình
- **Artifacts**: Models, logs

---

## 🔄 Pipeline Workflow

```
Stage 1: Data Ingestion
    ↓ (train.csv, test.csv)
Stage 2: Data Validation
    ↓ (validated data)
Stage 3: Data Transformation
    ↓ (train_transformed.npz, test_transformed.npz, preprocessor.joblib)
Stage 4: Model Training
    ↓ (model.joblib, metrics.json)
Stage 5: Model Evaluation
    ↓ (predictions.npz, visualizations)
```

---

## 📊 Chi tiết dữ liệu

### Dataset gốc
- **Train**: 594,194 samples
- **Test**: 254,655 samples
- **Features**: 20 features (17 sau khi loại bỏ id, TotalCharges, gender)

### Sau Feature Engineering & SMOTE
- **Train**: 920,754 samples (sau SMOTE)
- **Test**: 254,655 samples
- **Features**: 23 features (17 gốc + 6 features mới)
- **Class balance**: 50% Yes / 50% No (sau SMOTE)

### 9 Features mới được tạo
1. `charge_to_tenure_ratio`: Tỷ lệ chi phí/tháng sử dụng
2. `is_high_risk_profile`: Hợp đồng tháng + thanh toán Electronic check
3. `early_churn_flag`: Tenure ≤ 5 tháng
4. `utility_services_count`: Số dịch vụ hỗ trợ đang dùng
5. `streaming_count`: Số dịch vụ streaming đang dùng
6. `has_family`: Có Partner hoặc Dependents
7. `is_month_to_month`: Hợp đồng theo tháng
8. `is_fiber_optic`: Dùng Fiber optic
9. Các features từ preprocessing pipeline

---

## 🛠️ Tech Stack

- **Python 3.11**
- **Machine Learning**: scikit-learn, LightGBM, XGBoost
- **Data Processing**: pandas, numpy
- **Imbalanced Learning**: imbalanced-learn (SMOTE)
- **Experiment Tracking**: MLflow
- **Visualization**: matplotlib, seaborn

---

## 👥 Team

Dự án này được phát triển bởi nhóm:
- **EDA**: Giabi, Thầy Huy, Fuck, LA
- **Features Engineering**: Báo
- **Model Training & Pipeline**: K
- **Evaluation & Documentation**: Đức

---

## 📝 Lưu ý quan trọng

### SMOTE (Synthetic Minority Over-sampling)
- **Trước SMOTE**: 460,377 (No) vs 133,817 (Yes) - Tỷ lệ 77.5% vs 22.5%
- **Sau SMOTE**: 460,377 (No) vs 460,377 (Yes) - Tỷ lệ 50% vs 50%
- **Tổng samples**: 920,754 rows

### Test Set không có nhãn
- Tập test từ Kaggle không có cột `Churn`
- Stage 5 chỉ tạo predictions, không tính metrics
- Metrics được tính trên validation set (20% của train)

---

## 📚 Tài liệu tham khảo

- [Kaggle Competition: Playground Series S6E3](https://www.kaggle.com/competitions/playground-series-s6e3)
- [MLflow Documentation](https://mlflow.org/docs/latest/index.html)
- [LightGBM Documentation](https://lightgbm.readthedocs.io/)
- [XGBoost Documentation](https://xgboost.readthedocs.io/)
- [SMOTE Documentation](https://imbalanced-learn.org/stable/references/generated/imblearn.over_sampling.SMOTE.html)

---

## 📞 Liên hệ

Nếu có câu hỏi hoặc vấn đề, vui lòng tạo issue trên GitHub repository.

**Repository**: https://github.com/Ducdata1808/customer_churn_prediction

---

**Last Updated**: 2026-05-27  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
