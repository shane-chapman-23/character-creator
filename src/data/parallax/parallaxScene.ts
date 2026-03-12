import cityBuildings from "@/assets/bg/city_buildings.png";
import cityWindows from "@/assets/bg/city_windows.png";
import ground from "@/assets/bg/ground.png";
import grass from "@/assets/bg/grass.png";

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
    baseWidth: 1024,
    baseHeight: 5,
    speed: 1.4,
    anchor: "bottomToFloor",
    tint: "ground",
    depth: "front",
  },
  {
    id: "ground",
    src: ground,
    baseWidth: 1024,
    baseHeight: 700,
    speed: 1,
    anchor: "topToFloor",
    tint: "ground",
    depth: "back",
  },
];

export const parallaxPalette = {
  city: "#64aad8",
  window: "#90ceed",
  ground: "#16751b",
} as const;
