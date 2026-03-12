import { useCallback, useEffect, useRef } from "react";
import type { ParallaxLayer } from "@/data/parallax/parallaxScene";

type Options = {
  layers: ParallaxLayer[];
  running: boolean;
  scale: number;
};

// Drives seamless horizontal parallax by storing per-layer offsets
// and updating each layer track with requestAnimationFrame.
function normalizeOffset(offset: number, layerWidth: number) {
  if (layerWidth <= 0) return 0;

  // Keep the offset within one loop width so repeated layers
  // can scroll seamlessly without values growing forever.
  let normalized = offset % layerWidth;
  if (normalized > 0) normalized -= layerWidth;
  return normalized;
}

export default function useParallaxOffsets({
  layers,
  running,
  scale,
}: Options) {
  // Store per-layer offsets without causing React re-renders every frame.
  const offsetsRef = useRef<Record<string, number>>({});

  // Store each rendered track node so transforms can be updated directly.
  const tracksRef = useRef<Record<string, HTMLDivElement | null>>({});

  const frameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const registerLayerTrack = useCallback(
    (id: string, node: HTMLDivElement | null) => {
      tracksRef.current[id] = node;
      if (!node) return;

      // Apply the current saved offset when the node mounts/remounts.
      const offset = offsetsRef.current[id] ?? 0;
      node.style.transform = `translateX(${offset}px)`;
    },
    [],
  );

  useEffect(() => {
    const activeIds = new Set(layers.map((layer) => layer.id));

    // Remove stale layer data if the layer list changes.
    for (const id of Object.keys(offsetsRef.current)) {
      if (!activeIds.has(id)) delete offsetsRef.current[id];
    }

    for (const id of Object.keys(tracksRef.current)) {
      if (!activeIds.has(id)) delete tracksRef.current[id];
    }

    // Re-normalize offsets when scale changes so looping remains correct
    // for the new rendered layer width.
    for (const layer of layers) {
      const layerWidth = layer.baseWidth * scale;
      const current = offsetsRef.current[layer.id] ?? 0;
      const normalized = normalizeOffset(current, layerWidth);
      offsetsRef.current[layer.id] = normalized;

      const node = tracksRef.current[layer.id];
      if (node) node.style.transform = `translateX(${normalized}px)`;
    }
  }, [layers, scale]);

  useEffect(() => {
    if (!running) {
      if (frameRef.current != null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      lastTimeRef.current = null;
      return;
    }

    const tick = (time: number) => {
      if (lastTimeRef.current == null) {
        lastTimeRef.current = time;
      }

      const delta = time - lastTimeRef.current;
      lastTimeRef.current = time;

      for (const layer of layers) {
        const layerWidth = layer.baseWidth * scale;
        const speed = layer.speed * scale * 60;
        const movement = (speed * delta) / 1000;

        const current = offsetsRef.current[layer.id] ?? 0;
        const updated = normalizeOffset(current - movement, layerWidth);
        offsetsRef.current[layer.id] = updated;

        // Update the transform directly for smooth animation without
        // forcing a React render on every animation frame.
        const node = tracksRef.current[layer.id];
        if (node) node.style.transform = `translateX(${updated}px)`;
      }

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current != null) {
        cancelAnimationFrame(frameRef.current);
      }

      frameRef.current = null;
      lastTimeRef.current = null;
    };
  }, [layers, running, scale]);

  return { registerLayerTrack };
}
