import { useState } from "react";
import CharacterPreviewCanvas from "./components/CharacterPreviewCanvas";
import CharacterSelector from "./components/CharacterSelector";
import PixelScale from "./components/PixelScale";
import AnimationControls from "./components/AnimationControls";
import type { Anim } from "@/render/animation/bodyFrames";

function App() {
  const [anim, setAnim] = useState<Anim>("idle");

  return (
    <main className="bg-bg w-full min-h-screen flex flex-col items-center py-2 px-4">
      {/* Header */}
      <section>
        <h1 className="text-surface text-5xl md:text-7xl lg:text-9xl -mb-10 text-center">
          Character Creator
        </h1>
      </section>
      {/* Character Creator */}
      <div className=" flex flex-col w-full items-center justify-center gap-8 xl:flex-row xl:items-start">
        {/* Preview */}
        <section className="flex flex-col items-center gap-6">
          <PixelScale>
            <CharacterPreviewCanvas anim={anim} />
          </PixelScale>
          <AnimationControls anim={anim} setAnim={setAnim} />
        </section>
        {/* Selector */}
        <section className="my-auto">
          <CharacterSelector />
        </section>
      </div>
    </main>
  );
}

export default App;
