import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  scale: number;
};

const BASE = 256;

export default function PixelScale({ children, scale }: Props) {
  // Convert the scale into a real pixel size for the preview box.
  // The character art is built for a 256x256 canvas, so we multiply
  // that by the current scale.
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
