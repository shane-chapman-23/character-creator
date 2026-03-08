import { type KeyboardEvent } from "react";

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
      aria-labelledby={labelId}
      onKeyDown={handleKeyDown}
      className="flex items-center justify-between gap-3 font-inter"
    >
      <div className="flex gap-2">
        <button type="button" className="btn" onClick={onPrev} tabIndex={-1}>
          <span className="btn-face btn-scale ui-text bg-surface font-bold">
            {"<"}
          </span>
        </button>

        <button type="button" className="btn" onClick={onNext} tabIndex={-1}>
          <span className="btn-face btn-scale ui-text bg-surface font-bold">
            {">"}
          </span>
        </button>
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
