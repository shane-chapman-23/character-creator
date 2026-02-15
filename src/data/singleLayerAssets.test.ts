import { describe, it, expect } from "vitest";
import {
  idFromPath,
  createSingleLayerDiagnostics,
  setWithDuplicateIdTracking,
  buildEntriesById,
  buildSingleLayerAssets,
} from "./singleLayerAssets";

describe("idFromPath", () => {
  it("derives an id from a .png filename", () => {
    const path = "/src/assets/character/eyes/eyes_angry_2.png";
    expect(idFromPath(path)).toBe("eyes_angry_2");
  });

  it("returns null when path has no filename", () => {
    expect(idFromPath("/src/assets/character/eyes/")).toBeNull();
  });

  it("returns null for non-png files", () => {
    const path = "/src/assets/character/eyes/eyes_angry_2.webp";
    expect(idFromPath(path)).toBeNull();
  });

  it("handles uppercase extension", () => {
    const path = "/src/assets/character/mouth/mouth_smile.PNG";
    expect(idFromPath(path)).toBe("mouth_smile");
  });
});

describe("setWithDuplicateIdTracking", () => {
  it("adds first entry without recording a duplicate", () => {
    const map = new Map<string, { url: string; path: string }>();
    const diag = createSingleLayerDiagnostics();

    setWithDuplicateIdTracking(
      map,
      "eyes_1",
      { url: "u1", path: "/a.png" },
      diag,
    );

    expect(map.get("eyes_1")).toEqual({ url: "u1", path: "/a.png" });
    expect(diag.duplicates).toEqual([]);
  });

  it("records duplicates and last write wins", () => {
    const map = new Map<string, { url: string; path: string }>();
    const diag = createSingleLayerDiagnostics();

    setWithDuplicateIdTracking(
      map,
      "eyes_1",
      { url: "u1", path: "/first.png" },
      diag,
    );

    setWithDuplicateIdTracking(
      map,
      "eyes_1",
      { url: "u2", path: "/second.png" },
      diag,
    );

    expect(diag.duplicates).toEqual([
      { id: "eyes_1", existingPath: "/first.png", newPath: "/second.png" },
    ]);

    expect(map.get("eyes_1")).toEqual({ url: "u2", path: "/second.png" });
  });
});

describe("buildEntriesById", () => {
  it("filters by folderNeedle and maps id -> {url,path}", () => {
    const files = {
      "/src/assets/character/eyes/eyes_1.png": "e1",
      "/src/assets/character/eyes/eyes_2.png": "e2",
      "/src/assets/character/mouth/mouth_1.png": "m1",
    };

    const diag = createSingleLayerDiagnostics();
    const folderNeedle = "/src/assets/character/eyes/";
    const map = buildEntriesById(files, folderNeedle, diag);

    expect([...map.keys()].sort()).toEqual(["eyes_1", "eyes_2"]);
    expect(map.get("eyes_1")).toEqual({
      url: "e1",
      path: "/src/assets/character/eyes/eyes_1.png",
    });
    expect(diag.duplicates).toEqual([]);
  });

  it("records duplicates when two paths generate the same id (last write wins)", () => {
    const files = {
      "/src/assets/character/eyes/a/eyes_1.png": "first",
      "/src/assets/character/eyes/b/eyes_1.png": "second",
    } as Record<string, string>;

    const diag = createSingleLayerDiagnostics();
    const folderNeedle = "/src/assets/character/eyes/";
    const map = buildEntriesById(files, folderNeedle, diag);

    expect(map.get("eyes_1")?.url).toBe("second");

    expect(diag.duplicates).toEqual([
      {
        id: "eyes_1",
        existingPath: "/src/assets/character/eyes/a/eyes_1.png",
        newPath: "/src/assets/character/eyes/b/eyes_1.png",
      },
    ]);
  });
});

describe("buildSingleLayerAssets", () => {
  it("returns options for the selected folder only", () => {
    const files = {
      "/src/assets/character/eyes/eyes_1.png": "e1",
      "/src/assets/character/mouth/mouth_1.png": "m1",
    };

    const { options, diagnostics } = buildSingleLayerAssets(files, "eyes");

    expect(options).toEqual([{ id: "eyes_1", value: "e1" }]);
    expect(diagnostics.duplicates).toEqual([]);
  });

  it("sorts ids using localeCompare numeric (2 before 10)", () => {
    const files = {
      "/src/assets/character/eyes/eyes_10.png": "e10",
      "/src/assets/character/eyes/eyes_2.png": "e2",
    };

    const { options } = buildSingleLayerAssets(files, "eyes");

    expect(options).toEqual([
      { id: "eyes_2", value: "e2" },
      { id: "eyes_10", value: "e10" },
    ]);
  });

  it("records duplicates and last write wins in options", () => {
    const files = {
      "/src/assets/character/mouth/a/mouth_smile.png": "first",
      "/src/assets/character/mouth/b/mouth_smile.png": "second",
    } as Record<string, string>;

    const { options, diagnostics } = buildSingleLayerAssets(files, "mouth");

    expect(options).toEqual([{ id: "mouth_smile", value: "second" }]);
    expect(diagnostics.duplicates).toEqual([
      {
        id: "mouth_smile",
        existingPath: "/src/assets/character/mouth/a/mouth_smile.png",
        newPath: "/src/assets/character/mouth/b/mouth_smile.png",
      },
    ]);
  });
});
