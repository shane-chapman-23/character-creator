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
  minScale = 2,
  maxScale = 5,
  widthFraction = 0.8, // how much of the screen width the character is allowed to use
  heightFraction = 0.8, // how much of the screen height the character is allowed to use
}: Props) {
  const [scale, setScale] = useState(minScale);

  // Calculate the biggest scale the character can be based on the current
  // screen size (within the allowed width/height fractions) and update whenever
  // window is resized
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

  const size = BASE * scale;

  return (
    <div
      style={{
        width: size,
        height: size,
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}
