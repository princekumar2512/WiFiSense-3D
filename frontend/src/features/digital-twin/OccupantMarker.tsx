import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface OccupantMarkerProps {
  type: 'CONSENTED_PARTICIPANT' | 'ANONYMOUS_OCCUPANT';
  position: { x: number; y: number; z: number };
  label: string;
  subLabel?: string;
  confidenceScore: number;
  uncertaintyRadius: number; // in meters
  activity?: string;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const OccupantMarker: React.FC<OccupantMarkerProps> = ({
  type,
  position,
  label,
  subLabel,
  confidenceScore,
  uncertaintyRadius,
  activity = 'UNKNOWN',
  isSelected = false,
  onSelect,
}) => {
  const markerRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  const isConsented = type === 'CONSENTED_PARTICIPANT';

  // Electric cyan for consented participant, scientific amber for anonymous RF disturbance
  const mainColor = isConsented ? '#00f5ff' : '#f59e0b';
  const glowColor = isConsented ? '#38bdf8' : '#d97706';

  useFrame(({ clock }) => {
    if (markerRef.current) {
      const t = clock.getElapsedTime();
      // Subtle hovering bobbing
      markerRef.current.position.y = position.y + Math.sin(t * 3) * 0.08;
    }
    if (ringRef.current) {
      const t = clock.getElapsedTime() * 1.5;
      const s = 1 + Math.sin(t) * 0.08;
      ringRef.current.scale.set(s, s, 1);
    }
  });

  return (
    <group position={[position.x, 0, position.z]}>
      {/* Floor Uncertainty Radius Ring */}
      <mesh
        ref={ringRef}
        position={[0, position.y - 0.7, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[uncertaintyRadius * 0.9, uncertaintyRadius, 32]} />
        <meshBasicMaterial
          color={mainColor}
          transparent={true}
          opacity={0.35}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Floating 3D Occupant Avatar / Holographic Sphere */}
      <group ref={markerRef} position={[0, position.y, 0]} onClick={onSelect}>
        {/* Core sphere */}
        <mesh>
          <sphereGeometry args={[0.26, 16, 16]} />
          <meshStandardMaterial
            color={mainColor}
            emissive={glowColor}
            emissiveIntensity={0.8}
            metalness={0.5}
            roughness={0.2}
          />
        </mesh>

        {/* Outer translucent aura */}
        <mesh>
          <sphereGeometry args={[0.38, 16, 16]} />
          <meshBasicMaterial
            color={mainColor}
            transparent={true}
            opacity={0.25}
            wireframe={true}
          />
        </mesh>

        {/* Vertical beam pointing to floor */}
        <lineSegments position={[0, -0.4, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.8, 8]} />
          <meshBasicMaterial color={mainColor} transparent={true} opacity={0.6} />
        </lineSegments>

        {/* Floating Information Badge */}
        <Html position={[0, 0.6, 0]} center distanceFactor={14}>
          <div
            onClick={onSelect}
            className={`cursor-pointer px-2 py-1 rounded-md text-[10px] font-mono shadow-lg backdrop-blur-md border whitespace-nowrap transition-all ${
              isConsented
                ? 'bg-cyan-950/90 text-cyan-200 border-cyan-400 shadow-glow-cyan'
                : 'bg-amber-950/90 text-amber-200 border-amber-500 shadow-amber-900/40'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold">
              <span
                className={`w-2 h-2 rounded-full ${
                  isConsented ? 'bg-cyan-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span>{label}</span>
              {isConsented && (
                <span className="text-[8px] bg-cyan-900/80 text-cyan-300 px-1 py-0.2 rounded border border-cyan-600">
                  CONSENTED
                </span>
              )}
            </div>
            <div className="text-[9px] text-slate-300 flex items-center justify-between gap-2 mt-0.5">
              <span>{activity}</span>
              <span className="text-emerald-400">{(confidenceScore * 100).toFixed(0)}% conf</span>
              <span className="text-slate-400">±{uncertaintyRadius.toFixed(1)}m</span>
            </div>
          </div>
        </Html>
      </group>
    </group>
  );
};

