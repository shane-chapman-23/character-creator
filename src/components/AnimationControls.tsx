import type { Anim } from "@/render/animation/bodyFrames";

type Props = {
  anim: Anim;
  setAnim: (a: Anim) => void;
};

export default function AnimationControls({ anim, setAnim }: Props) {
  return (
    <div className="flex gap-2 p-2 font-inter font-bold">
      <button className="btn" onClick={() => setAnim("idle")}>
        <span
          className={`btn__face px-3 py-1 ${
            anim === "idle" ? "bg-white text-black" : "bg-black/40 text-white"
          }`}
        >
          Idle
        </span>
      </button>

      <button className="btn" onClick={() => setAnim("run")}>
        <span
          className={`btn__face px-3 py-1 ${
            anim === "run" ? "bg-white text-black" : "bg-black/40 text-white"
          }`}
        >
          Run
        </span>
      </button>
    </div>
  );
}
