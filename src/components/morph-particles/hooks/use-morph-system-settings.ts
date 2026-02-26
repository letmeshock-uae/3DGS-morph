import { useControls, folder } from "leva";
import {
  particlesMorphingConfig as config,
  morphingDebugFolderName,
} from "../config";

/**
 * Separated to prevent circular dependencies (Material depends on Resolution) and isolate destructive state.
 * Unlike uniforms controls, changing 'resolution' alters buffer allocations and requires a hard remount.
 */
export function useMorphSystemSettings() {
  const { resolution, debug } = useControls(morphingDebugFolderName, {
    Appearance: folder({
      resolution: {
        label: "Particle Count",
        value: config.resolution,
        options: {
          "1K (Low)": 32,
          "4K (Medium)": 64,
          "16K (High)": 128,
          "65K (Ultra)": 256,
          "262K (Extreme)": 512,
          "1M (Insane)": 1024,
        },
      },
    }),
    debug: {
      label: "Debug Mode",
      value: false,
    },
  });

  return { resolution, debug };
}
