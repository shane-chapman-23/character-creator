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

  const width = layer.baseWidth * scale;
  const height = layer.baseHeight * scale;

  // Position the layer relative to the floor line so different
  // layer types can align either above or directly on the floor.
  const verticalStyle =
    layer.anchor === "bottomToFloor"
      ? { top: floorY - height }
      : { top: floorY };

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
            <img
              src={tintedSrc}
              style={{ width, height }}
              className="pixel-art absolute inset-0"
              alt=""
            />
          </div>
        ))}
      </div>
    </div>
  );
}
