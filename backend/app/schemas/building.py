from typing import List, Optional
from pydantic import BaseModel

class RoomBase(BaseModel):
    room_number: str
    name: str
    wing: str = "long-wing"
    side: str = "left"
    capacity: int = 2
    pos_x: float
    pos_y: float
    pos_z: float
    width: float = 4.0
    height: float = 2.9
    depth: float = 4.2
    current_occupancy: int = 0
    signal_strength_dbm: float = -60.0
    is_occupied: bool = False
    activity_status: str = "unoccupied"
    confidence_score: float = 0.85

class RoomCreate(RoomBase):
    pass

class RoomUpdate(BaseModel):
    name: Optional[str] = None
    wing: Optional[str] = None
    side: Optional[str] = None
    capacity: Optional[int] = None
    pos_x: Optional[float] = None
    pos_y: Optional[float] = None
    pos_z: Optional[float] = None
    width: Optional[float] = None
    height: Optional[float] = None
    depth: Optional[float] = None
    current_occupancy: Optional[int] = None
    signal_strength_dbm: Optional[float] = None
    is_occupied: Optional[bool] = None
    activity_status: Optional[str] = None
    confidence_score: Optional[float] = None

class RoomSchema(RoomBase):
    id: str
    floor_id: str
    model_config = {"from_attributes": True}

class NodeSchema(BaseModel):
    id: str
    floor_id: str
    node_name: str
    hardware_type: str
    model: str
    mac_address: Optional[str] = None
    ip_address: Optional[str] = None
    band_ghz: float
    channel: int
    tx_power_dbm: float
    coverage_radius_meters: float
    pos_x: float
    pos_y: float
    pos_z: float
    status: str
    is_simulated: bool
    notes: Optional[str] = None
    model_config = {"from_attributes": True}

class FloorSchema(BaseModel):
    id: str
    floor_number: int
    name: str
    elevation_meters: float
    height_meters: float
    is_l_shaped: bool
    is_measured_pilot: bool
    slab_thickness_meters: float
    rooms: List[RoomSchema] = []
    nodes: List[NodeSchema] = []
    model_config = {"from_attributes": True}

class BuildingSchema(BaseModel):
    id: str
    code: str
    name: str
    total_floors: int
    is_pilot_building: bool
    floors: List[FloorSchema] = []
    model_config = {"from_attributes": True}
