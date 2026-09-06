"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { PaintSphere } from "./PaintSphere";

function CameraDrift() {
  const { camera } = useThree();
  const base = useRef(new THREE.Vector3(0, 0.4, 6.2));

  /* eslint-disable react-hooks/immutability -- r3f's animation-loop escape hatch */
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    camera.position.x = base.current.x + Math.sin(t * 0.1) * 0.3;
    camera.position.y = base.current.y + Math.cos(t * 0.08) * 0.12;
    camera.position.z = base.current.z;
    camera.lookAt(0, 0, 0);
  });
  /* eslint-enable react-hooks/immutability */

  return null;
}

export function HeroCanvas3D({ reduced }: { reduced: boolean }) {
  return (
    <Canvas
      dpr={[1, reduced ? 1.25 : 1.75]}
      camera={{ position: [0, 0.4, 6.2], fov: 36 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      shadows
    >
      {/*
        No environment map (no external HDRI fetch) — a network hiccup on
        that CDN previously took down this entire page. The glossy
        clearcoat highlight instead comes purely from local lights: a
        strong key light plus a few softer fills positioned to catch
        the sphere from different angles, the way a detailing photo
        shoot uses multiple softboxes rather than one giant light.
      */}
      <color attach="background" args={["#0c0b0a"]} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[4, 6, 4]} intensity={2.2} color="#ffffff" castShadow />
      <pointLight position={[-3, 2, 3]} intensity={1.4} color="#ffffff" />
      <pointLight position={[-2, -1, 2.5]} intensity={1} color="#e11d2e" />
      <pointLight position={[3, -1.5, -2]} intensity={0.6} color="#ffffff" />

      <Suspense fallback={null}>
        <PaintSphere />
      </Suspense>

      {!reduced ? <CameraDrift /> : null}
    </Canvas>
  );
}
