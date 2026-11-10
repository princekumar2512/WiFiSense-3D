export type Point3D = {
  x: number;
  y: number;
  z: number;
};

export type Size3D = {
  width: number;  // X axis dimension (meters)
  height: number; // Y axis dimension (meters)
  depth: number;  // Z axis dimension (meters)
};

export interface RoomDefinition {
  id: string;
  name: string;
  roomNumber: string;
  floorNumber: number;
  position: Point3D; // Center in local floor space
  size: Size3D;
  wing: 'long-wing' | 'short-wing' | 'junction' | 'standard';
  side: 'left' | 'right' | 'end';
  currentOccupancy: number; // Estimated count
  capacity: number;
  signalStrengthDbm: number; // Current RSSI
  isOccupied: boolean;
  activityStatus: 'stationary' | 'walking' | 'sitting' | 'standing' | 'unoccupied';
  confidenceScore: number; // 0.0 to 1.0
}

export interface CorridorSegment {
  id: string;
  name: string;
  floorNumber: number;
  startPoint: Point3D;
  endPoint: Point3D;
  width: number;
  type: 'L_JUNCTION' | 'LONG_CORRIDOR' | 'SHORT_CORRIDOR' | 'STANDARD';
}

export type NetworkNodeType = 'TPLINK_DECO' | 'ESP32_CSI' | 'CABINET' | 'BLE_BEACON';
export type NodeStatus = 'ONLINE' | 'DEGRADED' | 'OFFLINE' | 'SIMULATED';

export interface NetworkNodeDefinition {
  id: string;
  name: string;
  type: NetworkNodeType;
  model: string;
  macAddress?: string;
  ipAddress?: string;
  floorNumber: number;
  position: Point3D;
  status: NodeStatus;
  channel: number;
  frequencyGhz: 2.4 | 5.0 | 6.0;
  txPowerDbm: number;
  coverageRadiusMeters: number;
  isSimulated: boolean;
  notes?: string;
}

export interface VerticalCore {
  id: string;
  type: 'ELEVATOR' | 'STAIRCASE' | 'SHAFT';
  name: string;
  position: Point3D;
  size: Size3D;
  floorsServed: number[];
}

export interface FloorDefinition {
  floorNumber: number; // 1 to 9
  name: string;
  elevationY: number; // meters from ground
  slabThickness: number;
  height: number;
  isLShaped: boolean;
  rooms: RoomDefinition[];
  corridors: CorridorSegment[];
  nodes: NetworkNodeDefinition[];
  cores: VerticalCore[];
  networkCabinet?: {
    id: string;
    position: Point3D;
    size: Size3D;
  };
}

export interface BuildingDefinition {
  id: string;
  name: string;
  campusName: string;
  organizationId: string;
  description: string;
  totalFloors: number;
  activeFloorView: number | 'all'; // 1-9 or 'all'
  wallTransparency: number; // 0.1 to 1.0
  cutawayMode: boolean;
  showSignalWaves: boolean;
  showHeatmap: boolean;
  showOccupants: boolean;
  floors: FloorDefinition[];
  metadata: {
    configuredBy: string;
    lastUpdated: string;
    isPilotHostel: boolean;
  };
}

