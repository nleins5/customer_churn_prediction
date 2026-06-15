"""
Component để tạo predictions và file submission cho Kaggle competition.
"""

import pandas as pd
import numpy as np
import joblib
from pathlib import Path
from src.utils.logger import logger
from src.entity.config_entity import PredictionConfig


class PredictionPipeline:
    """
    Pipeline để tạo predictions trên test set và tạo file submission.
    """
    
    def __init__(self, config: PredictionConfig):
        """
        Khởi tạo PredictionPipeline.
        
        Args:
            config: Đối tượng PredictionConfig chứa cấu hình đường dẫn.
        """
        self.config = config
        self.model = None
        self.preprocessor = None
        self.test_df = None
        self.test_ids = None
        self.predictions = None
    
    def load_model(self):
        """Load trained model từ file."""
        try:
            logger.info(f"Loading model from {self.config.model_path}")
            self.model = joblib.load(self.config.model_path)
            logger.info("✓ Model loaded successfully")
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            raise e
    
    def load_preprocessor(self):
        """Load preprocessor từ file."""
        try:
            logger.info(f"Loading preprocessor from {self.config.preprocessor_path}")
            self.preprocessor = joblib.load(self.config.preprocessor_path)
            logger.info("✓ Preprocessor loaded successfully")
        except Exception as e:
            logger.error(f"Error loading preprocessor: {e}")
            raise e
    
    def load_test_data(self):
        """Đọc test data và lấy IDs."""
        try:
            logger.info(f"Loading test data from {self.config.test_data_path}")
            self.test_df = pd.read_csv(self.config.test_data_path)
            self.test_ids = self.test_df['id'].values
            logger.info(f"✓ Test data loaded: {len(self.test_df)} samples")
        except Exception as e:
            logger.error(f"Error loading test data: {e}")
            raise e
    
    def preprocess_test_data(self):
        """Transform test data bằng preprocessor."""
        try:
            logger.info("Preprocessing test data...")
            
            # Drop id column để transform
            test_features = self.test_df.drop('id', axis=1)
            
            # Transform bằng preprocessor đã fit trên train data
            test_transformed = self.preprocessor.transform(test_features)
            
            logger.info(f"✓ Test data preprocessed: shape {test_transformed.shape}")
            return test_transformed
            
        except Exception as e:
            logger.error(f"Error preprocessing test data: {e}")
            raise e
    
    def predict(self, test_transformed):
        """
        Tạo predictions trên test data.
        
        Args:
            test_transformed: Test data đã được transform
            
        Returns:
            predictions: Array of predictions
        """
        try:
            logger.info("Generating predictions...")
            
            # Predict class labels
            self.predictions = self.model.predict(test_transformed)
            
            # Convert 0/1 to No/Yes nếu cần
            if self.predictions.dtype in [np.int32, np.int64]:
                self.predictions = np.where(self.predictions == 1, 'Yes', 'No')
            
            logger.info(f"✓ Predictions generated: {len(self.predictions)} samples")
            logger.info(f"  - Predicted 'Yes': {np.sum(self.predictions == 'Yes')}")
            logger.info(f"  - Predicted 'No': {np.sum(self.predictions == 'No')}")
            
            return self.predictions
            
        except Exception as e:
            logger.error(f"Error generating predictions: {e}")
            raise e
    
    def create_submission(self):
        """Tạo file submission.csv."""
        try:
            logger.info(f"Creating submission file: {self.config.output_path}")
            
            # Tạo DataFrame với id và predictions
            submission = pd.DataFrame({
                'id': self.test_ids,
                'Churn': self.predictions
            })
            
            # Lưu vào CSV
            submission.to_csv(self.config.output_path, index=False)
            
            logger.info(f"✓ Submission file created: {self.config.output_path}")
            logger.info(f"  - Total rows: {len(submission)}")
            logger.info(f"  - Columns: {list(submission.columns)}")
            
            # Hiển thị 5 dòng đầu
            logger.info("\nFirst 5 rows of submission:")
            logger.info(f"\n{submission.head()}")
            
        except Exception as e:
            logger.error(f"Error creating submission file: {e}")
            raise e
    
    def run(self):
        """
        Chạy toàn bộ pipeline: load model, preprocess, predict, create submission.
        """
        try:
            logger.info("="*60)
            logger.info("Starting Prediction Pipeline")
            logger.info("="*60)
            
            # Step 1: Load model và preprocessor
            self.load_model()
            self.load_preprocessor()
            
            # Step 2: Load test data
            self.load_test_data()
            
            # Step 3: Preprocess test data
            test_transformed = self.preprocess_test_data()
            
            # Step 4: Generate predictions
            self.predict(test_transformed)
            
            # Step 5: Create submission file
            self.create_submission()
            
            logger.info("="*60)
            logger.info("✅ Prediction Pipeline completed successfully!")
            logger.info("="*60)
            
        except Exception as e:
            logger.error(f"Prediction Pipeline failed: {e}")
            raise e
