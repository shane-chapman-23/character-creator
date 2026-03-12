import { getOrCreateImage, isLoaded } from "./imageCache";
import type { RenderLayer } from "@/render/character/buildCharacterLayers";

// A shared off-screen canvas used to tint masked layers.
// We draw the mask into here, apply a colour using its alpha,
// then copy the result onto the real canvas.
//
// This avoids needing pre-coloured textures for every asset.
const TEMP_CANVAS = document.createElement("canvas");
const TEMP_CTX = TEMP_CANVAS.getContext("2d");

// Tints a mask image with a solid colour.
// We:
// 1. draw the mask to a temp canvas
// 2. fill colour only where pixels exist
// 3. copy the tinted result to the main canvas
//
// This lets us colour sprites at runtime
// without storing multiple coloured versions.
function drawTintedMasked(
  ctx: CanvasRenderingContext2D,
  maskImg: HTMLImageElement,
  colour: string,
  w: number,
  h: number,
) {
  if (!TEMP_CTX) return;

  // Match the temp canvas size to the output size.
  if (TEMP_CANVAS.width !== w) TEMP_CANVAS.width = w;
  if (TEMP_CANVAS.height !== h) TEMP_CANVAS.height = h;

  // Clear any previous drawing from the temp canvas.
  TEMP_CTX.globalCompositeOperation = "source-over";
  TEMP_CTX.imageSmoothingEnabled = false;
  TEMP_CTX.clearRect(0, 0, w, h);

  // Draw the mask (defines where colour should appear).
  TEMP_CTX.drawImage(maskImg, 0, 0, w, h);

  // Only fill where the mask has pixels.
  TEMP_CTX.globalCompositeOperation = "source-in";
  TEMP_CTX.fillStyle = colour;
  TEMP_CTX.fillRect(0, 0, w, h);

  // Copy tinted result into main canvas
  ctx.drawImage(TEMP_CANVAS, 0, 0, w, h);
}

// Returns all image URLs needed for a set of layers.
// Used for preloading assets before rendering.
export function collectLayerUrls(layers: RenderLayer[]) {
  const urls: string[] = [];
  for (const l of layers) {
    if (l.kind === "single") urls.push(l.src);
    else urls.push(l.bg, l.outline);
  }
  return urls;
}

// Collects all URLs needed for both body + head layers.
export function collectGroupUrls(group: {
  body: RenderLayer[];
  head: RenderLayer[];
}) {
  return collectLayerUrls([...group.body, ...group.head]);
}

// Draws a list of layers onto the canvas.
// Layered assets are tinted first (bg),
// then outlines are drawn on top.
export function renderLayersToCanvas(
  ctx: CanvasRenderingContext2D,
  layers: RenderLayer[],
  w: number,
  h: number,
) {
  ctx.clearRect(0, 0, w, h);
  ctx.globalCompositeOperation = "source-over";

  for (const l of layers) {
    ctx.globalCompositeOperation = "source-over";

    // Single-layer asset (no tinting needed).
    if (l.kind === "single") {
      const img = getOrCreateImage(l.src);
      if (!isLoaded(img)) continue;
      ctx.drawImage(img, 0, 0, w, h);
    } else {
      // Layered asset: tint background, then draw outline.
      const bg = getOrCreateImage(l.bg);
      const outline = getOrCreateImage(l.outline);

      if (isLoaded(bg)) drawTintedMasked(ctx, bg, l.colour, w, h);
      if (isLoaded(outline)) ctx.drawImage(outline, 0, 0, w, h);
    }
  }
}

// Same as renderLayersToCanvas,
// but allows a transform (like bob/rotation)
// to be applied before drawing.
export function renderLayersToCanvasWithTransform(
  ctx: CanvasRenderingContext2D,
  layers: RenderLayer[],
  w: number,
  h: number,
  drawWithTransform: (ctx: CanvasRenderingContext2D) => void,
) {
  // Save canvas state before applying transform.
  ctx.save();
  ctx.clearRect(0, 0, w, h);
  ctx.globalCompositeOperation = "source-over";

  // Apply caller-provided transform (e.g. head tilt).
  drawWithTransform(ctx);

  // draw layers after transform has been applied
  for (const l of layers) {
    ctx.globalCompositeOperation = "source-over";

    if (l.kind === "single") {
      const img = getOrCreateImage(l.src);
      if (!isLoaded(img)) continue;
      ctx.drawImage(img, 0, 0, w, h);
    } else {
      const bg = getOrCreateImage(l.bg);
      const outline = getOrCreateImage(l.outline);

      if (isLoaded(bg)) drawTintedMasked(ctx, bg, l.colour, w, h);
      if (isLoaded(outline)) ctx.drawImage(outline, 0, 0, w, h);
    }
  }
  // Restore canvas state so future draws aren't affected.
  ctx.restore();
}
