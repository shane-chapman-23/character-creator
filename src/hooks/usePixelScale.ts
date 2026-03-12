import { useEffect, useState } from "react";

type Options = {
  minScale?: number;
  maxScale?: number;
  widthFraction?: number;
  heightFraction?: number;
};

// Base pixel size of the character sprite (256px).
// Scaling multiplies this size to maintain crisp pixel rendering.
const BASE = 256;

export default function usePixelScale({
  minScale = 1,
  maxScale = 5,
  widthFraction = 0.9,
  heightFraction = 0.8,
}: Options = {}) {
  const [scale, setScale] = useState(minScale);

  // Calculate the biggest integer scale the character can be
  // based on the current screen size. We limit how much of the
  // screen it can use so it doesn't take over the whole page.
  // Runs on mount and whenever the window is resized.
  useEffect(() => {
    const updateScale = () => {
      const widthScale = Math.floor((window.innerWidth * widthFraction) / BASE);
      const heightScale = Math.floor(
        (window.innerHeight * heightFraction) / BASE,
      );

      // Pick the largest scale that still fits within the
      // allowed width/height fractions and clamp it between
      // minScale and maxScale.
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

  return scale;
}
