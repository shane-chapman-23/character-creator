import { parallaxScene } from "@/data/parallax/parallaxScene";

type Layer = (typeof parallaxScene)[number];

type Props = {
  layer: Layer;
  scale: number;
  floorY: number;
  tileCount: number;
  tintedSrc?: string;
  registerLayerTrack?: (layerId: string, node: HTMLDivElement | null) => void;
};

export default function ParallaxLayerRow({
  layer,
  scale,
  floorY,
  tileCount,
  tintedSrc,
  registerLayerTrack,
}: Props) {
  // If the tinted image hasn't finished generating yet, skip rendering.
  if (!tintedSrc) return null;

  const width = Math.round(layer.baseWidth * scale);
  const height = Math.round(layer.baseHeight * scale);

  // Position the layer relative to the floor line. Layers can anchor
  // either on the floor or extend upward from it. An optional yOffset
  // allows small visual tweaks for pixel-perfect alignment.
  const yOffset = layer.yOffset ?? 0;

  const verticalStyle =
    layer.anchor === "bottomToFloor"
      ? { top: Math.round(floorY - height + yOffset) }
      : { top: Math.round(floorY + yOffset) };

  return (
    <div
      className="absolute left-0 w-full overflow-hidden"
      style={verticalStyle}
    >
      <div
        className="flex"
        style={{
          width: width * tileCount,
          height,
          // Hint to the browser that this element will be animated
          // using transforms (improves animation performance).
          willChange: "transform",
        }}
        // Register this row's scrolling track with the parallax hook
        // so it can update the horizontal offset each frame.
        ref={(node) => registerLayerTrack?.(layer.id, node)}
      >
        {Array.from({ length: tileCount }, (_, i) => (
          <div
            key={`${layer.id}-${i}`}
            className="relative shrink-0"
            style={{ width, height }}
          >
            <div
              className="pixel-art absolute inset-0"
              style={{
                width,
                height,
                backgroundImage: `url(${tintedSrc})`,
                backgroundSize: `${width}px ${height}px`,
                backgroundRepeat: "no-repeat",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
