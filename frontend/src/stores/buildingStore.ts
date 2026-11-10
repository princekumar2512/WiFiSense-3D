import { create } from 'zustand';
import { BuildingDefinition, FloorDefinition, RoomDefinition, NetworkNodeDefinition, Point3D } from '../types/building';
import { createDefaultHostelBuilding } from '../utils/defaultHostelLayout';

interface BuildingState {
  building: BuildingDefinition;
  selectedFloorNumber: number | 'all';
  selectedRoomId: string | null;
  selectedNodeId: string | null;
  hoveredRoomId: string | null;
  isFirstPersonMode: boolean;
  is2DView: boolean;
  cameraPreset: 'isometric' | 'topDown' | 'firstFloorL' | 'sideElevation';

  // Actions
  setSelectedFloor: (floor: number | 'all') => void;
  setSelectedRoom: (roomId: string | null) => void;
  setSelectedNode: (nodeId: string | null) => void;
  setHoveredRoom: (roomId: string | null) => void;
  setWallTransparency: (val: number) => void;
  toggleCutawayMode: () => void;
  toggleSignalWaves: () => void;
  toggleHeatmap: () => void;
  toggleOccupants: () => void;
  toggleFirstPersonMode: () => void;
  toggle2DView: () => void;
  setCameraPreset: (preset: 'isometric' | 'topDown' | 'firstFloorL' | 'sideElevation') => void;

  // Editor Actions
  addFloor: () => void;
  removeFloor: (floorNumber: number) => void;
  updateRoom: (floorNumber: number, roomId: string, updates: Partial<RoomDefinition>) => void;
  addRoom: (floorNumber: number, room: RoomDefinition) => void;
  removeRoom: (floorNumber: number, roomId: string) => void;
  updateNode: (floorNumber: number, nodeId: string, updates: Partial<NetworkNodeDefinition>) => void;
  addNode: (floorNumber: number, node: NetworkNodeDefinition) => void;
  removeNode: (floorNumber: number, nodeId: string) => void;
  resetToDefaultPilot: () => void;
  loadPersistedBuildingFromBackend: () => Promise<void>;
}

