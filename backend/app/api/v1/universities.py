from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.auth.dependencies import require_role
from app.models.organization import University, Organization
from app.models.user import User

router = APIRouter(prefix="/universities", tags=["University Multi-Tenancy"])

class UniversityCreate(BaseModel):
    code: str
    name: str
    country: str = "India"
    state: Optional[str] = None
    city: Optional[str] = None

class UniversityUpdate(BaseModel):
    name: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None

@router.get("", response_model=List[Dict[str, Any]])
async def list_universities(db: AsyncSession = Depends(get_db)):
    """List all participating universities across the platform."""
    res = await db.execute(select(University).order_by(University.name))
    univs = res.scalars().all()
    return [
        {
            "id": u.id,
            "code": u.code,
            "name": u.name,
            "country": u.country,
            "state": u.state,
            "city": u.city,
            "created_at": u.created_at.isoformat()
        }
        for u in univs
    ]

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_university(
    payload: UniversityCreate,
    current_user: User = Depends(require_role(["SUPER_ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    """Register a new university tenant (Super Administrator only)."""
    existing = await db.execute(select(University).where(University.code == payload.code))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="University code already exists")

    univ = University(
        code=payload.code,
        name=payload.name,
        country=payload.country,
        state=payload.state,
        city=payload.city
    )
    db.add(univ)
    await db.commit()
    await db.refresh(univ)
    return {"message": "University created successfully", "id": univ.id, "code": univ.code}

@router.get("/{university_id}")
async def get_university(university_id: str, db: AsyncSession = Depends(get_db)):
    """Get single university details."""
    univ = await db.get(University, university_id)
    if not univ:
        raise HTTPException(status_code=404, detail="University not found")
    return {
        "id": univ.id,
        "code": univ.code,
        "name": univ.name,
        "country": univ.country,
        "state": univ.state,
        "city": univ.city
    }

