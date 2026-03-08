import { useState } from "react";
import CharacterPreviewCanvas from "./components/CharacterPreviewCanvas";
import CharacterSelector from "./components/CharacterSelector";
import PixelScale from "./components/PixelScale";
import AnimationControls from "./components/AnimationControls";
import type { Anim } from "@/render/animation/bodyFrames";

function App() {
  const [anim, setAnim] = useState<Anim>("idle");

  return (
    <main className="bg-bg w-full min-h-screen flex flex-col py-4 px-4">
      {/* Header */}
      <section>
        <h1 className="text-surface text-4xl absolute lg:left-1/2 lg:-translate-x-1/2 md:text-5xl lg:text-7xl text-center">
          Character Creator
        </h1>
      </section>
      {/* Character Creator */}
      <div className="flex flex-1 w-full flex-col items-center justify-center gap-12 md:flex-row md:flex-wrap">
        <section className="flex flex-col items-center gap-6">
          <PixelScale>
            <CharacterPreviewCanvas anim={anim} />
          </PixelScale>
          <AnimationControls anim={anim} setAnim={setAnim} />
        </section>

        <section>
          <CharacterSelector />
        </section>
      </div>
    </main>
  );
}

export default App;
