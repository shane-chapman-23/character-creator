import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  reportLayeredAssetDiagnostics,
  reportSingleLayerAssetDiagnostics,
} from "./assetDiagnostics";

describe("assetDiagnostics reporters (dev-only)", () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  describe("reportLayeredAssetDiagnostics", () => {
    it("does nothing when everything is empty", () => {
      reportLayeredAssetDiagnostics({
        unrecognized: [],
        duplicates: [],
        missingBg: [],
        missingOutline: [],
      } as any);

      expect(warnSpy).not.toHaveBeenCalled();
    });

    it("warns for unrecognized filenames", () => {
      reportLayeredAssetDiagnostics({
        unrecognized: ["/a.png", "/b.png"],
        duplicates: [],
        missingBg: [],
        missingOutline: [],
      } as any);

      expect(warnSpy).toHaveBeenCalledTimes(1);
      const msg = warnSpy.mock.calls[0][0] as string;
      expect(msg).toContain("[character assets] Unrecognized filenames:");
      expect(msg).toContain("/a.png");
      expect(msg).toContain("/b.png");
    });

    it("warns for duplicate keys (includes key + paths)", () => {
      reportLayeredAssetDiagnostics({
        unrecognized: [],
        duplicates: [
          {
            key: "hair_0_0",
            existingPath: "/old.png",
            newPath: "/new.png",
          },
        ],
        missingBg: [],
        missingOutline: [],
      } as any);

      expect(warnSpy).toHaveBeenCalledTimes(1);
      const msg = warnSpy.mock.calls[0][0] as string;
      expect(msg).toContain("[character assets] Duplicate keys:");
      expect(msg).toContain('"hair_0_0"');
      expect(msg).toContain("Existing: /old.png");
      expect(msg).toContain("New: /new.png");
    });

    it("warns for missing bg layers", () => {
      reportLayeredAssetDiagnostics({
        unrecognized: [],
        duplicates: [],
        missingBg: ["hair_2_0", "head_1_0"],
        missingOutline: [],
      } as any);

      expect(warnSpy).toHaveBeenCalledTimes(1);
      const msg = warnSpy.mock.calls[0][0] as string;
      expect(msg).toContain("[character assets] Missing bg layer for:");
      expect(msg).toContain("hair_2_0");
      expect(msg).toContain("head_1_0");
    });

    it("warns for missing outline layers", () => {
      reportLayeredAssetDiagnostics({
        unrecognized: [],
        duplicates: [],
        missingBg: [],
        missingOutline: ["hair_2_0"],
      } as any);

      expect(warnSpy).toHaveBeenCalledTimes(1);
      const msg = warnSpy.mock.calls[0][0] as string;
      expect(msg).toContain("[character assets] Missing outline layer for:");
      expect(msg).toContain("hair_2_0");
    });

    it("can emit multiple warnings in one call (one per category)", () => {
      reportLayeredAssetDiagnostics({
        unrecognized: ["/weird.png"],
        duplicates: [
          { key: "x", existingPath: "/a", newPath: "/b" },
          { key: "y", existingPath: "/c", newPath: "/d" },
        ],
        missingBg: ["m1"],
        missingOutline: ["m2"],
      } as any);

      // unrecognized + duplicates + missingBg + missingOutline
      expect(warnSpy).toHaveBeenCalledTimes(4);
    });
  });

  describe("reportSingleLayerAssetDiagnostics", () => {
    it("does nothing when there are no duplicates", () => {
      reportSingleLayerAssetDiagnostics("eyes", { duplicates: [] } as any);
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it("warns when there are duplicates and includes the folder name", () => {
      reportSingleLayerAssetDiagnostics("eyes", {
        duplicates: [
          { id: "eyes0", existingPath: "/old.png", newPath: "/new.png" },
        ],
      } as any);

      expect(warnSpy).toHaveBeenCalledTimes(1);
      const msg = warnSpy.mock.calls[0][0] as string;
      expect(msg).toContain("[character assets] Duplicate eyes ids:");
      expect(msg).toContain('"eyes0"');
      expect(msg).toContain("Existing: /old.png");
      expect(msg).toContain("New: /new.png");
    });
  });
});
