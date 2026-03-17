import type { Anim } from "@/render/animation/bodyFrames";
import Button from "./ui/Button";

type Props = {
  anim: Anim;
  setAnim: (a: Anim) => void;
};

export default function AnimationControls({ anim, setAnim }: Props) {
  const isRunning = anim === "run";

  return (
    <Button
      pressed={isRunning}
      onClick={() => setAnim(isRunning ? "idle" : "run")}
      className="font-inter"
      faceClassName={`min-w-[6rem] py-1 font-bold ${
        isRunning ? "bg-red-700 text-white" : "bg-green-600 text-white"
      }`}
    >
      {isRunning ? "Stop" : "Run"}
    </Button>
  );
}
