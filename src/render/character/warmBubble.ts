import type {
  CharacterConfig,
  CharacterPart,
  CharacterColourPart,
} from "@/types/character";
import { AVAILABLE_PART_IDS } from "@/state/availablePartIds";
import { cycleId, wrapIndex } from "@/state/selectorUtils";
import { PALETTES } from "@/state/palettes";
import {
  BODY_IDLE,
  BODY_RUN,
  EYES,
  HAIR,
  HEAD,
  MOUTH,
} from "@/data/character/characterAssets";
import { collectLayerUrls } from "@/render/character/canvasRenderer";
import type { Anim } from "../animation/bodyFrames";

// "Warm bubble" preloading.
//
// We preload assets for configs that are 1 step away from the
// current selection (next/prev part or colour).
//
// This reduces visible loading when the user clicks
// next/previous in the character creator.

// Returns configs that are one step away from the current config.
// This includes:
// - next/previous for each character part
// - next/previous for each colour
//
// Used to preload likely next selections.
export function getAdjacentConfigs(config: CharacterConfig): CharacterConfig[] {
  const partKeys: CharacterPart[] = ["hair", "eyes", "mouth"];
  const colourKeys: CharacterColourPart[] = ["skin", "hair", "top", "bottom"];

  // Collect all nearby configs here.
  const out: CharacterConfig[] = [];

  // Generate next/previous configs for each part (hair, eyes, mouth).
  for (const part of partKeys) {
    const ids = AVAILABLE_PART_IDS[part] ?? [];
    const curr = config.parts[part];

    const nextId = cycleId(ids, curr, 1);
    const prevId = cycleId(ids, curr, -1);

    out.push({ ...config, parts: { ...config.parts, [part]: nextId } });
    out.push({ ...config, parts: { ...config.parts, [part]: prevId } });
  }

  // Generate next/previous configs for each colour.
  for (const part of colourKeys) {
    const len = PALETTES[part].length;
    const curr = config.colours[part] ?? 0;

    const nextIndex = wrapIndex(curr + 1, len);
    const prevIndex = wrapIndex(curr - 1, len);

    out.push({ ...config, colours: { ...config.colours, [part]: nextIndex } });
    out.push({ ...config, colours: { ...config.colours, [part]: prevIndex } });
  }

  return out;
}

// Picks an asset option by id, falling back to index 0.
// Keeps preload resilient if config and assets drift.
function pickById<T extends { id: string }>(list: readonly T[], id: string): T {
  return list.find((o) => o.id === id) ?? list[0];
}

// Returns all image URLs needed to render this config
// for the given animation modes (e.g. idle/run).
//
// Important: this collects *all* body frame assets for each anim,
// not just frame 0, so first run/idle switch is already warm.
export function getConfigUrls(
  config: CharacterConfig,
  anims: Anim[] = ["idle"],
): string[] {
  // Static head/face layers for this config.
  const head0 = HEAD[0];
  const eyesOpt = pickById(EYES, config.parts.eyes);
  const mouthOpt = pickById(MOUTH, config.parts.mouth);
  const hairOpt = pickById(HAIR, config.parts.hair);

  const staticUrls = collectLayerUrls([
    {
      key: "head",
      kind: "layered",
      bg: head0.value.bg,
      outline: head0.value.outline,
      colour: "",
      altPrefix: "head",
    },
    { key: "eyes", kind: "single", src: eyesOpt.value, alt: "eyes" },
    { key: "mouth", kind: "single", src: mouthOpt.value, alt: "mouth" },
    {
      key: "hair",
      kind: "layered",
      bg: hairOpt.value.bg,
      outline: hairOpt.value.outline,
      colour: "",
      altPrefix: "hair",
    },
  ]);

  // Body frame layers across requested animations.
  const frameUrls = anims.flatMap((anim) => {
    const bodySet = anim === "run" ? BODY_RUN : BODY_IDLE;
    const frameCount = bodySet.legs.length;

    const urls: string[] = [];
    for (let i = 0; i < frameCount; i++) {
      const legs = bodySet.legs[i] ?? bodySet.legs[0];
      const bottom = bodySet.bottom[i] ?? bodySet.bottom[0];
      const top = bodySet.top[i] ?? bodySet.top[0];
      const arms = bodySet.arms[i] ?? bodySet.arms[0];

      if (!legs || !bottom || !top || !arms) continue;

      urls.push(
        legs.value.bg,
        legs.value.outline,
        bottom.value.bg,
        bottom.value.outline,
        top.value.bg,
        top.value.outline,
        arms.value.bg,
        arms.value.outline,
      );
    }

    return urls;
  });

  return Array.from(new Set([...staticUrls, ...frameUrls]));
}
