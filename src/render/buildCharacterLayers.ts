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

function firstOrThrow<T>(arr: readonly T[], label: string): T {
  const v = arr[0];
  if (!v) throw new Error(`[assets] Missing ${label} (array is empty)`);
  return v;
}

export function buildCharacterLayers(config: CharacterConfig): RenderLayer[] {
  const eyesOpt = pickById(EYES, config.parts.eyes);
  const mouthOpt = pickById(MOUTH, config.parts.mouth);
  const hairOpt = pickById(HAIR, config.parts.hair);

  const legs0 = firstOrThrow(BODY_IDLE.legs, "BODY_IDLE.legs[0]");
  const bottom0 = firstOrThrow(BODY_IDLE.bottom, "BODY_IDLE.bottom[0]");
  const top0 = firstOrThrow(BODY_IDLE.top, "BODY_IDLE.top[0]");
  const arms0 = firstOrThrow(BODY_IDLE.arms, "BODY_IDLE.arms[0]");
  const head0 = firstOrThrow(HEAD, "HEAD[0]");

  const skinColour = SKIN_COLOURS[config.colours.skin];
  const hairColour = HAIR_COLOURS[config.colours.hair];
  const topColour = TOP_COLOURS[config.colours.top];
  const bottomColour = BOTTOM_COLOURS[config.colours.bottom];

  return [
    {
      key: "legs",
      kind: "layered",
      bg: legs0.value.bg,
      outline: legs0.value.outline,
      colour: skinColour,
      altPrefix: "legs",
    },
    {
      key: "bottom",
      kind: "layered",
      bg: bottom0.value.bg,
      outline: bottom0.value.outline,
      colour: bottomColour,
      altPrefix: "bottom",
    },
    {
      key: "top",
      kind: "layered",
      bg: top0.value.bg,
      outline: top0.value.outline,
      colour: topColour,
      altPrefix: "top",
    },
    {
      key: "arms",
      kind: "layered",
      bg: arms0.value.bg,
      outline: arms0.value.outline,
      colour: skinColour,
      altPrefix: "arms",
    },
    {
      key: "head",
      kind: "layered",
      bg: head0.value.bg,
      outline: head0.value.outline,
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
