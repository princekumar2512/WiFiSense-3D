from typing import Optional
from pydantic import BaseModel

class NodeCreate(BaseModel):
    floor_id: str
    node_name: str
    hardware_type: str = "TPLINK_DECO"
    model: str = "TP-Link Deco X50"
    mac_address: Optional[str] = None
    ip_address: Optional[str] = None
    band_ghz: float = 2.4
    channel: int = 6
    tx_power_dbm: float = 20.0
    coverage_radius_meters: float = 14.0
    pos_x: float
    pos_y: float
    pos_z: float
    status: str = "ONLINE"
    is_simulated: bool = True
    notes: Optional[str] = None

class NodeUpdate(BaseModel):
    node_name: Optional[str] = None
    model: Optional[str] = None
    band_ghz: Optional[float] = None
    channel: Optional[int] = None
    tx_power_dbm: Optional[float] = None
    coverage_radius_meters: Optional[float] = None
    pos_x: Optional[float] = None
    pos_y: Optional[float] = None
    pos_z: Optional[float] = None
    status: Optional[str] = None
    notes: Optional[str] = None

