import { useState } from "react";
import CharacterPreviewCanvas from "./components/CharacterPreviewCanvas";
import CharacterSelector from "./components/CharacterSelector";
import PixelScale from "./components/PixelScale";
import AnimationControls from "./components/AnimationControls";
import type { Anim } from "@/render/animation/bodyFrames";
import ParallaxBackground from "./components/ParallaxBackground";
import usePixelScale from "./components/usePixelScale";

function App() {
  const [anim, setAnim] = useState<Anim>("idle");
  const scale = usePixelScale();

  return (
    <main className="relative bg-bg w-full min-h-screen flex flex-col py-4 px-4">
      <ParallaxBackground />
      {/* Header */}
      <section>
        <h1 className="text-surface absolute z-0 lg:left-1/2 lg:-translate-x-1/2 text-center whitespace-nowrap">
          Character Creator
        </h1>
      </section>
      {/* Character Creator */}
      <div className="flex flex-1 z-10 w-full flex-col items-center justify-center gap-8 sm:flex-row sm:flex-wrap lg:gap-16">
        <section className="flex flex-col items-center gap-6">
          <PixelScale scale={scale}>
            <CharacterPreviewCanvas anim={anim} />
          </PixelScale>
          <AnimationControls anim={anim} setAnim={setAnim} />
        </section>

        <section className="flex justify-center items-center">
          <CharacterSelector />
        </section>
      </div>
    </main>
  );
}

export default App;
