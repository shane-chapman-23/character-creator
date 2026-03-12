import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import useParallaxOffsets from "./useParallaxOffsets";
import type { ParallaxLayer } from "@/data/parallax/parallaxScene";

const layers: ParallaxLayer[] = [
  {
    id: "ground",
    src: "/ground.png",
    baseWidth: 100,
    baseHeight: 20,
    speed: 1,
    anchor: "topToFloor",
    tint: "ground",
    depth: "back",
  },
];

describe("useParallaxOffsets", () => {
  let rafQueue = new Map<number, FrameRequestCallback>();
  let nextRafId = 1;
  const runFrame = (id: number, time: number) => {
    const callback = rafQueue.get(id);
    rafQueue.delete(id);
    callback?.(time);
  };

  beforeEach(() => {
    rafQueue = new Map();
    nextRafId = 1;

    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      const id = nextRafId++;
      rafQueue.set(id, cb);
      return id;
    });

    vi.stubGlobal("cancelAnimationFrame", (id: number) => {
      rafQueue.delete(id);
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("only moves while running is true", () => {
    const node = document.createElement("div");

    const { result, rerender } = renderHook(
      ({ running }) =>
        useParallaxOffsets({
          layers,
          running,
          scale: 1,
        }),
      { initialProps: { running: false } },
    );

    act(() => {
      result.current.registerLayerTrack("ground", node);
    });

    expect(node.style.transform).toBe("translateX(0px)");
    expect(rafQueue.size).toBe(0);

    rerender({ running: true });
    expect(rafQueue.size).toBe(1);

    act(() => {
      runFrame(1, 1000);
    });
    act(() => {
      runFrame(2, 1016);
    });

    const runningOffset = Number(
      node.style.transform.replace("translateX(", "").replace("px)", ""),
    );
    expect(runningOffset).toBeLessThan(0);

    const beforePause = node.style.transform;
    rerender({ running: false });
    expect(rafQueue.size).toBe(0);
    expect(node.style.transform).toBe(beforePause);
  });
});
