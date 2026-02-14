import { describe, it, expect } from "vitest";
import {
  keyFromPath,
  pairLayeredAssets,
  buildEntriesByKey,
  collectMissingPairs,
  setWithDuplicateTracking,
  trackUnrecognized,
  createPairingDiagnostics,
} from "./pairLayeredAssets";

describe("keyFromPath", () => {
  it("derives a key from outline filename", () => {
    const path = "/src/assets/character/hair/hair_idle_12_outline.png";
    expect(keyFromPath(path)).toBe("hair_idle_12");
  });

  it("derives a key from bg filename", () => {
    const path = "/src/assets/character/hair/hair_idle_12_bg.png";
    expect(keyFromPath(path)).toBe("hair_idle_12");
  });

  it("allows underscores in variant", () => {
    const path = "/src/assets/character/body/body_run_bottom_3_outline.png";
    expect(keyFromPath(path)).toBe("body_run_bottom_3");
  });

  it("returns null when category contains invalid characters", () => {
    const path = "/src/assets/character/hair/hair-long_1_0_outline.png";
    expect(keyFromPath(path)).toBeNull();
  });

  it("returns null for malformed filenames", () => {
    const path = "/src/assets/character/hair/hair_outline.png";
    expect(keyFromPath(path)).toBeNull();
  });

  it("returns null when frame is not digits", () => {
    const path = "/src/assets/character/hair/hair_idle_x_outline.png";
    expect(keyFromPath(path)).toBeNull();
  });

  it("accepts extra suffix after layer token (outline|bg)", () => {
    const path = "/src/assets/character/hair/hair_idle_1_outline_v2.png";
    expect(keyFromPath(path)).toBe("hair_idle_1");
  });
});

describe("pairLayeredAssets", () => {
  it("returns only matched outline+bg pairs", () => {
    const outlineFiles = {
      "/src/assets/character/hair/hair_idle_1_outline.png": "o1",
      "/src/assets/character/hair/hair_idle_2_outline.png": "o2",
      // outline with no bg pair
      "/src/assets/character/hair/hair_idle_3_outline.png": "o3",
    };

    const bgFiles = {
      "/src/assets/character/hair/hair_idle_1_bg.png": "b1",
      "/src/assets/character/hair/hair_idle_2_bg.png": "b2",
      // bg with no outline pair
      "/src/assets/character/hair/hair_idle_99_bg.png": "b99",
    };

    const { paired, diagnostics } = pairLayeredAssets(
      outlineFiles,
      bgFiles,
      "hair",
    );

    expect(paired).toEqual([
      { outline: "o1", bg: "b1" },
      { outline: "o2", bg: "b2" },
    ]);

    expect(diagnostics.missingBg).toEqual(["hair_idle_3"]);
    expect(diagnostics.missingOutline).toEqual(["hair_idle_99"]);
    expect(diagnostics.unrecognized).toEqual([]);
    expect(diagnostics.duplicates).toEqual([]);
  });

  it("sorts using localeCompare numeric (frame 2 before 10)", () => {
    const outlineFiles = {
      "/src/assets/character/hair/hair_idle_10_outline.png": "o10",
      "/src/assets/character/hair/hair_idle_2_outline.png": "o2",
    };

    const bgFiles = {
      "/src/assets/character/hair/hair_idle_10_bg.png": "b10",
      "/src/assets/character/hair/hair_idle_2_bg.png": "b2",
    };

    const { paired } = pairLayeredAssets(outlineFiles, bgFiles, "hair");

    expect(paired).toEqual([
      { outline: "o2", bg: "b2" },
      { outline: "o10", bg: "b10" },
    ]);
  });

  it("ignores files from other folders", () => {
    const outlineFiles = {
      "/src/assets/character/hair/hair_idle_1_outline.png": "hair-o1",
      "/src/assets/character/head/head_idle_1_outline.png": "head-o1",
    };

    const bgFiles = {
      "/src/assets/character/hair/hair_idle_1_bg.png": "hair-b1",
      "/src/assets/character/head/head_idle_1_bg.png": "head-b1",
    };

    const { paired, diagnostics } = pairLayeredAssets(
      outlineFiles,
      bgFiles,
      "hair",
    );

    expect(paired).toEqual([{ outline: "hair-o1", bg: "hair-b1" }]);
    expect(diagnostics.missingBg).toEqual([]);
    expect(diagnostics.missingOutline).toEqual([]);
  });

  it("records unrecognized filenames in diagnostics", () => {
    const outlineFiles = {
      "/src/assets/character/hair/hair_idle_outline.png": "bad-outline",
      "/src/assets/character/hair/hair_idle_1_outline.png": "o1",
    };

    const bgFiles = {
      "/src/assets/character/hair/hair_idle_1_bg.png": "b1",
    };

    const { paired, diagnostics } = pairLayeredAssets(
      outlineFiles,
      bgFiles,
      "hair",
    );

    expect(paired).toEqual([{ outline: "o1", bg: "b1" }]);
    expect(diagnostics.unrecognized).toEqual([
      "/src/assets/character/hair/hair_idle_outline.png",
    ]);
  });

  it("records duplicates (last write wins)", () => {
    const outlineFiles = {
      "/src/assets/character/hair/hair_idle_1_outline.png": "o1-first",
      "/src/assets/character/hair/hair_idle_1_outline_DUP.png": "o1-second", // same key
    };

    const bgFiles = {
      "/src/assets/character/hair/hair_idle_1_bg.png": "b1",
    };

    const { paired, diagnostics } = pairLayeredAssets(
      outlineFiles,
      bgFiles,
      "hair",
    );

    // last write wins: outline should be o1-second
    expect(paired).toEqual([{ outline: "o1-second", bg: "b1" }]);

    expect(diagnostics.duplicates).toEqual([
      {
        key: "hair_idle_1",
        existingPath: "/src/assets/character/hair/hair_idle_1_outline.png",
        newPath: "/src/assets/character/hair/hair_idle_1_outline_DUP.png",
      },
    ]);
  });
});

