import { useState, useRef } from "react";
import CharacterPreviewCanvas from "./components/CharacterPreviewCanvas";
import CharacterSelector from "./components/CharacterSelector";
import PixelScale from "./components/PixelScale";
import AnimationControls from "./components/AnimationControls";
import type { Anim } from "@/render/animation/bodyFrames";
import ParallaxLayers from "./components/ParallaxLayers";
import usePixelScale from "./hooks/usePixelScale";
import useFloorY from "./hooks/useFloorY";

function App() {
  const [anim, setAnim] = useState<Anim>("idle");
  const scale = usePixelScale();

  const mainRef = useRef<HTMLElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);

  const floorY = useFloorY({
    containerRef: mainRef,
    targetRef: previewRef,
  });

  return (
    <main
      ref={mainRef}
      className="relative bg-bg w-full min-h-screen flex flex-col py-4 px-4 overflow-hidden"
    >
      <ParallaxLayers
        depth={"back"}
        anim={anim}
        scale={scale}
        floorY={floorY}
      />
      {/* Header */}
      <section>
        <h1 className="text-surface absolute z-0 lg:left-1/2 lg:-translate-x-1/2 text-center whitespace-nowrap">
          Character Creator
        </h1>
      </section>
      {/* Character Creator */}
      <div className="flex flex-1 z-10 w-full flex-col items-center justify-center gap-8 sm:flex-row sm:flex-wrap lg:gap-16">
        <section className="flex flex-col items-center gap-6">
          <div ref={previewRef}>
            <PixelScale scale={scale}>
              <CharacterPreviewCanvas anim={anim} />
            </PixelScale>
          </div>
          <AnimationControls anim={anim} setAnim={setAnim} />
        </section>
        <ParallaxLayers
          depth={"front"}
          anim={anim}
          scale={scale}
          floorY={floorY}
        />

        <section className="flex z-30 justify-center items-center">
          <CharacterSelector />
        </section>
      </div>
    </main>
  );
}

export default App;
