import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import {
  DataTexture,
  Material,
  Mesh,
  RGBAFormat,
  Texture,
  UnsignedByteType,
} from "three";

/* Fallback Texture */
const white = new Uint8Array([255, 255, 255, 255]);
const defaultTex = new DataTexture(white, 1, 1);
defaultTex.format = RGBAFormat;
defaultTex.type = UnsignedByteType;
defaultTex.needsUpdate = true;

type TexturedMaterial = Material & {
  map?: Texture | null;
};

export type MeshAsset = {
  id: number;
  name: string;
  mesh: Mesh;
  texture: Texture;
};

// Dynamically gather all .glb files from public/models using Vite glob
const glbPaths = Object.keys(import.meta.glob("/public/models/*.glb"))
  .map(path => path.replace("/public", ""))
  .filter(path => !path.includes("button.glb"));

export function useMorphMeshes() {
  const results = useGLTF(glbPaths, "/draco/");
  const gltfArray = Array.isArray(results) ? results : [results];

  const meshes = useMemo<MeshAsset[]>(() => {
    let index = 0;
    const assets: MeshAsset[] = [];
    
    gltfArray.forEach((gltf, i) => {
      if (!gltf || !gltf.nodes) return;
      const fileName = glbPaths[i].split('/').pop()?.replace('.glb', '') || `model_${i}`;
      
      Object.entries(gltf.nodes).forEach(([nodeName, obj]) => {
        if (obj instanceof Mesh) {
          const mat = obj.material as TexturedMaterial;
          const texture = mat?.map || defaultTex;
          assets.push({
            name: `${fileName}_${nodeName}`,
            mesh: obj as Mesh,
            id: index++,
            texture,
          });
        }
      });
    });
    
    return assets;
  }, [gltfArray]);

  return meshes;
}