describe("setWithDuplicateTracking", () => {
  it("adds first entry without recording a duplicate", () => {
    const map = new Map<string, { url: string; path: string }>();
    const diag = createPairingDiagnostics();

    setWithDuplicateTracking(
      map,
      "hair_0_0",
      { url: "o1", path: "/a.png" },
      diag,
    );

    expect(map.get("hair_0_0")).toEqual({ url: "o1", path: "/a.png" });
    expect(diag.duplicates).toEqual([]);
  });

  it("records duplicates and last write wins", () => {
    const map = new Map<string, { url: string; path: string }>();
    const diag = createPairingDiagnostics();

    setWithDuplicateTracking(
      map,
      "hair_0_0",
      { url: "o1", path: "/first.png" },
      diag,
    );

    setWithDuplicateTracking(
      map,
      "hair_0_0",
      { url: "o2", path: "/second.png" },
      diag,
    );

    expect(diag.duplicates).toEqual([
      {
        key: "hair_0_0",
        existingPath: "/first.png",
        newPath: "/second.png",
      },
    ]);

    expect(map.get("hair_0_0")).toEqual({ url: "o2", path: "/second.png" });
  });
});

describe("trackUnrecognized", () => {
  it("pushes the path into diagnostics.unrecognized", () => {
    const diag = createPairingDiagnostics();

    trackUnrecognized("/weird/file.png", diag);
    expect(diag.unrecognized).toEqual(["/weird/file.png"]);
  });
});

