import { useEffect, useMemo, useReducer, useRef } from "react";
import { useCharacterConfig } from "@/state/useCharacterConfig";
import { buildCharacterLayers } from "@/render/buildCharacterLayers";
import { renderCharacterToCanvas } from "@/render/canvas/canvasRenderer";
import {
  getOrCreateImage,
  isSettled,
  preloadImages,
} from "@/render/canvas/imageCache";
import { logCanvasLoadState } from "@/render/canvas/canvasDiagnostics";
import { getAdjacentConfigs, getConfigUrls } from "@/render/warmBubble";

const SPRITE_W = 256;
const SPRITE_H = 256;

export default function CharacterPreviewCanvas() {
  const { config, nextRandomConfig } = useCharacterConfig();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [, bumpLoadTick] = useReducer((n: number) => n + 1, 0);

  // Build renderable layers (order matters) from the current config.
  const layers = useMemo(() => buildCharacterLayers(config), [config]);
  const urls = useMemo(
    () => Array.from(new Set(getConfigUrls(config))),
    [config],
  );
  const imgs = useMemo(() => urls.map(getOrCreateImage), [urls]);
  const allSettled = imgs.every(isSettled);

  const warmUrls = useMemo(() => {
    const configs = [config, ...getAdjacentConfigs(config), nextRandomConfig];
    const urls = configs.flatMap(getConfigUrls);
    return Array.from(new Set(urls));
  }, [config, nextRandomConfig]);

  useEffect(() => {
    preloadImages(warmUrls);
  }, [warmUrls]);

  // Sets up the canvas for the current layers, draws immediately,
  // and listens for image load/error events to redraw assets become ready.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Render at native sprite resolution to avoid fractional DPR resampling.
    canvas.width = SPRITE_W;
    canvas.height = SPRITE_H;
    canvas.style.width = "100%";
    canvas.style.height = "100%";

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;

    // Dev-only: logs how many required assets are loaded for this render.
    logCanvasLoadState("CharacterPreview", urls, imgs);

    const draw = () => renderCharacterToCanvas(ctx, layers, SPRITE_W, SPRITE_H);

    draw();

    if (!allSettled) {
      let alive = true;
      const onAnyLoad = () => {
        if (!alive) return;
        bumpLoadTick();
        draw();
      };

      for (const img of imgs) {
        if (isSettled(img)) continue;
        img.addEventListener("load", onAnyLoad);
        img.addEventListener("error", onAnyLoad);
      }

      onAnyLoad();

      return () => {
        alive = false;
        for (const img of imgs) {
          img.removeEventListener("load", onAnyLoad);
          img.removeEventListener("error", onAnyLoad);
        }
      };
    }
  }, [allSettled, layers, urls, imgs]);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pixel-art"
        aria-label="Character preview"
      />

      {!allSettled && (
        <div className="absolute inset-0 grid place-items-center">
          <div className="rounded-xl bg-black/40 px-3 py-2 text-white text-sm">
            Loading…
          </div>
        </div>
      )}
    </div>
  );
}
