import React, { useRef } from 'react';
import { NetworkNodeDefinition } from '../../types/building';
import { useBuildingStore } from '../../stores/buildingStore';
import { useSimulationStore } from '../../stores/simulationStore';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface NodeMarkerProps {
  node: NetworkNodeDefinition;
}

export const NodeMarker: React.FC<NodeMarkerProps> = ({ node }) => {
  const meshRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const { selectedNodeId, setSelectedNode } = useBuildingStore();
  const { failedNodeId } = useSimulationStore();

  const isFailed = failedNodeId === node.id || node.status === 'OFFLINE';
  const isSelected = selectedNodeId === node.id;

  // Animate node pulse
  useFrame(({ clock }) => {
    if (ringRef.current && !isFailed) {
      const t = clock.getElapsedTime() * 2;
      const s = 1 + Math.sin(t) * 0.15;
      ringRef.current.scale.set(s, s, s);
    }
  });

  const nodeColor = isFailed ? '#ef4444' : '#00f5ff';
  const ledGlow = isFailed ? '#dc2626' : '#22d3ee';

  return (
    <group position={[node.position.x, node.position.y, node.position.z]} ref={meshRef}>
      {/* Click target hitbox */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          setSelectedNode(isSelected ? null : node.id);
        }}
      >
        <cylinderGeometry args={[0.35, 0.35, 0.45, 16]} />
        <meshStandardMaterial
          color={isSelected ? '#38bdf8' : '#e2e8f0'}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Top LED Indicator ring */}
      <mesh position={[0, 0.23, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 0.04, 16]} />
        <meshStandardMaterial
          color={ledGlow}
          emissive={ledGlow}
          emissiveIntensity={isFailed ? 0.8 : 1.5}
        />
      </mesh>

      {/* Pulsing halo ring */}
      <mesh ref={ringRef} position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.45, 0.55, 32]} />
        <meshBasicMaterial
          color={nodeColor}
          transparent={true}
          opacity={isFailed ? 0.3 : 0.6}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Point light projecting subtle glow onto corridor ceiling and floor */}
      <pointLight
        color={nodeColor}
        intensity={isFailed ? 0.5 : 2.0}
        distance={4.5}
        decay={2}
      />

      {/* Label tag */}
      <Html position={[0, 0.5, 0]} center distanceFactor={18}>
        <div
          onClick={(e) => {
            e.stopPropagation();
            setSelectedNode(node.id);
          }}
          className={`cursor-pointer px-2 py-0.5 rounded text-[9px] font-mono whitespace-nowrap transition-all border ${
            isFailed
              ? 'bg-rose-950/90 text-rose-300 border-rose-500 shadow-lg shadow-rose-900/50'
              : isSelected
              ? 'bg-cyan-900/90 text-white border-cyan-300 shadow-glow-cyan'
              : 'bg-navy-900/80 text-cyan-400 border-cyan-800 hover:border-cyan-400'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isFailed ? 'bg-rose-500 animate-ping' : 'bg-cyan-400 animate-pulse'
              }`}
            />
            <span className="font-semibold">{node.name.split(' ')[0]}</span>
            <span className="text-slate-400">({node.frequencyGhz}GHz)</span>
          </div>
        </div>
      </Html>
    </group>
  );
};

