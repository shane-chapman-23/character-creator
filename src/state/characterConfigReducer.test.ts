/**
 * Reducer unit tests.
 *
 * Focus: reducer behaviour + immutability.
 * External utilities are mocked to keep tests deterministic.
 * Some cases intentionally bypass types to simulate corrupted persisted state.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { createCharacterReducer } from "./characterConfigReducer";
import { DEFAULT_CHARACTER_CONFIG } from "./characterConfig";
import { PALETTES } from "./palettes";
import type { CharacterConfig } from "@/types/character";

// Mock selector utilities so reducer behaviour is predictable.
// In production these may depend on Math.random or dynamic lists,
// but here we force deterministic behaviour to make assertions reliable.
//
// - cycleId: always cycles in a predictable wrap-safe way
// - randomFrom: always picks the first available ID
// - wrapIndex: stable modulo behaviour for colour cycling
//
// This ensures we are testing reducer logic, not randomness.
vi.mock("./selectorUtils", () => {
  const wrap = (i: number, len: number) => {
    if (len <= 0) return 0;
    return ((i % len) + len) % len;
  };

  return {
    cycleId: (ids: string[], current: string, dir: 1 | -1) => {
      if (!ids || ids.length === 0) return current;
      const idx = ids.indexOf(current);
      const base = idx === -1 ? 0 : idx;
      return ids[wrap(base + dir, ids.length)];
    },
    randomFrom: (arr: string[]) => (arr && arr.length ? arr[0] : undefined),
    wrapIndex: (i: number, len: number) => wrap(i, len),
  };
});

// Mock clampConfigToAvailableOptions to identity so that:
// - reset behaviour is deterministic
// - reducer logic can be tested in isolation
// - tests are not affected by persistence safety logic
//
// The reducer still performs its own internal part clamping,
// which is tested separately below.
vi.mock("./characterConfig", async () => {
  const actual =
    await vi.importActual<typeof import("./characterConfig")>(
      "./characterConfig",
    );
  return {
    ...actual,
    clampConfigToAvailableOptions: (cfg: any) => cfg,
  };
});

type StateOverrides = Omit<Partial<CharacterConfig>, "parts" | "colours"> & {
  parts?: Partial<CharacterConfig["parts"]>;
  colours?: Partial<CharacterConfig["colours"]>;
};

// Test state factory.
//
// Creates a fully valid CharacterConfig using DEFAULT_CHARACTER_CONFIG
// while allowing shallow overrides for parts and colours.
//
// This avoids:
// - duplicating full config shape in every test
// - accidental omission of required fields
// - brittle tests when config structure evolves
//
// Nested merging ensures that overriding one part/colour does not
// replace the entire object.

const makeState = (overrides: StateOverrides = {}): CharacterConfig => {
  return {
    ...DEFAULT_CHARACTER_CONFIG,
    ...overrides,
    parts: {
      ...DEFAULT_CHARACTER_CONFIG.parts,
      ...(overrides.parts ?? {}),
    },
    colours: {
      ...DEFAULT_CHARACTER_CONFIG.colours,
      ...(overrides.colours ?? {}),
    },
  };
};

describe("createCharacterReducer", () => {
  const available = {
    hair: ["hair_a", "hair_b", "hair_c"],
    eyes: ["eyes_a", "eyes_b"],
    mouth: ["mouth_a", "mouth_b"],
  } as const;

  const reducer = createCharacterReducer(available as any);

  // Restore all mocks between tests to avoid cross-test leakage
  // (e.g. Math.random spies persisting into later tests).
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("part/set updates only the requested part", () => {
    const state = makeState({
      parts: { hair: "hair_a", eyes: "eyes_a", mouth: "mouth_a" },
    });

    const next = reducer(state, {
      type: "part/set",
      part: "hair",
      id: "hair_c",
    });

    expect(next.parts.hair).toBe("hair_c");
    expect(next.parts.eyes).toBe("eyes_a");
    expect(next.parts.mouth).toBe("mouth_a");
    expect(next).not.toBe(state);
    expect(next.parts).not.toBe(state.parts);
  });

  it("part/cycle uses available IDs and wraps (forward)", () => {
    const state = makeState({ parts: { hair: "hair_c" } });

    const next = reducer(state, { type: "part/cycle", part: "hair", dir: 1 });

    expect(next.parts.hair).toBe("hair_a");
  });

  it("part/cycle wraps (backward)", () => {
    const state = makeState({ parts: { eyes: "eyes_a" } });

    const next = reducer(state, { type: "part/cycle", part: "eyes", dir: -1 });

    expect(next.parts.eyes).toBe("eyes_b");
  });

  type ColourPart = keyof CharacterConfig["colours"];

  it("colour/set sets index when in range", () => {
    const part = Object.keys(PALETTES)[0] as ColourPart;
    const len = PALETTES[part].length;
    expect(len).toBeGreaterThan(0);

    const state = makeState({
      colours: { [part]: 0 } as Partial<CharacterConfig["colours"]>,
    });

    const next = reducer(state, { type: "colour/set", part, index: 1 });

    expect(next.colours[part]).toBe(1);
  });

  it("colour/set clamps below 0 to 0", () => {
    const part = Object.keys(PALETTES)[0] as ColourPart;
    const len = PALETTES[part].length;
    expect(len).toBeGreaterThan(0);

    const state = makeState({
      colours: { [part]: 2 } as Partial<CharacterConfig["colours"]>,
    });

    const next = reducer(state, { type: "colour/set", part, index: -99 });

    expect(next.colours[part]).toBe(0);
  });

  it("colour/set clamps above max to last index", () => {
    const part = Object.keys(PALETTES)[0] as ColourPart;
    const len = PALETTES[part].length;
    expect(len).toBeGreaterThan(0);

    const state = makeState({
      colours: { [part]: 0 } as Partial<CharacterConfig["colours"]>,
    });

    const next = reducer(state, { type: "colour/set", part, index: 999 });

    expect(next.colours[part]).toBe(len - 1);
  });

  it("colour/cycle wraps using palette length", () => {
    const part = Object.keys(PALETTES)[0] as ColourPart;
    const len = PALETTES[part].length;
    expect(len).toBeGreaterThan(0);

    const state = makeState({
      colours: { [part]: len - 1 } as Partial<CharacterConfig["colours"]>,
    });

    const next = reducer(state, { type: "colour/cycle", part, dir: 1 });

    expect(next.colours[part]).toBe(0);
  });

  it("config/randomize picks valid IDs and randomizes colours (deterministic)", () => {
    vi.spyOn(Math, "random").mockReturnValue(0); // always picks index 0

    const state = makeState({
      parts: { hair: "hair_c", eyes: "eyes_b", mouth: "mouth_b" },
      colours: { skin: 2, hair: 3, top: 4, bottom: 5 },
    });

    const next = reducer(state, { type: "config/randomize" });

    // parts still deterministic via mocked randomFrom
    expect(next.parts.hair).toBe("hair_a");
    expect(next.parts.eyes).toBe("eyes_a");
    expect(next.parts.mouth).toBe("mouth_a");

    // colours now deterministic via mocked Math.random
    (Object.keys(PALETTES) as Array<keyof CharacterConfig["colours"]>).forEach(
      (part) => {
        if (PALETTES[part].length > 0) expect(next.colours[part]).toBe(0);
      },
    );
  });

  it("config/randomize keeps existing value when available list is empty", () => {
    const reducer2 = createCharacterReducer({
      hair: [],
      eyes: ["eyes_a"],
      mouth: [],
    } as any);

    const state = makeState({
      parts: { hair: "hair_existing", eyes: "eyes_a", mouth: "mouth_existing" },
    });

    const next = reducer2(state, { type: "config/randomize" });

    expect(next.parts.hair).toBe("hair_existing");
    expect(next.parts.eyes).toBe("eyes_a");
    expect(next.parts.mouth).toBe("mouth_existing");
  });

  it("config/reset returns default (and then is clamped for parts safety)", () => {
    const state = makeState({
      parts: { hair: "hair_b", eyes: "eyes_b", mouth: "mouth_b" },
    });

    const next = reducer(state, { type: "config/reset" });

    expect(next.colours).toEqual(DEFAULT_CHARACTER_CONFIG.colours);
    expect(available.hair).toContain(next.parts.hair);
    expect(available.eyes).toContain(next.parts.eyes);
    expect(available.mouth).toContain(next.parts.mouth);
  });

  // Simulates corrupted runtime state (e.g. from old localStorage data).
  // Although TypeScript prevents invalid OptionIds at compile time,
  // persisted config may contain stale or deleted IDs.
  //
  // Reducer should defensively clamp these to the nearest valid option.
  it("always clamps invalid part IDs even if state already contains invalid IDs", () => {
    const state = makeState({
      parts: { hair: "NOT_REAL", eyes: "eyes_a", mouth: "mouth_a" },
    });

    const next = reducer(state, { type: "config/randomize" });

    expect(next.parts.hair).toBe("hair_a");
  });
});
