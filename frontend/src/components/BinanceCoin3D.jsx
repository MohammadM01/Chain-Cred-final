// BinanceCoin3D.js
import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";

function BinanceCoin() {
  // use the existing public asset placed in /public/assets/logo.png
  const logoTexture = useTexture("/assets/logo.png");
  const ref = useRef();

  // simple rotation so it's obvious when the mesh is rendered
  useFrame(() => {
    if (ref.current) ref.current.rotation.y += 0.01;
  });

  return (
    <mesh ref={ref}>
      <cylinderGeometry args={[1, 1, 0.2, 64]} />
      {/* Side material */}
      <meshStandardMaterial attach="material-0" color="#222222" />
      {/* Top face: logo texture (falls back to color if texture missing) */}
      <meshStandardMaterial attach="material-1" map={logoTexture} color="#f3ba2f" />
      {/* Bottom face */}
      <meshStandardMaterial attach="material-2" color="#111111" />
    </mesh>
  );
}

export default function BinanceCoin3D() {
  return (
    <Canvas
      // smaller, centered canvas so it doesn't overflow the layout and is easier to see
      style={{ width: "400px", height: "400px", background: "#181c23", borderRadius: 8 }}
      camera={{ position: [0, 0, 5], fov: 50 }}
      // reduce GPU pressure and make the canvas more robust
      gl={{ antialias: false, powerPreference: "high-performance" }}
      // limit device pixel ratio to reduce GPU memory usage (helps prevent context loss)
      dpr={[1, 1.5]}
      onCreated={(state) => {
        const { gl } = state;
        const canvas = gl.domElement;

        // log context events and attempt to prevent default so the page can restore
        canvas.addEventListener(
          "webglcontextlost",
          (e) => {
            e.preventDefault();
            // eslint-disable-next-line no-console
            console.warn("WebGL context lost on BinanceCoin3D canvas");
          },
          false
        );

        canvas.addEventListener(
          "webglcontextrestored",
          () => {
            // eslint-disable-next-line no-console
            console.info("WebGL context restored on BinanceCoin3D canvas");
            // r3f will recreate resources on next render; you can trigger a state update here if needed
          },
          false
        );
      }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 5, 5]} intensity={0.5} />
      <BinanceCoin />
      <OrbitControls enablePan={false} />
    </Canvas>
  );
}
