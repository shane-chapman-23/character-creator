import { useState } from "react";
import { useCharacterConfig } from "@/state/useCharacterConfig";
import CycleSelector from "./CycleSelector";

export default function CharacterSelector() {
  const { nextPart, prevPart, nextColour, prevColour, randomizeConfig } =
    useCharacterConfig();

  const [section, setSection] = useState<"body" | "face" | "clothes">("body");

  const sections = {
    body: [
      { label: "Skin", type: "colour", key: "skin" },
      { label: "Hair", type: "part", key: "hair" },
      { label: "Hair Colour", type: "colour", key: "hair" },
    ],
    face: [
      { label: "Eyes", type: "part", key: "eyes" },
      { label: "Mouth", type: "part", key: "mouth" },
    ],
    clothes: [
      { label: "Shirt", type: "colour", key: "top" },
      { label: "Shorts", type: "colour", key: "bottom" },
    ],
  } as const;

  const controls = sections[section];

  return (
    <div className="flex flex-col py-2 p-4 bg-surface rounded-xl shadow-card/40 border-3 max-w-90 h-80 items-center font-inter">
      <div className="flex gap-2 items-center w-full mb-2">
        <button className="btn m-2" onClick={randomizeConfig}>
          <span className="btn__face p-[4px] bg-accent rounded-lg text-text font-inter font-extrabold">
            RANDOM
          </span>
        </button>
      </div>
      <div className="w-full">
        {/* Tab bar */}
        <div className="flex gap border-b-3 border-text px-1">
          {(
            [
              ["body", "BODY"],
              ["face", "FACE"],
              ["clothes", "CLOTHES"],
            ] as const
          ).map(([key, label]) => {
            const active = section === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSection(key)}
                className={[
                  // base tab shape
                  "px-4 py-2 font-extrabold uppercase",
                  "rounded-t-xl",
                  "border-t-3 border-x-3 border-text",
                  // remove the "button press" feel for tabs (optional)
                  "shadow-none",
                  // make tabs sit on the bottom border
                  "-mb-[3px]",
                  "cursor-pointer",
                  // inactive vs active
                  active
                    ? "bg-surface text-text border-b-surface"
                    : "bg-black/40 text-surface border-b-text  hover:opacity-100",
                ].join(" ")}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Content panel (looks connected to active tab) */}
        <div className="pt-3">
          <div className="min-h-[100px] max-h-[100px] flex flex-col justify-start mb-4">
            {controls.map((c) => (
              <div key={`${c.type}-${c.key}`}>
                <CycleSelector
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
          </div>
        </div>
      </div>
      <p className="block mt-auto font-inter text-center text-black/50 text-sm">
        Interested in working together? <br />
        Email me at{" "}
        <a href="mailto:chapman.shane@proton.me" className="text-blue-700">
          {" "}
          chapman.shane@proton.me
        </a>
      </p>
    </div>
  );
}
