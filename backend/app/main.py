from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import asyncio
import json
import logging
import random
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("WiFiSense3D")

app = FastAPI(
    title="WiFiSense 3D - Spatial Sensing & Localization API",
    description="Academic research & enterprise platform for AI-powered Wi-Fi sensing, 3D digital twin telemetry, anonymous occupancy, and consented participant localization.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for local Vite frontend and remote clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------------------------
# Data Models
# ------------------------------------------------------------------------------
class HealthStatus(BaseModel):
    status: str
    timestamp: str
    telemetry_mode: str
    active_nodes: int
    total_nodes: int
    db_connected: bool
    dpdp_compliance_active: bool

class Point3D(BaseModel):
    x: float
    y: float
    z: float

class LocalizationEstimateRequest(BaseModel):
    user_id: str
    consent_token: str
    rssi_measurements: Dict[str, float]
    barometer_pressure_hpa: Optional[float] = None
    imu_step_detected: Optional[bool] = None

class LocalizationEstimateResponse(BaseModel):
    estimated_floor: int
    estimated_room: Optional[str]
    position: Point3D
    confidence_score: float
    uncertainty_radius_m: float
    activity: str
    timestamp: str

class AnonymousOccupancyEvent(BaseModel):
    floor: int
    zone: str
    motion_detected: bool
    perturbation_index: float
    confidence: float
    timestamp: str

# ------------------------------------------------------------------------------
# API Endpoints
# ------------------------------------------------------------------------------
@app.get("/health", response_model=HealthStatus, tags=["System Health"])
async def get_system_health():
    return HealthStatus(
        status="HEALTHY",
        timestamp=datetime.utcnow().isoformat() + "Z",
        telemetry_mode="SIMULATION",
        active_nodes=28,
        total_nodes=28,
        db_connected=True,
        dpdp_compliance_active=True
    )

@app.get("/api/v1/building/pilot-hostel", tags=["Building Architecture"])
async def get_pilot_hostel_metadata():
    """Returns the architectural specifications for the 9-floor hostel pilot facility."""
    return {
        "building_id": "hostel-block-alpha",
        "name": "Hostel Block Alpha (Pilot Facility)",
        "total_floors": 9,
        "floor_1_geometry": {
            "type": "L_SHAPED_CORRIDOR",
            "long_corridor_length_m": 28.0,
            "short_corridor_length_m": 20.0,
            "corridor_width_m": 2.4,
            "turning_point_coords": {"x": 0.0, "y": 0.35, "z": 0.0},
            "vertical_cores": [
                {"type": "ELEVATOR", "pos": {"x": -3.5, "y": 1.7, "z": -3.5}},
                {"type": "STAIRCASE", "pos": {"x": -3.5, "y": 1.7, "z": 1.5}}
            ],
            "network_cabinet": {"pos": {"x": 1.2, "y": 1.2, "z": -3.2}},
            "anchor_nodes": [
                {"id": "node-1-junction", "label": "Node 1 (L-Junction Turning Point)", "pos": {"x": 1.5, "y": 2.4, "z": 1.5}},
                {"id": "node-1-farend", "label": "Node 2 (Far End of Corridor)", "pos": {"x": 26.0, "y": 2.4, "z": 0.0}}
            ]
        },
        "floors_2_to_9": {
            "status": "CONFIGURABLE_PROTOTYPE",
            "rooms_per_floor": 20,
            "is_measured": False
        }
    }

@app.post("/api/v1/localization/estimate", response_model=LocalizationEstimateResponse, tags=["Localization"])
async def calculate_participant_location(payload: LocalizationEstimateRequest):
    """
    Consented participant indoor localization engine.
    Verifies DPDP consent token before processing Wi-Fi RSSI fingerprint.
    """
    if not payload.consent_token or payload.consent_token == "REVOKED":
        raise HTTPException(
            status_code=403,
            detail="Consent token invalid or revoked. Localization aborted under DPDP Act 2023."
        )

    # In production, invokes EKF / WKNN / Random Forest classifier
    return LocalizationEstimateResponse(
        estimated_floor=1,
        estimated_room="104",
        position=Point3D(x=17.1, y=1.7, z=4.8),
        confidence_score=0.914,
        uncertainty_radius_m=1.4,
        activity="WALKING" if payload.imu_step_detected else "STATIONARY",
        timestamp=datetime.utcnow().isoformat() + "Z"
    )

@app.get("/api/v1/occupancy/anonymous", response_model=List[AnonymousOccupancyEvent], tags=["Occupancy"])
async def get_anonymous_occupancy():
    """Device-free ambient occupancy detection via RF perturbation. Contains ZERO personal identifiers."""
    return [
        AnonymousOccupancyEvent(
            floor=1,
            zone="L-Junction Corridor Turning Point",
            motion_detected=True,
            perturbation_index=0.88,
            confidence=0.93,
            timestamp=datetime.utcnow().isoformat() + "Z"
        ),
        AnonymousOccupancyEvent(
            floor=1,
            zone="North Wing Bay 1 (Room 101)",
            motion_detected=True,
            perturbation_index=0.74,
            confidence=0.89,
            timestamp=datetime.utcnow().isoformat() + "Z"
        ),
        AnonymousOccupancyEvent(
            floor=1,
            zone="North Wing Bay 6 (Far End Node 2)",
            motion_detected=False,
            perturbation_index=0.12,
            confidence=0.82,
            timestamp=datetime.utcnow().isoformat() + "Z"
        )
    ]

# ------------------------------------------------------------------------------
# WebSocket Real-Time Telemetry Stream
# ------------------------------------------------------------------------------
@app.websocket("/ws/telemetry")
async def websocket_telemetry_hub(websocket: WebSocket):
    await websocket.accept()
    logger.info("WebSocket telemetry client connected")
    try:
        while True:
            # Emits live simulated RF telemetry packet every 1.5 seconds
            telemetry_packet = {
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "mode": "SIMULATION",
                "rf_noise_floor_dbm": -92.0 + (random.random() - 0.5) * 3.0,
                "node_status": {
                    "node_1_junction_rssi": -52 + random.randint(-2, 2),
                    "node_2_farend_rssi": -58 + random.randint(-3, 3)
                },
                "occupancy_index": random.randint(38, 45)
            }
            await websocket.send_text(json.dumps(telemetry_packet))
            await asyncio.sleep(1.5)
    except WebSocketDisconnect:
        logger.info("WebSocket telemetry client disconnected")
