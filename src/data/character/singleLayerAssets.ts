import type { CharacterOption } from "@/types/character";
import { reportSingleLayerAssetDiagnostics } from "./assetDiagnostics";

// Load single-layer images (eyes, mouth) so we can:
// - generate stable ids from filenames
// - detect duplicate ids (last write wins)
// - keep ordering deterministic (numeric sort)

// prettier-ignore
// Eager-import at module init time so these resolve to static URLs
const SINGLE_LAYER_FILES = import.meta.glob("/src/assets/character/{eyes,mouth}/*.png", {
  eager: true,
  import: "default",
}) as Record<string, string>;

// Keeps both the built URL and original path (useful for diagnostics)
type AssetEntry = { url: string; path: string };

export type SingleLayerDiagnostics = {
  duplicates: Array<{ id: string; existingPath: string; newPath: string }>;
};

export const createSingleLayerDiagnostics = (): SingleLayerDiagnostics => ({
  duplicates: [],
});

// Convert a filepath to a stable id, e.g.
// ".../eyes/eyes_2.png" -> "eyes_2"
export const idFromPath = (path: string) => {
  const file = path.split("/").pop();
  if (!file) return null;
  if (!file.toLowerCase().endsWith(".png")) return null;
  return file.replace(/\.png$/i, "");
};

// Adds id -> entry, recording duplicates into diagnostics (last write wins).
export const setWithDuplicateIdTracking = (
  map: Map<string, AssetEntry>,
  id: string,
  entry: AssetEntry,
  diag: SingleLayerDiagnostics,
) => {
  if (map.has(id)) {
    const existing = map.get(id)!;
    diag.duplicates.push({
      id,
      existingPath: existing.path,
      newPath: entry.path,
    });
  }
  map.set(id, entry);
};

// Builds an id -> asset lookup for one character folder.
export const buildEntriesById = (
  files: Record<string, string>,
  folderNeedle: string,
  diag: SingleLayerDiagnostics,
) => {
  const map = new Map<string, AssetEntry>();

  for (const [path, url] of Object.entries(files)) {
    if (!path.includes(folderNeedle)) continue;

    const id = idFromPath(path);
    if (!id) continue; // (shouldn't happen with the glob, but keeps it safe)

    setWithDuplicateIdTracking(map, id, { url, path }, diag);
  }

  return map;
};

// Composition root for single-layer character assets:
// - loads files for the folder
// - reports dev-only diagnostics (duplicate ids)
// - returns stable CharacterOption<string>[] (id + url)
export const getSingleLayerAssetsFor = (folder: "eyes" | "mouth") => {
  const { options, diagnostics } = buildSingleLayerAssets(
    SINGLE_LAYER_FILES,
    folder,
  );

  reportSingleLayerAssetDiagnostics(folder, diagnostics);

  return options;
};

// Pure logic (no logging):
// returns CharacterOptions (stable id + url) + diagnostics for reporting/testing.
export const buildSingleLayerAssets = (
  files: Record<string, string>,
  folder: "eyes" | "mouth",
): {
  options: CharacterOption<string>[];
  diagnostics: SingleLayerDiagnostics;
} => {
  const folderNeedle = `/src/assets/character/${folder}/`;
  const diag = createSingleLayerDiagnostics();

  const byId = buildEntriesById(files, folderNeedle, diag);

  const options = [...byId.entries()]
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(([id, entry]) => ({
      id,
      value: entry.url,
    }));

  return { options, diagnostics: diag };
};
