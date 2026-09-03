"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

const NODE_POSITIONS: [number, number, number][] = [
  [3.4, 1.4, -1.2],
  [-3.6, -0.8, -0.6],
  [2.8, -1.6, 1.8],
  [-2.6, 1.8, 1.4],
];

function PacketOnLine({ start, end, speed, offset }: { start: THREE.Vector3; end: THREE.Vector3; speed: number; offset: number }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = (Math.sin(clock.getElapsedTime() * speed + offset) + 1) / 2;
    ref.current.position.lerpVectors(start, end, t);
    const material = ref.current.material as THREE.MeshStandardMaterial;
    material.emissiveIntensity = 1.2 + Math.sin(clock.getElapsedTime() * 6 + offset) * 0.4;
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.035, 8, 8]} />
      <meshStandardMaterial color="#8fcaff" emissive="#3b93ff" emissiveIntensity={1.2} toneMapped={false} />
    </mesh>
  );
}

export function NetworkNodes() {
  const origin = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const nodes = useMemo(
    () => NODE_POSITIONS.map((p) => new THREE.Vector3(...p)),
    []
  );

  return (
    <group>
      {nodes.map((node, i) => (
        <group key={i}>
          <mesh position={node}>
            <icosahedronGeometry args={[0.12, 0]} />
            <meshStandardMaterial
              color="#131a26"
              emissive="#3b93ff"
              emissiveIntensity={0.5}
              metalness={0.4}
              roughness={0.3}
            />
          </mesh>
          <Line
            points={[origin, node]}
            color="#1d5fb0"
            transparent
            opacity={0.35}
            lineWidth={1}
          />
          <PacketOnLine start={origin} end={node} speed={0.35 + i * 0.08} offset={i * 1.7} />
        </group>
      ))}
    </group>
  );
}
