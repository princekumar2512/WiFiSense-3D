import React, { useRef, useState } from 'react';
import { RoomDefinition } from '../../types/building';
import { useBuildingStore } from '../../stores/buildingStore';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface RoomMeshProps {
  room: RoomDefinition;
  floorElevationY: number;
  wallTransparency: number;
}

export const RoomMesh: React.FC<RoomMeshProps> = ({ room, floorElevationY, wallTransparency }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const { selectedRoomId, setSelectedRoom, setHoveredRoom } = useBuildingStore();

  const isSelected = selectedRoomId === room.id;

  // Determine room appearance based on occupancy and selection
  let baseColor = '#0f2942'; // default dark blue room
  let emissiveColor = '#000000';
  let emissiveIntensity = 0;

  if (isSelected) {
    baseColor = '#00f5ff';
    emissiveColor = '#00f5ff';
    emissiveIntensity = 0.5;
  } else if (hovered) {
    baseColor = '#1e4e79';
    emissiveColor = '#38bdf8';
    emissiveIntensity = 0.25;
  } else if (room.isOccupied) {
    baseColor = room.currentOccupancy >= 2 ? '#1e3a8a' : '#172554';
    emissiveColor = '#3b82f6';
    emissiveIntensity = 0.15;
  }

  return (
    <group position={[room.position.x, room.position.y, room.position.z]}>
      {/* Semi-transparent room volume */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedRoom(isSelected ? null : room.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          setHoveredRoom(room.id);
        }}
        onPointerOut={() => {
          setHovered(false);
          setHoveredRoom(null);
        }}
      >
        <boxGeometry args={[room.size.width, room.size.height, room.size.depth]} />
        <meshStandardMaterial
          color={baseColor}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity}
          transparent={true}
          opacity={hovered || isSelected ? 0.75 : Math.max(0.15, wallTransparency)}
          roughness={0.2}
          metalness={0.3}
        />
      </mesh>

      {/* Wireframe border for crisp architectural look */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(room.size.width, room.size.height, room.size.depth)]} />
        <lineBasicMaterial
          color={isSelected ? '#00f5ff' : hovered ? '#38bdf8' : room.isOccupied ? '#60a5fa' : '#1e3a5f'}
          linewidth={isSelected || hovered ? 2 : 1}
          transparent={true}
          opacity={0.8}
        />
      </lineSegments>

      {/* Room floating badge on hover or selection */}
      {(hovered || isSelected) && (
        <Html position={[0, room.size.height / 2 + 0.3, 0]} center distanceFactor={15}>
          <div className="pointer-events-none select-none px-2 py-1 bg-navy-900/90 border border-cyan-400 text-cyan-300 text-[10px] font-mono rounded shadow-glow-cyan backdrop-blur-sm whitespace-nowrap">
            <span className="font-bold text-white">{room.name}</span>
            <span className="mx-1 text-slate-500">|</span>
            <span>{room.isOccupied ? `Occupied (${room.currentOccupancy}p)` : 'Vacant'}</span>
            <span className="mx-1 text-slate-500">|</span>
            <span className="text-emerald-400">{room.signalStrengthDbm} dBm</span>
          </div>
        </Html>
      )}
    </group>
  );
};
