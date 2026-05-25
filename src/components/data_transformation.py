import pandas as pd
import numpy as np
import joblib
from pathlib import Path

from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from imblearn.over_sampling import SMOTE

from src.entity.config_entity import DataTransformationConfig
from src.utils.common import logger


# Transformer tạo feature mới từ kết quả EDA
# Không có trạng thái (stateless): fit() không làm gì, chỉ transform() tạo cột mới
# Phải đặt TRƯỚC ColumnTransformer trong Pipeline để các cột mới được xử lý tiếp theo
class ChurnFeatureEngineer(BaseEstimator, TransformerMixin):

    def fit(self, X, y=None):
        # Không cần học gì từ dữ liệu, trả về chính nó
        return self

    def transform(self, X, y=None):
        X = X.copy()

        # Tỷ lệ chi phí trên số tháng sử dụng - tỷ lệ cao cho thấy áp lực chi phí lớn, churn risk 87.1%
        X["charge_to_tenure_ratio"] = X["MonthlyCharges"] / (X["tenure"] + 1)

        # Hồ sơ rủi ro cao - khách hàng hợp đồng tháng và thanh toán Electronic check có churn trên 40%
        X["is_high_risk_profile"] = (
            (X["Contract"] == "Month-to-month") &
            (X["PaymentMethod"] == "Electronic check")
        ).astype(int)

        # Cờ hiệu churn sớm - phân phối KDE của nhóm Churn=Yes tập trung ở tenure thấp (dưới 5 tháng)
        X["early_churn_flag"] = (X["tenure"] <= 5).astype(int)

        # Đếm số dịch vụ hỗ trợ mà khách hàng đang dùng - càng nhiều dịch vụ càng khó rời đi
        utility_cols = ["OnlineSecurity", "TechSupport", "OnlineBackup", "DeviceProtection"]
        for col in utility_cols:
            X[col] = X[col].map({"Yes": 1, "No": 0, "No internet service": 0}).fillna(0)
        X["utility_services_count"] = X[utility_cols].sum(axis=1)

        # Đếm số dịch vụ streaming - gộp lại để giảm đa cộng tuyến giữa StreamingTV và StreamingMovies (tương quan 0.66)
        streaming_cols = ["StreamingTV", "StreamingMovies"]
        for col in streaming_cols:
            X[col] = X[col].map({"Yes": 1, "No": 0, "No internet service": 0}).fillna(0)
        X["streaming_count"] = X[streaming_cols].sum(axis=1)

        # Gộp Partner và Dependents thành một biến - hai biến này tương quan cao với nhau
        X["has_family"] = (
            (X["Partner"] == "Yes") | (X["Dependents"] == "Yes")
        ).astype(int)

        # Biến nhị phân cho hợp đồng tháng - đây là biến phân tách churn mạnh nhất (spread 41%)
        X["is_month_to_month"] = (X["Contract"] == "Month-to-month").astype(int)

        # Biến nhị phân cho Fiber optic - nhóm này có churn rate cao nhất 41.5%
        X["is_fiber_optic"] = (X["InternetService"] == "Fiber optic").astype(int)

        return X


# Transformer cắt bớt outlier bằng phương pháp Winsorization
# fit() học ngưỡng cắt từ tập train, transform() áp dụng cho cả train và test
class WinsorizerTransformer(BaseEstimator, TransformerMixin):

    def __init__(self, lower_pct=0.01, upper_pct=0.99):
        # Ngưỡng dưới (percentile 1%) và ngưỡng trên (percentile 99%)
        self.lower_pct = lower_pct
        self.upper_pct = upper_pct
        self.bounds_ = {}

    def fit(self, X, y=None):
        # Học ngưỡng cắt cho từng cột từ tập train
        X = pd.DataFrame(X) if not isinstance(X, pd.DataFrame) else X
        for i, col in enumerate(X.columns):
            self.bounds_[i] = (
                X[col].quantile(self.lower_pct),
                X[col].quantile(self.upper_pct),
            )
        return self

    def transform(self, X, y=None):
        # Cắt giá trị nằm ngoài ngưỡng đã học
        X = np.array(X, dtype=float).copy()
        for i, (lower, upper) in self.bounds_.items():
            X[:, i] = np.clip(X[:, i], lower, upper)
        return X


