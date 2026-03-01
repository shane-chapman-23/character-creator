// Stores already-created Image objects by URL.
// This prevents the same asset being fetched/decoded multiple times.
const IMG_CACHE = new Map<string, HTMLImageElement>();

// Returns an Image for this URL from cache,
// or creates and starts loading it if needed.
//
// This ensures each asset is only fetched and decoded once,
// preventing frame hitches when switching character parts.
export function getOrCreateImage(src: string) {
  const existing = IMG_CACHE.get(src);
  if (existing) return existing;

  const img = new Image();
  // Hint to the browser to decode in the background if possible.
  img.decoding = "async";
  img.src = src;

  IMG_CACHE.set(src, img);
  return img;
}

// True if the image has successfully loaded
// and is ready to be drawn to canvas.
export function isLoaded(img: HTMLImageElement) {
  return img.complete && img.naturalWidth > 0;
}

// True once the image has finished loading,
// either successfully or with an error.
export function isSettled(img: HTMLImageElement) {
  return img.complete;
}

// Preloads a list of image URLs.
// Resolves once all images have either loaded or failed.
export function preloadImages(urls: string[]) {
  // Remove duplicates so we don't attach multiple listeners
  // to the same image.
  const unique = Array.from(new Set(urls));

  return Promise.all(
    unique.map((u) => {
      const img = getOrCreateImage(u);
      // Already finished loading — no need to wait.
      if (isSettled(img)) return Promise.resolve(isLoaded(img));

      return new Promise<boolean>((resolve) => {
        // Called when the image loads or errors.
        // Removes listeners and resolves the promise.
        const done = () => {
          img.removeEventListener("load", done);
          img.removeEventListener("error", done);
          resolve(isLoaded(img));
        };

        img.addEventListener("load", done);
        img.addEventListener("error", done);
      });
    }),
  );
}
