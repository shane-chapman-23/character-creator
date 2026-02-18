import type { CharacterColourPart } from "@/types/character";
import {
  SKIN_COLOURS,
  HAIR_COLOURS,
  TOP_COLOURS,
  BOTTOM_COLOURS,
} from "@/data/characterPalettes";

export const PALETTES: Record<CharacterColourPart, readonly string[]> = {
  skin: SKIN_COLOURS,
  hair: HAIR_COLOURS,
  top: TOP_COLOURS,
  bottom: BOTTOM_COLOURS,
};
