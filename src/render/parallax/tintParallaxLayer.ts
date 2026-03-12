// Cache tinted results so we only process each src/colour combination once.
const tintedLayerCache = new Map<string, string>();

function createCacheKey(src: string, colour: string) {
  return `${src}::${colour}`;
}

// Creates a tinted version of a parallax mask image using canvas
// compositing and returns it as a data URL.
export default async function tintParallaxLayer(src: string, colour: string) {
  const cacheKey = createCacheKey(src, colour);
  const cached = tintedLayerCache.get(cacheKey);

  // Return cached result if this tint has already been generated.
  if (cached) return cached;

  const img = await loadImage(src);

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  const ctx = canvas.getContext("2d");
  // If canvas is unavailable (very unlikely), fall back to the original image.
  if (!ctx) return src;

  // Disable smoothing to preserve crisp pixel-art edges.
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the mask image first.
  ctx.drawImage(img, 0, 0);

  // Apply the tint colour only where the mask has pixels.
  // "source-in" keeps the fill where the existing image pixels are.
  ctx.globalCompositeOperation = "source-in";
  ctx.fillStyle = colour;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const tintedSrc = canvas.toDataURL();

  // Store result so we don't repeat the canvas work next time.
  tintedLayerCache.set(cacheKey, tintedSrc);

  return tintedSrc;
}

function loadImage(src: string) {
  // Utility to load an image as a Promise so it can be awaited.
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();

    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));

    img.src = src;
  });
}
