import { isLoaded } from "./imageCache";

// Dev-only: logs load state of images needed for the current canvas render.
export function logCanvasLoadState(
  label: string,
  urls: string[],
  imgs: HTMLImageElement[],
) {
  if (!import.meta.env.DEV) return;

  const loaded = imgs.filter(isLoaded).length;
  const settled = imgs.filter((i) => i.complete).length;

  console.debug(
    `[${label}] urls=${urls.length} loaded=${loaded}/${imgs.length} settled=${settled}/${imgs.length}`,
  );
}
