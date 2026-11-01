"""
HostelFlow AI — Risk Detection & Hostel Operations Intelligence Microservice
FastAPI + scikit-learn
Run: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import pickle, os, logging
from collections import Counter

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="HostelFlow AI Service", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

class MaintenanceAnalysisInput(BaseModel):
    tasks: List[Dict[str, Any]]

class FeedbackAnalysisInput(BaseModel):
    feedback_entries: List[Dict[str, Any]]

class FoodComplaintInput(BaseModel):
    complaints: List[Dict[str, Any]]

class StudentActivityInput(BaseModel):
    student_name: str
    roll_number: str
    total_leaves: int
    total_exits: int
    total_returns: int
    late_count: int
    is_overdue: bool
    risk_level: str
    complaint_count: int

class AssistantQueryInput(BaseModel):
    user_role: str
    query: str

# ── Load / Train Model ──

MODEL_PATH = "risk_model.pkl"
SCALER_PATH = "scaler.pkl"

def train_and_save_model():
    """Train on synthetic data and persist."""
    logger.info("Training risk model...")

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
    y = np.array([0, 0, 0, 1, 1, 1, 2, 2, 2, 2])

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_scaled, y)

    try:
        with open(MODEL_PATH, "wb") as f:
            pickle.dump(model, f)
        with open(SCALER_PATH, "wb") as f:
            pickle.dump(scaler, f)
        logger.info("Model trained and saved.")
    except Exception as e:
        logger.warning(f"Could not persist model: {e}")

    return model, scaler

def load_model():
    if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH):
        try:
            with open(MODEL_PATH, "rb") as f:
                model = pickle.load(f)
            with open(SCALER_PATH, "rb") as f:
                scaler = pickle.load(f)
            logger.info("Model loaded from disk.")
            return model, scaler
        except Exception:
            pass
    return train_and_save_model()

try:
    model, scaler = load_model()
except Exception as e:
    logger.warning(f"Fallback initializing: {e}")
    model, scaler = None, None

LABELS = {0: "LOW", 1: "MEDIUM", 2: "HIGH"}

# ── Routes ──

@app.get("/health", response_model=HealthResponse)
def health():
    return HealthResponse(status="ok", model_loaded=model is not None, version="2.0.0")

@app.post("/predict/risk", response_model=RiskOutput)
def predict_risk(data: RiskInput):
    try:
        total = max(data.total_leaves, 1)
        late_ratio = data.late_returns / total

        if model is not None and scaler is not None:
            features = np.array([[data.late_count, data.total_leaves, late_ratio, data.total_leaves]])
            features_scaled = scaler.transform(features)
            proba = model.predict_proba(features_scaled)[0]
            pred_class = int(np.argmax(proba))
            risk_level = LABELS[pred_class]
            risk_score = float(proba[2])
        else:
            if data.late_count >= 5:
                risk_level = "HIGH"
                risk_score = 0.85
            elif data.late_count >= 3:
                risk_level = "MEDIUM"
                risk_score = 0.50
            else:
                risk_level = "LOW"
                risk_score = 0.15

        factors = []
        if data.late_count >= 5:
            factors.append(f"High late return frequency ({data.late_count} times)")
        if late_ratio >= 0.5:
            factors.append("50%+ of leaves result in late returns")
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

@app.post("/analyze/maintenance")
def analyze_maintenance(data: MaintenanceAnalysisInput):
    """Identify repeated maintenance problems across rooms and categories."""
    tasks = data.tasks
    if not tasks:
        return {"summary": "No maintenance data available.", "repeated_rooms": [], "top_categories": []}

    room_counter = Counter([t.get("roomNumber") for t in tasks if t.get("roomNumber")])
    cat_counter = Counter([t.get("category", "OTHER") for t in tasks])

    repeated_rooms = [{"room": r, "count": c} for r, c in room_counter.most_common(5) if c > 1]
    top_categories = [{"category": k, "count": v} for k, v in cat_counter.most_common(5)]

    summary = (
        f"Analyzed {len(tasks)} maintenance records. "
        f"Primary category is {top_categories[0]['category'] if top_categories else 'General'}. "
        f"{len(repeated_rooms)} room(s) exhibit recurring repair needs."
    )

    return {
        "summary": summary,
        "repeated_rooms": repeated_rooms,
        "top_categories": top_categories,
        "recommendation": "Dispatch specialized inspection to repeated rooms." if repeated_rooms else "Routine upkeep satisfactory."
    }

@app.post("/analyze/feedback")
def analyze_feedback(data: FeedbackAnalysisInput):
    """Summarize weekly hostel feedback sentiment and condition ratings."""
    entries = data.feedback_entries
    if not entries:
        return {"summary": "No weekly feedback submitted yet.", "average_ratings": {}, "concerns": []}

    all_ratings = {}
    for e in entries:
        ratings = e.get("ratings") or {}
        for k, v in ratings.items():
            all_ratings.setdefault(k, []).append(v)

    averages = {k: round(sum(v) / len(v), 2) for k, v in all_ratings.items() if v}
    low_rated = [k for k, v in averages.items() if v < 3.0]

    concerns = []
    if low_rated:
        concerns.append(f"Sub-optimal satisfaction in: {', '.join(low_rated)}")
    if averages.get("washroomCleanliness", 5.0) < 3.0:
        concerns.append("Urgent sanitation intervention suggested in washrooms.")
    if averages.get("electricity", 5.0) < 3.0:
        concerns.append("Electrical supply fluctuations reported repeatedly.")

    return {
        "summary": f"Aggregated {len(entries)} student responses. Average satisfaction score is {round(sum(averages.values())/max(len(averages),1), 2)}/5.",
        "average_ratings": averages,
        "concerns": concerns if concerns else ["Hostel conditions generally reported in good order."],
        "action_items": [f"Audit {area}" for area in low_rated] if low_rated else ["Maintain periodic inspections."]
    }

@app.post("/analyze/food-complaints")
def analyze_food_complaints(data: FoodComplaintInput):
    """Cluster and identify recurring food complaints and hygiene issues."""
    complaints = data.complaints
    if not complaints:
        return {"summary": "No food complaints recorded.", "recurring_issues": []}

    categories = Counter([c.get("category", "FOOD_QUALITY") for c in complaints])
    recurring = [{"category": cat, "count": cnt} for cat, cnt in categories.most_common() if cnt > 0]

    hygiene_count = categories.get("HYGIENE", 0) + categories.get("INSECTS", 0)
    quality_count = categories.get("FOOD_QUALITY", 0) + categories.get("UNDERCOOKED_FOOD", 0)

    advisory = []
    if hygiene_count > 0:
        advisory.append(f"{hygiene_count} hygiene/cleanliness incident(s) flagged in mess. Deep kitchen sanitisation advised.")
    if quality_count > 0:
        advisory.append(f"{quality_count} food preparation/quality complaint(s) noted. Review cooking standard with head chef.")

    return {
        "summary": f"Detected {len(complaints)} food complaints across {len(categories)} categories.",
        "recurring_issues": recurring,
        "hygiene_alert": hygiene_count >= 2,
        "advisory": advisory if advisory else ["No major recurring mess disruptions."]
    }

@app.post("/analyze/student-activity")
def analyze_student_activity(data: StudentActivityInput):
    """Generate intelligent advisory summary for a student's supervision."""
    insights = []
    if data.is_overdue:
        insights.append("CRITICAL: Student is currently overdue without gate check-in scan.")
    if data.late_count >= 3:
        insights.append(f"Recurring tardiness: {data.late_count} recorded late return incidents.")
    if data.complaint_count > 3:
        insights.append(f"High complaint frequency: {data.complaint_count} registered grievances.")

    attendance_status = "Good standing"
    if data.late_count >= 4 or data.is_overdue:
        attendance_status = "Supervision required"
    elif data.late_count >= 2:
        attendance_status = "Mild delay pattern"

    return {
        "student": data.student_name,
        "roll_number": data.roll_number,
        "status_evaluation": attendance_status,
        "insights": insights if insights else ["Standard leave and gate attendance maintained."],
        "recommended_action": (
            "Contact parent and schedule immediate meeting." if data.is_overdue or data.risk_level == "HIGH"
            else "Issue gentle reminder on hostel curfew timings." if data.late_count > 0
            else "No supervisory action required."
        )
    }

