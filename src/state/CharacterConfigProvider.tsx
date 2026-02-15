import React, { createContext, useEffect, useMemo, useState } from "react";
import type {
  CharacterConfig,
  CharacterPart,
  OptionId,
} from "@/types/character";
import {
  DEFAULT_CHARACTER_CONFIG,
  clampConfigToAvailableIds,
} from "./characterConfig";
import { AVAILABLE_PART_IDS } from "./availablePartIds";
import { cycleId, randomFrom } from "./selectorUtils";

// Versioned key so we can invalidate old persisted shapes safely.
const STORAGE_KEY = "character_config_v1";

export type CharacterConfigContextValue = {
  config: CharacterConfig;

  // Part selection (stable IDs)
  setPartId: (part: CharacterPart, id: OptionId) => void;
  nextPart: (part: CharacterPart) => void;
  prevPart: (part: CharacterPart) => void;

  // Simple randomize (only selects parts, doesn’t touch colours)
  randomizeParts: () => void;

  // Convenience: reset to defaults
  reset: () => void;
};

export const CharacterConfigContext =
  createContext<CharacterConfigContextValue | null>(null);

export function CharacterConfigProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [config, setConfig] = useState<CharacterConfig>(() => {
    // Lazy init avoids reading localStorage on every render.
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CHARACTER_CONFIG;

    try {
      const parsed = JSON.parse(raw) as CharacterConfig;
      // Assets can change between releases; clamp keeps stale saves usable.
      return clampConfigToAvailableIds(parsed, AVAILABLE_PART_IDS);
    } catch {
      return DEFAULT_CHARACTER_CONFIG;
    }
  });

  // Persist after any config mutation so refresh keeps current selections.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [config]);

  const setPartId = (part: CharacterPart, id: OptionId) => {
    setConfig((prev) => ({
      ...prev,
      parts: {
        ...prev.parts,
        [part]: id,
      },
    }));
  };

  const nextPart = (part: CharacterPart) => {
    const ids = AVAILABLE_PART_IDS[part];
    setConfig((prev) => {
      const nextId = cycleId(ids, prev.parts[part], 1);
      return {
        ...prev,
        parts: {
          ...prev.parts,
          [part]: nextId,
        },
      };
    });
  };

  const prevPart = (part: CharacterPart) => {
    const ids = AVAILABLE_PART_IDS[part];
    setConfig((prev) => {
      const nextId = cycleId(ids, prev.parts[part], -1);
      return {
        ...prev,
        parts: {
          ...prev.parts,
          [part]: nextId,
        },
      };
    });
  };

  const randomizeParts = () => {
    setConfig((prev) => ({
      ...prev,
      parts: {
        // Fallbacks keep behavior stable if an option list is unexpectedly empty.
        hair: randomFrom(AVAILABLE_PART_IDS.hair) || prev.parts.hair,
        eyes: randomFrom(AVAILABLE_PART_IDS.eyes) || prev.parts.eyes,
        mouth: randomFrom(AVAILABLE_PART_IDS.mouth) || prev.parts.mouth,
      },
    }));
  };

  const reset = () => {
    setConfig(
      clampConfigToAvailableIds(DEFAULT_CHARACTER_CONFIG, AVAILABLE_PART_IDS),
    );
  };

  // Memoized context value prevents needless rerenders in consumers.
  const value = useMemo<CharacterConfigContextValue>(
    () => ({
      config,
      setPartId,
      nextPart,
      prevPart,
      randomizeParts,
      reset,
    }),
    [config],
  );

  return (
    <CharacterConfigContext.Provider value={value}>
      {children}
    </CharacterConfigContext.Provider>
  );
}
