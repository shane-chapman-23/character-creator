import type { Anim } from "@/render/animation/bodyFrames";

type Props = {
  anim: Anim;
  setAnim: (a: Anim) => void;
};

export default function AnimationControls({ anim, setAnim }: Props) {
  const isRunning = anim === "run";

  return (
    <div className="flex gap-2 p-3 font-inter font-bold">
      <button
        className={`btn ${isRunning ? "btn-locked" : ""}`}
        onClick={() => setAnim(isRunning ? "idle" : "run")}
        aria-pressed={isRunning}
        type="button"
      >
        <span
          className={`btn-face px-3 py-1 ${
            anim === "run" ? "bg-white text-black" : "bg-black/40 text-white"
          }`}
        >
          Run
        </span>
      </button>
    </div>
  );
}
