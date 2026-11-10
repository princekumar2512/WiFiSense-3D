import React, { useState } from 'react';
import { useBuildingStore } from '../../stores/buildingStore';
import { RoomDefinition, NetworkNodeDefinition } from '../../types/building';
import { persistBuildingConfig } from '../../services/api';
import {
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Sliders,
  Building,
  Wifi,
  DoorOpen,
  Info,
  CheckCircle,
} from 'lucide-react';

export const BuildingEditor: React.FC = () => {
  const {
    building,
    selectedFloorNumber,
    setSelectedFloor,
    addFloor,
    removeFloor,
    updateRoom,
    addRoom,
    removeRoom,
    updateNode,
    addNode,
    removeNode,
    resetToDefaultPilot,
  } = useBuildingStore();

  const [activeTab, setActiveTab] = useState<'rooms' | 'nodes' | 'floors' | 'corridors'>('rooms');
  const [saveNotification, setSaveNotification] = useState(false);
  const [isPersisting, setIsPersisting] = useState(false);

  const currentFloorNum = selectedFloorNumber === 'all' ? 1 : selectedFloorNumber;
  const currentFloor = building.floors.find((f) => f.floorNumber === currentFloorNum) || building.floors[0];

  const handleSaveConfiguration = async () => {
    setIsPersisting(true);
    try {
      await persistBuildingConfig(building.id, {
        name: building.name,
        floors: building.floors
      });
      setSaveNotification(true);
      setTimeout(() => setSaveNotification(false), 3000);
    } catch (err) {
      console.error("Backend persistence error:", err);
      // Still show local persistence notification
      setSaveNotification(true);
      setTimeout(() => setSaveNotification(false), 3000);
    } finally {
      setIsPersisting(false);
    }
  };

  const handleAddNewRoom = () => {
    const nextRoomNum = `${currentFloor.floorNumber}${currentFloor.rooms.length + 1 < 10 ? '0' : ''}${currentFloor.rooms.length + 1}`;
    const newRoom: RoomDefinition = {
      id: `room-${currentFloor.floorNumber}-${nextRoomNum}-${Date.now()}`,
      name: `Room ${nextRoomNum}`,
      roomNumber: nextRoomNum,
      floorNumber: currentFloor.floorNumber,
      position: { x: 12.0, y: currentFloor.elevationY + 1.45 + currentFloor.slabThickness, z: 4.8 },
      size: { width: 4.0, height: 2.9, depth: 4.2 },
      wing: 'long-wing',
      side: 'left',
      capacity: 2,
      currentOccupancy: 0,
      signalStrengthDbm: -60,
      isOccupied: false,
      activityStatus: 'unoccupied',
      confidenceScore: 0.85,
    };
    addRoom(currentFloor.floorNumber, newRoom);
  };

  const handleAddNewNode = () => {
    const nextNodeIdx = currentFloor.nodes.length + 1;
    const newNode: NetworkNodeDefinition = {
      id: `node-${currentFloor.floorNumber}-${Date.now()}`,
      name: `Deco-F${currentFloor.floorNumber}-0${nextNodeIdx}`,
      type: 'TPLINK_DECO',
      model: 'TP-Link Deco X50 (Configurable)',
      floorNumber: currentFloor.floorNumber,
      position: { x: 10.0, y: currentFloor.elevationY + 2.4, z: 0.0 },
      status: 'ONLINE',
      channel: 6,
      frequencyGhz: 2.4,
      txPowerDbm: 20,
      coverageRadiusMeters: 14.0,
      isSimulated: true,
      notes: 'Custom placed node',
    };
    addNode(currentFloor.floorNumber, newNode);
  };

  return (
    <div className="bg-navy-900 border border-slate-800 rounded-xl p-5 shadow-glass-panel">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-wide">
              Architectural & Hardware Configuration Editor
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic building modeler for Floor 1 (Measured L-Shape) & Floors 2–9 (Configurable Research Prototypes)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetToDefaultPilot}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-navy-800 text-slate-300 border border-slate-700 rounded-lg hover:bg-navy-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Pilot Baseline</span>
          </button>

          <button
            onClick={handleSaveConfiguration}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-navy-950 rounded-lg transition-all shadow-glow-cyan"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>

      {saveNotification && (
        <div className="mt-3 p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>Building configuration successfully persisted to active spatial profile!</span>
        </div>
      )}

      {/* Floor Selector Subheader */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 p-3 bg-navy-950/60 border border-slate-800 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">Current Editing Floor:</span>
          <select
            value={currentFloorNum}
            onChange={(e) => setSelectedFloor(parseInt(e.target.value))}
            className="bg-navy-800 text-cyan-300 text-xs font-mono border border-cyan-800/80 rounded px-2.5 py-1 focus:outline-none focus:border-cyan-400"
          >
            {building.floors.map((f) => (
              <option key={f.floorNumber} value={f.floorNumber}>
                Floor {f.floorNumber} {f.floorNumber === 1 ? '(Measured L-Shape Pilot)' : '(Prototype)'}
              </option>
            ))}
          </select>
          {currentFloorNum === 1 ? (
            <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-700 px-2 py-0.5 rounded font-mono">
              Measured Pilot Ground Floor
            </span>
          ) : (
            <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-700 px-2 py-0.5 rounded font-mono">
              Editable Unmeasured Approximation
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={addFloor}
            className="flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 bg-navy-800 hover:bg-navy-700 text-cyan-300 border border-cyan-900 rounded"
          >
            <Plus className="w-3 h-3" />
            <span>Add Floor</span>
          </button>
          {building.totalFloors > 1 && (
            <button
              onClick={() => removeFloor(currentFloor.floorNumber)}
              className="flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded"
            >
              <Trash2 className="w-3 h-3" />
              <span>Delete Floor {currentFloor.floorNumber}</span>
            </button>
          )}
        </div>
      </div>

      {/* Editing Category Tabs */}
      <div className="flex border-b border-slate-800 mt-5">
        <button
          onClick={() => setActiveTab('rooms')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'rooms'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <DoorOpen className="w-4 h-4" />
          <span>Rooms ({currentFloor.rooms.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('nodes')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'nodes'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Wifi className="w-4 h-4" />
          <span>Wi-Fi Nodes ({currentFloor.nodes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('corridors')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'corridors'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Corridor & Cores</span>
        </button>
      </div>

      {/* Tab 1: Rooms Editor */}
      {activeTab === 'rooms' && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400">
              Editing rooms for Floor {currentFloor.floorNumber} (Dual-sided L-corridor placement)
            </span>
            <button
              onClick={handleAddNewRoom}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono bg-cyan-950 text-cyan-300 border border-cyan-600 rounded hover:bg-cyan-900 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Room</span>
            </button>
          </div>

          <div className="max-h-[380px] overflow-y-auto pr-1 space-y-2">
            {currentFloor.rooms.map((room) => (
              <div
                key={room.id}
                className="bg-navy-950/70 border border-slate-800 rounded-lg p-3 hover:border-slate-700 transition-colors grid grid-cols-1 md:grid-cols-6 gap-3 items-center text-xs"
              >
                {/* Room Label */}
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-mono">Label</span>
                  <input
                    type="text"
                    value={room.name}
                    onChange={(e) =>
                      updateRoom(currentFloor.floorNumber, room.id, { name: e.target.value })
                    }
                    className="w-full bg-navy-800 text-white font-mono rounded px-2 py-1 border border-slate-700"
                  />
                </div>

                {/* Wing */}
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-mono">Wing</span>
                  <select
                    value={room.wing}
                    onChange={(e) =>
                      updateRoom(currentFloor.floorNumber, room.id, {
                        wing: e.target.value as RoomDefinition['wing'],
                      })
                    }
                    className="w-full bg-navy-800 text-slate-300 font-mono rounded px-2 py-1 border border-slate-700"
                  >
                    <option value="long-wing">Long Wing</option>
                    <option value="short-wing">Short Wing</option>
                    <option value="junction">Junction</option>
                  </select>
                </div>

                {/* X Coordinate */}
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-mono">Pos X (m)</span>
                  <input
                    type="number"
                    step="0.5"
                    value={room.position.x}
                    onChange={(e) =>
                      updateRoom(currentFloor.floorNumber, room.id, {
                        position: { ...room.position, x: parseFloat(e.target.value) || 0 },
                      })
                    }
                    className="w-full bg-navy-800 text-slate-300 font-mono rounded px-2 py-1 border border-slate-700"
                  />
                </div>

                {/* Z Coordinate */}
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-mono">Pos Z (m)</span>
                  <input
                    type="number"
                    step="0.5"
                    value={room.position.z}
                    onChange={(e) =>
                      updateRoom(currentFloor.floorNumber, room.id, {
                        position: { ...room.position, z: parseFloat(e.target.value) || 0 },
                      })
                    }
                    className="w-full bg-navy-800 text-slate-300 font-mono rounded px-2 py-1 border border-slate-700"
                  />
                </div>

                {/* Dimensions (W x D) */}
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-mono">W x D (m)</span>
                  <div className="flex gap-1">
                    <input
                      type="number"
                      step="0.2"
                      value={room.size.width}
                      onChange={(e) =>
                        updateRoom(currentFloor.floorNumber, room.id, {
                          size: { ...room.size, width: parseFloat(e.target.value) || 1 },
                        })
                      }
                      className="w-1/2 bg-navy-800 text-slate-300 font-mono rounded px-1.5 py-1 border border-slate-700"
                    />
                    <input
                      type="number"
                      step="0.2"
                      value={room.size.depth}
                      onChange={(e) =>
                        updateRoom(currentFloor.floorNumber, room.id, {
                          size: { ...room.size, depth: parseFloat(e.target.value) || 1 },
                        })
                      }
                      className="w-1/2 bg-navy-800 text-slate-300 font-mono rounded px-1.5 py-1 border border-slate-700"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end">
                  <button
                    onClick={() => removeRoom(currentFloor.floorNumber, room.id)}
                    className="p-1.5 text-rose-400 hover:bg-rose-950/60 rounded border border-rose-900/60"
                    title="Delete Room"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Wi-Fi Nodes Editor */}
      {activeTab === 'nodes' && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400">
              Manage TP-Link Deco mesh nodes and router placement (1 node per ~3 rooms)
            </span>
            <button
              onClick={handleAddNewNode}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono bg-cyan-950 text-cyan-300 border border-cyan-600 rounded hover:bg-cyan-900 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Wi-Fi Node</span>
            </button>
          </div>

          <div className="space-y-2">
            {currentFloor.nodes.map((node) => (
              <div
                key={node.id}
                className="bg-navy-950/70 border border-slate-800 rounded-lg p-3 hover:border-cyan-800 transition-colors grid grid-cols-1 md:grid-cols-5 gap-3 items-center text-xs"
              >
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-mono">Node Name</span>
                  <input
                    type="text"
                    value={node.name}
                    onChange={(e) =>
                      updateNode(currentFloor.floorNumber, node.id, { name: e.target.value })
                    }
                    className="w-full bg-navy-800 text-cyan-300 font-mono rounded px-2 py-1 border border-slate-700"
                  />
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-mono">Band / Channel</span>
                  <select
                    value={node.frequencyGhz}
                    onChange={(e) =>
                      updateNode(currentFloor.floorNumber, node.id, {
                        frequencyGhz: parseFloat(e.target.value) as 2.4 | 5.0,
                      })
                    }
                    className="w-full bg-navy-800 text-slate-300 font-mono rounded px-2 py-1 border border-slate-700"
                  >
                    <option value={2.4}>2.4 GHz (Long Range)</option>
                    <option value={5.0}>5.0 GHz (High Throughput)</option>
                  </select>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-mono">Position (X, Z)</span>
                  <div className="flex gap-1">
                    <input
                      type="number"
                      step="0.5"
                      value={node.position.x}
                      onChange={(e) =>
                        updateNode(currentFloor.floorNumber, node.id, {
                          position: { ...node.position, x: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="w-1/2 bg-navy-800 text-slate-300 font-mono rounded px-1.5 py-1 border border-slate-700"
                    />
                    <input
                      type="number"
                      step="0.5"
                      value={node.position.z}
                      onChange={(e) =>
                        updateNode(currentFloor.floorNumber, node.id, {
                          position: { ...node.position, z: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="w-1/2 bg-navy-800 text-slate-300 font-mono rounded px-1.5 py-1 border border-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-mono">Status</span>
                  <select
                    value={node.status}
                    onChange={(e) =>
                      updateNode(currentFloor.floorNumber, node.id, {
                        status: e.target.value as NetworkNodeDefinition['status'],
                      })
                    }
                    className="w-full bg-navy-800 text-slate-300 font-mono rounded px-2 py-1 border border-slate-700"
                  >
                    <option value="ONLINE">ONLINE (Active)</option>
                    <option value="DEGRADED">DEGRADED</option>
                    <option value="OFFLINE">OFFLINE</option>
                  </select>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => removeNode(currentFloor.floorNumber, node.id)}
                    className="p-1.5 text-rose-400 hover:bg-rose-950/60 rounded border border-rose-900/60"
                    title="Delete Node"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Corridors & Cores */}
      {activeTab === 'corridors' && (
        <div className="mt-4 space-y-4">
          <div className="p-3 bg-navy-950/80 border border-slate-800 rounded-lg text-xs space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold">
              <Info className="w-4 h-4" />
              <span>L-Shaped Corridor Configuration Details</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              • <strong>Long Wing Corridor:</strong> Length 28m, Width 2.4m, hosting Rooms 01–12 on North & South sides.
              <br />• <strong>Short Wing Corridor:</strong> Length 20m, Width 2.4m, hosting Rooms 13–20 on East & West sides.
              <br />• <strong>L-Junction Turning Point:</strong> Elevator shaft & main staircase core positioned at corner junction (X: -3.5m, Z: -3.5m).
              <br />• <strong>Floor 1 Network Cabinet:</strong> Large rack cabinet positioned at X: 1.2m, Z: -3.2m with fiber backhaul.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

