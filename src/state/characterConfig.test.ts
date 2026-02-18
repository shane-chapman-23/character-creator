import { describe, it, expect } from "vitest";
import type { CharacterConfig } from "@/types/character";
import {
  clampConfigToAvailableOptions,
  DEFAULT_CHARACTER_CONFIG,
} from "./characterConfig";
import { PALETTES } from "./palettes";

const makeConfig = (
  overrides: Partial<CharacterConfig> = {},
): CharacterConfig =>
  ({
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
  }) as CharacterConfig;

describe("clampConfigToAvailableOptions", () => {
  it("keeps valid part IDs when they exist in available lists", () => {
    const available = {
      hair: ["hair_0_0", "hair_1_0"],
      eyes: ["eyes0", "eyes1"],
      mouth: ["mouth0", "mouth1"],
    } as any;

    const cfg = makeConfig({
      parts: { hair: "hair_1_0", eyes: "eyes1", mouth: "mouth1" } as any,
    });

    const next = clampConfigToAvailableOptions(cfg, available);

    expect(next.parts).toEqual(cfg.parts);
  });

  it("clamps invalid part IDs to the first available option", () => {
    const available = {
      hair: ["hair_a", "hair_b"],
      eyes: ["eyes_a", "eyes_b"],
      mouth: ["mouth_a", "mouth_b"],
    } as any;

    const cfg = makeConfig({
      parts: { hair: "NOT_REAL", eyes: "eyes_b", mouth: "mouth_b" } as any,
    });

    const next = clampConfigToAvailableOptions(cfg, available);

    expect(next.parts.hair).toBe("hair_a");
    expect(next.parts.eyes).toBe("eyes_b");
    expect(next.parts.mouth).toBe("mouth_b");
  });

  it("keeps the original part ID if the available list is empty (no validation possible)", () => {
    const available = {
      hair: [],
      eyes: ["eyes0"],
      mouth: [],
    } as any;

    const cfg = makeConfig({
      parts: {
        hair: "hair_existing",
        eyes: "eyes0",
        mouth: "mouth_existing",
      } as any,
    });

    const next = clampConfigToAvailableOptions(cfg, available);

    expect(next.parts.hair).toBe("hair_existing");
    expect(next.parts.eyes).toBe("eyes0");
    expect(next.parts.mouth).toBe("mouth_existing");
  });

  it("clamps colour indices to 0 when out of range (negative or too large)", () => {
    // Sanity: palettes exist
    expect(PALETTES.skin.length).toBeGreaterThan(0);
    expect(PALETTES.hair.length).toBeGreaterThan(0);
    expect(PALETTES.top.length).toBeGreaterThan(0);
    expect(PALETTES.bottom.length).toBeGreaterThan(0);

    const available = {
      hair: ["hair_0_0"],
      eyes: ["eyes0"],
      mouth: ["mouth0"],
    } as any;

    const cfg = makeConfig({
      colours: {
        skin: -1,
        hair: 999,
        top: -50,
        bottom: 123456,
      },
    });

    const next = clampConfigToAvailableOptions(cfg, available);

    expect(next.colours.skin).toBe(0);
    expect(next.colours.hair).toBe(0);
    expect(next.colours.top).toBe(0);
    expect(next.colours.bottom).toBe(0);
  });

  it("keeps the original part ID if available[part] is missing at runtime", () => {
    const available = {
      // hair intentionally omitted
      eyes: ["eyes0"],
      mouth: ["mouth0"],
    } as any;

    const cfg = makeConfig({
      parts: { hair: "hair_existing", eyes: "eyes0", mouth: "mouth0" } as any,
    });

    const next = clampConfigToAvailableOptions(cfg, available);

    expect(next.parts.hair).toBe("hair_existing");
  });
});
