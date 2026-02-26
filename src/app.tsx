import { OrbitControls, useGLTF, useTexture } from "@react-three/drei";
import { Leva, useControls, folder } from "leva";
import { ui } from "./utils/tunnels";
import Canvas from "./components/canvas";
import Lights from "./components/lights";
import MorphShowcase from "./components/morph-particles/morph-showcase";

import { customTheme } from "./utils/leva";
import { Suspense } from "react";
import Loader from "./components/loader";
import StatsMonitor from "./components/stats-monitor";

export default function App() {
  const { autoRotate, rotationTime } = useControls({
    "🎥 Camera": folder({
      autoRotate: {
        label: "Auto Rotate",
        value: true,
      },
      rotationTime: {
        label: "360° Time (s)",
        value: 30,
        min: 1,
        max: 120,
        step: 1,
        render: (get) => get("🎥 Camera.autoRotate"),
      },
    }),
  });

  return (
    <>
      <Loader />

      <ui.Out />



      <Leva theme={customTheme} hideCopyButton flat />
      <Canvas camera={{ position: [-2.73, 1.28, 4.62] }}>
        <OrbitControls
          makeDefault
          target={[0.48, -0.05, 0.17]}
          autoRotate={autoRotate}
          // OrbitControls autoRotateSpeed 2.0 = 30 seconds per orbit.
          // Formula: speed = 60 / seconds
          autoRotateSpeed={60 / rotationTime}
        />
        <StatsMonitor />
        <Lights />

        <Suspense fallback={null}>
          <MorphShowcase position={[0, -1, -1]} />
        </Suspense>
      </Canvas>
    </>
  );
}

useGLTF.preload("/models/models.glb", "/draco/");
useGLTF.preload("/models/button.glb", "/draco/");
useTexture.preload("/textures/noise.png");
