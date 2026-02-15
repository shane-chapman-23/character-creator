import type { AvailablePartIds } from "./characterConfig";
import { HAIR, EYES, MOUTH } from "@/data/characterAssets";

// Central source of selectable IDs so config validation and UI stay in sync.
export const AVAILABLE_PART_IDS: AvailablePartIds = {
  hair: HAIR.map((o) => o.id),
  eyes: EYES.map((o) => o.id),
  mouth: MOUTH.map((o) => o.id),
};
