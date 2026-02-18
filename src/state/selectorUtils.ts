import type { OptionId } from "@/types/character";

export const wrapIndex = (i: number, len: number) => {
  // Guard 0-length lists so callers always get a safe index.
  if (len <= 0) return 0;
  // Modulo with offset handles negative movement (prev) as well as next.
  return ((i % len) + len) % len;
};

export const cycleId = (ids: OptionId[], currentId: OptionId, dir: 1 | -1) => {
  // Preserve current selection when no options are available.
  if (ids.length === 0) return currentId;

  const currentIndex = ids.indexOf(currentId);
  // Unknown IDs can happen after asset changes; recover by starting at 0.
  const start = currentIndex === -1 ? 0 : currentIndex;
  const nextIndex = wrapIndex(start + dir, ids.length);
  return ids[nextIndex];
};

export const randomFrom = (ids: OptionId[]) => {
  // Empty string signals "no random option" to callers with fallback logic.
  if (ids.length === 0) return "";
  const idx = Math.floor(Math.random() * ids.length);
  return ids[idx];
};
