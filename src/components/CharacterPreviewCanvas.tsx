import { useEffect, useMemo, useReducer, useRef } from "react";
import { useCharacterConfig } from "@/state/useCharacterConfig";
import { buildCharacterLayers } from "@/render/buildCharacterLayers";
import {
  collectLayerUrls,
  renderCharacterToCanvas,
} from "@/render/canvas/canvasRenderer";
import { getOrCreateImage, isLoaded } from "@/render/canvas/imageCache";
import { logCanvasLoadState } from "@/render/canvas/canvasDiagnostics";

const SPRITE_W = 256;
const SPRITE_H = 256;

export default function CharacterPreviewCanvas() {
  const { config } = useCharacterConfig();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [, bumpLoadTick] = useReducer((n: number) => n + 1, 0);

  // Build renderable layers (order matters) from the current config.
  const layers = useMemo(() => buildCharacterLayers(config), [config]);
  const urls = useMemo(
    () => Array.from(new Set(collectLayerUrls(layers))),
    [layers],
  );
  const allReady = urls.every((url) => isLoaded(getOrCreateImage(url)));

  // Sets up the canvas for the current layers, draws immediately,
  // and listens for image load/error events to redraw assets become ready.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(SPRITE_W * dpr);
    canvas.height = Math.floor(SPRITE_H * dpr);
    canvas.style.width = `${SPRITE_W}px`;
    canvas.style.height = `${SPRITE_H}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;

    const imgs = urls.map(getOrCreateImage);

    // Dev-only: logs how many required assets are loaded for this render.
    logCanvasLoadState("CharacterPreview", urls, imgs);

    const draw = () => renderCharacterToCanvas(ctx, layers, SPRITE_W, SPRITE_H);

    draw();

    if (!allReady) {
      let alive = true;
      const onAnyLoad = () => {
        if (!alive) return;
        bumpLoadTick();
        draw();
      };

      for (const img of imgs) {
        if (isLoaded(img)) continue;
        img.addEventListener("load", onAnyLoad);
        img.addEventListener("error", onAnyLoad);
      }

      return () => {
        alive = false;
        for (const img of imgs) {
          img.removeEventListener("load", onAnyLoad);
          img.removeEventListener("error", onAnyLoad);
        }
      };
    }
  }, [allReady, layers, urls]);

  return (
    <div className="relative w-[256px] h-[256px]">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pixel-art"
        aria-label="Character preview"
      />

      {!allReady && (
        <div className="absolute inset-0 grid place-items-center">
          <div className="rounded-xl bg-black/40 px-3 py-2 text-white text-sm">
            Loading…
          </div>
        </div>
      )}
    </div>
  );
}
