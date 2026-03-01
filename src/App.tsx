import { useState } from "react";
import CharacterPreviewCanvas from "./components/CharacterPreviewCanvas";
import CharacterSelector from "./components/CharacterSelector";
import PixelScale from "./components/PixelScale";
import AnimationControls from "./components/AnimationControls";
import type { Anim } from "@/render/animation/bodyFrames";

function App() {
  const [anim, setAnim] = useState<Anim>("idle");

  return (
    <main className="bg-blue-500 w-screen h-screen flex flex-col items-center justify-between">
      {/* Header */}
      <section></section>
      {/* Character Creator */}
      <div className="flex">
        {/* Preview */}
        <section>
          <PixelScale scale={1}>
            <CharacterPreviewCanvas anim={anim} />
          </PixelScale>
        </section>
        {/* Selector */}
        <section>
          <CharacterSelector />
        </section>
      </div>
      {/* Footer */}
      <section>
        <AnimationControls anim={anim} setAnim={setAnim} />
      </section>
    </main>
  );
}

export default App;
