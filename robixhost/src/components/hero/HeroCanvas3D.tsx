"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { ServerRack } from "./ServerRack";
import { DataParticles } from "./DataParticles";
import { NetworkNodes } from "./NetworkNodes";

function CameraDrift() {
  const { camera } = useThree();
  const base = useRef(new THREE.Vector3(0, 0.4, 6.2));

  // r3f's animation-loop escape hatch: useFrame runs outside React's
  // render/commit cycle specifically so scene objects (like the camera
  // from useThree) can be mutated imperatively every frame — this is the
  // documented r3f pattern, not application render-purity being violated.
  /* eslint-disable react-hooks/immutability */
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    camera.position.x = base.current.x + Math.sin(t * 0.12) * 0.35;
    camera.position.y = base.current.y + Math.cos(t * 0.09) * 0.18;
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
      camera={{ position: [0, 0.4, 6.2], fov: 42 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#05070b"]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 5, 3]} intensity={1.1} color="#e7ecf2" />
      <pointLight position={[-3, -2, 2]} intensity={0.6} color="#3b93ff" />

      <Suspense fallback={null}>
        <group rotation={[0.05, 0, 0]}>
          <ServerRack />
          {!reduced ? <NetworkNodes /> : null}
          <DataParticles count={reduced ? 90 : 260} />
        </group>
      </Suspense>

      {!reduced ? <CameraDrift /> : null}
    </Canvas>
  );
}
