import type { CharacterConfig } from "@/types/character";
import { HEAD, HAIR, EYES, MOUTH, BODY_IDLE } from "@/data/characterAssets";
import {
  SKIN_COLOURS,
  HAIR_COLOURS,
  TOP_COLOURS,
  BOTTOM_COLOURS,
} from "@/data/characterPalettes";

type RenderLayer =
  | {
      key: string;
      kind: "layered";
      bg: string;
      outline: string;
      colour: string;
      altPrefix: string;
    }
  | { key: string; kind: "single"; src: string; alt: string };

function pickById<T extends { id: string }>(list: readonly T[], id: string): T {
  return list.find((o) => o.id === id) ?? list[0];
}

export function buildCharacterLayers(config: CharacterConfig): RenderLayer[] {
  const eyesOpt = pickById(EYES, config.parts.eyes);
  const mouthOpt = pickById(MOUTH, config.parts.mouth);
  const hairOpt = pickById(HAIR, config.parts.hair);

  const skinColour = SKIN_COLOURS[config.colours.skin];
  const hairColour = HAIR_COLOURS[config.colours.hair];
  const topColour = TOP_COLOURS[config.colours.top];
  const bottomColour = BOTTOM_COLOURS[config.colours.bottom];

  return [
    {
      key: "legs",
      kind: "layered",
      bg: BODY_IDLE.legs[0].value.bg,
      outline: BODY_IDLE.legs[0].value.outline,
      colour: skinColour,
      altPrefix: "legs",
    },
    {
      key: "bottom",
      kind: "layered",
      bg: BODY_IDLE.bottom[0].value.bg,
      outline: BODY_IDLE.bottom[0].value.outline,
      colour: bottomColour,
      altPrefix: "bottom",
    },
    {
      key: "top",
      kind: "layered",
      bg: BODY_IDLE.top[0].value.bg,
      outline: BODY_IDLE.top[0].value.outline,
      colour: topColour,
      altPrefix: "top",
    },
    {
      key: "arms",
      kind: "layered",
      bg: BODY_IDLE.arms[0].value.bg,
      outline: BODY_IDLE.arms[0].value.outline,
      colour: skinColour,
      altPrefix: "arms",
    },
    {
      key: "head",
      kind: "layered",
      bg: HEAD[0].value.bg,
      outline: HEAD[0].value.outline,
      colour: skinColour,
      altPrefix: "head",
    },
    { key: "eyes", kind: "single", src: eyesOpt.value, alt: "eyes" },
    { key: "mouth", kind: "single", src: mouthOpt.value, alt: "mouth" },
    {
      key: "hair",
      kind: "layered",
      bg: hairOpt.value.bg,
      outline: hairOpt.value.outline,
      colour: hairColour,
      altPrefix: "hair",
    },
  ];
}