@app.post("/assistant/chat")
def assistant_chat(data: AssistantQueryInput):
    """HostelFlow AI Assistant answering hostel rules, guidelines, and leave FAQs."""
    q = data.query.lower()

    if "late" in q or "curfew" in q:
        resp = "Hostel curfew is strictly 08:00 PM for standard outings. Returns past expected time are automatically flagged as late and notify warden and parent."
    elif "leave" in q or "apply" in q:
        resp = "To apply for leave, submit your destination, from/to dates, and reason. Outings require mentor approval. Multi-day leaves require warden approval and parent consent."
    elif "mess" in q or "food" in q:
        resp = "The weekly mess timetable is updated by the warden. Breakfast is 07:30-09:30, Lunch 12:30-14:30, Snacks 17:00-18:00, Dinner 19:30-21:30. You can submit food feedback or complaints in Hostel Care."
    elif "emergency" in q or "sos" in q:
        resp = "In an emergency, click the SOS button in your Student Dashboard. It sends an instant priority broadcast to your Warden, Mentor, and Linked Parent."
    elif "complaint" in q:
        resp = "Complaints are tracked in real-time through: SUBMITTED -> ASSIGNED -> IN_PROGRESS -> RESOLVED. You can also reopen a complaint if it is not satisfactorily resolved."
    else:
        resp = f"HostelFlow AI Assistant: I'm here to support hostel operations. You can ask about leave approval, gate passes, mess timetable, or emergency protocols."

    return {
        "query": data.query,
        "response": resp,
        "role": data.user_role
    }

@app.get("/")
def root():
    return {
        "service": "HostelFlow AI Intelligence",
        "version": "2.0.0",
        "status": "running",
        "endpoints": [
            "/health",
            "/predict/risk",
            "/analyze/maintenance",
            "/analyze/feedback",
            "/analyze/food-complaints",
            "/analyze/student-activity",
            "/assistant/chat"
        ]
    }
