from datetime import datetime
from typing import Optional, Dict, List
from pydantic import BaseModel

class LocalizationQuery(BaseModel):
    user_id: str
    consent_token: str
    rssi_map: Dict[str, float] # { "node-1-junction": -52.0, "node-1-farend": -65.0 }
    barometer_pressure_hpa: Optional[float] = None
    step_frequency_hz: Optional[float] = None

class LocalizationResponseSchema(BaseModel):
    id: str
    user_id: str
    pseudonym: str
    floor_number: int
    room_number: Optional[str] = None
    position: Dict[str, float] # { "x": 17.1, "y": 1.7, "z": 4.8 }
    confidence_score: float
    uncertainty_radius_m: float
    activity: str
    model_version: str
    timestamp: datetime

