import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class NetworkNode(Base):
    __tablename__ = "network_nodes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    floor_id: Mapped[str] = mapped_column(String(36), ForeignKey("floors.id", ondelete="CASCADE"), nullable=False, index=True)
    node_name: Mapped[str] = mapped_column(String(128), nullable=False)
    hardware_type: Mapped[str] = mapped_column(String(64), default="TPLINK_DECO") # 'TPLINK_DECO', 'ESP32_CSI', 'BLE_BEACON'
    model: Mapped[str] = mapped_column(String(128), default="TP-Link Deco X50")
    mac_address: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    band_ghz: Mapped[float] = mapped_column(Float, default=2.4)
    channel: Mapped[int] = mapped_column(Integer, default=6)
    tx_power_dbm: Mapped[float] = mapped_column(Float, default=20.0)
    coverage_radius_meters: Mapped[float] = mapped_column(Float, default=14.0)
    pos_x: Mapped[float] = mapped_column(Float, nullable=False)
    pos_y: Mapped[float] = mapped_column(Float, nullable=False)
    pos_z: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="ONLINE") # 'ONLINE', 'DEGRADED', 'OFFLINE'
    is_simulated: Mapped[bool] = mapped_column(Boolean, default=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    floor: Mapped["Floor"] = relationship("Floor", back_populates="nodes")


class NetworkCabinet(Base):
    __tablename__ = "network_cabinets"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    floor_id: Mapped[str] = mapped_column(String(36), ForeignKey("floors.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(128), default="Main Network Distribution Cabinet")
    pos_x: Mapped[float] = mapped_column(Float, default=1.2)
    pos_y: Mapped[float] = mapped_column(Float, default=1.2)
    pos_z: Mapped[float] = mapped_column(Float, default=-3.2)
    fiber_backhaul_capacity_gbps: Mapped[float] = mapped_column(Float, default=10.0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Sensor(Base):
    __tablename__ = "sensors"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    floor_id: Mapped[str] = mapped_column(String(36), ForeignKey("floors.id", ondelete="CASCADE"), nullable=False, index=True)
    room_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("rooms.id", ondelete="SET NULL"), nullable=True)
    sensor_type: Mapped[str] = mapped_column(String(64), default="RF_SNOOPER")
    model: Mapped[str] = mapped_column(String(128), default="ESP32-S3-CSI-Probe")
    pos_x: Mapped[float] = mapped_column(Float, default=0.0)
    pos_y: Mapped[float] = mapped_column(Float, default=0.0)
    pos_z: Mapped[float] = mapped_column(Float, default=0.0)
    status: Mapped[str] = mapped_column(String(32), default="ACTIVE")
    battery_pct: Mapped[Optional[float]] = mapped_column(Float, default=100.0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
