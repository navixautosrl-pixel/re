"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const BLADE_COUNT = 5;
const LED_COLORS = ["#3b93ff", "#5fb0ff", "#8fcaff"];

function Blade({ index }: { index: number }) {
  const ledRefs = useRef<THREE.Mesh[]>([]);
  const y = index * 0.34 - ((BLADE_COUNT - 1) * 0.34) / 2;
  const ledCount = 4;
  // Deliberately random per-LED phase offset, computed once — see the
  // same note in DataParticles.tsx.
  const seeds = useMemo(
    // eslint-disable-next-line react-hooks/purity
    () => Array.from({ length: ledCount }, () => Math.random() * Math.PI * 2),
    []
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    ledRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const material = mesh.material as THREE.MeshStandardMaterial;
      const pulse = 0.4 + Math.abs(Math.sin(t * (1.4 + i * 0.3) + seeds[i])) * 1.6;
      material.emissiveIntensity = pulse;
    });
  });

  return (
    <group position={[0, y, 0]}>
      {/* Blade chassis */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.6, 0.26, 1.1]} />
        <meshStandardMaterial color="#0b0f17" metalness={0.6} roughness={0.35} />
      </mesh>
      {/* Front face accent */}
      <mesh position={[0, 0, 0.56]}>
        <boxGeometry args={[2.55, 0.2, 0.02]} />
        <meshStandardMaterial color="#131a26" metalness={0.4} roughness={0.5} />
      </mesh>
      {/* LED indicators */}
      {Array.from({ length: ledCount }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) ledRefs.current[i] = el;
          }}
          position={[-1.05 + i * 0.16, 0, 0.58]}
        >
          <boxGeometry args={[0.05, 0.05, 0.02]} />
          <meshStandardMaterial
            color={LED_COLORS[i % LED_COLORS.length]}
            emissive={LED_COLORS[i % LED_COLORS.length]}
            emissiveIntensity={1}
            toneMapped={false}
          />
        </mesh>
      ))}
      {/* Vent slats, suggesting cooling/airflow */}
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh key={`vent-${i}`} position={[0.55 + i * 0.06, 0, 0.57]}>
          <boxGeometry args={[0.02, 0.14, 0.01]} />
          <meshStandardMaterial color="#05070b" />
        </mesh>
      ))}
    </group>
  );
}

export function ServerRack() {
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.15) * 0.18;
  });

  return (
    <group ref={group}>
      {Array.from({ length: BLADE_COUNT }).map((_, i) => (
        <Blade key={i} index={i} />
      ))}
      {/* Chassis frame */}
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={[2.7, BLADE_COUNT * 0.34 + 0.1, 1.14]} />
        <meshStandardMaterial
          color="#04060a"
          metalness={0.7}
          roughness={0.4}
          transparent
          opacity={0.25}
        />
      </mesh>
    </group>
  );
}
