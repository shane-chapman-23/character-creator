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
        <h1 className="text-surface text-2xl md:text-4xl lg:text-6xl text-center -mb-5">
          Character Creator
        </h1>
      </section>
      {/* Character Creator */}
      <div className="flex w-full flex-col items-center justify-center gap-8 xl:flex-row ">
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
