import cityBuildings from "@/assets/parallax/city_buildings.png";
import cityWindows from "@/assets/parallax/city_windows.png";
import ground from "@/assets/parallax/ground.png";
import grass from "@/assets/parallax/grass.png";

export type VerticalAnchor = "bottomToFloor" | "topToFloor";
export type TintGroup = "city" | "window" | "ground";
export type Depth = "back" | "front";

export type ParallaxLayer = {
  id: string;
  src: string;
  baseWidth: number;
  baseHeight: number;
  speed: number;
  anchor: VerticalAnchor;
  tint: TintGroup;
  depth: Depth;
  yOffset?: number;
};

export const parallaxScene: ParallaxLayer[] = [
  {
    id: "city",
    src: cityBuildings,
    baseWidth: 1024,
    baseHeight: 512,
    speed: 0.1,
    anchor: "bottomToFloor",
    tint: "city",
    depth: "back",
  },
  {
    id: "windows",
    src: cityWindows,
    baseWidth: 1024,
    baseHeight: 512,
    speed: 0.1,
    anchor: "bottomToFloor",
    tint: "window",
    depth: "back",
  },
  {
    id: "grass",
    src: grass,
    baseWidth: 128,
    baseHeight: 5,
    speed: 1.5,
    anchor: "bottomToFloor",
    tint: "ground",
    depth: "front",
    yOffset: 1,
  },
  {
    id: "ground",
    src: ground,
    baseWidth: 1024,
    baseHeight: 700,
    speed: 1.5,
    anchor: "topToFloor",
    tint: "ground",
    depth: "back",
  },
];

export type ParallaxPalette = Record<TintGroup, string>;
export type ParallaxThemeName = "light" | "dark";

export const parallaxPalettes: Record<ParallaxThemeName, ParallaxPalette> = {
  light: {
    city: "#5f87a8",
    window: "#c9d4dd",
    ground: "#04724D",
  },
  dark: {
    city: "#1f1c2b",
    window: "#E1BC29",
    ground: "#034732",
  },
};

// Backward-compatible default palette for callers that are not
// theme-aware yet.
export const parallaxPalette: ParallaxPalette = parallaxPalettes.light;

export function getParallaxPalette(theme: ParallaxThemeName) {
  return parallaxPalettes[theme];
}
