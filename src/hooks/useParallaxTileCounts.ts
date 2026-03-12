import { useMemo } from "react";
import { parallaxScene } from "@/data/parallax/parallaxScene";

type Layer = (typeof parallaxScene)[number];

// Determines how many repeating tiles each parallax layer needs
// so horizontal scrolling always covers the container width.
export default function useParallaxTileCounts(
  layers: Layer[],
  containerWidth: number,
  scale: number,
) {
  return useMemo(() => {
    const entries = layers.map((layer) => {
      const tileWidth = layer.baseWidth * scale;

      // Fallback if something goes wrong with scaling.
      // At least two tiles are required for seamless looping.
      if (tileWidth <= 0) {
        return [layer.id, 2] as const;
      }

      // Calculate how many copies of the layer image are needed
      // to fully cover the container width during scrolling.
      // +1 ensures there is always an extra tile ready to slide in.
      const count = Math.max(2, Math.ceil(containerWidth / tileWidth) + 1);

      return [layer.id, count] as const;
    });

    // Convert [id, count][] into { [id]: count }
    return Object.fromEntries(entries);
  }, [layers, containerWidth, scale]);
}
