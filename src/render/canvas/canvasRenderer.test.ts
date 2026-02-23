import { describe, it, expect } from "vitest";
import type { RenderLayer } from "./canvasRenderer";

import { collectLayerUrls } from "./canvasRenderer";

describe("collectLayerUrls", () => {
  it("collects src for single layers and bg+outline for layered layers", () => {
    const layers: RenderLayer[] = [
      { key: "a", kind: "single", src: "/eyes.png", alt: "eyes" },
      {
        key: "b",
        kind: "layered",
        bg: "/hair_bg.png",
        outline: "/hair_outline.png",
        colour: "#fff",
        altPrefix: "hair",
      },
    ];

    expect(collectLayerUrls(layers)).toEqual([
      "/eyes.png",
      "/hair_bg.png",
      "/hair_outline.png",
    ]);
  });

  it("preserves order (matches render order)", () => {
    const layers: RenderLayer[] = [
      {
        key: "1",
        kind: "layered",
        bg: "/a_bg.png",
        outline: "/a_outline.png",
        colour: "#fff",
        altPrefix: "a",
      },
      { key: "2", kind: "single", src: "/b.png", alt: "b" },
      {
        key: "3",
        kind: "layered",
        bg: "/c_bg.png",
        outline: "/c_outline.png",
        colour: "#fff",
        altPrefix: "c",
      },
    ];

    expect(collectLayerUrls(layers)).toEqual([
      "/a_bg.png",
      "/a_outline.png",
      "/b.png",
      "/c_bg.png",
      "/c_outline.png",
    ]);
  });
});
