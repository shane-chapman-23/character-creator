import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

import CharacterPreviewCanvas from "./CharacterPreviewCanvas";

// --- mocks ---

// We don't care about real config here.
vi.mock("@/state/useCharacterConfig", () => ({
  useCharacterConfig: () => ({
    config: {},
  }),
}));

// Force a predictable layer set
vi.mock("@/render/buildCharacterLayers", () => ({
  buildCharacterLayers: () => [
    {
      key: "hair",
      kind: "layered",
      bg: "/hair_bg.png",
      outline: "/hair_outline.png",
      colour: "#fff",
      altPrefix: "hair",
    },
  ],
}));

// Keep references so tests can trigger load later.
let created: Map<string, MockImage>;

class MockImage extends EventTarget {
  complete = false;
  naturalWidth = 0;
  decoding = "";
  private _src = "";

  get src() {
    return this._src;
  }
  set src(v: string) {
    this._src = v;
    created.set(v, this);
  }

  succeedLoad() {
    this.complete = true;
    this.naturalWidth = 256;
    this.dispatchEvent(new Event("load"));
  }
}

// Replace global Image
beforeEach(() => {
  created = new Map();

  vi.stubGlobal("Image", class extends MockImage {} as unknown as typeof Image);
});

describe("CharacterPreviewCanvas", () => {
  it("shows loading overlay until images are ready, then hides it", async () => {
    render(<CharacterPreviewCanvas />);

    // Spinner should be visible initially
    expect(screen.getByText("Loading…")).toBeInTheDocument();

    // Simulate both images loading
    await act(async () => {
      created.get("/hair_bg.png")?.succeedLoad();
      created.get("/hair_outline.png")?.succeedLoad();
    });

    // Spinner should now be gone
    expect(screen.queryByText("Loading…")).not.toBeInTheDocument();
  });
});