export const useBuildingStore = create<BuildingState>((set, get) => ({
  building: createDefaultHostelBuilding(),
  selectedFloorNumber: 'all',
  selectedRoomId: null,
  selectedNodeId: null,
  hoveredRoomId: null,
  isFirstPersonMode: false,
  is2DView: false,
  cameraPreset: 'isometric',

  setSelectedFloor: (floor) => set({ selectedFloorNumber: floor }),
  setSelectedRoom: (roomId) => set({ selectedRoomId: roomId }),
  setSelectedNode: (nodeId) => set({ selectedNodeId: nodeId }),
  setHoveredRoom: (roomId) => set({ hoveredRoomId: roomId }),
  
  setWallTransparency: (val) =>
    set((state) => ({ building: { ...state.building, wallTransparency: val } })),

  toggleCutawayMode: () =>
    set((state) => ({ building: { ...state.building, cutawayMode: !state.building.cutawayMode } })),

  toggleSignalWaves: () =>
    set((state) => ({ building: { ...state.building, showSignalWaves: !state.building.showSignalWaves } })),

  toggleHeatmap: () =>
    set((state) => ({ building: { ...state.building, showHeatmap: !state.building.showHeatmap } })),

  toggleOccupants: () =>
    set((state) => ({ building: { ...state.building, showOccupants: !state.building.showOccupants } })),

  toggleFirstPersonMode: () =>
    set((state) => ({ isFirstPersonMode: !state.isFirstPersonMode })),

  toggle2DView: () =>
    set((state) => ({ is2DView: !state.is2DView })),

  setCameraPreset: (preset) => set({ cameraPreset: preset }),

  addFloor: () => {
    const { building } = get();
    const newFloorNum = building.totalFloors + 1;
    const floorHeight = 3.4;
    const elevationY = (newFloorNum - 1) * floorHeight;

    const newFloor: FloorDefinition = {
      floorNumber: newFloorNum,
      name: `Floor ${newFloorNum} (Configurable)`,
      elevationY,
      slabThickness: 0.35,
      height: floorHeight,
      isLShaped: true,
      rooms: [],
      corridors: [],
      nodes: [],
      cores: [],
    };

    set({
      building: {
        ...building,
        totalFloors: newFloorNum,
        floors: [...building.floors, newFloor],
      },
    });
  },

  removeFloor: (floorNumber) => {
    const { building } = get();
    if (building.totalFloors <= 1) return;
    const filteredFloors = building.floors.filter((f) => f.floorNumber !== floorNumber);
    set({
      building: {
        ...building,
        totalFloors: filteredFloors.length,
        floors: filteredFloors,
      },
    });
  },

  updateRoom: (floorNumber, roomId, updates) => {
    set((state) => ({
      building: {
        ...state.building,
        floors: state.building.floors.map((f) => {
          if (f.floorNumber !== floorNumber) return f;
          return {
            ...f,
            rooms: f.rooms.map((r) => (r.id === roomId ? { ...r, ...updates } : r)),
          };
        }),
      },
    }));
  },

  addRoom: (floorNumber, room) => {
    set((state) => ({
      building: {
        ...state.building,
        floors: state.building.floors.map((f) => {
          if (f.floorNumber !== floorNumber) return f;
          return { ...f, rooms: [...f.rooms, room] };
        }),
      },
    }));
  },

  removeRoom: (floorNumber, roomId) => {
    set((state) => ({
      building: {
        ...state.building,
        floors: state.building.floors.map((f) => {
          if (f.floorNumber !== floorNumber) return f;
          return { ...f, rooms: f.rooms.filter((r) => r.id !== roomId) };
        }),
      },
    }));
  },

  updateNode: (floorNumber, nodeId, updates) => {
    set((state) => ({
      building: {
        ...state.building,
        floors: state.building.floors.map((f) => {
          if (f.floorNumber !== floorNumber) return f;
          return {
            ...f,
            nodes: f.nodes.map((n) => (n.id === nodeId ? { ...n, ...updates } : n)),
          };
        }),
      },
    }));
  },

  addNode: (floorNumber, node) => {
    set((state) => ({
      building: {
        ...state.building,
        floors: state.building.floors.map((f) => {
          if (f.floorNumber !== floorNumber) return f;
          return { ...f, nodes: [...f.nodes, node] };
        }),
      },
    }));
  },

  removeNode: (floorNumber, nodeId) => {
    set((state) => ({
      building: {
        ...state.building,
        floors: state.building.floors.map((f) => {
          if (f.floorNumber !== floorNumber) return f;
          return { ...f, nodes: f.nodes.filter((n) => n.id !== nodeId) };
        }),
      },
    }));
  },

  resetToDefaultPilot: () => set({ building: createDefaultHostelBuilding() }),

  loadPersistedBuildingFromBackend: async () => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/buildings/hostel-block-alpha');
      if (!res.ok) return;
      const data = await res.json();
      if (!data || !data.floors) return;

      const currentBldg = get().building;
      // Merge database floors with current visualization settings
      const updatedFloors = currentBldg.floors.map((fl) => {
        const remoteFloor = data.floors.find((f: any) => f.floor_number === fl.floorNumber);
        if (!remoteFloor) return fl;

        const updatedRooms = fl.rooms.map((rm) => {
          const remoteRm = remoteFloor.rooms?.find((r: any) => r.id === rm.id);
          if (!remoteRm) return rm;
          return {
            ...rm,
            name: remoteRm.name || rm.name,
            position: { x: remoteRm.pos_x ?? rm.position.x, y: remoteRm.pos_y ?? rm.position.y, z: remoteRm.pos_z ?? rm.position.z },
            size: { width: remoteRm.width ?? rm.size.width, height: remoteRm.height ?? rm.size.height, depth: remoteRm.depth ?? rm.size.depth }
          };
        });

        const updatedNodes = fl.nodes.map((nd) => {
          const remoteNd = remoteFloor.nodes?.find((n: any) => n.id === nd.id);
          if (!remoteNd) return nd;
          return {
            ...nd,
            name: remoteNd.name || nd.name,
            position: remoteNd.position ? { x: remoteNd.position.x, y: remoteNd.position.y, z: remoteNd.position.z } : nd.position,
            status: remoteNd.status || nd.status
          };
        });

        return {
          ...fl,
          name: remoteFloor.name || fl.name,
          rooms: updatedRooms,
          nodes: updatedNodes
        };
      });

      set({
        building: {
          ...currentBldg,
          name: data.name || currentBldg.name,
          totalFloors: data.total_floors || currentBldg.totalFloors,
          floors: updatedFloors
        }
      });
      console.log('Building configuration successfully loaded and synced from database!');
    } catch (err) {
      console.warn('Could not load building from backend, using baseline cached geometry.', err);
    }
  },
}));

