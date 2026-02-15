import type { PairingDiagnostics } from "./pairLayeredAssets";
import type { SingleLayerDiagnostics } from "./singleLayerAssets";

export type SingleLayerDuplicate = {
  id: string;
  existingPath: string;
  newPath: string;
};

// Dev-only diagnostics reporter for asset pairing and duplicates.
//
// This module is intentionally separated from the pairing logic so that:
// - pairLayeredAssets and pairSingleAssets remain a pure transform (no console side effects)
// - diagnostics can be inspected in tests without triggering logs
// - logging is restricted to development environments only
//
// In production builds, these functions are a no-op.

export const reportLayeredAssetDiagnostics = (d: PairingDiagnostics) => {
  if (!import.meta.env.DEV) return;

  if (d.unrecognized.length) {
    console.warn(
      `[character assets] Unrecognized filenames:\n` +
        d.unrecognized.join("\n"),
    );
  }

  if (d.duplicates.length) {
    console.warn(
      `[character assets] Duplicate keys:\n` +
        d.duplicates
          .map(
            (x) =>
              `- "${x.key}"\n  Existing: ${x.existingPath}\n  New: ${x.newPath}`,
          )
          .join("\n"),
    );
  }

  if (d.missingBg.length) {
    console.warn(
      `[character assets] Missing bg layer for: ${d.missingBg.join(", ")}`,
    );
  }

  if (d.missingOutline.length) {
    console.warn(
      `[character assets] Missing outline layer for: ${d.missingOutline.join(", ")}`,
    );
  }
};

export const reportSingleLayerAssetDiagnostics = (
  folder: string,
  d: SingleLayerDiagnostics,
) => {
  if (!import.meta.env.DEV) return;

  if (d.duplicates.length) {
    console.warn(
      `[character assets] Duplicate ${folder} ids:\n` +
        d.duplicates
          .map(
            (x) =>
              `- "${x.id}"\n  Existing: ${x.existingPath}\n  New: ${x.newPath}`,
          )
          .join("\n"),
    );
  }
};
