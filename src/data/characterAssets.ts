import { getLayeredAssetsFor } from "./pairLayeredAssets";
import type { LayeredAsset } from "@/types/character";

// ---------- HEAD ----------
export const HEAD: LayeredAsset[] = getLayeredAssetsFor("head");

// ---------- HAIR ----------
export const HAIR: LayeredAsset[] = getLayeredAssetsFor("hair");

// ---------- EYES ----------
const eyes = import.meta.glob("/src/assets/character/eyes/*.png", {
  eager: true,
  import: "default",
});
export const EYES = Object.values(eyes) as string[];

// ---------- MOUTH ----------
const mouth = import.meta.glob("/src/assets/character/mouth/*.png", {
  eager: true,
  import: "default",
});
export const MOUTH = Object.values(mouth) as string[];

// ---------- BODY ----------

const BODY = getLayeredAssetsFor("body");

// Helper: grab frames for a specific animation + part
const bodyFrames = (
  anim: "idle" | "run",
  part: "arms" | "legs" | "top" | "bottom",
) =>
  BODY.filter(
    (a) =>
      a.bg.includes(`body_${anim}_${part}_`) &&
      a.outline.includes(`body_${anim}_${part}_`),
  ).sort((a, b) => a.bg.localeCompare(b.bg, undefined, { numeric: true }));

export const BODY_IDLE = {
  arms: bodyFrames("idle", "arms"),
  legs: bodyFrames("idle", "legs"),
  top: bodyFrames("idle", "top"),
  bottom: bodyFrames("idle", "bottom"),
};

export const BODY_RUN = {
  arms: bodyFrames("run", "arms"),
  legs: bodyFrames("run", "legs"),
  top: bodyFrames("run", "top"),
  bottom: bodyFrames("run", "bottom"),
};
