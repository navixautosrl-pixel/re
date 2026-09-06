"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * The brand's 3D object: a bead of water on freshly polished paint — the
 * actual visual signature of good detailing (hydrophobic coating beading
 * water), not a generic spinning object. High-clearcoat physical
 * material for the glossy highlight, a few smaller droplets orbiting.
 */
function Droplet({ position, scale }: { position: [number, number, number]; scale: number }) {
  const ref = useRef<THREE.Mesh>(null);
  // Deliberately random per-droplet phase offset, computed once via useMemo.
  // eslint-disable-next-line react-hooks/purity
  const seed = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.position.y = position[1] + Math.sin(t * 0.5 + seed) * 0.08;
  });

  return (
    <mesh ref={ref} position={position} scale={scale} castShadow>
      <sphereGeometry args={[1, 48, 48]} />
      <meshPhysicalMaterial
        color="#0c0b0a"
        metalness={0.1}
        roughness={0.05}
        clearcoat={1}
        clearcoatRoughness={0.03}
        reflectivity={1}
        envMapIntensity={1.4}
      />
    </mesh>
  );
}

export function PaintSphere() {
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();
    group.current.rotation.y = t * 0.08;
  });

  return (
    <group ref={group}>
      <Droplet position={[0, 0, 0]} scale={1.1} />
      <Droplet position={[1.9, -0.6, -0.6]} scale={0.28} />
      <Droplet position={[-1.7, 0.7, 0.4]} scale={0.22} />
      <Droplet position={[1.2, 1.1, 0.8]} scale={0.16} />
      <Droplet position={[-1.3, -1.0, -0.3]} scale={0.19} />

      {/* Glossy paint floor beneath, catching the reflection */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.4, 0]} receiveShadow>
        <circleGeometry args={[4.2, 64]} />
        <meshPhysicalMaterial color="#0c0b0a" metalness={0.3} roughness={0.15} clearcoat={1} clearcoatRoughness={0.1} />
      </mesh>
    </group>
  );
}
