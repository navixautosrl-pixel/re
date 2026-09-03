"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

const NODE_POSITIONS: [number, number, number][] = [
  [2.5, 1.1, -0.9],
  [-2.6, -0.6, -0.4],
  [2.1, -1.2, 1.3],
  [-1.9, 1.3, 1.0],
];

function PacketOnLine({ start, end, speed, offset }: { start: THREE.Vector3; end: THREE.Vector3; speed: number; offset: number }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = (Math.sin(clock.getElapsedTime() * speed + offset) + 1) / 2;
    ref.current.position.lerpVectors(start, end, t);
    const material = ref.current.material as THREE.MeshStandardMaterial;
    material.emissiveIntensity = 1 + Math.sin(clock.getElapsedTime() * 6 + offset) * 0.35;
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.03, 8, 8]} />
      <meshStandardMaterial color="#9fb4f5" emissive="#3557d6" emissiveIntensity={1} toneMapped={false} />
    </mesh>
  );
}

export function NetworkNodes() {
  const origin = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const nodes = useMemo(() => NODE_POSITIONS.map((p) => new THREE.Vector3(...p)), []);

  return (
    <group>
      {nodes.map((node, i) => (
        <group key={i}>
          <mesh position={node}>
            <icosahedronGeometry args={[0.09, 0]} />
            <meshStandardMaterial
              color="#15171b"
              emissive="#3557d6"
              emissiveIntensity={0.4}
              metalness={0.5}
              roughness={0.3}
            />
          </mesh>
          <Line points={[origin, node]} color="#3557d6" transparent opacity={0.22} lineWidth={1} />
          <PacketOnLine start={origin} end={node} speed={0.3 + i * 0.07} offset={i * 1.7} />
        </group>
      ))}
    </group>
  );
}
