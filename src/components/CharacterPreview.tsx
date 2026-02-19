import { useMemo } from "react";
import { useCharacterConfig } from "@/state/useCharacterConfig";
import { buildCharacterLayers } from "@/render/buildCharacterLayers";

import TintedLayer from "@/components/TintedLayer";

export default function CharacterPreview() {
  const { config } = useCharacterConfig();
  const layers = useMemo(() => buildCharacterLayers(config), [config]);

  return (
    <div className="relative w-[256px] h-[256px]">
      {layers.map((l) =>
        l.kind === "layered" ? (
          <div key={l.key}>
            <TintedLayer
              src={l.bg}
              colour={l.colour}
              className="absolute inset-0 w-full h-full pixel-art"
            />
            <img
              src={l.outline}
              className="absolute inset-0 w-full h-full pixel-art"
              alt={`${l.altPrefix} outline`}
            />
          </div>
        ) : (
          <img
            key={l.key}
            src={l.src}
            className="absolute inset-0 w-full h-full pixel-art"
            alt={l.alt}
          />
        ),
      )}
    </div>
  );
}
