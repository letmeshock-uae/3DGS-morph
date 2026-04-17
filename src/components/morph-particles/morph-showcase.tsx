import type { ThreeElements } from "@react-three/fiber";
import { useMorphControls, type MorphMode } from "./hooks/use-morph-controls";
import { useMorphMaterial } from "./hooks/use-morph-material";
import MorphAssetsCredits from "./morph-assets-credits";
import { useMorphMeshes } from "./hooks/use-morph-meshes";
import { MorphTexturesDebug } from "./morph-textures-debug";
import { useMorphSystemSettings } from "./hooks/use-morph-system-settings";
import { useScrollMorph, type ScrollMorphResult } from "./hooks/use-scroll-morph";
import { useEffect } from "react";

type MorphShowcaseProps = ThreeElements["group"] & {
  mode?: MorphMode;
  onScrollState?: (state: ScrollMorphResult) => void;
};

export default function MorphShowcase({
  mode = "auto",
  onScrollState,
  ...props
}: MorphShowcaseProps) {
  const meshes = useMorphMeshes();
  const { resolution, debug } = useMorphSystemSettings();
  const { material, dataTextures } = useMorphMaterial(resolution, meshes);
  const { controls, activeMesh } = useMorphControls(
    material.uniforms,
    meshes,
    mode,
  );

  const scrollMorphResult = useScrollMorph(
    meshes,
    material.uniforms,
    mode === "scroll",
  );

  useEffect(() => {
    if (scrollMorphResult && onScrollState) {
      onScrollState(scrollMorphResult);
    }
  }, [scrollMorphResult, onScrollState]);

  return (
    <group {...props}>
      <instancedMesh
        key={`particles-${resolution}`}
        args={[undefined, undefined, resolution * resolution]}
        frustumCulled={false}
      >
        <planeGeometry />
        <spriteNodeMaterial
          transparent={controls.transparent}
          blending={controls.blending}
          depthWrite={controls.depthWrite}
          wireframe={controls.wireframe}
          alphaToCoverage={controls.alphaToCoverage}
          {...material.nodes}
        />
      </instancedMesh>

      {debug && (
        <MorphTexturesDebug
          key={`debug-${resolution}`}
          positions={dataTextures.positions}
          uvs={dataTextures.uvs}
          activeMesh={activeMesh}
        />
      )}

      <MorphAssetsCredits activeMesh={activeMesh} />
    </group>
  );
}

export { type MorphMode } from "./hooks/use-morph-controls";
export { type ScrollMorphResult } from "./hooks/use-scroll-morph";
