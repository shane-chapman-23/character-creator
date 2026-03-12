import { useEffect } from "react";
import { buildCharacterLayers } from "@/render/character/buildCharacterLayers";
import {
  collectLayerUrls,
  renderLayersToCanvas,
  renderLayersToCanvasWithTransform,
} from "./canvasRenderer";
import { getOrCreateImage, isSettled } from "./imageCache";
import {
  logCanvasLoadState,
  makeRafTracker,
  logRafHitch,
  warnIfCanvasMissing,
  warnIfCtxMissing,
  // optional:
  // logTransformDebug,
} from "./canvasDiagnostics";
import type { Anim } from "@/render/animation/bodyFrames";
import type { CharacterConfig } from "@/types/character";

const deg = (d: number) => (d * Math.PI) / 180;

type Args = {
  label?: string;

  bodyRef: React.RefObject<HTMLCanvasElement | null>;
  headRef: React.RefObject<HTMLCanvasElement | null>;

  spriteW: number;
  spriteH: number;

  config: CharacterConfig;
  imgs: HTMLImageElement[];

  animRef: { current: Anim }; // simple, no React type drama
  bumpLoadTick: () => void;
};

export function useCharacterPreviewRenderer({
  label = "CharacterPreview",
  bodyRef,
  headRef,
  spriteW,
  spriteH,
  config,
  imgs,
  animRef,
  bumpLoadTick,
}: Args) {
  // Effect owns the whole canvas render loop lifecycle:
  // - runs after mount (and whenever deps change)
  // - grabs the actual <canvas> elements from refs
  // - sets them up for pixel-art rendering
  // - starts a requestAnimationFrame loop
  // - cleans up RAF + event listeners on unmount / deps change
  useEffect(() => {
    // Read refs *inside* the effect so we get the real DOM nodes
    // after React has mounted them (no extra rerender needed).
    const bodyCanvas = bodyRef.current;
    const headCanvas = headRef.current;

    // DEV-ONLY: warn if the canvas refs haven't been attached yet.
    // This usually means the component hasn't mounted, or the ref
    // wasn't passed correctly to the <canvas>.
    warnIfCanvasMissing(`${label}/body`, bodyCanvas);
    warnIfCanvasMissing(`${label}/head`, headCanvas);

    // fail safely and wait for next effect run
    if (!bodyCanvas || !headCanvas) return;

    // get 2d references for head and body canvases
    const bodyCtx = bodyCanvas.getContext("2d");
    const headCtx = headCanvas.getContext("2d");

    // DEV-ONLY: warn if the browser failed to give us a 2D context.
    warnIfCtxMissing(`${label}/body`, bodyCtx);
    warnIfCtxMissing(`${label}/head`, headCtx);

    // fail safely and wait for next effect run
    if (!bodyCtx || !headCtx) return;

    // DEV-ONLY: track requestAnimationFrame timing so we can warn about
    // stutters/hitches (e.g. GC pause, background tab throttling, heavy work).
    const rafTracker = makeRafTracker();

    // set the internal drawing resolution to match our sprite size,
    // then use CSS to scale it up on screen.
    // this avoids blurry resampling and keeps pixel art crisp
    for (const c of [bodyCanvas, headCanvas]) {
      c.width = spriteW;
      c.height = spriteH;
      c.style.width = "100%";
      c.style.height = "100%";
    }

    // reset canvas transforms to a clean slate,
    // and disable smoothing so scaled pixel art stays crisp
    bodyCtx.setTransform(1, 0, 0, 1, 0, 0);
    headCtx.setTransform(1, 0, 0, 1, 0, 0);
    bodyCtx.imageSmoothingEnabled = false;
    headCtx.imageSmoothingEnabled = false;

    // DEV-ONLY: At t=0, figure out which image URLs are required to draw
    // the very first frame (body + head), then log how many are already loaded.
    // This helps debug missing assets, broken URLs, or slow-loading layers.
    {
      const anim0 = animRef.current;
      const group0 = buildCharacterLayers(config, anim0, 0);
      const requiredUrls = Array.from(
        new Set([
          ...collectLayerUrls(group0.body),
          ...collectLayerUrls(group0.head),
        ]),
      );
      const requiredImgs = requiredUrls.map(getOrCreateImage);
      logCanvasLoadState(label, requiredUrls, requiredImgs);
    }

    // Used to control our animation loop.
    // `alive` stops drawing when the component unmounts.
    // `raf` stores the current animation frame id so we can cancel it later.
    let alive = true;
    let raf = 0;

    // Draw one frame of the character animation.
    const drawFrame = (tMs: number) => {
      const anim = animRef.current;

      // Turn time from milliseconds into seconds
      // so our animation runs smoothly on all machines.
      const t = tMs / 1000;

      // Build the layers needed for this exact frame.
      const group = buildCharacterLayers(config, anim, t);

      // --- BODY ---
      // Draw the body normally.
      renderLayersToCanvas(bodyCtx, group.body, spriteW, spriteH);

      // --- HEAD ---
      // Make the head gently bob up and down.
      const bobY = Math.round(Math.sin(t * -6) * 1);

      // If running, also tilt the head slightly.
      const rot = anim === "run" ? Math.sin(t * 10) * deg(3) : 0;

      // This is the point the head rotates around (neck area).
      const pivotX = spriteW / 2;
      const pivotY = 200;

      // Draw the head with the bob/rotation applied.
      renderLayersToCanvasWithTransform(
        headCtx,
        group.head,
        spriteW,
        spriteH,
        (ctx) => {
          ctx.translate(pivotX, pivotY + bobY);
          if (rot) ctx.rotate(rot);
          ctx.translate(-pivotX, -pivotY);
        },
      );
    };

    // Runs every frame (~60 times per second).
    // Draws the next frame, then schedules another.
    const tick = (tMs: number) => {
      if (!alive) return;

      logRafHitch(label, rafTracker, tMs);
      drawFrame(tMs);

      raf = requestAnimationFrame(tick);
    };

    // Start the animation loop.
    raf = requestAnimationFrame(tick);

    // When any required image finishes loading (or fails),
    // force a small React re-render so the loading overlay can update.
    const onAnyLoad = () => {
      if (!alive) return;
      bumpLoadTick();
    };

    // Listen for when each image finishes loading.
    // Skip any that are already done.
    for (const img of imgs) {
      if (isSettled(img)) continue;

      img.addEventListener("load", onAnyLoad);
      img.addEventListener("error", onAnyLoad);
    }

    // Run this once now in case an image finished loading
    // before we attached the event listeners.
    onAnyLoad();

    // Cleanup when the component unmounts or this effect reruns.
    // Stops the animation loop and removes image listeners.
    return () => {
      // Tell the animation loop to stop running.
      alive = false;
      // Cancel the next scheduled frame.
      cancelAnimationFrame(raf);
      // Remove image load/error listeners
      // so they don't fire after unmount.
      for (const img of imgs) {
        img.removeEventListener("load", onAnyLoad);
        img.removeEventListener("error", onAnyLoad);
      }
    };
  }, [
    label,
    bodyRef,
    headRef,
    spriteW,
    spriteH,
    config,
    imgs,
    animRef,
    bumpLoadTick,
  ]);
}
