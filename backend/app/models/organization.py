import uuid
from datetime import datetime
from typing import List, Optional
from sqlalchemy import String, Integer, Float, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class University(Base):
    __tablename__ = "universities"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code: Mapped[str] = mapped_column(String(32), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    country: Mapped[str] = mapped_column(String(64), default="India")
    state: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    city: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    organizations: Mapped[List["Organization"]] = relationship("Organization", back_populates="university", cascade="all, delete-orphan")


class Organization(Base):
    __tablename__ = "organizations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    university_id: Mapped[str] = mapped_column(String(36), ForeignKey("universities.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[str] = mapped_column(String(64), default="RESIDENTIAL_HOSTELS")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    university: Mapped["University"] = relationship("University", back_populates="organizations")
    buildings: Mapped[List["Building"]] = relationship("Building", back_populates="organization", cascade="all, delete-orphan")


class Building(Base):
    __tablename__ = "buildings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    code: Mapped[str] = mapped_column(String(64), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    total_floors: Mapped[int] = mapped_column(Integer, default=9)
    is_pilot_building: Mapped[bool] = mapped_column(Boolean, default=True)
    local_origin_latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    local_origin_longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    organization: Mapped["Organization"] = relationship("Organization", back_populates="buildings")
    floors: Mapped[List["Floor"]] = relationship("Floor", back_populates="building", cascade="all, delete-orphan", order_by="Floor.floor_number")


class Floor(Base):
    __tablename__ = "floors"
    __table_args__ = (UniqueConstraint("building_id", "floor_number", name="uq_building_floor"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    building_id: Mapped[str] = mapped_column(String(36), ForeignKey("buildings.id", ondelete="CASCADE"), nullable=False, index=True)
    floor_number: Mapped[int] = mapped_column(Integer, nullable=False)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    elevation_meters: Mapped[float] = mapped_column(Float, default=0.0)
    height_meters: Mapped[float] = mapped_column(Float, default=3.4)
    is_l_shaped: Mapped[bool] = mapped_column(Boolean, default=True)
    is_measured_pilot: Mapped[bool] = mapped_column(Boolean, default=False)
    slab_thickness_meters: Mapped[float] = mapped_column(Float, default=0.35)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    building: Mapped["Building"] = relationship("Building", back_populates="floors")
    rooms: Mapped[List["Room"]] = relationship("Room", back_populates="floor", cascade="all, delete-orphan", order_by="Room.room_number")
    nodes: Mapped[List["NetworkNode"]] = relationship("NetworkNode", back_populates="floor", cascade="all, delete-orphan")


class Room(Base):
    __tablename__ = "rooms"
    __table_args__ = (UniqueConstraint("floor_id", "room_number", name="uq_floor_room"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    floor_id: Mapped[str] = mapped_column(String(36), ForeignKey("floors.id", ondelete="CASCADE"), nullable=False, index=True)
    room_number: Mapped[str] = mapped_column(String(32), nullable=False)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    wing: Mapped[str] = mapped_column(String(64), default="long-wing") # 'long-wing', 'short-wing', 'junction'
    side: Mapped[str] = mapped_column(String(32), default="left")
    capacity: Mapped[int] = mapped_column(Integer, default=2)
    pos_x: Mapped[float] = mapped_column(Float, nullable=False)
    pos_y: Mapped[float] = mapped_column(Float, nullable=False)
    pos_z: Mapped[float] = mapped_column(Float, nullable=False)
    width: Mapped[float] = mapped_column(Float, default=4.0)
    height: Mapped[float] = mapped_column(Float, default=2.9)
    depth: Mapped[float] = mapped_column(Float, default=4.2)
    
    # State fields
    current_occupancy: Mapped[int] = mapped_column(Integer, default=0)
    signal_strength_dbm: Mapped[float] = mapped_column(Float, default=-60.0)
    is_occupied: Mapped[bool] = mapped_column(Boolean, default=False)
    activity_status: Mapped[str] = mapped_column(String(32), default="unoccupied")
    confidence_score: Mapped[float] = mapped_column(Float, default=0.85)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    floor: Mapped["Floor"] = relationship("Floor", back_populates="rooms")
