const IMG_CACHE = new Map<string, HTMLImageElement>();

// Returns a cached Image() if one already exists for this URL
// Ensures each asset is only fetched/decoded once, so switching
// character parts later doesn't cause render-time hitch.
export function getOrCreateImage(src: string) {
  const existing = IMG_CACHE.get(src);
  if (existing) return existing;

  const img = new Image();
  img.decoding = "async";
  img.src = src;

  IMG_CACHE.set(src, img);
  return img;
}

// True if the image has finished loading successfully and is ready to draw.
export function isLoaded(img: HTMLImageElement) {
  return img.complete && img.naturalWidth > 0;
}

// True once the image has either loaded or failed.
export function isSettled(img: HTMLImageElement) {
  return img.complete;
}

// Preloads a set of image URLs and resolves when all are ready to draw.
export function preloadImages(urls: string[]) {
  // Remove duplicate URLs so we don't attach multiple listeners per image.
  const unique = Array.from(new Set(urls));

  return Promise.all(
    unique.map((u) => {
      const img = getOrCreateImage(u);
      if (isSettled(img)) return Promise.resolve(isLoaded(img));

      return new Promise<boolean>((resolve) => {
        // When the image loads or errors, clean up listeners and resolve.
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
