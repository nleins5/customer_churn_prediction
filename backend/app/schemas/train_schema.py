from pydantic import BaseModel, Field
from typing import Dict, Any, List

class TrainRequest(BaseModel):
    model_type: str = Field(..., description="Thuật toán: 'logistic_regression', 'decision_tree', 'random_forest', 'xgboost', 'lightgbm'")
    hyperparameters: Dict[str, Any] = Field(default_factory=dict, description="Siêu tham số tùy chỉnh")
    test_size: float = Field(0.2, ge=0.1, le=0.5, description="Tỷ lệ tập validation")
    sample_size: int = Field(30000, le=50000, description="Số lượng mẫu lấy để huấn luyện nhanh")

class TrainResponse(BaseModel):
    model_type: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: float
    confusion_matrix: List[List[int]]
    training_time_seconds: float
