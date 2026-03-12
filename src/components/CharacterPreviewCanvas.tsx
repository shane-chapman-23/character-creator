import { useEffect, useMemo, useReducer, useRef } from "react";
import { useCharacterConfig } from "@/state/useCharacterConfig";
import {
  getAdjacentConfigs,
  getConfigUrls,
} from "@/render/character/warmBubble";
import {
  getOrCreateImage,
  isSettled,
  preloadImages,
} from "@/render/character/imageCache";
import { useCharacterPreviewRenderer } from "@/render/character/useCharacterPreviewRenderer";
import type { Anim } from "@/render/animation/bodyFrames";

const SPRITE_W = 256;
const SPRITE_H = 256;

type Props = {
  anim: Anim;
};

export default function CharacterPreviewCanvas({ anim }: Props) {
  // use nextRandomConfig to preload its assets now,
  // so when the player clicks "Randomize" the next character renders instantly
  const { config, nextRandomConfig } = useCharacterConfig();

  const bodyRef = useRef<HTMLCanvasElement | null>(null);
  const headRef = useRef<HTMLCanvasElement | null>(null);

  const animRef = useRef<Anim>(anim);
  useEffect(() => {
    animRef.current = anim;
  }, [anim]);

  // Controlled forced re-render we can call
  // whenever something happens outside React's awareness.
  const [, bumpLoadTick] = useReducer((n: number) => n + 1, 0);

  // Get all image URLs needed to render the current character
  // in both idle and run animations.
  // Use a Set to avoid loading the same image more than once.
  const urls = useMemo(
    () => Array.from(new Set(getConfigUrls(config, ["idle", "run"]))),
    [config],
  );

  // turn URLs into cached HTMLImageElements (creates if not already in cache)
  // this also starts loading them if they aren’t already loaded
  const imgs = useMemo(() => urls.map(getOrCreateImage), [urls]);

  // check if every required image has finished loading (or errored)
  // used to know when it's safe to hide the loading overlay
  const allSettled = imgs.every(isSettled);

  // Preload assets for:
  // - current config
  // - adjacent configs (next/prev parts + colours)
  // - next random config
  //
  // Includes both idle and run animations so switching
  // animation mode later doesn't cause a hitch.
  const warmUrls = useMemo(() => {
    const configs = [config, ...getAdjacentConfigs(config), nextRandomConfig];
    const urls = configs.flatMap((c) => getConfigUrls(c, ["idle", "run"]));
    return Array.from(new Set(urls));
  }, [config, nextRandomConfig]);

  useEffect(() => {
    preloadImages(warmUrls);
  }, [warmUrls]);

  // canvas render loop + cleanup lives in the hook now
  useCharacterPreviewRenderer({
    label: "CharacterPreview",
    bodyRef,
    headRef,
    spriteW: SPRITE_W,
    spriteH: SPRITE_H,
    config,
    imgs,
    animRef,
    bumpLoadTick,
  });

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={bodyRef}
        className="absolute inset-0 pixel-art"
        aria-label="Character body preview"
      />

      <canvas
        ref={headRef}
        className="absolute inset-0 pixel-art"
        aria-label="Character head preview"
      />

      {!allSettled && (
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-white text-xl">Loading…</div>
        </div>
      )}
    </div>
  );
}
