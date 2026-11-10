from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.auth.dependencies import require_role
from app.models.organization import Room
from app.models.user import User
from app.schemas.building import RoomCreate, RoomUpdate, RoomSchema

router = APIRouter(prefix="/rooms", tags=["Room Management"])

@router.get("/{room_id}", response_model=RoomSchema)
async def get_room(room_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieve detailed spatial parameters of a room."""
    room = await db.get(Room, room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room

@router.post("", response_model=RoomSchema, status_code=status.HTTP_201_CREATED)
async def create_room(
    floor_id: str,
    payload: RoomCreate,
    current_user: User = Depends(require_role(["SUPER_ADMIN", "HOSTEL_ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    """Add a new room to a floor."""
    room = Room(
        floor_id=floor_id,
        room_number=payload.room_number,
        name=payload.name,
        wing=payload.wing,
        side=payload.side,
        capacity=payload.capacity,
        pos_x=payload.pos_x,
        pos_y=payload.pos_y,
        pos_z=payload.pos_z,
        width=payload.width,
        height=payload.height,
        depth=payload.depth,
        current_occupancy=payload.current_occupancy,
        signal_strength_dbm=payload.signal_strength_dbm,
        is_occupied=payload.is_occupied,
        activity_status=payload.activity_status,
        confidence_score=payload.confidence_score
    )
    db.add(room)
    await db.commit()
    await db.refresh(room)
    return room

@router.delete("/{room_id}")
async def delete_room(
    room_id: str,
    current_user: User = Depends(require_role(["SUPER_ADMIN", "HOSTEL_ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    """Delete a room from floor architecture."""
    room = await db.get(Room, room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    await db.delete(room)
    await db.commit()
    return {"message": "Room deleted successfully", "id": room_id}
