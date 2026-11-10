from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.auth.dependencies import require_role
from app.models.organization import Floor, Room, Building
from app.models.network import NetworkNode
from app.models.user import User

router = APIRouter(prefix="/floors", tags=["Floor Management"])

class FloorCreate(BaseModel):
    building_id: str
    floor_number: int
    name: str
    elevation_meters: float
    height_meters: float = 3.4
    is_l_shaped: bool = True
    is_measured_pilot: bool = False

class FloorUpdate(BaseModel):
    name: Optional[str] = None
    elevation_meters: Optional[float] = None
    height_meters: Optional[float] = None
    is_l_shaped: Optional[bool] = None

@router.get("/{floor_id}")
async def get_floor_details(floor_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieve single floor with rooms and nodes."""
    res = await db.execute(
        select(Floor)
        .where(Floor.id == floor_id)
        .options(selectinload(Floor.rooms), selectinload(Floor.nodes))
    )
    floor = res.scalar_one_or_none()
    if not floor:
        raise HTTPException(status_code=404, detail="Floor not found")
    return {
        "id": floor.id,
        "floor_number": floor.floor_number,
        "name": floor.name,
        "elevation_meters": floor.elevation_meters,
        "height_meters": floor.height_meters,
        "is_l_shaped": floor.is_l_shaped,
        "is_measured_pilot": floor.is_measured_pilot,
        "rooms_count": len(floor.rooms),
        "nodes_count": len(floor.nodes)
    }

@router.put("/{floor_id}")
async def update_floor(
    floor_id: str,
    payload: FloorUpdate,
    current_user: User = Depends(require_role(["SUPER_ADMIN", "HOSTEL_ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    """Update floor elevation or parameters."""
    floor = await db.get(Floor, floor_id)
    if not floor:
        raise HTTPException(status_code=404, detail="Floor not found")

    if payload.name is not None: floor.name = payload.name
    if payload.elevation_meters is not None: floor.elevation_meters = payload.elevation_meters
    if payload.height_meters is not None: floor.height_meters = payload.height_meters
    if payload.is_l_shaped is not None: floor.is_l_shaped = payload.is_l_shaped

    await db.commit()
    return {"message": "Floor updated successfully", "id": floor.id}
