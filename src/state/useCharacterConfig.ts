import { useContext } from "react";
import { CharacterConfigContext } from "./CharacterConfigProvider";

export function useCharacterConfig() {
  const ctx = useContext(CharacterConfigContext);
  // Fail fast with a clear error instead of returning nullable context downstream.
  if (!ctx)
    throw new Error(
      "useCharacterConfig must be used within CharacterConfigProvider",
    );
  return ctx;
}
