import type { LayeredAsset } from "@/types/character";
import { reportAssetDiagnostics } from "./assetDiagnostics";

// Load outline + bg images separately so we can:
// - enforce filename conventions
// - detect duplicates / missing pairs
// - pair layers into LayeredAsset[] (UI never deals with partial layers)

// prettier-ignore
// Eager-import at module init time so these resolve to static URLs
// (avoids async dynamic imports; images may still load over network)
const OUTLINE_FILES = import.meta.glob("/src/assets/character/**/*_outline*.png",{ 
    eager: true, 
    import: "default" 
  }) as Record<string, string>;

const BG_FILES = import.meta.glob("/src/assets/character/**/*_bg*.png", {
  eager: true,
  import: "default",
}) as Record<string, string>;

// Keeps both the built URL and original path (useful for diagnostics)
type AssetEntry = { url: string; path: string };

export type PairingDiagnostics = {
  missingBg: string[];
  missingOutline: string[];
  unrecognized: string[];
  duplicates: Array<{ key: string; existingPath: string; newPath: string }>;
};

export const createPairingDiagnostics = (): PairingDiagnostics => ({
  missingBg: [],
  missingOutline: [],
  unrecognized: [],
  duplicates: [],
});

// Convert a filepath to a pairing key, e.g.
// ".../hair_3_0_outline.png" -> "hair_3_0"
// ".../body_idle_arms_1_bg.png" -> "body_idle_arms_1"
export const keyFromPath = (path: string) => {
  const file = path.split("/").pop();
  if (!file) return null;

  // Enforces: "<category>_<variant>_<frame>_(outline|bg).png"
  // - category: no underscores (hair, body, eyes)
  // - variant: can contain underscores (idle_arms, run_bottom, etc)
  // - frame: digits
  const match = file.match(
    /^(?<category>[a-z0-9]+)_(?<variant>[a-z0-9_]+)_(?<frame>\d+)_(?:outline|bg).*\.png$/i,
  );
  if (!match?.groups) return null;

  const { category, variant, frame } = match.groups;
  return `${category}_${variant}_${frame}`;
};

// Adds key -> entry, recording duplicates into diagnostics (last write wins).
export const setWithDuplicateTracking = (
  map: Map<string, AssetEntry>,
  key: string,
  entry: AssetEntry,
  diag: PairingDiagnostics,
) => {
  if (map.has(key)) {
    const existing = map.get(key)!;
    diag.duplicates.push({
      key,
      existingPath: existing.path,
      newPath: entry.path,
    });
  }
  map.set(key, entry);
};

// Records files that don't match the "<category>_<variant>_<frame>_(outline|bg).png" naming convention.
export const trackUnrecognized = (path: string, diag: PairingDiagnostics) => {
  diag.unrecognized.push(path);
};

// Builds a key -> asset lookup for one character folder.
// Converts valid filenames into pairing keys (e.g. "hair12")
// so outline + bg layers can be matched quickly later.
export const buildEntriesByKey = (
  files: Record<string, string>,
  folderNeedle: string,
  diag: PairingDiagnostics,
) => {
  const map = new Map<string, AssetEntry>();

  for (const [path, url] of Object.entries(files)) {
    if (!path.includes(folderNeedle)) continue;

    const key = keyFromPath(path);
    if (!key) {
      trackUnrecognized(path, diag);
      continue;
    }

    setWithDuplicateTracking(map, key, { url, path }, diag);
  }

  return map;
};

// Records keys where one layer exists without its matching pair.
export const collectMissingPairs = (
  outlines: Map<string, AssetEntry>,
  bgs: Map<string, AssetEntry>,
  diag: PairingDiagnostics,
) => {
  const outlineKeys = new Set(outlines.keys());
  const bgKeys = new Set(bgs.keys());

  for (const k of outlineKeys) if (!bgKeys.has(k)) diag.missingBg.push(k);
  for (const k of bgKeys) if (!outlineKeys.has(k)) diag.missingOutline.push(k);
};

// Composition root for character assets:
// - pairs raw filesystem URLs into LayeredAsset[]
// - reports dev-only diagnostics (bad names, missing pairs, duplicates)
export const getLayeredAssetsFor = (folder: string) => {
  const { paired, diagnostics } = pairLayeredAssets(
    OUTLINE_FILES,
    BG_FILES,
    folder,
  );

  reportAssetDiagnostics(diagnostics);

  return paired;
};

// Pure pairing logic (no logging):
// returns paired LayeredAssets + diagnostics for reporting/testing.
export const pairLayeredAssets = (
  outlineFiles: Record<string, string>,
  bgFiles: Record<string, string>,
  folder: string,
): { paired: LayeredAsset[]; diagnostics: PairingDiagnostics } => {
  const folderNeedle = `/src/assets/character/${folder}/`;
  const diag = createPairingDiagnostics();

  const outlinesByKey = buildEntriesByKey(outlineFiles, folderNeedle, diag);
  const bgsByKey = buildEntriesByKey(bgFiles, folderNeedle, diag);

  collectMissingPairs(outlinesByKey, bgsByKey, diag);

  // Combine outline + bg into LayeredAsset objects by matching on the shared key.
  // Start with all outline keys e.g. "hair_3_0", "body_idle_arms_1"
  const paired = [...outlinesByKey.keys()]
    // Only keep styles that have BOTH an outline AND a bg.
    // (prevents crashes if a file is missing its pair)
    .filter((k) => bgsByKey.has(k))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    // Map to LayeredAsset objects with { outline: string, bg: string }
    .map((k) => ({
      outline: outlinesByKey.get(k)!.url,
      bg: bgsByKey.get(k)!.url,
    }));

  return { paired, diagnostics: diag };
};
