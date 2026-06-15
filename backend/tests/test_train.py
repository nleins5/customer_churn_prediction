import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_supported_models():
    response = client.get("/api/train/models")
    assert response.status_code == 200
    data = response.json()
    assert "models" in data
    assert "logistic_regression" in data["models"]
    assert "random_forest" in data["models"]

def test_train_logistic_regression():
    payload = {
        "model_type": "logistic_regression",
        "hyperparameters": {"max_iter": 100},
        "test_size": 0.2,
        "sample_size": 1000
    }
    response = client.post("/api/train", json=payload)
    assert response.status_code == 200, response.json()
    data = response.json()
    assert data["model_type"] == "logistic_regression"
    assert "accuracy" in data
    assert "confusion_matrix" in data
    assert data["training_time_seconds"] < 30

def test_train_xgboost():
    payload = {
        "model_type": "xgboost",
        "hyperparameters": {"n_estimators": 10, "max_depth": 3},
        "test_size": 0.2,
        "sample_size": 1000
    }
    response = client.post("/api/train", json=payload)
    assert response.status_code == 200, response.json()
    data = response.json()
    assert data["model_type"] == "xgboost"

def test_train_invalid_model():
    payload = {
        "model_type": "invalid_model",
        "hyperparameters": {},
        "test_size": 0.2,
        "sample_size": 1000
    }
    response = client.post("/api/train", json=payload)
    assert response.status_code == 400
    assert "not supported" in response.json()["detail"]

def test_train_sample_size_exceeded():
    payload = {
        "model_type": "lightgbm",
        "hyperparameters": {},
        "test_size": 0.2,
        "sample_size": 100000
    }
    response = client.post("/api/train", json=payload)
    assert response.status_code == 422  # Pydantic validation error for sample_size > 50000
