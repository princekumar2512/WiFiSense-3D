import React from 'react';
import { BuildingCanvas } from '../features/digital-twin/BuildingCanvas';
import { useBuildingStore } from '../stores/buildingStore';
import { FloorDefinition, RoomDefinition, NetworkNodeDefinition } from '../types/building';
import {
  Layers,
  Info,
  DoorOpen,
  Wifi,
  Users,
  Compass,
  Sliders,
  X,
} from 'lucide-react';

export const DigitalTwinPage: React.FC = () => {
  const {
    building,
    selectedFloorNumber,
    selectedRoomId,
    setSelectedRoom,
    selectedNodeId,
    setSelectedNode,
  } = useBuildingStore();

  // Find selected room data if clicked
  const selectedRoom = building.floors
    .flatMap((f: FloorDefinition) => f.rooms)
    .find((r: RoomDefinition) => r.id === selectedRoomId);

  // Find selected node data if clicked
  const selectedNode = building.floors
    .flatMap((f: FloorDefinition) => f.nodes)
    .find((n: NetworkNodeDefinition) => n.id === selectedNodeId);

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] bg-navy-950 overflow-hidden">
      {/* 3D Canvas */}
      <BuildingCanvas className="w-full h-full" showOverlayControls={true} />

      {/* Selected Room Inspection Drawer (Right Side) */}
      {selectedRoom && (
        <div className="absolute top-20 right-4 w-80 bg-navy-900/90 backdrop-blur-xl border border-cyan-400 rounded-2xl p-4 shadow-2xl z-20 animate-fade-in font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2 text-cyan-300 font-bold">
              <DoorOpen className="w-4 h-4 text-cyan-400" />
              <span>{selectedRoom.name}</span>
            </div>
            <button
              onClick={() => setSelectedRoom(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 space-y-2 text-slate-300">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-500">Floor Level:</span>
              <span className="text-white font-bold">Floor {selectedRoom.floorNumber}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-500">Corridor Wing:</span>
              <span className="text-cyan-300 capitalize">{selectedRoom.wing.replace('-', ' ')}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-500">Occupancy State:</span>
              <span
                className={`font-bold ${
                  selectedRoom.isOccupied ? 'text-amber-400' : 'text-slate-400'
                }`}
              >
                {selectedRoom.isOccupied
                  ? `OCCUPIED (${selectedRoom.currentOccupancy} pers)`
                  : 'VACANT'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-500">Estimated Activity:</span>
              <span className="text-white uppercase">{selectedRoom.activityStatus}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-500">Wi-Fi RSSI:</span>
              <span className="text-emerald-400">{selectedRoom.signalStrengthDbm} dBm</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-500">Localization Confidence:</span>
              <span className="text-cyan-400 font-bold">
                {(selectedRoom.confidenceScore * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Room Coordinates:</span>
              <span className="text-slate-400 text-[10px]">
                X:{selectedRoom.position.x} Y:{selectedRoom.position.y.toFixed(1)} Z:
                {selectedRoom.position.z}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Selected Node Inspection Drawer */}
      {selectedNode && (
        <div className="absolute top-20 right-4 w-80 bg-navy-900/90 backdrop-blur-xl border border-cyan-400 rounded-2xl p-4 shadow-2xl z-20 animate-fade-in font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2 text-cyan-300 font-bold">
              <Wifi className="w-4 h-4 text-cyan-400" />
              <span>{selectedNode.name}</span>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 space-y-2 text-slate-300">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-500">Hardware Model:</span>
              <span className="text-white font-bold">{selectedNode.model}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-500">MAC / IP:</span>
              <span className="text-cyan-300">{selectedNode.macAddress || '98:48:27:XX:XX'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-500">Operating Band:</span>
              <span className="text-white font-bold">{selectedNode.frequencyGhz} GHz</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-500">Status:</span>
              <span
                className={`font-bold ${
                  selectedNode.status === 'ONLINE' ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {selectedNode.status}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-500">Coverage Radius:</span>
              <span className="text-slate-300">{selectedNode.coverageRadiusMeters} meters</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Placement Notes:</span>
              <span className="text-slate-400 text-[10px]">{selectedNode.notes || 'Corridor mesh node'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
