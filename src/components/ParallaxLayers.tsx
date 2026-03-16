import ParallaxLayerRow from "./ParallaxLayerRow";
import {
  parallaxScene,
  type Depth,
  type ParallaxThemeName,
} from "@/data/parallax/parallaxScene";

import { useMemo } from "react";
import useParallaxOffsets from "@/hooks/useParallaxOffsets";
import useTintedParallaxSources from "@/hooks/useTintedParallaxSources";
import { useElementWidth } from "@/hooks/useElementWidth";
import useParallaxTileCounts from "@/hooks/useParallaxTileCounts";
import useParallaxCrossfade from "@/hooks/useParallaxCrossfade";

import type { Anim } from "@/render/animation/bodyFrames";

type Props = {
  anim: Anim;
  scale: number;
  floorY: number;
  depth: Depth;
  theme: ParallaxThemeName;
};

const PARALLAX_CROSSFADE_DELAY_MS = 20;

// Renders one depth layer of the parallax scene by combining
// offset animation, tinted sources, measured container width,
// and repeated tile counts for each layer row.
export default function ParallaxLayers({
  anim,
  scale,
  floorY,
  depth,
  theme,
}: Props) {
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
  const nextTintedSrcs = useTintedParallaxSources(sceneLayers, theme);

  const { currentSrcs, previousSrcs, isCrossfading, clearPreviousSrcs } =
    useParallaxCrossfade({
      nextTintedSrcs,
      crossfadeDelayMs: PARALLAX_CROSSFADE_DELAY_MS,
    });

  // Measure the container width so we can calculate how many
  // repeated tiles each layer needs to cover the screen.
  const { ref: rootRef, width: containerWidth } =
    useElementWidth<HTMLDivElement>();

  const tileCountByLayer = useParallaxTileCounts(
    sceneLayers,
    containerWidth,
    scale,
  );

  function renderRows(srcs: Record<string, string>, tracked: boolean) {
    return sceneLayers.map((layer) => (
      <ParallaxLayerRow
        key={layer.id}
        layer={layer}
        scale={scale}
        floorY={floorY}
        tileCount={tileCountByLayer[layer.id] ?? 2}
        tintedSrc={srcs[layer.id]}
        registerLayerTrack={tracked ? registerLayerTrack : undefined}
      />
    ));
  }

  return (
    <div
      ref={rootRef}
      className={`absolute inset-0 overflow-hidden pointer-events-none ${
        depth === "front" ? "z-20" : "z-0"
      }`}
    >
      <div
        className="absolute inset-0"
        style={{
          opacity: isCrossfading ? 1 : previousSrcs ? 0 : 1,
          transition: "opacity var(--theme-duration) var(--theme-ease)",
        }}
      >
        {renderRows(currentSrcs, true)}
      </div>

      {previousSrcs && (
        <div
          className="absolute inset-0"
          style={{
            opacity: isCrossfading ? 0 : 1,
            transition: "opacity var(--theme-duration) var(--theme-ease)",
          }}
          onTransitionEnd={() => {
            if (isCrossfading) {
              clearPreviousSrcs();
            }
          }}
        >
          {renderRows(previousSrcs, true)}
        </div>
      )}
    </div>
  );
}
