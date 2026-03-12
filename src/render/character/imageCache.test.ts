import { describe, it, expect, beforeEach, vi } from "vitest";
import { getOrCreateImage, isLoaded, preloadImages } from "./imageCache";

/**
 * A controllable Image mock so we can simulate:
 * - complete / naturalWidth
 * - load/error events
 * - caching behaviour
 */
class MockImage extends EventTarget {
  decoding: string = "";
  private _src = "";

  // These two are what your isLoaded() checks.
  complete = false;
  naturalWidth = 0;

  get src() {
    return this._src;
  }

  set src(v: string) {
    this._src = v;
    // Do NOT auto-load here. Tests will manually dispatch load/error.
  }

  // Helpers for tests
  succeedLoad() {
    this.complete = true;
    this.naturalWidth = 256;
    this.dispatchEvent(new Event("load"));
  }

  failLoad() {
    this.complete = true;
    this.naturalWidth = 0;
    this.dispatchEvent(new Event("error"));
  }
}

describe("imageCache", () => {
  // We'll keep a registry so tests can access created images by src.
  let createdBySrc: Map<string, MockImage>;

  beforeEach(() => {
    createdBySrc = new Map();

    // Replace global Image with our mock for each test
    vi.stubGlobal(
      "Image",
      class extends MockImage {
        constructor() {
          super();
          // Track the instance once it gets a src
          const originalSetter = Object.getOwnPropertyDescriptor(
            MockImage.prototype,
            "src",
          )!.set!;

          Object.defineProperty(this, "src", {
            get: () => super.src,
            set: (v: string) => {
              originalSetter.call(this, v);
              createdBySrc.set(v, this);
            },
          });
        }
      } as unknown as typeof Image,
    );
  });

  it("getOrCreateImage returns the same instance for the same src", () => {
    const a = getOrCreateImage("/a.png");
    const b = getOrCreateImage("/a.png");
    const c = getOrCreateImage("/b.png");

    expect(a).toBe(b);
    expect(a).not.toBe(c);
  });

  it("isLoaded is true only when complete and naturalWidth > 0", () => {
    const img = getOrCreateImage("/x.png") as unknown as MockImage;

    // default: not loaded
    expect(isLoaded(img as unknown as HTMLImageElement)).toBe(false);

    // complete but failed
    img.complete = true;
    img.naturalWidth = 0;
    expect(isLoaded(img as unknown as HTMLImageElement)).toBe(false);

    // success
    img.naturalWidth = 256;
    expect(isLoaded(img as unknown as HTMLImageElement)).toBe(true);
  });

  it("preloadImages resolves immediately for images already loaded", async () => {
    const img = getOrCreateImage("/ready.png") as unknown as MockImage;
    img.complete = true;
    img.naturalWidth = 256;

    const results = await preloadImages(["/ready.png"]);
    expect(results).toEqual([true]);
  });

  it("preloadImages resolves true after load event", async () => {
    const p = preloadImages(["/load-me.png"]);

    const img = createdBySrc.get("/load-me.png");
    expect(img).toBeTruthy();

    img!.succeedLoad();

    const results = await p;
    expect(results).toEqual([true]);
  });

  it("preloadImages resolves false after error event", async () => {
    const p = preloadImages(["/broken.png"]);

    const img = createdBySrc.get("/broken.png");
    expect(img).toBeTruthy();

    img!.failLoad();

    const results = await p;
    expect(results).toEqual([false]);
  });

  it("preloadImages de-dupes urls", async () => {
    const p = preloadImages(["/dup.png", "/dup.png", "/dup.png"]);

    const img = createdBySrc.get("/dup.png");
    expect(img).toBeTruthy();

    img!.succeedLoad();

    const results = await p;
    // still returns an entry per input URL? No: your code returns per unique URL.
    // So it should be length 1.
    expect(results).toEqual([true]);
  });
});
