import type { Anim } from "@/render/animation/bodyFrames";
import Button from "./ui/Button";

type Props = {
  anim: Anim;
  setAnim: (a: Anim) => void;
};

export default function AnimationControls({ anim, setAnim }: Props) {
  const isRunning = anim === "run";

  return (
    <div className="flex gap-2 p-3 font-inter font-bold">
      <Button
        pressed={isRunning}
        onClick={() => setAnim(isRunning ? "idle" : "run")}
        faceClassName={`min-w-[5.5rem] px-3 py-1 font-bold ${
          isRunning ? "bg-white text-black" : "bg-[#2f4f6e] text-white"
        }`}
      >
        {isRunning ? "Stop" : "Run"}
      </Button>
    </div>
  );
}
