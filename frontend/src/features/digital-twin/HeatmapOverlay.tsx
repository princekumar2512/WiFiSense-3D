import React, { useMemo } from 'react';
import * as THREE from 'three';

interface HeatmapOverlayProps {
  floorElevationY: number;
  slabThickness: number;
  showHeatmap: boolean;
}

export const HeatmapOverlay: React.FC<HeatmapOverlayProps> = ({
  floorElevationY,
  slabThickness,
  showHeatmap,
}) => {
  // Generate a procedural canvas texture simulating RF signal strength gradients from Node 1 (junction) and Node 2 (far end)
  const heatmapTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Dark transparent base
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, 256, 256);

    // Node 1 (Junction) gradient
    const grad1 = ctx.createRadialGradient(40, 40, 5, 40, 40, 110);
    grad1.addColorStop(0, 'rgba(0, 245, 255, 0.45)');
    grad1.addColorStop(0.4, 'rgba(14, 165, 233, 0.25)');
    grad1.addColorStop(0.8, 'rgba(59, 130, 246, 0.1)');
    grad1.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad1;
    ctx.beginPath();
    ctx.arc(40, 40, 110, 0, Math.PI * 2);
    ctx.fill();

    // Node 2 (Far End) gradient
    const grad2 = ctx.createRadialGradient(210, 40, 5, 210, 40, 120);
    grad2.addColorStop(0, 'rgba(0, 245, 255, 0.45)');
    grad2.addColorStop(0.4, 'rgba(14, 165, 233, 0.25)');
    grad2.addColorStop(0.8, 'rgba(59, 130, 246, 0.1)');
    grad2.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad2;
    ctx.beginPath();
    ctx.arc(210, 40, 120, 0, Math.PI * 2);
    ctx.fill();

    // Node 3 (Short wing) gradient
    const grad3 = ctx.createRadialGradient(40, 180, 5, 40, 180, 90);
    grad3.addColorStop(0, 'rgba(34, 197, 94, 0.35)');
    grad3.addColorStop(0.5, 'rgba(14, 165, 233, 0.18)');
    grad3.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad3;
    ctx.beginPath();
    ctx.arc(40, 180, 90, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }, []);

  if (!showHeatmap || !heatmapTexture) return null;

  return (
    <group position={[13.5, floorElevationY + slabThickness + 0.05, 7.0]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh>
        <planeGeometry args={[35, 28]} />
        <meshBasicMaterial
          map={heatmapTexture}
          transparent={true}
          opacity={0.65}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

