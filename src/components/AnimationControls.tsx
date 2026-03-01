import type { Anim } from "@/render/animation/bodyFrames";

type Props = {
  anim: Anim;
  setAnim: (a: Anim) => void;
};

export default function AnimationControls({ anim, setAnim }: Props) {
  return (
    <div className="flex gap-2 p-2">
      <button
        className={`px-3 py-1 rounded-lg ${
          anim === "idle" ? "bg-white text-black" : "bg-black/40 text-white"
        }`}
        onClick={() => setAnim("idle")}
      >
        Idle
      </button>

      <button
        className={`px-3 py-1 rounded-lg ${
          anim === "run" ? "bg-white text-black" : "bg-black/40 text-white"
        }`}
        onClick={() => setAnim("run")}
      >
        Run
      </button>
    </div>
  );
}
