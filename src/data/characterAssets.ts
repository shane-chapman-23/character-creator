import { getLayeredAssetsFor } from "./pairLayeredAssets";
import { getSingleLayerAssetsFor } from "./singleLayerAssets";
import type { CharacterOption, LayeredAsset } from "@/types/character";

// ---------- HEAD ----------
export const HEAD: CharacterOption<LayeredAsset>[] =
  getLayeredAssetsFor("head");

// ---------- HAIR ----------
export const HAIR: CharacterOption<LayeredAsset>[] =
  getLayeredAssetsFor("hair");

// ---------- EYES ----------
export const EYES: CharacterOption<string>[] = getSingleLayerAssetsFor("eyes");

// ---------- MOUTH ----------
export const MOUTH: CharacterOption<string>[] =
  getSingleLayerAssetsFor("mouth");

// ---------- BODY ----------
const BODY: CharacterOption<LayeredAsset>[] = getLayeredAssetsFor("body");

// Partition the flat BODY list into animation/part buckets for rendering.
const bodyFrames = (
  anim: "idle" | "run",
  part: "arms" | "legs" | "top" | "bottom",
) =>
  BODY.filter(
    (a) =>
      a.value.bg.includes(`body_${anim}_${part}_`) &&
      a.value.outline.includes(`body_${anim}_${part}_`),
  )
    // Numeric sort keeps frame 2 before frame 10.
    .sort((a, b) =>
      a.value.bg.localeCompare(b.value.bg, undefined, { numeric: true }),
    );

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
