import type {
  CharacterConfig,
  CharacterPart,
  OptionId,
  CharacterColourPart,
  ColourIndex,
} from "@/types/character";
import type { AvailablePartIds } from "./characterConfig";
import {
  DEFAULT_CHARACTER_CONFIG,
  clampConfigToAvailableOptions,
} from "./characterConfig";
import { cycleId, randomFrom, wrapIndex } from "./selectorUtils";
import { PALETTES } from "./palettes";

export type CharacterAction =
  | { type: "part/set"; part: CharacterPart; id: OptionId }
  | { type: "part/cycle"; part: CharacterPart; dir: 1 | -1 }
  | { type: "colour/set"; part: CharacterColourPart; index: ColourIndex }
  | { type: "colour/cycle"; part: CharacterColourPart; dir: 1 | -1 }
  | { type: "config/randomize" }
  | { type: "config/reset" };

// Ensures selected part IDs still exist in available assets (fallback to first valid option if not).
const clampPartsOnly = (
  config: CharacterConfig,
  available: AvailablePartIds,
): CharacterConfig => {
  const safeId = (part: CharacterPart, id: OptionId): OptionId => {
    const ids = available[part];
    if (!ids || ids.length === 0) return id;
    return ids.includes(id) ? id : ids[0];
  };

  return {
    ...config,
    parts: {
      hair: safeId("hair", config.parts.hair),
      eyes: safeId("eyes", config.parts.eyes),
      mouth: safeId("mouth", config.parts.mouth),
    },
  };
};

// Reducer factory that gives the reducer access to the current available part IDs,
// so it can safely cycle, randomize, and validate selections without needing them
// passed in every action.
export const createCharacterReducer =
  (available: AvailablePartIds) =>
  (state: CharacterConfig, action: CharacterAction): CharacterConfig => {
    let next: CharacterConfig = state;

    switch (action.type) {
      case "part/set": {
        next = {
          ...state,
          parts: { ...state.parts, [action.part]: action.id },
        };
        break;
      }

      case "part/cycle": {
        const ids = available[action.part] ?? [];
        const nextId = cycleId(ids, state.parts[action.part], action.dir);
        next = {
          ...state,
          parts: { ...state.parts, [action.part]: nextId },
        };
        break;
      }

      case "colour/set": {
        const len = PALETTES[action.part].length;
        const safe =
          len <= 0 ? 0 : Math.max(0, Math.min(action.index, len - 1));
        next = {
          ...state,
          colours: { ...state.colours, [action.part]: safe },
        };
        break;
      }

      case "colour/cycle": {
        const len = PALETTES[action.part].length;
        const current = state.colours[action.part] ?? 0;
        const nextIndex = wrapIndex(current + action.dir, len);
        next = {
          ...state,
          colours: { ...state.colours, [action.part]: nextIndex },
        };
        break;
      }

      case "config/randomize": {
        const randIndex = (len: number, fallback: number) => {
          if (len <= 0) return fallback;
          return Math.floor(Math.random() * len);
        };

        next = {
          ...state,
          parts: {
            ...state.parts,
            hair: randomFrom(available.hair) || state.parts.hair,
            eyes: randomFrom(available.eyes) || state.parts.eyes,
            mouth: randomFrom(available.mouth) || state.parts.mouth,
          },
          colours: {
            ...state.colours,
            skin: randIndex(PALETTES.skin.length, state.colours.skin),
            hair: randIndex(PALETTES.hair.length, state.colours.hair),
            top: randIndex(PALETTES.top.length, state.colours.top),
            bottom: randIndex(PALETTES.bottom.length, state.colours.bottom),
          },
        };
        break;
      }

      case "config/reset": {
        next = clampConfigToAvailableOptions(
          DEFAULT_CHARACTER_CONFIG,
          available,
        );
        break;
      }

      default: {
        next = state;
        break;
      }
    }

    // Safety: keep saved IDs valid even if assets change between sessions.
    return clampPartsOnly(next, available);
  };
