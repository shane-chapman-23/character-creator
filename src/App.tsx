import { useState } from "react";
import CharacterPreviewCanvas from "./components/CharacterPreviewCanvas";
import CharacterSelector from "./components/CharacterSelector";
import PixelScale from "./components/PixelScale";
import AnimationControls from "./components/AnimationControls";
import type { Anim } from "@/render/animation/bodyFrames";

function App() {
  const [anim, setAnim] = useState<Anim>("idle");

  return (
    <main className="bg-bg w-screen h-screen flex flex-col items-center justify-between">
      {/* Header */}
      <section></section>
      {/* Character Creator */}
      <div className="flex">
        {/* Preview */}
        <section className="flex flex-col items-center gap-6">
          <PixelScale scale={1}>
            <CharacterPreviewCanvas anim={anim} />
          </PixelScale>
          <AnimationControls anim={anim} setAnim={setAnim} />
        </section>
        {/* Selector */}
        <section>
          <CharacterSelector />
        </section>
      </div>
      {/* Footer */}
      <section></section>
    </main>
  );
}

export default App;
