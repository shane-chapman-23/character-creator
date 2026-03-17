import { useState, useRef, useEffect } from "react";
import CharacterPreviewCanvas from "./components/CharacterPreviewCanvas";
import CharacterSelector from "./components/CharacterSelector";
import PixelScale from "./components/PixelScale";
import AnimationControls from "./components/AnimationControls";
import type { Anim } from "@/render/animation/bodyFrames";
import ParallaxLayers from "./components/ParallaxLayers";
import Button from "./components/ui/Button";
import usePixelScale from "./hooks/usePixelScale";
import useFloorY from "./hooks/useFloorY";
import type { ParallaxThemeName } from "@/data/parallax/parallaxScene";

function App() {
  const [anim, setAnim] = useState<Anim>("idle");
  const [theme, setTheme] = useState<ParallaxThemeName>("light");
  const themeTransitionTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    return () => {
      if (themeTransitionTimeoutRef.current !== null) {
        window.clearTimeout(themeTransitionTimeoutRef.current);
      }
    };
  }, []);

  function toggleTheme() {
    const root = document.documentElement;
    root.classList.add("theme-transitioning");

    if (themeTransitionTimeoutRef.current !== null) {
      window.clearTimeout(themeTransitionTimeoutRef.current);
    }

    themeTransitionTimeoutRef.current = window.setTimeout(() => {
      root.classList.remove("theme-transitioning");
      themeTransitionTimeoutRef.current = null;
    }, 300);

    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }

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
      className="relative bg-bg w-full min-h-screen flex flex-col py-4 px-4"
    >
      <ParallaxLayers
        depth={"back"}
        anim={anim}
        scale={scale}
        floorY={floorY}
        theme={theme}
      />
      {/* <h1 className="text-center text-white">Character Creator</h1> */}

      {/* Theme switch button */}
      <section className="flex gap-4 items-center absolute z-11 lg:m-6 text-center ">
        <Button
          onClick={toggleTheme}
          className="btn-round "
          faceClassName="btn-face-icon bg-button rounded-full font-inter font-extrabold ui-text-sm"
        >
          {theme === "light" ? "Dark" : "Light"}
        </Button>
      </section>
      {/* Character Creator */}
      <div className="flex flex-1 z-10 w-full flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap lg:gap-16">
        <section className="flex flex-col items-center gap-6">
          <div ref={previewRef}>
            <PixelScale scale={scale}>
              <CharacterPreviewCanvas anim={anim} />
            </PixelScale>
          </div>
        </section>
        <ParallaxLayers
          depth={"front"}
          anim={anim}
          scale={scale}
          floorY={floorY}
          theme={theme}
        />

        <section className="flex z-30 flex-col gap-2 justify-center items-center">
          <CharacterSelector anim={anim} setAnim={setAnim} />
        </section>
      </div>
    </main>
  );
}

export default App;
