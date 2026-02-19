import { useCharacterConfig } from "@/state/useCharacterConfig";
import CycleSelector from "./CycleSelector";

export default function CharacterSelector() {
  const { nextPart, prevPart, nextColour, prevColour, randomizeConfig, reset } =
    useCharacterConfig();

  const controls = [
    { label: "Skin Tone", type: "colour", key: "skin" },
    { label: "Hair", type: "part", key: "hair" },
    { label: "Hair Colour", type: "colour", key: "hair" },
    { label: "Eyes", type: "part", key: "eyes" },
    { label: "Mouth", type: "part", key: "mouth" },

    { label: "Shirt Colour", type: "colour", key: "top" },
    { label: "Shorts Colour", type: "colour", key: "bottom" },
  ] as const;

  return (
    <div className="flex flex-col gap-3 p-4">
      {controls.map((c) => (
        <CycleSelector
          key={`${c.type}-${c.key}`}
          label={c.label}
          onPrev={() => {
            if (c.type === "part") prevPart(c.key);
            else prevColour(c.key);
          }}
          onNext={() => {
            if (c.type === "part") nextPart(c.key);
            else nextColour(c.key);
          }}
        />
      ))}

      <div className="flex gap-2 mt-4">
        <button
          className="px-3 py-1 rounded bg-green-500"
          onClick={randomizeConfig}
        >
          Randomize
        </button>
        <button className="px-3 py-1 rounded bg-red-500" onClick={reset}>
          Reset
        </button>
      </div>
    </div>
  );
}
