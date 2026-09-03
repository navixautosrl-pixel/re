"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { InfrastructureCore } from "./InfrastructureCore";
import { DataParticles } from "./DataParticles";
import { NetworkNodes } from "./NetworkNodes";

function CameraDrift() {
  const { camera } = useThree();
  const base = useRef(new THREE.Vector3(0, 0.25, 6.4));

  /* eslint-disable react-hooks/immutability -- r3f's animation-loop escape
     hatch: useFrame runs outside React's render/commit cycle specifically
     so scene objects can be mutated imperatively every frame. */
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    camera.position.x = base.current.x + Math.sin(t * 0.1) * 0.3;
    camera.position.y = base.current.y + Math.cos(t * 0.08) * 0.15;
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
      camera={{ position: [0, 0.25, 6.4], fov: 38 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#08090a"]} />
      {/* Studio three-point lighting on the metallic core */}
      <ambientLight intensity={0.28} />
      <directionalLight position={[4, 5, 3]} intensity={1.4} color="#f4f4f3" />
      <directionalLight position={[-4, -2, -3]} intensity={0.3} color="#f4f4f3" />
      <pointLight position={[-3, 1, 3]} intensity={0.9} color="#3557d6" />

      <Suspense fallback={null}>
        <InfrastructureCore />
        {!reduced ? <NetworkNodes /> : null}
        <DataParticles count={reduced ? 70 : 200} />
      </Suspense>

      {!reduced ? <CameraDrift /> : null}
    </Canvas>
  );
}
