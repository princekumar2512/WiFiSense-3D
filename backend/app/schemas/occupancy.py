from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class OccupancyEventCreate(BaseModel):
    building_id: str
    floor_id: str
    room_id: Optional[str] = None
    zone_label: str
    estimated_occupant_count: int
    motion_detected: bool
    rf_perturbation_intensity: float
    confidence_score: float = 0.88
    uncertainty_meters: float = 1.6
    detection_method: str = "RF_PERTURBATION"
    is_simulated: bool = True

class OccupancyRecordSchema(BaseModel):
    id: str
    building_id: str
    floor_id: str
    room_id: Optional[str] = None
    zone_label: str
    estimated_occupant_count: int
    motion_detected: bool
    rf_perturbation_intensity: float
    confidence_score: float
    uncertainty_meters: float
    detection_method: str
    is_simulated: bool
    timestamp: datetime
    model_config = {"from_attributes": True}
