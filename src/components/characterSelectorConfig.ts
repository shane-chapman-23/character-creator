type CharacterSection = "body" | "face" | "clothes";

type CharacterSelectorActions = {
  nextPart: (key: "hair" | "eyes" | "mouth") => void;
  prevPart: (key: "hair" | "eyes" | "mouth") => void;
  nextColour: (key: "skin" | "hair" | "top" | "bottom") => void;
  prevColour: (key: "skin" | "hair" | "top" | "bottom") => void;
};

export function createCharacterSections({
  nextPart,
  prevPart,
  nextColour,
  prevColour,
}: CharacterSelectorActions) {
  return {
    body: [
      {
        label: "Skin",
        id: "skin-colour",
        onPrev: () => prevColour("skin"),
        onNext: () => nextColour("skin"),
      },
      {
        label: "Hair",
        id: "hair-part",
        onPrev: () => prevPart("hair"),
        onNext: () => nextPart("hair"),
      },
      {
        label: "Hair Colour",
        id: "hair-colour",
        onPrev: () => prevColour("hair"),
        onNext: () => nextColour("hair"),
      },
    ],
    face: [
      {
        label: "Eyes",
        id: "eyes-part",
        onPrev: () => prevPart("eyes"),
        onNext: () => nextPart("eyes"),
      },
      {
        label: "Mouth",
        id: "mouth-part",
        onPrev: () => prevPart("mouth"),
        onNext: () => nextPart("mouth"),
      },
    ],
    clothes: [
      {
        label: "Shirt",
        id: "top-colour",
        onPrev: () => prevColour("top"),
        onNext: () => nextColour("top"),
      },
      {
        label: "Shorts",
        id: "bottom-colour",
        onPrev: () => prevColour("bottom"),
        onNext: () => nextColour("bottom"),
      },
    ],
  } as const;
}

export const CHARACTER_TABS = [
  ["body", "BODY"],
  ["face", "FACE"],
  ["clothes", "CLOTHES"],
] as const;
