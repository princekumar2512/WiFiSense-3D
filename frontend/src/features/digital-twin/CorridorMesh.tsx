import React from 'react';
import { CorridorSegment, VerticalCore } from '../../types/building';
import * as THREE from 'three';

interface CorridorMeshProps {
  corridors: CorridorSegment[];
  cores: VerticalCore[];
  floorElevationY: number;
  slabThickness: number;
  hasCabinet?: boolean;
  cabinetPosition?: { x: number; y: number; z: number };
}

export const CorridorMesh: React.FC<CorridorMeshProps> = ({
  corridors,
  cores,
  floorElevationY,
  slabThickness,
  hasCabinet,
  cabinetPosition,
}) => {
  return (
    <group position={[0, floorElevationY, 0]}>
      {/* 1. L-Shaped Floor Slab Base */}
      {/* Long Wing Slab (covering rooms + corridor: X: -5 to 30, Z: -7 to 7) */}
      <mesh position={[13.5, slabThickness / 2, 0]} receiveShadow>
        <boxGeometry args={[33, slabThickness, 14]} />
        <meshStandardMaterial color="#071326" roughness={0.7} metalness={0.2} />
      </mesh>

      {/* Short Wing Slab (extending along +Z: X: -7 to 7, Z: 7 to 22) */}
      <mesh position={[0, slabThickness / 2, 14.5]} receiveShadow>
        <boxGeometry args={[14, slabThickness, 15]} />
        <meshStandardMaterial color="#071326" roughness={0.7} metalness={0.2} />
      </mesh>

      {/* 2. Corridor Floor Runners (High-tech walkway floor with subtle grid lines) */}
      {corridors.map((corr) => {
        if (corr.type === 'LONG_CORRIDOR') {
          return (
            <group key={corr.id} position={[14, slabThickness + 0.02, 0]}>
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[28, corr.width]} />
                <meshStandardMaterial color="#0a223f" roughness={0.3} metalness={0.4} />
              </mesh>
              {/* Corridor guideline markings */}
              <lineSegments rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[28, corr.width]} />
                <lineBasicMaterial color="#00f5ff" transparent={true} opacity={0.3} />
              </lineSegments>
            </group>
          );
        } else if (corr.type === 'SHORT_CORRIDOR') {
          return (
            <group key={corr.id} position={[0, slabThickness + 0.02, 10]}>
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[corr.width, 20]} />
                <meshStandardMaterial color="#0a223f" roughness={0.3} metalness={0.4} />
              </mesh>
              <lineSegments rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[corr.width, 20]} />
                <lineBasicMaterial color="#00f5ff" transparent={true} opacity={0.3} />
              </lineSegments>
            </group>
          );
        } else if (corr.type === 'L_JUNCTION') {
          return (
            <group key={corr.id} position={[0, slabThickness + 0.025, 0]}>
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[corr.width, corr.width]} />
                <meshStandardMaterial color="#0f345e" roughness={0.2} metalness={0.5} />
              </mesh>
            </group>
          );
        }
        return null;
      })}

      {/* 3. Vertical Cores at L-Junction: Elevator and Staircase */}
      {cores.map((core) => (
        <group key={core.id} position={[core.position.x, core.size.height / 2 + slabThickness, core.position.z]}>
          <mesh>
            <boxGeometry args={[core.size.width, core.size.height, core.size.depth]} />
            <meshStandardMaterial
              color={core.type === 'ELEVATOR' ? '#1e293b' : '#334155'}
              metalness={0.8}
              roughness={0.2}
              transparent={true}
              opacity={0.7}
            />
          </mesh>
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(core.size.width, core.size.height, core.size.depth)]} />
            <lineBasicMaterial color={core.type === 'ELEVATOR' ? '#38bdf8' : '#94a3b8'} />
          </lineSegments>
        </group>
      ))}

      {/* 4. Large Network Cabinet (Floor 1 Pilot Facility) */}
      {hasCabinet && cabinetPosition && (
        <group position={[cabinetPosition.x, 1.1 + slabThickness, cabinetPosition.z]}>
          <mesh>
            <boxGeometry args={[1.6, 2.2, 0.9]} />
            <meshStandardMaterial color="#020617" metalness={0.9} roughness={0.1} />
          </mesh>
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(1.6, 2.2, 0.9)]} />
            <lineBasicMaterial color="#00f5ff" />
          </lineSegments>
          {/* Status LEDs on rack cabinet */}
          <pointLight color="#00f5ff" intensity={1.5} distance={2.5} position={[0, 0.5, 0.5]} />
        </group>
      )}
    </group>
  );
};
