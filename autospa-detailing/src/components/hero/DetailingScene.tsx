"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, RoundedBox, Sparkles } from "@react-three/drei";
import * as THREE from "three";

/**
 * The brand's 3D signature, take two: not an abstract sphere but the
 * actual subject — a stylized modified car (colored paint, colored rims,
 * underglow, LED tail lights) getting detailed, with soap bubbles and a
 * wax-shimmer sparkle field around it. Built entirely from primitives —
 * no external model file, so no extra network dependency.
 */
function Wheel({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, -0.34, z]} rotation={[0, 0, Math.PI / 2]}>
      <mesh castShadow>
        <torusGeometry args={[0.26, 0.1, 16, 32]} />
        <meshStandardMaterial color="#111111" roughness={0.85} metalness={0.1} />
      </mesh>
      <mesh castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.13, 24]} />
        <meshPhysicalMaterial color="#fb923c" metalness={0.9} roughness={0.2} clearcoat={1} envMapIntensity={1.3} />
      </mesh>
    </group>
  );
}

function CarModel() {
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();
    group.current.rotation.y = Math.sin(t * 0.15) * 0.35 + 0.4;
    group.current.position.y = Math.sin(t * 0.6) * 0.03;
  });

  return (
    <group ref={group}>
      <RoundedBox args={[2.4, 0.5, 1.1]} radius={0.12} smoothness={4} position={[0, 0, 0]} castShadow>
        <meshPhysicalMaterial color="#22d3ee" metalness={0.65} roughness={0.22} clearcoat={1} clearcoatRoughness={0.08} envMapIntensity={1.4} />
      </RoundedBox>
      <RoundedBox args={[1.15, 0.4, 0.92]} radius={0.16} smoothness={4} position={[-0.15, 0.44, 0]} castShadow>
        <meshPhysicalMaterial color="#0a0a0b" metalness={0.3} roughness={0.08} clearcoat={1} envMapIntensity={1} />
      </RoundedBox>

      <Wheel x={0.82} z={0.58} />
      <Wheel x={0.82} z={-0.58} />
      <Wheel x={-0.82} z={0.58} />
      <Wheel x={-0.82} z={-0.58} />

      <mesh position={[1.18, 0.02, 0.3]}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2.2} />
      </mesh>
      <mesh position={[1.18, 0.02, -0.3]}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2.2} />
      </mesh>
      <mesh position={[-1.19, 0.08, 0.32]}>
        <boxGeometry args={[0.05, 0.12, 0.22]} />
        <meshStandardMaterial color="#f0399e" emissive="#f0399e" emissiveIntensity={2.4} />
      </mesh>
      <mesh position={[-1.19, 0.08, -0.32]}>
        <boxGeometry args={[0.05, 0.12, 0.22]} />
        <meshStandardMaterial color="#f0399e" emissive="#f0399e" emissiveIntensity={2.4} />
      </mesh>

      {/* Underglow — the neon-under-the-chassis look that's the literal
          signature of urban modified-car culture, as a cyan tint cast onto
          the floor beneath the car (no extra geometry — a lit ring mesh
          here produced a stray mirror-floor reflection streak). */}
      <pointLight position={[0, -0.55, 0]} color="#22d3ee" intensity={0.5} distance={1.6} decay={2} />
    </group>
  );
}

function Bubble({ position, scale, color }: { position: [number, number, number]; scale: number; color: string }) {
  return (
    <Float speed={1.2} floatIntensity={0.8} rotationIntensity={0.4} floatingRange={[-0.15, 0.15]}>
      <mesh position={position} scale={scale} castShadow>
        <sphereGeometry args={[1, 32, 32]} />
        <meshPhysicalMaterial
          color={color}
          transmission={0.9}
          thickness={0.3}
          roughness={0.05}
          iridescence={1}
          iridescenceIOR={1.3}
          iridescenceThicknessRange={[100, 400]}
          envMapIntensity={1.6}
        />
      </mesh>
    </Float>
  );
}

export function DetailingScene() {
  return (
    <group>
      <CarModel />

      <Bubble position={[1.7, 0.9, 0.4]} scale={0.16} color="#ffffff" />
      <Bubble position={[-1.6, 1.1, -0.5]} scale={0.12} color="#f0399e" />
      <Bubble position={[1.3, 1.5, -0.7]} scale={0.09} color="#22d3ee" />
      <Bubble position={[-1.3, 0.6, 0.8]} scale={0.1} color="#ffffff" />
      <Bubble position={[0.2, 1.7, 0.9]} scale={0.13} color="#fb923c" />

      <Sparkles count={40} scale={[4.5, 2.4, 4]} size={2.2} speed={0.25} color="#f4f1ec" opacity={0.6} />
      <Sparkles count={16} scale={[3.5, 1.6, 3]} size={3} speed={0.15} color="#22d3ee" opacity={0.5} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.05, 0]} receiveShadow>
        <circleGeometry args={[4.2, 64]} />
        <meshPhysicalMaterial color="#0c0b0a" metalness={0.3} roughness={0.15} clearcoat={1} clearcoatRoughness={0.1} />
      </mesh>
    </group>
  );
}
