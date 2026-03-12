import { useEffect, useState } from "react";
import tintParallaxLayer from "@/render/parallax/tintParallaxLayer";
import {
  getParallaxPalette,
  parallaxPalettes,
  parallaxScene,
  type ParallaxThemeName,
} from "@/data/parallax/parallaxScene";

type Layer = (typeof parallaxScene)[number];

// Builds tinted image sources for each parallax layer and returns
// them as a map keyed by layer id.
export default function useTintedParallaxSources(
  layers: Layer[],
  theme: ParallaxThemeName,
) {
  const [tintedSrcs, setTintedSrcs] = useState<Record<string, string>>({});

  useEffect(() => {
    // Prevent state updates if the component unmounts while
    // async tint generation is still in progress.
    let cancelled = false;

    async function buildTheme(themeName: ParallaxThemeName) {
      const palette = getParallaxPalette(themeName);
      // Tint all layer sources in parallel. allSettled lets us keep
      // successful results even if one layer fails to process.
      const results = await Promise.allSettled(
        layers.map(async (layer) => {
          const tintedSrc = await tintParallaxLayer(
            layer.src,
            palette[layer.tint],
          );

          return [layer.id, tintedSrc] as const;
        }),
      );

      const entries = results.map((result, index) => {
        const layer = layers[index];

        if (result.status === "fulfilled") {
          return result.value;
        }

        // Fall back to the original untinted source if tinting fails,
        // so one broken layer does not break the whole background.
        console.error(
          `Failed to tint parallax layer "${layer.id}"`,
          result.reason,
        );
        return [layer.id, layer.src] as const;
      });

      return Object.fromEntries(entries);
    }

    async function build() {
      const activeThemeSrcs = await buildTheme(theme);

      if (!cancelled) {
        setTintedSrcs(activeThemeSrcs);
      }

      // Warm the cache for the remaining themes so future theme switches
      // can crossfade immediately instead of waiting on canvas work.
      const remainingThemes = Object.keys(parallaxPalettes).filter(
        (themeName) => themeName !== theme,
      ) as ParallaxThemeName[];

      await Promise.allSettled(remainingThemes.map((themeName) => buildTheme(themeName)));
    }

    build();

    return () => {
      cancelled = true;
    };
  }, [layers, theme]);

  return tintedSrcs;
}
