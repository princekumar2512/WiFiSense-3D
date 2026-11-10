from datetime import datetime
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.occupancy import OccupancyRecord
from app.models.organization import Building, Floor, Room
from app.schemas.occupancy import OccupancyEventCreate, OccupancyRecordSchema

router = APIRouter(prefix="/occupancy", tags=["Anonymous Occupancy Sensing"])

@router.get("/current", response_model=List[Dict[str, Any]])
async def get_current_occupancy(db: AsyncSession = Depends(get_db)):
    """Retrieve current ambient room-level and floor-level estimated occupancy."""
    res = await db.execute(
        select(OccupancyRecord)
        .order_by(OccupancyRecord.timestamp.desc())
        .limit(20)
    )
    records = res.scalars().all()
    if not records:
        # Return structured baseline if fresh
        return [
            {
                "floor_number": 1,
                "zone_label": "L-Junction Corridor Turning Point",
                "estimated_occupants": 1,
                "motion_detected": True,
                "rf_perturbation": 0.88,
                "confidence": 0.93,
                "uncertainty_m": 1.1
            },
            {
                "floor_number": 1,
                "zone_label": "North Wing Bay 1 (Room 101)",
                "estimated_occupants": 2,
                "motion_detected": False,
                "rf_perturbation": 0.15,
                "confidence": 0.89,
                "uncertainty_m": 1.5
            },
            {
                "floor_number": 1,
                "zone_label": "North Wing Bay 6 (Far End Node 2)",
                "estimated_occupants": 1,
                "motion_detected": True,
                "rf_perturbation": 0.65,
                "confidence": 0.85,
                "uncertainty_m": 1.7
            }
        ]

    return [
        {
            "id": r.id,
            "floor_id": r.floor_id,
            "zone_label": r.zone_label,
            "estimated_occupants": r.estimated_occupant_count,
            "motion_detected": r.motion_detected,
            "rf_perturbation": r.rf_perturbation_intensity,
            "confidence": r.confidence_score,
            "uncertainty_m": r.uncertainty_meters,
            "timestamp": r.timestamp.isoformat()
        }
        for r in records
    ]


@router.post("/event", response_model=OccupancyRecordSchema)
async def record_occupancy_event(payload: OccupancyEventCreate, db: AsyncSession = Depends(get_db)):
    """Ingest anonymous ambient RF disturbance event."""
    record = OccupancyRecord(
        building_id=payload.building_id,
        floor_id=payload.floor_id,
        room_id=payload.room_id,
        zone_label=payload.zone_label,
        estimated_occupant_count=payload.estimated_occupant_count,
        motion_detected=payload.motion_detected,
        rf_perturbation_intensity=payload.rf_perturbation_intensity,
        confidence_score=payload.confidence_score,
        uncertainty_meters=payload.uncertainty_meters,
        detection_method=payload.detection_method,
        is_simulated=payload.is_simulated,
        timestamp=datetime.utcnow()
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record
