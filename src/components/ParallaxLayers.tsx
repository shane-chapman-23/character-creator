import { useMemo } from "react";
import { parallaxScene, type Depth } from "@/data/parallax/parallaxScene";
import useParallaxOffsets from "@/hooks/useParallaxOffsets";
import useTintedParallaxSources from "@/hooks/useTintedParallaxSources";
import { useElementWidth } from "@/hooks/useElementWidth";
import useParallaxTileCounts from "@/hooks/useParallaxTileCounts";
import ParallaxLayerRow from "./ParallaxLayerRow";
import type { Anim } from "@/render/animation/bodyFrames";

type Props = {
  anim: Anim;
  scale: number;
  floorY: number;
  depth: Depth;
};
// Renders one depth layer of the parallax scene by combining
// offset animation, tinted sources, measured container width,
// and repeated tile counts for each layer row.
export default function ParallaxLayers({ anim, scale, floorY, depth }: Props) {
  // Only animate the parallax when the character is running.
  const running = anim === "run";

  // Build the subset of scene layers for the requested depth
  // so front and back layers can be rendered separately.
  const sceneLayers = useMemo(
    () => parallaxScene.filter((layer) => layer.depth === depth),
    [depth],
  );

  // Manage per-layer horizontal offsets and expose a ref callback
  // used by each row to register its scrolling track element.
  const { registerLayerTrack } = useParallaxOffsets({
    layers: sceneLayers,
    running,
    scale,
  });

  // Generate tinted image sources for the active layers.
  const tintedSrcs = useTintedParallaxSources(sceneLayers);

  // Measure the container width so we can calculate how many
  // repeated tiles each layer needs to cover the screen.
  const { ref: rootRef, width: containerWidth } =
    useElementWidth<HTMLDivElement>();

  const tileCountByLayer = useParallaxTileCounts(
    sceneLayers,
    containerWidth,
    scale,
  );

  return (
    <div
      ref={rootRef}
      className={`absolute inset-0 overflow-hidden pointer-events-none ${
        depth === "front" ? "z-20" : "z-0"
      }`}
    >
      {sceneLayers.map((layer) => (
        <ParallaxLayerRow
          key={layer.id}
          layer={layer}
          scale={scale}
          floorY={floorY}
          tileCount={tileCountByLayer[layer.id] ?? 2}
          tintedSrc={tintedSrcs[layer.id]}
          registerLayerTrack={registerLayerTrack}
        />
      ))}
    </div>
  );
}
