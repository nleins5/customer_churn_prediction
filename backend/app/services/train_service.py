import time
import pandas as pd
import numpy as np
import joblib
import logging
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from lightgbm import LGBMClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix
from imblearn.over_sampling import SMOTE
import sys

from app.schemas.train_schema import TrainRequest

logger = logging.getLogger(__name__)

# Path to the data and preprocessor relative to the backend folder
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.append(str(BASE_DIR))

TRAIN_DATA_PATH = BASE_DIR / "artifacts" / "data_ingestion" / "train.csv"
PREPROCESSOR_PATH = BASE_DIR / "artifacts" / "data_transformation" / "preprocessor.joblib"
TARGET_COL = "Churn"

def load_and_sample_data(sample_size: int, test_size: float):
    logger.info(f"Loading data from {TRAIN_DATA_PATH}")
    df = pd.read_csv(TRAIN_DATA_PATH)
    
    # Stratified sampling
    if sample_size < len(df):
        logger.info(f"Sampling {sample_size} rows from {len(df)} rows")
        df_sample = df.groupby(TARGET_COL, group_keys=False).apply(
            lambda x: x.sample(n=int(len(x)/len(df) * sample_size), random_state=42)
        ).reset_index(drop=True)
    else:
        df_sample = df.copy()

    # Preprocessing identical to original pipeline
    df_sample["TotalCharges"] = pd.to_numeric(df_sample["TotalCharges"], errors="coerce")
    df_sample = df_sample[~((df_sample["InternetService"] == "No") & (df_sample["PhoneService"] == "No"))].reset_index(drop=True)
    
    X = df_sample.drop(columns=[TARGET_COL])
    y = df_sample[TARGET_COL].map({"Yes": 1, "No": 0})
    
    # Load preprocessor
    logger.info(f"Loading preprocessor from {PREPROCESSOR_PATH}")
    preprocessor = joblib.load(PREPROCESSOR_PATH)
    X_transformed = preprocessor.transform(X)
    
    # Train/Validation split
    X_train, X_val, y_train, y_val = train_test_split(X_transformed, y, test_size=test_size, random_state=42, stratify=y)
    
    # Apply SMOTE only on Train set to avoid data leakage
    logger.info("Applying SMOTE on the sampled training set")
    smote = SMOTE(random_state=42)
    X_train_resampled, y_train_resampled = smote.fit_resample(X_train, y_train)
    
    return X_train_resampled, X_val, y_train_resampled, y_val

def get_model(model_type: str, hyperparameters: dict):
    if model_type == "logistic_regression":
        params = {"random_state": 42, "max_iter": 1000}
        params.update(hyperparameters)
        return LogisticRegression(**params)
    elif model_type == "decision_tree":
        params = {"random_state": 42}
        params.update(hyperparameters)
        return DecisionTreeClassifier(**params)
    elif model_type == "random_forest":
        params = {"random_state": 42}
        params.update(hyperparameters)
        return RandomForestClassifier(**params)
    elif model_type == "xgboost":
        params = {"random_state": 42, "eval_metric": 'logloss', "use_label_encoder": False}
        params.update(hyperparameters)
        return XGBClassifier(**params)
    elif model_type == "lightgbm":
        params = {"random_state": 42, "verbose": -1}
        params.update(hyperparameters)
        return LGBMClassifier(**params)
    else:
        raise ValueError(f"Model type '{model_type}' is not supported.")

def train_and_evaluate(request: TrainRequest) -> dict:
    start_time = time.time()
    
    logger.info(f"Starting train_and_evaluate for model {request.model_type}")
    X_train, X_val, y_train, y_val = load_and_sample_data(request.sample_size, request.test_size)
    
    logger.info(f"Initializing {request.model_type} model")
    model = get_model(request.model_type, request.hyperparameters)
    
    logger.info("Fitting model...")
    model.fit(X_train, y_train)
    
    logger.info("Evaluating model...")
    y_pred = model.predict(X_val)
    # Get probabilities for ROC AUC if applicable (Logistic, RF, XGB, LGBM support predict_proba)
    try:
        y_prob = model.predict_proba(X_val)[:, 1]
        roc_auc = float(roc_auc_score(y_val, y_prob))
    except Exception:
        # Fallback if model doesn't support predict_proba
        roc_auc = float(roc_auc_score(y_val, y_pred))
    
    acc = float(accuracy_score(y_val, y_pred))
    prec = float(precision_score(y_val, y_pred, zero_division=0))
    rec = float(recall_score(y_val, y_pred, zero_division=0))
    f1 = float(f1_score(y_val, y_pred, zero_division=0))
    cm = confusion_matrix(y_val, y_pred).tolist()
    
    training_time = float(time.time() - start_time)
    logger.info(f"Training completed in {training_time:.2f} seconds")
    
    return {
        "model_type": request.model_type,
        "accuracy": acc,
        "precision": prec,
        "recall": rec,
        "f1_score": f1,
        "roc_auc": roc_auc,
        "confusion_matrix": cm,
        "training_time_seconds": training_time
    }
