"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * The brand's 3D object: an abstract infrastructure core, not a literal
 * server rack. A solid metallic geodesic form (the "system") with a
 * larger wireframe shell around it (the "network" reading it from
 * outside) — built from primitives, no external model files.
 */
export function InfrastructureCore() {
  const group = useRef<THREE.Group>(null);
  const wireframe = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (group.current) {
      group.current.rotation.y = t * 0.09;
      group.current.rotation.x = Math.sin(t * 0.06) * 0.06;
    }
    if (wireframe.current) {
      wireframe.current.rotation.y = -t * 0.05;
    }
  });

  return (
    <group ref={group}>
      <mesh castShadow receiveShadow>
        <icosahedronGeometry args={[1.15, 2]} />
        <meshStandardMaterial
          color="#15171b"
          metalness={0.85}
          roughness={0.28}
          emissive="#3557d6"
          emissiveIntensity={0.05}
        />
      </mesh>
      <mesh ref={wireframe}>
        <icosahedronGeometry args={[1.55, 1]} />
        <meshBasicMaterial color="#3557d6" wireframe transparent opacity={0.18} />
      </mesh>
    </group>
  );
}