describe("buildEntriesByKey", () => {
  it("filters by folderNeedle and converts valid files into key->entry", () => {
    const files = {
      "/src/assets/character/hair/hair_0_0_outline.png": "o00",
      "/src/assets/character/hair/hair_1_0_outline.png": "o10",
      "/src/assets/character/body/body_idle_top_0_outline.png": "body-o",
    };

    const diag = createPairingDiagnostics();

    const folderNeedle = "/src/assets/character/hair/";
    const map = buildEntriesByKey(files, folderNeedle, diag);

    expect([...map.keys()].sort()).toEqual(["hair_0_0", "hair_1_0"]);
    expect(map.get("hair_0_0")).toEqual({
      url: "o00",
      path: "/src/assets/character/hair/hair_0_0_outline.png",
    });

    expect(diag.unrecognized).toEqual([]);
    expect(diag.duplicates).toEqual([]);
  });

  it("records unrecognized files (in the folder) into diagnostics", () => {
    const files = {
      "/src/assets/character/hair/hair_outline.png": "bad",
      "/src/assets/character/hair/hair_0_0_outline.png": "good",
      // unrecognized but NOT in folder -> should be ignored completely
      "/src/assets/character/body/body_outline.png": "bad2",
    };

    const diag = createPairingDiagnostics();

    const folderNeedle = "/src/assets/character/hair/";
    const map = buildEntriesByKey(files, folderNeedle, diag);

    expect([...map.keys()]).toEqual(["hair_0_0"]);
    expect(diag.unrecognized).toEqual([
      "/src/assets/character/hair/hair_outline.png",
    ]);
  });

  it("records duplicates when two paths generate the same key", () => {
    const files = {
      "/src/assets/character/hair/hair_0_0_outline.png": "first",
      "/src/assets/character/hair/hair_0_0_outline_DUP.png": "second", // same key
    };

    const diag = createPairingDiagnostics();

    const folderNeedle = "/src/assets/character/hair/";
    const map = buildEntriesByKey(files, folderNeedle, diag);

    expect(map.get("hair_0_0")?.url).toBe("second"); // last wins

    expect(diag.duplicates).toEqual([
      {
        key: "hair_0_0",
        existingPath: "/src/assets/character/hair/hair_0_0_outline.png",
        newPath: "/src/assets/character/hair/hair_0_0_outline_DUP.png",
      },
    ]);
  });
});

describe("collectMissingPairs", () => {
  it("fills missingBg and missingOutline correctly", () => {
    const outlines = new Map<string, { url: string; path: string }>([
      ["hair_0_0", { url: "o00", path: "/o00" }],
      ["hair_1_0", { url: "o10", path: "/o10" }],
    ]);

    const bgs = new Map<string, { url: string; path: string }>([
      ["hair_0_0", { url: "b00", path: "/b00" }],
      ["hair_9_0", { url: "b90", path: "/b90" }],
    ]);

    const diag = createPairingDiagnostics();

    collectMissingPairs(outlines, bgs, diag);

    expect(diag.missingBg).toEqual(["hair_1_0"]);
    expect(diag.missingOutline).toEqual(["hair_9_0"]);
  });
});

describe("pairLayeredAssets (realistic body/idle set)", () => {
  it("pairs multiple variants + frames and reports partial missing layers", () => {
    const outlineFiles = {
      "/src/assets/character/body/body_idle_bottom_0_outline.png": "o-bot-0",
      "/src/assets/character/body/body_idle_bottom_1_outline.png": "o-bot-1",
      "/src/assets/character/body/body_idle_legs_0_outline.png": "o-legs-0",
      "/src/assets/character/body/body_idle_legs_1_outline.png": "o-legs-1",
      "/src/assets/character/body/body_idle_top_0_outline.png": "o-top-0",
      "/src/assets/character/body/body_idle_top_1_outline.png": "o-top-1",
    };

    const bgFiles = {
      "/src/assets/character/body/body_idle_bottom_0_bg.png": "b-bot-0",
      "/src/assets/character/body/body_idle_bottom_1_bg.png": "b-bot-1",
      "/src/assets/character/body/body_idle_legs_0_bg.png": "b-legs-0",
      // legs_1 missing bg
      "/src/assets/character/body/body_idle_top_0_bg.png": "b-top-0",
      "/src/assets/character/body/body_idle_top_1_bg.png": "b-top-1",
    };

    const { paired, diagnostics } = pairLayeredAssets(
      outlineFiles,
      bgFiles,
      "body",
    );

    expect(paired).toEqual([
      { outline: "o-bot-0", bg: "b-bot-0" },
      { outline: "o-bot-1", bg: "b-bot-1" },
      { outline: "o-legs-0", bg: "b-legs-0" },
      { outline: "o-top-0", bg: "b-top-0" },
      { outline: "o-top-1", bg: "b-top-1" },
    ]);

    expect(diagnostics.missingBg).toEqual(["body_idle_legs_1"]);
    expect(diagnostics.missingOutline).toEqual([]);
  });
});
