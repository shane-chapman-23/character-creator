import CharacterPreview from "./components/CharacterPreview";
import PixelScale from "./components/PixelScale";

function App() {
  return (
    <main className="bg-blue-500 w-screen h-screen flex flex-col items-center justify-between">
      {/* Header */}
      <section></section>
      {/* Character Creator */}
      <div>
        <section>
          <PixelScale scale={2}>
            <CharacterPreview />
          </PixelScale>
        </section>
        <section></section>
      </div>
      {/* Footer */}
      <section></section>
    </main>
  );
}

export default App;
