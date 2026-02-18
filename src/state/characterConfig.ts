import type {
  CharacterConfig,
  CharacterPart,
  OptionId,
} from "@/types/character";
import { PALETTES } from "./palettes";

// If no saved character config found, it will revert back to default
export const DEFAULT_CHARACTER_CONFIG: CharacterConfig = {
  parts: {
    hair: "hair_0_0",
    eyes: "eyes0",
    mouth: "mouth0",
  },
  colours: {
    skin: 0,
    top: 0,
    bottom: 0,
    hair: 0,
  },
};

export type AvailablePartIds = Record<CharacterPart, OptionId[]>;

// If a saved config contains stale IDs (assets changed),
// clamp them back into a currently valid option ID.
export function clampConfigToAvailableOptions(
  config: CharacterConfig,
  available: AvailablePartIds,
): CharacterConfig {
  const safeId = (part: CharacterPart, id: OptionId): OptionId => {
    const ids = available[part];
    // Return original ID if we have no options to validate against.
    if (!ids || ids.length === 0) return id;
    return ids.includes(id) ? id : ids[0];
  };
  const safeColour = (i: number, len: number) =>
    len <= 0 ? 0 : i >= 0 && i < len ? i : 0;

  return {
    ...config,
    parts: {
      hair: safeId("hair", config.parts.hair),
      eyes: safeId("eyes", config.parts.eyes),
      mouth: safeId("mouth", config.parts.mouth),
    },
    colours: {
      skin: safeColour(config.colours.skin, PALETTES.skin.length),
      hair: safeColour(config.colours.hair, PALETTES.hair.length),
      top: safeColour(config.colours.top, PALETTES.top.length),
      bottom: safeColour(config.colours.bottom, PALETTES.bottom.length),
    },
  };
}
