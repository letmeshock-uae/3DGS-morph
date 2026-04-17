import type { ScrollMorphResult } from "../morph-particles/morph-showcase";
import { capitalize } from "@/utils/capitalize";

type LandingSectionsProps = {
  meshNames: string[];
  scrollMorphState: ScrollMorphResult | null;
};

function getSectionOpacity(
  index: number,
  state: ScrollMorphResult | null,
): number {
  if (!state) return index === 0 ? 1 : 0;

  const { shapeIndexA, shapeIndexB, morphProgress } = state;

  if (index === shapeIndexA && index === shapeIndexB) return 1;

  if (index === shapeIndexA) {
    if (morphProgress < 0.1) return 1;
    if (morphProgress > 0.9) return 0;
    return 1 - morphProgress;
  }

  if (index === shapeIndexB) {
    if (morphProgress > 0.9) return 1;
    if (morphProgress < 0.1) return 0;
    return morphProgress;
  }

  return 0;
}

function getDisplayName(meshName: string): string {
  const parts = meshName.split("_");
  const name = parts.length > 1 ? parts[parts.length - 1] : parts[0];
  return capitalize(name);
}

export default function LandingSections({
  meshNames,
  scrollMorphState,
}: LandingSectionsProps) {
  const totalHeight = (meshNames.length + 1) * 100;
  const heroOpacity = scrollMorphState
    ? Math.max(0, 1 - scrollMorphState.globalProgress * meshNames.length)
    : 1;

  return (
    <div className="relative z-10" style={{ height: `${totalHeight}vh` }}>
      {/* Hero */}
      <div
        className="sticky top-0 flex h-dvh flex-col items-center justify-center px-6 transition-opacity duration-500"
        style={{ opacity: heroOpacity }}
      >
        <h1 className="text-center text-5xl font-black tracking-tight text-white sm:text-7xl md:text-8xl">
          Morphing
          <br />
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
            Particles
          </span>
        </h1>
        <p className="mt-4 text-center text-sm tracking-widest text-white/50 uppercase sm:text-base">
          WebGPU &middot; TSL &middot; React Three Fiber
        </p>

        <div className="mt-12 animate-bounce text-white/30">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </div>

      {/* Morph sections */}
      {meshNames.map((name, i) => {
        const opacity = getSectionOpacity(i, scrollMorphState);
        const displayName = getDisplayName(name);

        return (
          <div key={name} className="sticky top-0 h-dvh">
            <div
              className="pointer-events-none flex h-full items-end justify-start p-8 transition-opacity duration-300 sm:items-center sm:justify-start sm:p-16"
              style={{ opacity }}
            >
              <div className="pointer-events-auto max-w-md">
                <span className="text-xs font-medium tracking-widest text-white/40 uppercase">
                  Shape {i + 1} / {meshNames.length}
                </span>
                <h2 className="mt-2 text-4xl font-bold text-white sm:text-6xl">
                  {displayName}
                </h2>
                <div className="mt-3 h-px w-16 bg-gradient-to-r from-white/60 to-transparent" />
                <p className="mt-4 text-sm leading-relaxed text-white/50 sm:text-base">
                  GPU-driven particle morphing &mdash; {(meshNames.length > 1 ? meshNames.length : 0).toLocaleString()}+ shapes
                  interpolated in real-time using TSL node shaders.
                </p>
              </div>
            </div>
          </div>
        );
      })}

      {/* Final section */}
      <div className="sticky top-0 flex h-dvh flex-col items-center justify-center px-6">
        <div
          className="text-center transition-opacity duration-700"
          style={{
            opacity: scrollMorphState
              ? Math.min(1, Math.max(0, (scrollMorphState.globalProgress - 0.85) / 0.15))
              : 0,
          }}
        >
          <h2 className="text-3xl font-bold text-white sm:text-5xl">
            All shapes explored
          </h2>
          <p className="mt-4 text-sm text-white/50 sm:text-base">
            Built with Three.js TSL, WebGPU, and React Three Fiber
          </p>
          <a
            href="https://github.com"
            target="_blank"
            className="mt-8 inline-block rounded-full border border-white/20 px-8 py-3 text-sm font-medium text-white transition-colors hover:border-white/50 hover:bg-white/5"
          >
            View Source
          </a>
        </div>
      </div>
    </div>
  );
}
