import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SignalWaveMeshProps {
  origin: { x: number; y: number; z: number };
  radius: number;
  color?: string;
  speed?: number;
  isActive?: boolean;
}

export const SignalWaveMesh: React.FC<SignalWaveMeshProps> = ({
  origin,
  radius,
  color = '#00f5ff',
  speed = 1.0,
  isActive = true,
}) => {
  const wave1Ref = useRef<THREE.Mesh>(null);
  const wave2Ref = useRef<THREE.Mesh>(null);
  const wave3Ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!isActive) return;
    const t = clock.getElapsedTime() * speed;

    const animateWave = (mesh: THREE.Mesh | null, offset: number) => {
      if (!mesh) return;
      const progress = (t + offset) % 3; // 0 to 3
      const scale = (progress / 3) * radius;
      mesh.scale.set(scale, scale, 1);
      const material = mesh.material as THREE.MeshBasicMaterial;
      if (material) {
        // Fade out as it expands
        material.opacity = Math.max(0, 0.45 * (1 - progress / 3));
      }
    };

    animateWave(wave1Ref.current, 0.0);
    animateWave(wave2Ref.current, 1.0);
    animateWave(wave3Ref.current, 2.0);
  });

  if (!isActive) return null;

  return (
    <group position={[origin.x, origin.y - 0.2, origin.z]} rotation={[-Math.PI / 2, 0, 0]}>
      {/* Wave Ring 1 */}
      <mesh ref={wave1Ref}>
        <ringGeometry args={[0.95, 1.0, 48]} />
        <meshBasicMaterial color={color} transparent={true} opacity={0.4} side={THREE.DoubleSide} />
      </mesh>

      {/* Wave Ring 2 */}
      <mesh ref={wave2Ref}>
        <ringGeometry args={[0.95, 1.0, 48]} />
        <meshBasicMaterial color={color} transparent={true} opacity={0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* Wave Ring 3 */}
      <mesh ref={wave3Ref}>
        <ringGeometry args={[0.95, 1.0, 48]} />
        <meshBasicMaterial color={color} transparent={true} opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

