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
        <h1 className="text-surface text-5xl md:text-7xl lg:text-9xl">
          Character Creator
        </h1>
      </section>
      {/* Character Creator */}
      <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start">
        {/* Preview */}
        <section className="flex flex-col items-center gap-6">
          <PixelScale scale={1}>
            <CharacterPreviewCanvas anim={anim} />
          </PixelScale>
          <AnimationControls anim={anim} setAnim={setAnim} />
        </section>
        {/* Selector */}
        <section className="my-auto max-w-full">
          <CharacterSelector />
        </section>
      </div>
      {/* Footer */}
      <section className="flex flex-col h-[100px]">
        <p className="mt-auto font-inter text-center">
          Interested in working together? <br />
          Email me at{" "}
          <a href="mailto:chapman.shane@proton.me" className="text-surface">
            {" "}
            chapman.shane@proton.me
          </a>
        </p>
      </section>
    </main>
  );
}

export default App;