# Class chính của Stage 03, được gọi bởi src/pipeline/stage_03_data_transformation.py
class DataTransformation:

    # Các cột bị loại bỏ trước khi đưa vào pipeline
    COLS_TO_DROP = [
        "id",           # chỉ là ID của Kaggle, không chứa thông tin dự báo
        "TotalCharges", # đa cộng tuyến quá cao với tenure (0.77) và MonthlyCharges (0.63)
        "gender",       # spread churn chỉ 0.57%, không có giá trị dự báo
    ]

    # Các cột số được xử lý qua Winsorizer rồi StandardScaler
    # Bao gồm cả 3 feature mới tạo ra từ ChurnFeatureEngineer
    NUMERIC_COLS = [
        "tenure",
        "MonthlyCharges",
        "charge_to_tenure_ratio",
        "utility_services_count",
        "streaming_count",
    ]

    # Các cột phân loại còn lại sau khi đã gộp các biến tương quan thành feature mới
    # OnlineSecurity, TechSupport, OnlineBackup, DeviceProtection đã được gộp vào utility_services_count
    # StreamingTV, StreamingMovies đã được gộp vào streaming_count
    CATEGORICAL_COLS = [
        "MultipleLines",
        "InternetService",
        "Contract",
        "PaymentMethod",
    ]

    # Các cột nhị phân Yes/No được mã hóa bằng OneHotEncoder drop='first' thành 0/1
    BINARY_COLS = [
        "Partner",
        "Dependents",
        "PhoneService",
        "PaperlessBilling",
    ]

    # Các feature nhị phân đã được tạo sẵn bởi ChurnFeatureEngineer, giá trị đã là 0/1
    ENGINEERED_BINARY_COLS = [
        "is_high_risk_profile",
        "early_churn_flag",
        "has_family",
        "is_month_to_month",
        "is_fiber_optic",
    ]

    TARGET_COL = "Churn"

    def __init__(self, config: DataTransformationConfig):
        self.config = config

    def get_data_transformer_object(self) -> Pipeline:
        # Xây dựng sklearn Pipeline gồm 2 bước chính:
        # Bước 1: ChurnFeatureEngineer tạo feature mới trước
        # Bước 2: ColumnTransformer xử lý từng nhóm cột khác nhau
        # Trả về pipeline CHƯA fit

        logger.info("Xây dựng preprocessing pipeline")

        # Pipeline cho cột số: xử lý giá trị thiếu bằng median, cắt outlier, chuẩn hóa
        numeric_pipeline = Pipeline(steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("winsorizer", WinsorizerTransformer()),
            ("scaler", StandardScaler()),
        ])

        # Pipeline cho cột phân loại: xử lý giá trị thiếu bằng giá trị phổ biến nhất, mã hóa OHE
        categorical_pipeline = Pipeline(steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("encoder", OneHotEncoder(
                handle_unknown="ignore",  # bỏ qua category lạ trong tập test
                drop="first",             # tránh dummy variable trap
                sparse_output=False,
            )),
        ])

        # Pipeline cho cột nhị phân Yes/No: xử lý giá trị thiếu, mã hóa OHE thành 0/1
        binary_pipeline = Pipeline(steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("encoder", OneHotEncoder(
                handle_unknown="ignore",
                drop="first",
                sparse_output=False,
            )),
        ])

        # Pipeline cho các feature nhị phân đã tạo sẵn: chỉ cần xử lý giá trị thiếu
        engineered_pipeline = Pipeline(steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
        ])

        # Gộp tất cả các pipeline lại theo từng nhóm cột
        preprocessor = ColumnTransformer(
            transformers=[
                ("num", numeric_pipeline, self.NUMERIC_COLS),
                ("cat", categorical_pipeline, self.CATEGORICAL_COLS),
                ("bin", binary_pipeline, self.BINARY_COLS),
                ("eng", engineered_pipeline, self.ENGINEERED_BINARY_COLS),
            ],
            remainder="drop",  # loại bỏ tất cả cột không được liệt kê ở trên
        )

        # Pipeline đầy đủ: tạo feature mới trước, rồi xử lý
        full_pipeline = Pipeline(steps=[
            ("feature_engineering", ChurnFeatureEngineer()),
            ("preprocessing", preprocessor),
        ])

        return full_pipeline

    def initiate_data_transformation(self):
        # Điểm vào được gọi bởi stage_03_data_transformation.py
        # Thứ tự xử lý: load dữ liệu, drop cột, tách X/y, fit pipeline trên train,
        # transform cả train và test, áp dụng SMOTE trên train, lưu kết quả

        logger.info("Bắt đầu Stage 03: Data Transformation")

        # Bước 1: Đọc dữ liệu từ artifacts của Stage 01
        logger.info(f"Đọc file train: {self.config.train_data_path}")
        df_train = pd.read_csv(self.config.train_data_path)

        logger.info(f"Đọc file test: {self.config.test_data_path}")
        df_test = pd.read_csv(self.config.test_data_path)

        logger.info(f"Kích thước train: {df_train.shape}, kích thước test: {df_test.shape}")

        # Bước 2: Chuyển TotalCharges sang số (trong dataset có thể bị lưu dạng chuỗi do khoảng trắng)
        for df in [df_train, df_test]:
            df["TotalCharges"] = pd.to_numeric(df["TotalCharges"], errors="coerce")

        # Bước 3: Loại bỏ các cột không cần thiết
        cols_drop_train = [c for c in self.COLS_TO_DROP if c in df_train.columns]
        cols_drop_test  = [c for c in self.COLS_TO_DROP if c in df_test.columns]
        df_train = df_train.drop(columns=cols_drop_train)
        df_test  = df_test.drop(columns=cols_drop_test)
        logger.info(f"Đã xóa các cột: {cols_drop_train}")

        # Bước 4: Tách biến đầu vào X và nhãn mục tiêu y
        X_train = df_train.drop(columns=[self.TARGET_COL])
        y_train = df_train[self.TARGET_COL].map({"Yes": 1, "No": 0})

        # Tập test của Kaggle có thể không có cột target
        if self.TARGET_COL in df_test.columns:
            X_test = df_test.drop(columns=[self.TARGET_COL])
            y_test = df_test[self.TARGET_COL].map({"Yes": 1, "No": 0})
        else:
            X_test = df_test.copy()
            y_test = None

        logger.info(f"X_train: {X_train.shape}, tỷ lệ churn: {y_train.mean():.2%}")

        # Bước 5: Fit pipeline CHỈ trên tập train để tránh data leakage
        logger.info("Fit preprocessing pipeline trên X_train")
        pipeline = self.get_data_transformer_object()
        X_train_transformed = pipeline.fit_transform(X_train)

        # Bước 6: Chỉ transform X_test, không fit lại
        logger.info("Transform X_test (không fit lại)")
        X_test_transformed = pipeline.transform(X_test)

        logger.info(f"Sau transform: X_train {X_train_transformed.shape}, X_test {X_test_transformed.shape}")

        # Bước 7: Áp dụng SMOTE CHỈ trên tập train để xử lý mất cân bằng nhãn (77.5% No vs 22.5% Yes)
        logger.info("Áp dụng SMOTE trên X_train để cân bằng nhãn")
        logger.info(f"Phân phối nhãn trước SMOTE: {dict(zip(*np.unique(y_train, return_counts=True)))}")

        smote = SMOTE(random_state=42)
        X_train_resampled, y_train_resampled = smote.fit_resample(
            X_train_transformed, y_train
        )

        logger.info(f"Phân phối nhãn sau SMOTE: {dict(zip(*np.unique(y_train_resampled, return_counts=True)))}")
        logger.info(f"X_train sau SMOTE: {X_train_resampled.shape}")

        # Bước 8: Lưu pipeline đã fit (không lưu SMOTE vì không cần khi dự báo)
        joblib.dump(pipeline, self.config.preprocessor_path)
        logger.info(f"Đã lưu preprocessor: {self.config.preprocessor_path}")

        # Bước 9: Lưu dữ liệu đã xử lý để Stage 04 sử dụng
        train_path = self.config.root_dir / "train_transformed.npz"
        test_path  = self.config.root_dir / "test_transformed.npz"

        np.savez(train_path, X=X_train_resampled, y=np.array(y_train_resampled))

        if y_test is not None:
            np.savez(test_path, X=X_test_transformed, y=np.array(y_test))
        else:
            np.savez(test_path, X=X_test_transformed)

        logger.info(f"Đã lưu file train: {train_path}")
        logger.info(f"Đã lưu file test: {test_path}")

        # Bước 10: Kiểm tra kết quả trước khi kết thúc
        assert X_train_resampled.shape[1] == X_test_transformed.shape[1], \
            "Lỗi: Số cột của train và test không khớp sau khi transform"
        assert not np.isnan(X_train_resampled).any(), \
            "Lỗi: Còn giá trị NaN trong X_train sau khi transform"
        assert not np.isnan(X_test_transformed).any(), \
            "Lỗi: Còn giá trị NaN trong X_test sau khi transform"

        logger.info(f"Kiểm tra thành công, số feature cuối: {X_train_resampled.shape[1]}")
        logger.info("Hoàn thành Stage 03: Data Transformation")