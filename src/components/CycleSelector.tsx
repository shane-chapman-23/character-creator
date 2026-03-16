import { type KeyboardEvent } from "react";
import Button from "./ui/Button";

type Props = {
  label: string;
  onPrev: () => void | Promise<void>;
  onNext: () => void | Promise<void>;
};

export default function CycleSelector({ label, onPrev, onNext }: Props) {
  const labelId = `cycle-selector-${label.toLowerCase().replace(/\s+/g, "-")}`;

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      onPrev();
    }

    if (e.key === "ArrowRight") {
      e.preventDefault();
      onNext();
    }
  };

  return (
    <div
      role="group"
      tabIndex={0}
      aria-label={`${label}. Use left and right arrow keys to change option`}
      onKeyDown={handleKeyDown}
      className="flex items-center justify-between gap-3 font-inter"
    >
      <div className="flex gap-2 text-text">
        <Button
          onClick={onPrev}
          tabIndex={-1}
          ariaLabel={`Previous ${label}`}
          faceClassName="px-2 bg-surface font-bold"
        >
          {"<"}
        </Button>

        <Button
          onClick={onNext}
          tabIndex={-1}
          ariaLabel={`Next ${label}`}
          faceClassName="px-2 bg-surface font-bold"
        >
          {">"}
        </Button>
      </div>

      <span
        id={labelId}
        className="text-right ui-text-lg font-extrabold text-text"
      >
        {label}
      </span>
    </div>
  );
}
