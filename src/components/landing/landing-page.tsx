import { Suspense, useCallback, useState } from "react";
import { OrbitControls, useGLTF, useTexture } from "@react-three/drei";
import Canvas from "../canvas";
import Lights from "../lights";
import Loader from "../loader";
import MorphShowcase from "../morph-particles/morph-showcase";
import type { ScrollMorphResult } from "../morph-particles/morph-showcase";
import LandingSections from "./landing-sections";
import { capitalize } from "@/utils/capitalize";

function ScrollHUD({ state }: { state: ScrollMorphResult | null }) {
  if (!state) return null;

  const parts = state.currentShapeName.split("_");
  const rawName = parts.length > 1 ? parts[parts.length - 1] : parts[0];
  const displayName = capitalize(rawName);

  return (
    <div
      className="fixed right-6 bottom-6 z-20 rounded-xl border border-white/10 bg-black/40 px-4 py-3 font-mono text-xs text-white/70 backdrop-blur-md transition-opacity duration-500"
      style={{ opacity: state.globalProgress > 0.01 ? 1 : 0 }}
    >
      <div className="flex items-center gap-3">
        <span className="text-white/90">{displayName}</span>
        <span className="text-white/30">|</span>
        <span>{(state.globalProgress * 100).toFixed(0)}%</span>
      </div>
      <div className="mt-2 h-px w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-150"
          style={{ width: `${state.globalProgress * 100}%` }}
        />
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [scrollMorphState, setScrollMorphState] =
    useState<ScrollMorphResult | null>(null);

  const handleScrollState = useCallback((state: ScrollMorphResult) => {
    setScrollMorphState(state);
  }, []);

  const meshNames = scrollMorphState?.meshNames ?? [];

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

      <LandingSections
        meshNames={meshNames}
        scrollMorphState={scrollMorphState}
      />

      <ScrollHUD state={scrollMorphState} />
    </div>
  );
}

useGLTF.preload("/models/models.glb", "/draco/");
useTexture.preload("/textures/noise.png");
