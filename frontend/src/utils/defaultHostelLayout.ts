import { BuildingDefinition, FloorDefinition, RoomDefinition, CorridorSegment, NetworkNodeDefinition, VerticalCore } from '../types/building';

export const createDefaultHostelBuilding = (): BuildingDefinition => {
  const totalFloors = 9;
  const floorHeight = 3.4; // 3.4 meters per floor
  const slabThickness = 0.35;
  const corridorWidth = 2.4;
  const roomDepth = 4.2;
  const roomWidth = 4.0;
  const roomHeight = 2.9;

  const floors: FloorDefinition[] = [];

  for (let f = 1; f <= totalFloors; f++) {
    const isFirstFloor = f === 1;
    const elevationY = (f - 1) * floorHeight;
    const floorLabel = f === 1 ? 'Floor 1 (Ground / Pilot Measured)' : `Floor ${f} (Configurable Prototype)`;

    // Rooms along long corridor (X: 2m to 26m, centered at Z=0)
    const longWingRoomsCount = 6; // 6 on top (+Z), 6 on bottom (-Z) = 12 rooms
    const shortWingRoomsCount = 4; // 4 on right (+X), 4 on left (-X) = 8 rooms
    // Total rooms = 20 per floor (> 18 rooms per floor requirement)

    const rooms: RoomDefinition[] = [];

    // Long wing rooms (+Z side: "North")
    for (let i = 0; i < longWingRoomsCount; i++) {
      const roomNum = `${f}0${i + 1}`;
      const posX = 4.5 + i * 4.2;
      const posZ = corridorWidth / 2 + roomDepth / 2; // North side
      rooms.push({
        id: `room-${f}-${roomNum}`,
        name: `Room ${roomNum}`,
        roomNumber: roomNum,
        floorNumber: f,
        position: { x: posX, y: elevationY + roomHeight / 2 + slabThickness, z: posZ },
        size: { width: roomWidth, height: roomHeight, depth: roomDepth },
        wing: 'long-wing',
        side: 'left',
        capacity: 2,
        currentOccupancy: (f + i) % 3 === 0 ? 2 : (f + i) % 2 === 0 ? 1 : 0,
        signalStrengthDbm: -52 - (i * 3) - ((f - 1) * 2),
        isOccupied: (f + i) % 2 === 0,
        activityStatus: (f + i) % 3 === 0 ? 'stationary' : (f + i) % 2 === 0 ? 'walking' : 'unoccupied',
        confidenceScore: 0.82 + ((i * 2) % 15) / 100,
      });
    }

    // Long wing rooms (-Z side: "South")
    for (let i = 0; i < longWingRoomsCount; i++) {
      const roomNum = `${f}${i + 7 < 10 ? '0' : ''}${i + 7}`;
      const posX = 4.5 + i * 4.2;
      const posZ = -(corridorWidth / 2 + roomDepth / 2); // South side
      rooms.push({
        id: `room-${f}-${roomNum}`,
        name: `Room ${roomNum}`,
        roomNumber: roomNum,
        floorNumber: f,
        position: { x: posX, y: elevationY + roomHeight / 2 + slabThickness, z: posZ },
        size: { width: roomWidth, height: roomHeight, depth: roomDepth },
        wing: 'long-wing',
        side: 'right',
        capacity: 2,
        currentOccupancy: (f + i * 2) % 3 === 0 ? 1 : 0,
        signalStrengthDbm: -55 - (i * 3) - ((f - 1) * 2),
        isOccupied: (f + i * 2) % 3 === 0,
        activityStatus: (f + i * 2) % 3 === 0 ? 'sitting' : 'unoccupied',
        confidenceScore: 0.85 + ((i * 3) % 12) / 100,
      });
    }

    // Short wing rooms (+X side: "East") along Z axis (from Z=4m to Z=18m)
    for (let i = 0; i < shortWingRoomsCount; i++) {
      const roomNum = `${f}${13 + i}`;
      const posX = corridorWidth / 2 + roomDepth / 2;
      const posZ = 4.5 + i * 4.2;
      rooms.push({
        id: `room-${f}-${roomNum}`,
        name: `Room ${roomNum}`,
        roomNumber: roomNum,
        floorNumber: f,
        position: { x: posX, y: elevationY + roomHeight / 2 + slabThickness, z: posZ },
        size: { width: roomDepth, height: roomHeight, depth: roomWidth },
        wing: 'short-wing',
        side: 'left',
        capacity: 2,
        currentOccupancy: (f + i) % 4 === 0 ? 2 : 0,
        signalStrengthDbm: -58 - (i * 4),
        isOccupied: (f + i) % 4 === 0,
        activityStatus: (f + i) % 4 === 0 ? 'standing' : 'unoccupied',
        confidenceScore: 0.79 + ((i * 4) % 16) / 100,
      });
    }

    // Short wing rooms (-X side: "West") along Z axis
    for (let i = 0; i < shortWingRoomsCount; i++) {
      const roomNum = `${f}${17 + i}`;
      const posX = -(corridorWidth / 2 + roomDepth / 2);
      const posZ = 4.5 + i * 4.2;
      rooms.push({
        id: `room-${f}-${roomNum}`,
        name: `Room ${roomNum}`,
        roomNumber: roomNum,
        floorNumber: f,
        position: { x: posX, y: elevationY + roomHeight / 2 + slabThickness, z: posZ },
        size: { width: roomDepth, height: roomHeight, depth: roomWidth },
        wing: 'short-wing',
        side: 'right',
        capacity: 2,
        currentOccupancy: (f + i + 1) % 3 === 0 ? 1 : 0,
        signalStrengthDbm: -60 - (i * 3),
        isOccupied: (f + i + 1) % 3 === 0,
        activityStatus: (f + i + 1) % 3 === 0 ? 'walking' : 'unoccupied',
        confidenceScore: 0.81,
      });
    }

    // Corridors
    const corridors: CorridorSegment[] = [
      {
        id: `corr-long-${f}`,
        name: `Floor ${f} Long Corridor`,
        floorNumber: f,
        startPoint: { x: 0, y: elevationY + slabThickness, z: 0 },
        endPoint: { x: 28, y: elevationY + slabThickness, z: 0 },
        width: corridorWidth,
        type: 'LONG_CORRIDOR',
      },
      {
        id: `corr-short-${f}`,
        name: `Floor ${f} Short Corridor`,
        floorNumber: f,
        startPoint: { x: 0, y: elevationY + slabThickness, z: 0 },
        endPoint: { x: 0, y: elevationY + slabThickness, z: 20 },
        width: corridorWidth,
        type: 'SHORT_CORRIDOR',
      },
      {
        id: `corr-junc-${f}`,
        name: `Floor ${f} L-Junction`,
        floorNumber: f,
        startPoint: { x: -corridorWidth / 2, y: elevationY + slabThickness, z: -corridorWidth / 2 },
        endPoint: { x: corridorWidth / 2, y: elevationY + slabThickness, z: corridorWidth / 2 },
        width: corridorWidth * 1.4,
        type: 'L_JUNCTION',
      },
    ];

    // Vertical Cores: Elevator and Staircase placed at L-shaped turning point
    const cores: VerticalCore[] = [
      {
        id: `lift-${f}`,
        type: 'ELEVATOR',
        name: `Central Lift Core (Floor ${f})`,
        position: { x: -3.5, y: elevationY + roomHeight / 2 + slabThickness, z: -3.5 },
        size: { width: 3.2, height: roomHeight, depth: 3.2 },
        floorsServed: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      },
      {
        id: `stairs-${f}`,
        type: 'STAIRCASE',
        name: `Main Staircase Core (Floor ${f})`,
        position: { x: -3.5, y: elevationY + roomHeight / 2 + slabThickness, z: 1.5 },
        size: { width: 3.2, height: roomHeight, depth: 4.5 },
        floorsServed: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      },
    ];

    // Network Nodes (TP-Link Deco)
    // Pilot hostel requirements:
    // Floor 1 has two known positions:
    // 1. Node 1: Near the L-shaped turning point (around X=1.5, Z=1.5).
    // 2. Node 2: At the far end of the corridor (around X=26, Z=0).
    // Plus one node every ~3 rooms along corridor.
    const nodes: NetworkNodeDefinition[] = [];

    if (isFirstFloor) {
      nodes.push(
        {
          id: `node-${f}-junction`,
          name: `Deco-F1-01 (L-Junction Turning Point)`,
          type: 'TPLINK_DECO',
          model: 'TP-Link Deco X50 / M4 (Hostel Mesh)',
          macAddress: '98:48:27:A1:42:01',
          ipAddress: '192.168.68.101',
          floorNumber: f,
          position: { x: 1.5, y: elevationY + 2.4, z: 1.5 },
          status: 'ONLINE',
          channel: 6,
          frequencyGhz: 2.4,
          txPowerDbm: 20,
          coverageRadiusMeters: 14.0,
          isSimulated: true,
          notes: 'Primary anchor node at L-junction beside elevator core',
        },
        {
          id: `node-${f}-farend`,
          name: `Deco-F1-02 (Far End Long Corridor)`,
          type: 'TPLINK_DECO',
          model: 'TP-Link Deco X50 / M4 (Hostel Mesh)',
          macAddress: '98:48:27:A1:42:02',
          ipAddress: '192.168.68.102',
          floorNumber: f,
          position: { x: 26.0, y: elevationY + 2.4, z: 0.0 },
          status: 'ONLINE',
          channel: 11,
          frequencyGhz: 5.0,
          txPowerDbm: 23,
          coverageRadiusMeters: 16.0,
          isSimulated: true,
          notes: 'End-of-corridor anchor node covering Rooms 106, 112',
        },
        {
          id: `node-${f}-midway`,
          name: `Deco-F1-03 (Mid-Corridor Booster)`,
          type: 'TPLINK_DECO',
          model: 'TP-Link Deco X50 / M4 (Hostel Mesh)',
          macAddress: '98:48:27:A1:42:03',
          ipAddress: '192.168.68.103',
          floorNumber: f,
          position: { x: 13.5, y: elevationY + 2.4, z: 0.0 },
          status: 'ONLINE',
          channel: 1,
          frequencyGhz: 2.4,
          txPowerDbm: 20,
          coverageRadiusMeters: 14.0,
          isSimulated: true,
          notes: 'Shared corridor node serving rooms 103-104 and 109-110',
        },
        {
          id: `node-${f}-shortwing`,
          name: `Deco-F1-04 (Short Wing End)`,
          type: 'TPLINK_DECO',
          model: 'TP-Link Deco X50 / M4 (Hostel Mesh)',
          macAddress: '98:48:27:A1:42:04',
          ipAddress: '192.168.68.104',
          floorNumber: f,
          position: { x: 0.0, y: elevationY + 2.4, z: 15.0 },
          status: 'ONLINE',
          channel: 36,
          frequencyGhz: 5.0,
          txPowerDbm: 22,
          coverageRadiusMeters: 13.5,
          isSimulated: true,
          notes: 'Short corridor apex node serving rooms 115-116 and 119-120',
        }
      );
    } else {
      // Configurable prototype for floors 2 to 9
      nodes.push(
        {
          id: `node-${f}-junction`,
          name: `Deco-F${f}-01 (Junction Node)`,
          type: 'TPLINK_DECO',
          model: 'TP-Link Deco X50 (Configurable)',
          macAddress: `98:48:27:A${f}:10:01`,
          ipAddress: `192.168.68.${f}01`,
          floorNumber: f,
          position: { x: 1.5, y: elevationY + 2.4, z: 1.5 },
          status: f === 7 ? 'DEGRADED' : 'ONLINE',
          channel: (f % 3) * 5 + 1,
          frequencyGhz: f % 2 === 0 ? 5.0 : 2.4,
          txPowerDbm: 20,
          coverageRadiusMeters: 14.0,
          isSimulated: true,
        },
        {
          id: `node-${f}-farend`,
          name: `Deco-F${f}-02 (Far End Node)`,
          type: 'TPLINK_DECO',
          model: 'TP-Link Deco X50 (Configurable)',
          macAddress: `98:48:27:A${f}:10:02`,
          ipAddress: `192.168.68.${f}02`,
          floorNumber: f,
          position: { x: 26.0, y: elevationY + 2.4, z: 0.0 },
          status: 'ONLINE',
          channel: (f % 3) * 5 + 6,
          frequencyGhz: 5.0,
          txPowerDbm: 23,
          coverageRadiusMeters: 15.0,
          isSimulated: true,
        },
        {
          id: `node-${f}-mid`,
          name: `Deco-F${f}-03 (Mid Node)`,
          type: 'TPLINK_DECO',
          model: 'TP-Link Deco X50 (Configurable)',
          macAddress: `98:48:27:A${f}:10:03`,
          ipAddress: `192.168.68.${f}03`,
          floorNumber: f,
          position: { x: 13.5, y: elevationY + 2.4, z: 0.0 },
          status: 'ONLINE',
          channel: 1,
          frequencyGhz: 2.4,
          txPowerDbm: 20,
          coverageRadiusMeters: 14.0,
          isSimulated: true,
        }
      );
    }

    floors.push({
      floorNumber: f,
      name: floorLabel,
      elevationY,
      slabThickness,
      height: floorHeight,
      isLShaped: true,
      rooms,
      corridors,
      nodes,
      cores,
      networkCabinet: isFirstFloor
        ? {
            id: 'main-network-cabinet-f1',
            position: { x: 1.2, y: elevationY + 1.2, z: -3.2 },
            size: { width: 1.8, height: 2.2, depth: 1.0 },
          }
        : undefined,
    });
  }

  return {
    id: 'hostel-block-alpha',
    name: 'Hostel Block Alpha (Pilot Facility)',
    campusName: 'Main University Campus',
    organizationId: 'univ-tech-01',
    description: 'Nine-floor student hostel building equipped with TP-Link Deco mesh Wi-Fi nodes along L-shaped common corridors.',
    totalFloors,
    activeFloorView: 'all',
    wallTransparency: 0.28,
    cutawayMode: false,
    showSignalWaves: true,
    showHeatmap: true,
    showOccupants: true,
    floors,
    metadata: {
      configuredBy: 'WiFiSense 3D Spatial Systems Lab',
      lastUpdated: new Date().toISOString(),
      isPilotHostel: true,
    },
  };
};

