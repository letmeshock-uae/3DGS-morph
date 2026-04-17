/* eslint-disable react-hooks/immutability */
import { useEffect, useMemo } from "react";
import {
  useScrollProgress,
  type ScrollProgressState,
} from "@/hooks/use-scroll-progress";
import type { ParticlesMorphUniforms } from "../config";
import type { MeshAsset } from "./use-morph-meshes";

export type ScrollMorphResult = {
  currentShapeName: string;
  nextShapeName: string;
  morphProgress: number;
  globalProgress: number;
  shapeIndexA: number;
  shapeIndexB: number;
  meshNames: string[];
  scrollState: ScrollProgressState;
};

export function useScrollMorph(
  meshes: MeshAsset[],
  uniforms: ParticlesMorphUniforms,
  enabled: boolean,
): ScrollMorphResult | null {
  const scrollState = useScrollProgress();
  const { scrollProgress } = scrollState;

  const meshNames = useMemo(() => meshes.map((m) => m.name), [meshes]);

  const result = useMemo<ScrollMorphResult>(() => {
    const count = meshes.length;
    if (count < 2) {
      return {
        currentShapeName: meshes[0]?.name ?? "",
        nextShapeName: meshes[0]?.name ?? "",
        morphProgress: 0,
        globalProgress: 0,
        shapeIndexA: 0,
        shapeIndexB: 0,
        meshNames,
        scrollState,
      };
    }

    const morphT = scrollProgress * (count - 1);
    const shapeIndexA = Math.min(Math.floor(morphT), count - 2);
    const shapeIndexB = Math.min(shapeIndexA + 1, count - 1);
    const morphProgress = morphT - shapeIndexA;

    return {
      currentShapeName: meshes[shapeIndexA].name,
      nextShapeName: meshes[shapeIndexB].name,
      morphProgress,
      globalProgress: scrollProgress,
      shapeIndexA,
      shapeIndexB,
      meshNames,
      scrollState,
    };
  }, [scrollProgress, meshes, meshNames, scrollState]);

  useEffect(() => {
    if (!enabled) return;
    const meshA = meshes[result.shapeIndexA];
    const meshB = meshes[result.shapeIndexB];
    if (!meshA || !meshB) return;

    uniforms.meshAIndex.value = meshA.id;
    uniforms.mapA.value = meshA.texture;
    uniforms.meshBIndex.value = meshB.id;
    uniforms.mapB.value = meshB.texture;
  }, [enabled, result.shapeIndexA, result.shapeIndexB, meshes, uniforms]);

  useEffect(() => {
    if (!enabled) return;
    uniforms.animationProgress.value = result.morphProgress;
  }, [enabled, result.morphProgress, uniforms]);

  return enabled ? result : null;
}
