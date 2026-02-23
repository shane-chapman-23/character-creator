import { describe, it, expect, vi, afterEach } from "vitest";
import { wrapIndex, cycleId, randomFrom } from "./selectorUtils";
import type { OptionId } from "@/types/character";

describe("wrapIndex", () => {
  it("returns 0 when len <= 0", () => {
    expect(wrapIndex(5, 0)).toBe(0);
    expect(wrapIndex(-5, 0)).toBe(0);
    expect(wrapIndex(5, -2)).toBe(0);
  });

  it("wraps forward indexes", () => {
    expect(wrapIndex(0, 3)).toBe(0);
    expect(wrapIndex(1, 3)).toBe(1);
    expect(wrapIndex(2, 3)).toBe(2);
    expect(wrapIndex(3, 3)).toBe(0);
    expect(wrapIndex(4, 3)).toBe(1);
  });

  it("wraps negative indexes", () => {
    expect(wrapIndex(-1, 3)).toBe(2);
    expect(wrapIndex(-2, 3)).toBe(1);
    expect(wrapIndex(-3, 3)).toBe(0);
    expect(wrapIndex(-4, 3)).toBe(2);
  });
});

describe("cycleId", () => {
  it("returns currentId when ids is empty", () => {
    expect(cycleId([], "x", 1)).toBe("x");
    expect(cycleId([], "x", -1)).toBe("x");
  });

  it("cycles forward and wraps", () => {
    const ids: OptionId[] = ["a", "b", "c"];
    expect(cycleId(ids, "a", 1)).toBe("b");
    expect(cycleId(ids, "b", 1)).toBe("c");
    expect(cycleId(ids, "c", 1)).toBe("a");
  });

  it("cycles backward and wraps", () => {
    const ids: OptionId[] = ["a", "b", "c"];
    expect(cycleId(ids, "a", -1)).toBe("c");
    expect(cycleId(ids, "c", -1)).toBe("b");
    expect(cycleId(ids, "b", -1)).toBe("a");
  });

  it("recovers when currentId is not found by starting at 0", () => {
    const ids: OptionId[] = ["a", "b", "c"];
    // start=0; dir=1 -> "b"
    expect(cycleId(ids, "NOT_REAL", 1)).toBe("b");
    // start=0; dir=-1 -> wraps to last
    expect(cycleId(ids, "NOT_REAL", -1)).toBe("c");
  });
});

describe("randomFrom", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns "" when ids is empty', () => {
    expect(randomFrom([])).toBe("");
  });

  it("returns the element at the computed random index", () => {
    const ids: OptionId[] = ["a", "b", "c"];

    vi.spyOn(Math, "random").mockReturnValue(0); // idx=0
    expect(randomFrom(ids)).toBe("a");

    vi.spyOn(Math, "random").mockReturnValue(0.999); // idx=2
    expect(randomFrom(ids)).toBe("c");
  });
});
