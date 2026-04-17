import { Suspense, useCallback, useState } from "react";
import { OrbitControls, useGLTF, useTexture } from "@react-three/drei";
import Canvas from "../canvas";
import Lights from "../lights";
import Loader from "../loader";
import MorphShowcase from "../morph-particles/morph-showcase";
import type { ScrollMorphResult } from "../morph-particles/morph-showcase";
import LandingSections from "./landing-sections";

export default function LandingPage() {
  const [scrollMorphState, setScrollMorphState] =
    useState<ScrollMorphResult | null>(null);

  const handleScrollState = useCallback((state: ScrollMorphResult) => {
    setScrollMorphState(state);
  }, []);

  const meshCount = scrollMorphState?.meshNames.length ?? 0;

  return (
    <div className="relative">
      <Loader />

      <Canvas fixed camera={{ position: [-2.73, 1.28, 4.62] }}>
        <OrbitControls
          makeDefault
          target={[0.48, -0.05, 0.17]}
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
          autoRotate
          autoRotateSpeed={1}
        />
        <Lights />
        <Suspense fallback={null}>
          <MorphShowcase
            mode="scroll"
            onScrollState={handleScrollState}
            position={[0, -1, -1]}
          />
        </Suspense>
      </Canvas>

      <LandingSections meshCount={meshCount} />
    </div>
  );
}

useGLTF.preload("/models/models.glb", "/draco/");
useTexture.preload("/textures/noise.png");
