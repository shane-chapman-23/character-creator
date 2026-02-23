import { getOrCreateImage, isLoaded } from "./imageCache";

type RenderLayer =
  | {
      key: string;
      kind: "layered";
      bg: string;
      outline: string;
      colour: string;
      altPrefix: string;
    }
  | { key: string; kind: "single"; src: string; alt: string };

const TEMP_CANVAS = document.createElement("canvas");
const TEMP_CTX = TEMP_CANVAS.getContext("2d");

// Draws a solid colour through the alpha of the mask image,
// producing a tinited version of the layer on the main canvas.
function drawTintedMasked(
  ctx: CanvasRenderingContext2D,
  maskImg: HTMLImageElement,
  colour: string,
  w: number,
  h: number,
) {
  if (!TEMP_CTX) return;

  // Ensure temp canvas matches output size
  if (TEMP_CANVAS.width !== w) TEMP_CANVAS.width = w;
  if (TEMP_CANVAS.height !== h) TEMP_CANVAS.height = h;

  // Clear previous frame
  TEMP_CTX.globalCompositeOperation = "source-over";
  TEMP_CTX.clearRect(0, 0, w, h);

  // Draw mask
  TEMP_CTX.drawImage(maskImg, 0, 0, w, h);

  // Fill colour only where pixels exist
  TEMP_CTX.globalCompositeOperation = "source-in";
  TEMP_CTX.fillStyle = colour;
  TEMP_CTX.fillRect(0, 0, w, h);

  // Copy tinted result into main canvas
  ctx.drawImage(TEMP_CANVAS, 0, 0, w, h);
}

// Flattens render layers into a list of image URLs to preload.
export function collectLayerUrls(layers: RenderLayer[]) {
  const urls: string[] = [];
  for (const l of layers) {
    if (l.kind === "single") urls.push(l.src);
    else urls.push(l.bg, l.outline);
  }
  return urls;
}

// Renders the character by drawing each layer in order onto the canvas.
// Layered assets are tinted via mask (bg) then outlines on top.
export function renderCharacterToCanvas(
  ctx: CanvasRenderingContext2D,
  layers: RenderLayer[],
  w: number,
  h: number,
) {
  ctx.clearRect(0, 0, w, h);
  ctx.globalCompositeOperation = "source-over";

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
}

export type { RenderLayer };
