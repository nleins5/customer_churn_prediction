import pytest
import numpy as np
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

@pytest.fixture(autouse=True)
def mock_load_and_sample_data(monkeypatch):
    def fake_load_and_sample_data(sample_size, test_size):
        num_features = 23
        train_size = int(sample_size * (1 - test_size))
        val_size = int(sample_size * test_size)
        if train_size < 10:
            train_size = 10
        if val_size < 10:
            val_size = 10
        
        y_train = np.array([0, 1] * (train_size // 2))
        if len(y_train) < train_size:
            y_train = np.append(y_train, [0])
            
        y_val = np.array([0, 1] * (val_size // 2))
        if len(y_val) < val_size:
            y_val = np.append(y_val, [0])
            
        X_train = np.random.randn(len(y_train), num_features)
        X_val = np.random.randn(len(y_val), num_features)
        
        return X_train, X_val, y_train, y_val

    import app.services.train_service as train_service
    monkeypatch.setattr(train_service, "load_and_sample_data", fake_load_and_sample_data)


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
