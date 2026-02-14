import type { PairingDiagnostics } from "./pairLayeredAssets";

// Dev-only diagnostics reporter for asset pairing.
//
// This module is intentionally separated from the pairing logic so that:
// - pairLayeredAssets remains a pure transform (no console side effects)
// - diagnostics can be inspected in tests without triggering logs
// - logging is restricted to development environments only
//
// In production builds, this function is a no-op.

export const reportAssetDiagnostics = (d: PairingDiagnostics) => {
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
