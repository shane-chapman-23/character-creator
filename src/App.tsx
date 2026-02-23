import CharacterPreviewCanvas from "./components/CharacterPreviewCanvas";
import CharacterSelector from "./components/CharacterSelector";
import PixelScale from "./components/PixelScale";

function App() {
  return (
    <main className="bg-blue-500 w-screen h-screen flex flex-col items-center justify-between">
      {/* Header */}
      <section></section>
      {/* Character Creator */}
      <div className="flex">
        {/* Preview */}
        <section>
          <PixelScale scale={1}>
            <CharacterPreviewCanvas />
          </PixelScale>
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
