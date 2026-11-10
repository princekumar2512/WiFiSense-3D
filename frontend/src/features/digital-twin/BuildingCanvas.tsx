import React, { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { BuildingScene } from './BuildingScene';
import { useBuildingStore } from '../../stores/buildingStore';
import {
  Layers,
  Radio,
  Eye,
  Sliders,
  Maximize2,
  Minimize2,
  Compass,
  Building,
  Activity,
} from 'lucide-react';

interface BuildingCanvasProps {
  className?: string;
  showOverlayControls?: boolean;
}

export const BuildingCanvas: React.FC<BuildingCanvasProps> = ({
  className = 'w-full h-full min-h-[500px]',
  showOverlayControls = true,
}) => {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const {
    building,
    selectedFloorNumber,
    setSelectedFloor,
    toggleCutawayMode,
    toggleSignalWaves,
    toggleHeatmap,
    toggleOccupants,
    cameraPreset,
    setCameraPreset,
    setWallTransparency,
  } = useBuildingStore();

  // Apply camera preset transitions
  useEffect(() => {
    if (!controlsRef.current) return;
    if (cameraPreset === 'isometric') {
      controlsRef.current.object.position.set(38, 32, 42);
      controlsRef.current.target.set(4, 12, 2);
    } else if (cameraPreset === 'firstFloorL') {
      controlsRef.current.object.position.set(16, 18, 26);
      controlsRef.current.target.set(6, 2, 4);
    } else if (cameraPreset === 'topDown') {
      controlsRef.current.object.position.set(5, 55, 5);
      controlsRef.current.target.set(5, 0, 5);
    } else if (cameraPreset === 'sideElevation') {
      controlsRef.current.object.position.set(55, 16, 2);
      controlsRef.current.target.set(4, 15, 2);
    }
    controlsRef.current.update();
  }, [cameraPreset, selectedFloorNumber]);

  return (
    <div className={`relative bg-navy-950 overflow-hidden ${className}`}>
      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [38, 32, 42], fov: 42 }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <color attach="background" args={['#020611']} />
        <fog attach="fog" args={['#020611', 40, 110]} />

        {/* Ambient & Directional Lighting */}
        <ambientLight intensity={0.8} />
        <directionalLight
          position={[25, 45, 30]}
          intensity={1.4}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <pointLight position={[-15, 30, -10]} intensity={0.6} color="#00f5ff" />
        <pointLight position={[35, 10, 20]} intensity={0.8} color="#3b82f6" />

        {/* Main 3D Scene */}
        <BuildingScene />

        {/* Orbit Controls */}
        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.06}
          maxPolarAngle={Math.PI / 2 + 0.05} // don't go below ground
          minDistance={5}
          maxDistance={90}
        />
      </Canvas>

      {/* Floating HUD Controls */}
      {showOverlayControls && (
        <>
          {/* Top-Left: Building & Floor Selector */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            <div className="bg-navy-900/85 backdrop-blur-md border border-cyan-500/30 rounded-lg p-2.5 shadow-glass-panel">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-semibold text-white tracking-wide">
                    {building.name}
                  </span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/60">
                  9 FLOORS
                </span>
              </div>

              {/* Floor Switcher Buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSelectedFloor('all')}
                  className={`px-2 py-1 text-[11px] font-mono rounded transition-all ${
                    selectedFloorNumber === 'all'
                      ? 'bg-cyan-500 text-navy-950 font-bold shadow-glow-cyan'
                      : 'bg-navy-800 text-slate-300 hover:bg-navy-700'
                  }`}
                >
                  All (Stack)
                </button>
                {building.floors.map((f) => (
                  <button
                    key={f.floorNumber}
                    onClick={() => setSelectedFloor(f.floorNumber)}
                    className={`px-2 py-1 text-[11px] font-mono rounded transition-all ${
                      selectedFloorNumber === f.floorNumber
                        ? 'bg-cyan-400 text-navy-950 font-bold shadow-glow-cyan'
                        : f.floorNumber === 1
                        ? 'bg-navy-800 text-cyan-300 border border-cyan-800/80 hover:bg-navy-700'
                        : 'bg-navy-800 text-slate-300 hover:bg-navy-700'
                    }`}
                    title={f.name}
                  >
                    F{f.floorNumber}
                  </button>
                ))}
              </div>
            </div>

            {/* Camera Presets */}
            <div className="bg-navy-900/85 backdrop-blur-md border border-slate-700/60 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[10px] uppercase font-mono text-slate-400 mr-1">Views:</span>
              <button
                onClick={() => setCameraPreset('isometric')}
                className={`px-2 py-0.5 text-[10px] font-mono rounded ${
                  cameraPreset === 'isometric'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                3D Iso
              </button>
              <button
                onClick={() => {
                  setSelectedFloor(1);
                  setCameraPreset('firstFloorL');
                }}
                className={`px-2 py-0.5 text-[10px] font-mono rounded ${
                  cameraPreset === 'firstFloorL'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                    : 'text-cyan-400 hover:text-white font-medium'
                }`}
              >
                F1 L-Corridor
              </button>
              <button
                onClick={() => setCameraPreset('topDown')}
                className={`px-2 py-0.5 text-[10px] font-mono rounded ${
                  cameraPreset === 'topDown'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Top-Down
              </button>
              <button
                onClick={() => setCameraPreset('sideElevation')}
                className={`px-2 py-0.5 text-[10px] font-mono rounded ${
                  cameraPreset === 'sideElevation'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Elevation
              </button>
            </div>
          </div>

          {/* Top-Right: Layer Visibility Toggles */}
          <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
            <div className="bg-navy-900/85 backdrop-blur-md border border-cyan-500/30 rounded-lg p-2.5 shadow-glass-panel flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white border-b border-slate-800 pb-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Layers & Visualization</span>
              </div>

              {/* RF Waves Toggle */}
              <button
                onClick={toggleSignalWaves}
                className={`flex items-center justify-between gap-3 px-2 py-1 text-[11px] rounded transition-all ${
                  building.showSignalWaves
                    ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/50'
                    : 'bg-navy-800/80 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Wi-Fi Signal Waves</span>
                </div>
                <span className="font-mono text-[9px]">{building.showSignalWaves ? 'ON' : 'OFF'}</span>
              </button>

              {/* Heatmap Toggle */}
              <button
                onClick={toggleHeatmap}
                className={`flex items-center justify-between gap-3 px-2 py-1 text-[11px] rounded transition-all ${
                  building.showHeatmap
                    ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/50'
                    : 'bg-navy-800/80 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span>RF Coverage Heatmap</span>
                </div>
                <span className="font-mono text-[9px]">{building.showHeatmap ? 'ON' : 'OFF'}</span>
              </button>

              {/* Occupants Toggle */}
              <button
                onClick={toggleOccupants}
                className={`flex items-center justify-between gap-3 px-2 py-1 text-[11px] rounded transition-all ${
                  building.showOccupants
                    ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/50'
                    : 'bg-navy-800/80 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span>Human Occupancy Markers</span>
                </div>
                <span className="font-mono text-[9px]">{building.showOccupants ? 'ON' : 'OFF'}</span>
              </button>

              {/* Cutaway Mode */}
              <button
                onClick={toggleCutawayMode}
                className={`flex items-center justify-between gap-3 px-2 py-1 text-[11px] rounded transition-all ${
                  building.cutawayMode
                    ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-500/50'
                    : 'bg-navy-800/80 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Cutaway Architectural View</span>
                </div>
                <span className="font-mono text-[9px]">{building.cutawayMode ? 'ACTIVE' : 'OFF'}</span>
              </button>

              {/* Wall Transparency Slider */}
              <div className="pt-1.5 border-t border-slate-800/80">
                <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                  <span>Wall Transparency</span>
                  <span>{Math.round(building.wallTransparency * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.05"
                  value={building.wallTransparency}
                  onChange={(e) => setWallTransparency(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 h-1 bg-navy-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Bottom-Center: Status Bar */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-navy-900/85 backdrop-blur-md border border-cyan-500/20 px-4 py-1.5 rounded-full flex items-center gap-4 text-xs font-mono text-slate-300 shadow-glass-panel">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white font-semibold">Deco Nodes: 28 Online</span>
            </div>
            <span className="text-slate-600">|</span>
            <div>
              <span className="text-slate-400">First-Floor Anchor: </span>
              <span className="text-cyan-300 font-bold">Node 1 (L-Junction) & Node 2 (Far End)</span>
            </div>
            <span className="text-slate-600">|</span>
            <div>
              <span className="text-slate-400">Rendering: </span>
              <span className="text-emerald-400">Three.js WebGL (60 FPS)</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
