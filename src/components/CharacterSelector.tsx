import { useState, type KeyboardEvent } from "react";
import { useCharacterConfig } from "@/state/useCharacterConfig";
import {
  createCharacterSections,
  CHARACTER_TABS,
} from "./characterSelectorConfig";
import CycleSelector from "./CycleSelector";
import Button from "./ui/Button";

export default function CharacterSelector() {
  const { nextPart, prevPart, nextColour, prevColour, randomizeConfig } =
    useCharacterConfig();

  const [section, setSection] = useState<"body" | "face" | "clothes">("body");

  const sections = createCharacterSections({
    nextPart,
    prevPart,
    nextColour,
    prevColour,
  });

  const controls = sections[section];

  const handleTabKeyDown = (
    e: KeyboardEvent<HTMLButtonElement>,
    currentKey: typeof section,
  ) => {
    const tabKeys = CHARACTER_TABS.map(([key]) => key);
    const currentIndex = tabKeys.indexOf(currentKey);

    if (e.key === "ArrowRight") {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % tabKeys.length;
      setSection(tabKeys[nextIndex]);
      document.getElementById(`tab-${tabKeys[nextIndex]}`)?.focus();
    }

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + tabKeys.length) % tabKeys.length;
      setSection(tabKeys[prevIndex]);
      document.getElementById(`tab-${tabKeys[prevIndex]}`)?.focus();
    }

    if (e.key === "Home") {
      e.preventDefault();
      setSection(tabKeys[0]);
      document.getElementById(`tab-${tabKeys[0]}`)?.focus();
    }

    if (e.key === "End") {
      e.preventDefault();
      setSection(tabKeys[tabKeys.length - 1]);
      document.getElementById(`tab-${tabKeys[tabKeys.length - 1]}`)?.focus();
    }
  };

  return (
    <div className="selector shadow-card/40 p-[1rem] md:h-[21rem] lg:h-[23rem] xl:h-[25rem] 2xl:h-[32rem] 2xl:p-[1.5rem] max-h-[60vh] min-h-[21.6rem]">
      <Button
        onClick={randomizeConfig}
        className="mb-4 mx-auto w-full"
        faceClassName="btn-scale ui-text-lg bg-accent rounded-lg text-text font-inter font-extrabold"
      >
        RANDOM
      </Button>

      <div className="w-full shrink-0">
        <div
          role="tablist"
          aria-label="Character sections"
          className="tab-list "
        >
          {CHARACTER_TABS.map(([key, label]) => {
            const active = section === key;

            return (
              <button
                key={key}
                id={`tab-${key}`}
                role="tab"
                type="button"
                aria-selected={active}
                aria-controls={`panel-${key}`}
                tabIndex={active ? 0 : -1}
                onClick={() => setSection(key)}
                onKeyDown={(e) => handleTabKeyDown(e, key)}
                className={["tab", active ? "tab-active" : "tab-inactive"].join(
                  " ",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div
        id={`panel-${section}`}
        role="tabpanel"
        aria-labelledby={`tab-${section}`}
        tabIndex={-1}
        className="pt-2 px-2 flex-1 min-h-0 overflow-y-auto"
      >
        {controls.map((c) => (
          <div key={c.id}>
            <CycleSelector
              label={c.label}
              onPrev={c.onPrev}
              onNext={c.onNext}
            />
            <div className="inset-divider" />
          </div>
        ))}
      </div>

      <p className="ui-text-sm block mt-auto font-inter text-center text-black/50 text-sm bg-surface z-11">
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
