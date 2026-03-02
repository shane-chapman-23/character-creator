import { useCharacterConfig } from "@/state/useCharacterConfig";
import CycleSelector from "./CycleSelector";

export default function CharacterSelector() {
  const { nextPart, prevPart, nextColour, prevColour, randomizeConfig } =
    useCharacterConfig();

  const controls = [
    { label: "SKIN", type: "colour", key: "skin" },
    { label: "HAIR", type: "part", key: "hair" },
    { label: "HAIR COLOUR", type: "colour", key: "hair" },
    { label: "EYES", type: "part", key: "eyes" },
    { label: "MOUTH", type: "part", key: "mouth" },

    { label: "SHIRT", type: "colour", key: "top" },
    { label: "SHORTS", type: "colour", key: "bottom" },
  ] as const;

  return (
    <div className="flex flex-col gap-1 py-2 p-4 bg-surface rounded-xl shadow-card/40 border-3 max-w-90">
      <h1 className="text-center text-accent mb-2">CHARACTER CREATOR!</h1>
      {controls.map((c) => (
        <div>
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
          <div className="inset-divider" />
        </div>
      ))}

      <div className="flex gap-2 mt-4">
        <button
          className="p-6 py-2  bg-accent text-text font-inter font-extrabold mx-auto"
          onClick={randomizeConfig}
        >
          Randomize
        </button>
      </div>
    </div>
  );
}
