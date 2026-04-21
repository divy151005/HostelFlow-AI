"""
HostelFlow AI — Risk Detection Microservice
FastAPI + scikit-learn
Run: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import pickle, os, logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="HostelFlow AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Models ──

class RiskInput(BaseModel):
    student_id: str
    late_count: int
    total_leaves: int
    late_returns: int
    absence_pattern: Optional[float] = 0.0

class RiskOutput(BaseModel):
    student_id: str
    risk_level: str          # LOW, MEDIUM, HIGH
    risk_score: float        # 0.0 – 1.0
    factors: list[str]
    recommendation: str

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    version: str

# ── Load / Train Model ──

MODEL_PATH = "risk_model.pkl"
SCALER_PATH = "scaler.pkl"

def train_and_save_model():
    """Train on synthetic data and persist."""
    logger.info("Training risk model...")

    # Synthetic training data: [late_count, total_leaves, late_ratio, days_out]
    X = np.array([
        [0, 5,  0.0,  5],   # LOW
        [1, 10, 0.1, 10],   # LOW
        [2, 8,  0.25, 8],   # LOW
        [3, 12, 0.25, 12],  # MEDIUM
        [3, 7,  0.43, 7],   # MEDIUM
        [4, 10, 0.40, 10],  # MEDIUM
        [5, 8,  0.63, 8],   # HIGH
        [6, 9,  0.67, 9],   # HIGH
        [7, 10, 0.70, 10],  # HIGH
        [8, 12, 0.67, 12],  # HIGH
    ])
    # 0=LOW, 1=MEDIUM, 2=HIGH
    y = np.array([0, 0, 0, 1, 1, 1, 2, 2, 2, 2])

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_scaled, y)

    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)
    with open(SCALER_PATH, "wb") as f:
        pickle.dump(scaler, f)

    logger.info("Model trained and saved.")
    return model, scaler

def load_model():
    if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH):
        with open(MODEL_PATH, "rb") as f:
            model = pickle.load(f)
        with open(SCALER_PATH, "rb") as f:
            scaler = pickle.load(f)
        logger.info("Model loaded from disk.")
        return model, scaler
    return train_and_save_model()

model, scaler = load_model()
LABELS = {0: "LOW", 1: "MEDIUM", 2: "HIGH"}

# ── Routes ──

@app.get("/health", response_model=HealthResponse)
def health():
    return HealthResponse(status="ok", model_loaded=model is not None, version="1.0.0")

@app.post("/predict/risk", response_model=RiskOutput)
def predict_risk(data: RiskInput):
    try:
        total = max(data.total_leaves, 1)
        late_ratio = data.late_returns / total
        days_out = data.total_leaves

        features = np.array([[data.late_count, data.total_leaves, late_ratio, days_out]])
        features_scaled = scaler.transform(features)

        proba = model.predict_proba(features_scaled)[0]
        pred_class = int(np.argmax(proba))
        risk_level = LABELS[pred_class]
        risk_score = float(proba[2])  # probability of HIGH

        factors = []
        recommendation = ""

        if data.late_count >= 5:
            factors.append(f"High late return frequency ({data.late_count} times)")
        if late_ratio >= 0.5:
            factors.append(f"50%+ of leaves result in late returns")
        if data.late_count >= 3:
            factors.append("Repeated pattern of delayed returns")

        if risk_level == "HIGH":
            recommendation = "Immediate counselling recommended. Restrict outings until reviewed."
        elif risk_level == "MEDIUM":
            recommendation = "Monitor closely. Issue formal warning to student and parent."
        else:
            recommendation = "Student is compliant. No action needed."

        return RiskOutput(
            student_id=data.student_id,
            risk_level=risk_level,
            risk_score=round(risk_score, 3),
            factors=factors if factors else ["No significant risk factors"],
            recommendation=recommendation
        )

    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def root():
    return {"service": "HostelFlow AI", "status": "running", "endpoints": ["/health", "/predict/risk"]}
