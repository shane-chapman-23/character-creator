import React, {
  createContext,
  useEffect,
  useMemo,
  useReducer,
  useCallback,
} from "react";
import type {
  CharacterConfig,
  CharacterPart,
  OptionId,
  CharacterColourPart,
  ColourIndex,
} from "@/types/character";
import type { AvailablePartIds } from "./characterConfig";
import {
  DEFAULT_CHARACTER_CONFIG,
  clampConfigToAvailableOptions,
} from "./characterConfig";
import { createCharacterReducer } from "./characterConfigReducer";
import { AVAILABLE_PART_IDS } from "./availablePartIds";
import { PALETTES } from "./palettes";

// Versioned key so we can invalidate old persisted shapes safely.
const STORAGE_KEY = "character_config_v1";

export type CharacterConfigContextValue = {
  config: CharacterConfig;
  nextRandomConfig: CharacterConfig;

  // Part selection (stable IDs)
  setPartId: (part: CharacterPart, id: OptionId) => void;
  nextPart: (part: CharacterPart) => void;
  prevPart: (part: CharacterPart) => void;

  setColourIndex: (part: CharacterColourPart, index: ColourIndex) => void;
  nextColour: (part: CharacterColourPart) => void;
  prevColour: (part: CharacterColourPart) => void;

  // Simple randomize
  randomizeConfig: () => void;

  // Convenience: reset to defaults
  reset: () => void;
};

function buildRandomConfig(
  base: CharacterConfig,
  available: AvailablePartIds,
): CharacterConfig {
  const randFrom = (ids: OptionId[], fallback: OptionId) => {
    if (ids.length === 0) return fallback;
    return ids[Math.floor(Math.random() * ids.length)]!;
  };

  const randIndex = (len: number, fallback: number) => {
    if (len <= 0) return fallback;
    return Math.floor(Math.random() * len);
  };

  return {
    ...base,
    parts: {
      ...base.parts,
      hair: randFrom(available.hair ?? [], base.parts.hair),
      eyes: randFrom(available.eyes ?? [], base.parts.eyes),
      mouth: randFrom(available.mouth ?? [], base.parts.mouth),
    },
    colours: {
      ...base.colours,
      skin: randIndex(PALETTES.skin.length, base.colours.skin),
      hair: randIndex(PALETTES.hair.length, base.colours.hair),
      top: randIndex(PALETTES.top.length, base.colours.top),
      bottom: randIndex(PALETTES.bottom.length, base.colours.bottom),
    },
  };
}

// eslint-disable-next-line react-refresh/only-export-components
export const CharacterConfigContext =
  createContext<CharacterConfigContextValue | null>(null);

export function CharacterConfigProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const reducer = createCharacterReducer(AVAILABLE_PART_IDS);
  // useReducer manages the character config and provides dispatch for updates.
  // We use lazy init so the starting config is loaded from localStorage once
  // (and clamped to currently available parts) instead of recalculating every render.
  // Clamping ensures any saved config only contains valid part IDs.
  // (e.g. if an asset was deleted/renamed since last session, we fallback to a safe option)
  const [config, dispatch] = useReducer(
    reducer,
    undefined,
    (): CharacterConfig => {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULT_CHARACTER_CONFIG;

      try {
        const parsed = JSON.parse(raw) as CharacterConfig;
        return clampConfigToAvailableOptions(parsed, AVAILABLE_PART_IDS);
      } catch {
        return DEFAULT_CHARACTER_CONFIG;
      }
    },
  );

  const nextRandomConfig = useMemo(() => {
    return clampConfigToAvailableOptions(
      buildRandomConfig(config, AVAILABLE_PART_IDS),
      AVAILABLE_PART_IDS,
    );
  }, [config]);

  // Persist after any config mutation so refresh keeps current selections.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [config]);

  const setPartId = useCallback((part: CharacterPart, id: OptionId) => {
    dispatch({ type: "part/set", part, id });
  }, []);

  const nextPart = useCallback((part: CharacterPart) => {
    dispatch({ type: "part/cycle", part, dir: 1 });
  }, []);

  const prevPart = useCallback((part: CharacterPart) => {
    dispatch({ type: "part/cycle", part, dir: -1 });
  }, []);

  const setColourIndex = useCallback(
    (part: CharacterColourPart, index: ColourIndex) => {
      dispatch({ type: "colour/set", part, index });
    },
    [],
  );

  const nextColour = useCallback((part: CharacterColourPart) => {
    dispatch({ type: "colour/cycle", part, dir: 1 });
  }, []);

  const prevColour = useCallback((part: CharacterColourPart) => {
    dispatch({ type: "colour/cycle", part, dir: -1 });
  }, []);

  const randomizeConfig = useCallback(() => {
    dispatch({ type: "config/apply", config: nextRandomConfig });
  }, [nextRandomConfig]);

  const reset = useCallback(() => {
    dispatch({ type: "config/reset" });
  }, []);

  // Memoized context value prevents needless rerenders in consumers.
  const value = useMemo<CharacterConfigContextValue>(
    () => ({
      config,
      nextRandomConfig,
      setPartId,
      nextPart,
      prevPart,
      setColourIndex,
      nextColour,
      prevColour,
      randomizeConfig,
      reset,
    }),
    [
      config,
      nextRandomConfig,
      setPartId,
      nextPart,
      prevPart,
      setColourIndex,
      nextColour,
      prevColour,
      randomizeConfig,
      reset,
    ],
  );

  return (
    <CharacterConfigContext.Provider value={value}>
      {children}
    </CharacterConfigContext.Provider>
  );
}
