from fastapi import APIRouter, HTTPException
from app.schemas.train_schema import TrainRequest, TrainResponse
from app.services.train_service import train_and_evaluate

router = APIRouter(prefix="/api/train", tags=["Model Comparison"])

SUPPORTED_MODELS = {
    "logistic_regression": {"C": 1.0, "max_iter": 1000},
    "decision_tree": {"max_depth": 5},
    "random_forest": {"n_estimators": 100, "max_depth": 10},
    "xgboost": {"n_estimators": 100, "max_depth": 6, "learning_rate": 0.1},
    "lightgbm": {"n_estimators": 100, "max_depth": 7, "learning_rate": 0.1}
}

@router.get("/models")
async def get_supported_models():
    """Lấy danh sách các thuật toán được hỗ trợ và tham số mặc định"""
    return {"models": SUPPORTED_MODELS}

@router.post("", response_model=TrainResponse)
async def train_model(request: TrainRequest):
    """Tiến hành huấn luyện nhanh và đánh giá mô hình trên tập mẫu"""
    if request.model_type not in SUPPORTED_MODELS:
        raise HTTPException(status_code=400, detail=f"Model type '{request.model_type}' is not supported.")
        
    try:
        result = train_and_evaluate(request)
        return result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
