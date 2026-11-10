import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

class LocalizationEstimate(Base):
    """
    PIPELINE A: Consented Participant Localization.
    Strictly tied to an active, unrevoked consent record.
    Never mixed with anonymous spatial sensing records.
    """
    __tablename__ = "localization_estimates"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    consent_id: Mapped[str] = mapped_column(String(36), ForeignKey("consent_records.id", ondelete="CASCADE"), nullable=False, index=True)
    floor_id: Mapped[str] = mapped_column(String(36), ForeignKey("floors.id", ondelete="CASCADE"), nullable=False, index=True)
    room_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("rooms.id", ondelete="SET NULL"), nullable=True)
    
    pos_x: Mapped[float] = mapped_column(Float, nullable=False)
    pos_y: Mapped[float] = mapped_column(Float, nullable=False)
    pos_z: Mapped[float] = mapped_column(Float, nullable=False)
    confidence_score: Mapped[float] = mapped_column(Float, nullable=False)
    uncertainty_radius_m: Mapped[float] = mapped_column(Float, nullable=False)
    activity_category: Mapped[str] = mapped_column(String(64), default="UNKNOWN")
    data_sources_json: Mapped[str] = mapped_column(Text, default='["WIFI_RSSI"]')
    model_version: Mapped[str] = mapped_column(String(32), default="EKF-RF-v1.2")
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)

