import React from 'react';
import { useBuildingStore } from '../../stores/buildingStore';
import { BuildingFloor } from './BuildingFloor';
import { Html } from '@react-three/drei';

export const BuildingScene: React.FC = () => {
  const { building, selectedFloorNumber, setSelectedFloor } = useBuildingStore();

  const isIsolated = selectedFloorNumber !== 'all';

  return (
    <group position={[-10, 0, -5]}>
      {/* High-tech ground plane / grid */}
      <gridHelper args={[80, 40, '#00f5ff', '#0a223f']} position={[14, -0.05, 7]} />

      {/* Render Floors */}
      {building.floors.map((floor) => {
        // If a specific floor is selected, only render that floor (isolated view)
        if (isIsolated && floor.floorNumber !== selectedFloorNumber) {
          return null;
        }

        return (
          <React.Fragment key={floor.floorNumber}>
            <BuildingFloor
              floor={floor}
              isIsolatedView={isIsolated}
              cutawayActive={building.cutawayMode}
            />

            {/* Floor elevation label tag on the side */}
            {!isIsolated && (
              <Html
                position={[-6, floor.elevationY + 1.6, -5]}
                center
                distanceFactor={28}
              >
                <button
                  onClick={() => setSelectedFloor(floor.floorNumber)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all border ${
                    floor.floorNumber === 1
                      ? 'bg-cyan-950/80 text-cyan-300 border-cyan-400 hover:bg-cyan-900 shadow-glow-cyan'
                      : 'bg-navy-900/70 text-slate-400 border-slate-700 hover:border-cyan-500 hover:text-white'
                  }`}
                >
                  <span className="font-bold">L{floor.floorNumber}</span>
                  {floor.floorNumber === 1 && <span className="ml-1 text-[8px] text-cyan-400">PILOT</span>}
                </button>
              </Html>
            )}
          </React.Fragment>
        );
      })}
    </group>
  );
};
