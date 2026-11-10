import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Integer, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

class OccupancyRecord(Base):
    """
    PIPELINE B: Device-Free Anonymous Ambient Occupancy.
    Zero PII or MAC address storage.
    Aggregated spatial RF perturbation estimates only.
    """
    __tablename__ = "occupancy_records"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    building_id: Mapped[str] = mapped_column(String(36), ForeignKey("buildings.id", ondelete="CASCADE"), nullable=False, index=True)
    floor_id: Mapped[str] = mapped_column(String(36), ForeignKey("floors.id", ondelete="CASCADE"), nullable=False, index=True)
    room_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("rooms.id", ondelete="SET NULL"), nullable=True)
    
    zone_label: Mapped[str] = mapped_column(String(128), nullable=False)
    estimated_occupant_count: Mapped[int] = mapped_column(Integer, default=0)
    motion_detected: Mapped[bool] = mapped_column(Boolean, default=False)
    rf_perturbation_intensity: Mapped[float] = mapped_column(Float, default=0.0)
    confidence_score: Mapped[float] = mapped_column(Float, default=0.85)
    uncertainty_meters: Mapped[float] = mapped_column(Float, default=1.8)
    detection_method: Mapped[str] = mapped_column(String(64), default="RF_PERTURBATION")
    is_simulated: Mapped[bool] = mapped_column(Boolean, default=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)

