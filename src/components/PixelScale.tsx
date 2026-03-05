import { useEffect, useState } from "react";

type Props = {
  children: React.ReactNode;
  minScale?: number;
  maxScale?: number;
  widthFraction?: number;
  heightFraction?: number;
};

const BASE = 256;

export default function PixelScale({
  children,
  minScale = 1,
  maxScale = 5,
  widthFraction = 0.45,
  heightFraction = 0.6,
}: Props) {
  const [scale, setScale] = useState(minScale);

  useEffect(() => {
    const updateScale = () => {
      const widthScale = Math.floor((window.innerWidth * widthFraction) / BASE);
      const heightScale = Math.floor(
        (window.innerHeight * heightFraction) / BASE,
      );
      const nextScale = Math.max(
        minScale,
        Math.min(maxScale, Math.min(widthScale, heightScale)),
      );
      setScale(nextScale);
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [heightFraction, maxScale, minScale, widthFraction]);

  const dpr = window.devicePixelRatio || 1;
  // Snap upward so source pixels map to whole physical pixels without shrinking intent.
  const snappedScale = Math.max(minScale, Math.ceil(scale * dpr) / dpr);

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
