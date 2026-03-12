import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import useTintedParallaxSources from "./useTintedParallaxSources";
import type { ParallaxLayer } from "@/data/parallax/parallaxScene";
import tintBackgroundLayer from "@/render/parallax/tintParallaxLayer";

vi.mock("@/render/parallax/tintParallaxLayer", () => ({
  default: vi.fn(),
}));

const mockedTintBackgroundLayer = vi.mocked(tintBackgroundLayer);

const layers: ParallaxLayer[] = [
  {
    id: "city",
    src: "/city.png",
    baseWidth: 1024,
    baseHeight: 512,
    speed: 0.1,
    anchor: "bottomToFloor",
    tint: "city",
    depth: "back",
  },
  {
    id: "grass",
    src: "/grass.png",
    baseWidth: 1024,
    baseHeight: 5,
    speed: 1.4,
    anchor: "bottomToFloor",
    tint: "ground",
    depth: "front",
  },
];

describe("useTintedParallaxSources", () => {
  beforeEach(() => {
    mockedTintBackgroundLayer.mockReset();
  });

  it("stores tinted sources when all layers tint successfully", async () => {
    mockedTintBackgroundLayer.mockImplementation(
      async (src) => `${src}?tinted`,
    );

    const { result } = renderHook(() => useTintedParallaxSources(layers));

    await waitFor(() => {
      expect(result.current.city).toBe("/city.png?tinted");
      expect(result.current.grass).toBe("/grass.png?tinted");
    });
  });

  it("falls back to original layer source if one tint request fails", async () => {
    mockedTintBackgroundLayer.mockImplementation(async (src) => {
      if (src === "/grass.png") throw new Error("boom");
      return `${src}?tinted`;
    });

    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { result } = renderHook(() => useTintedParallaxSources(layers));

    await waitFor(() => {
      expect(result.current.city).toBe("/city.png?tinted");
      expect(result.current.grass).toBe("/grass.png");
    });

    expect(errorSpy).toHaveBeenCalledOnce();
    errorSpy.mockRestore();
  });
});
