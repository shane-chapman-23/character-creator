import type {
  CharacterConfig,
  CharacterPart,
  CharacterColourPart,
} from "@/types/character";
import { AVAILABLE_PART_IDS } from "@/state/availablePartIds";
import { cycleId, wrapIndex } from "@/state/selectorUtils";
import { PALETTES } from "@/state/palettes";

import { buildCharacterLayers } from "@/render/buildCharacterLayers";
import { collectLayerUrls } from "@/render/canvas/canvasRenderer";

/**
 * Returns configs that are exactly 1 click away from the current config:
 * - next/prev for each part
 * - next/prev for each colour
 */
export function getAdjacentConfigs(config: CharacterConfig): CharacterConfig[] {
  const partKeys: CharacterPart[] = ["hair", "eyes", "mouth"];
  const colourKeys: CharacterColourPart[] = ["skin", "hair", "top", "bottom"];

  const out: CharacterConfig[] = [];

  // Adjacent parts (next/prev)
  for (const part of partKeys) {
    const ids = AVAILABLE_PART_IDS[part] ?? [];
    const curr = config.parts[part];

    const nextId = cycleId(ids, curr, 1);
    const prevId = cycleId(ids, curr, -1);

    out.push({ ...config, parts: { ...config.parts, [part]: nextId } });
    out.push({ ...config, parts: { ...config.parts, [part]: prevId } });
  }

  // Adjacent colours (next/prev)
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

export function getConfigUrls(config: CharacterConfig): string[] {
  const layers = buildCharacterLayers(config);
  return collectLayerUrls(layers);
}
