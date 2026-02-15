export type CharacterPart = "hair" | "eyes" | "mouth";

// Stable ID for a character part selection.
// Keeps saves valid even if option ordering changes later.
export type OptionId = string;

export type CharacterConfig = {
  parts: Record<CharacterPart, OptionId>;
  colours: {
    skin: number;
    top: number; // shirt
    bottom: number; // shorts
    hair: number;
  };
};

export type CharacterOption<T> = {
  id: OptionId;
  // Carries the renderable asset while keeping the stable ID beside it.
  value: T;
};

export type LayeredAsset = {
  outline: string;
  bg: string;
};
