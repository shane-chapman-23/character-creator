type Props = {
  children: React.ReactNode;
  scale?: number;
};

// Renders pixel art at its native resolution (256x256),
// then scales the already-rendered result using CSS transforms
// to preserve crisp pixel edges.
//
// Resizing a 256px sprite to (e.g.) 512px via layout causes the browser
// to resample the image, which can blur edges even with
// 'image-rendering: pixelated' set.
export default function PixelScale({ children, scale = 2 }: Props) {
  return (
    <div
      style={{
        width: 256 * scale,
        height: 256 * scale,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </div>
  );
}
