type Props = {
  children: React.ReactNode;
  scale?: number;
};

const BASE = 256;

export default function PixelScale({ children, scale = 2 }: Props) {
  const dpr = window.devicePixelRatio || 1;

  // Snap upward so source pixels map to whole physical pixels without shrinking intent.
  const snappedScale = Math.max(1, Math.ceil(scale * dpr) / dpr);

  return (
    <div
      style={{
        width: BASE * snappedScale,
        height: BASE * snappedScale,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: BASE * snappedScale,
          height: BASE * snappedScale,
        }}
      >
        {children}
      </div>
    </div>
  );
}
