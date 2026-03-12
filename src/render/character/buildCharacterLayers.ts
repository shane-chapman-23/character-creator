import type { CharacterConfig } from "@/types/character";
import {
  HEAD,
  HAIR,
  EYES,
  MOUTH,
  BODY_IDLE,
  BODY_RUN,
} from "@/data/character/characterAssets";
import { getBodyFrameIndex, type Anim } from "@/render/animation/bodyFrames";
import {
  SKIN_COLOURS,
  HAIR_COLOURS,
  TOP_COLOURS,
  BOTTOM_COLOURS,
} from "@/data/character/characterPalettes";

// Converts the current character config into a render plan for the canvas.
// Output is two ordered layer lists (body + head) describing:
// - which image files to draw (bg/outline or single sprite)
// - what colour to tint masked layers with
// - which frame to use for the current animation time

// A single thing the canvas renderer can draw.
// - "layered": mask+tint background + outline on top
// - "single": a normal sprite drawn as-is (eyes/mouth, etc.)
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

// The renderer draws body + head separately so we can transform the head
// (bob/tilt) without affecting the body.
type RenderGroup = {
  body: RenderLayer[];
  head: RenderLayer[];
};

// Picks an option by id, falling back to the first option if the id is missing.
// (Helps keep the app resilient if assets/config get out of sync.)
function pickById<T extends { id: string }>(list: readonly T[], id: string): T {
  return list.find((o) => o.id === id) ?? list[0];
}

// Like arr[0], but throws a clear error if the asset list is empty.
// Empty asset lists usually mean a broken import or missing files.
function firstOrThrow<T>(arr: readonly T[], label: string): T {
  const v = arr[0];
  if (!v) throw new Error(`[assets] Missing ${label} (array is empty)`);
  return v;
}

// Builds the exact draw order for the current character.
// `t` is time in seconds (used to pick the animation frame).
export function buildCharacterLayers(
  config: CharacterConfig,
  anim: Anim,
  t: number,
): RenderGroup {
  // Find the selected assets for the current config.
  // If an id is invalid, we fall back to the first available option.
  const eyesOpt = pickById(EYES, config.parts.eyes);
  const mouthOpt = pickById(MOUTH, config.parts.mouth);
  const hairOpt = pickById(HAIR, config.parts.hair);

  // Head currently only has one base option, but we keep the structure flexible.
  const head0 = firstOrThrow(HEAD, "HEAD[0]");

  // Convert palette indexes from config into actual colour strings.
  const skinColour = SKIN_COLOURS[config.colours.skin];
  const hairColour = HAIR_COLOURS[config.colours.hair];
  const topColour = TOP_COLOURS[config.colours.top];
  const bottomColour = BOTTOM_COLOURS[config.colours.bottom];

  // Choose which animation set to use.
  const bodySet = anim === "run" ? BODY_RUN : BODY_IDLE;

  // Pick the frame number based on time.
  // frameCount is taken from legs, but all body parts should have matching lengths.
  const frameCount = bodySet.legs.length;
  const frame = getBodyFrameIndex(anim, t, frameCount);

  // Pull out the current frame for each body part.
  // Fallback to frame 0 if something is missing to avoid crashing silently.
  const legs = bodySet.legs[frame] ?? bodySet.legs[0];
  const bottom = bodySet.bottom[frame] ?? bodySet.bottom[0];
  const top = bodySet.top[frame] ?? bodySet.top[0];
  const arms = bodySet.arms[frame] ?? bodySet.arms[0];

  // If any core frame is missing, it's an asset/data bug we want to notice immediately.
  if (!legs || !bottom || !top || !arms) {
    throw new Error(`[assets] Missing body frame: anim=${anim} frame=${frame}`);
  }

  // Body render order matters: legs -> clothes -> arms.
  // (Arms are on top so they don't get hidden by the shirt.)

  // NOTE: altPrefix is a human-readable label for this layer
  // (e.g. "legs", "hair") used for debugging, accessibility,
  // or future features like exports or layer visibility.
  const body: RenderLayer[] = [
    {
      key: "legs",
      kind: "layered",
      bg: legs.value.bg,
      outline: legs.value.outline,
      colour: skinColour,
      altPrefix: "legs",
    },
    {
      key: "bottom",
      kind: "layered",
      bg: bottom.value.bg,
      outline: bottom.value.outline,
      colour: bottomColour,
      altPrefix: "bottom",
    },
    {
      key: "top",
      kind: "layered",
      bg: top.value.bg,
      outline: top.value.outline,
      colour: topColour,
      altPrefix: "top",
    },
    {
      key: "arms",
      kind: "layered",
      bg: arms.value.bg,
      outline: arms.value.outline,
      colour: skinColour,
      altPrefix: "arms",
    },
  ];

  // Head render order matters: base head -> face -> hair.
  const head: RenderLayer[] = [
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

  return { body, head };
}

export type { RenderLayer, RenderGroup };
