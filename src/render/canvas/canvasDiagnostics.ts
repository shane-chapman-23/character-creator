import { isLoaded } from "./imageCache";

// ---------------------------------------------
// IMAGE LOAD STATE
// ---------------------------------------------

// Dev-only: logs load state of images needed for the current canvas render.
export function logCanvasLoadState(
  label: string,
  urls: string[],
  imgs: HTMLImageElement[],
) {
  if (!import.meta.env.DEV) return;

  const loaded = imgs.filter(isLoaded).length;
  // "settled" here means the browser is done trying (loaded or errored)
  const settled = imgs.filter((i) => i.complete).length;

  console.debug(
    `[${label}] urls=${urls.length} loaded=${loaded}/${imgs.length} settled=${settled}/${imgs.length}`,
  );
}

// ---------------------------------------------
// CANVAS / CONTEXT READINESS
// ---------------------------------------------

export function warnIfCanvasMissing(
  label: string,
  c: HTMLCanvasElement | null,
) {
  if (!import.meta.env.DEV) return;
  if (!c) console.warn(`[${label}] canvas ref missing`);
}

export function warnIfCtxMissing(
  label: string,
  ctx: CanvasRenderingContext2D | null,
) {
  if (!import.meta.env.DEV) return;
  if (!ctx) console.warn(`[${label}] failed to get 2D context`);
}

// ---------------------------------------------
// RAF HITCH DETECTION
// ---------------------------------------------

type RafTracker = { lastMs: number };

export function makeRafTracker(): RafTracker {
  return { lastMs: 0 };
}

// Dev-only: warns if there's a big frame gap (tab throttling, GC pause, etc.)
export function logRafHitch(
  label: string,
  tracker: RafTracker,
  tMs: number,
  thresholdMs = 120,
) {
  if (!import.meta.env.DEV) return;

  if (tracker.lastMs !== 0) {
    const dt = tMs - tracker.lastMs;
    if (dt > thresholdMs) {
      console.warn(`[${label}] RAF hitch: ${Math.round(dt)}ms`);
    }
  }
  tracker.lastMs = tMs;
}

// ---------------------------------------------
// OPTIONAL: TRANSFORM SANITY (very low noise)
// ---------------------------------------------

export function logTransformDebug(label: string, bobY: number, rotRad: number) {
  if (!import.meta.env.DEV) return;
  // Only log if something looks extreme (keeps console clean)
  if (Math.abs(bobY) > 10 || Math.abs(rotRad) > 0.5) {
    console.warn(`[${label}] unusual transform`, { bobY, rotRad });
  }
}
