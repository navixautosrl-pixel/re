"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { DetailingScene } from "./DetailingScene";

function CameraDrift() {
  const { camera } = useThree();
  const base = useRef(new THREE.Vector3(0, 0.65, 6.4));

  /* eslint-disable react-hooks/immutability -- r3f's animation-loop escape hatch */
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    camera.position.x = base.current.x + Math.sin(t * 0.1) * 0.3;
    camera.position.y = base.current.y + Math.cos(t * 0.08) * 0.12;
    camera.position.z = base.current.z;
    camera.lookAt(0, 0.15, 0);
  });
  /* eslint-enable react-hooks/immutability */

  return null;
}

export function HeroCanvas3D({ reduced }: { reduced: boolean }) {
  return (
    <Canvas
      dpr={[1, reduced ? 1.25 : 1.75]}
      camera={{ position: [0, 0.65, 6.4], fov: 38 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      shadows
    >
      {/*
        No preset/files on Environment — that would fetch an external HDRI,
        and a network hiccup on that CDN previously took down this entire
        page. Passing Lightformer children instead builds the reflection
        map procedurally, on-device, with zero network calls: a bright
        studio "window" above plus cyan/orange/pink rim cards, so the
        colored paint and rims pick up a colorful studio reflection
        instead of a single flat highlight.
      */}
      <color attach="background" args={["#0c0b0a"]} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[4, 6, 4]} intensity={2.2} color="#ffffff" castShadow />
      <pointLight position={[-3, 2, 3]} intensity={1.2} color="#22d3ee" />
      <pointLight position={[-2, -1.4, 2.5]} intensity={0.9} color="#f0399e" />
      <pointLight position={[3, -1.2, -2]} intensity={0.8} color="#fb923c" />

      <Environment resolution={256} blur={0.7}>
        <Lightformer form="rect" intensity={4} position={[0, 4, 2]} scale={[6, 3, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={2} position={[-4, 1, 3]} scale={[3, 4, 1]} color="#22d3ee" />
        <Lightformer form="rect" intensity={2.4} position={[3, 0, -2]} rotation={[0, Math.PI / 3, 0]} scale={[3, 3, 1]} color="#f0399e" />
        <Lightformer form="rect" intensity={1.6} position={[0, 2.5, -3]} scale={[4, 2, 1]} color="#fb923c" />
      </Environment>

      <Suspense fallback={null}>
        <DetailingScene />
      </Suspense>

      {!reduced ? <CameraDrift /> : null}
    </Canvas>
  );
}
