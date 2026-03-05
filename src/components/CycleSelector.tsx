type Props = {
  label: string;
  onPrev: () => void | Promise<void>;
  onNext: () => void | Promise<void>;
};

export default function CycleSelector({ label, onPrev, onNext }: Props) {
  return (
    <div className="flex items-center gap-3 font-inter justify-between">
      <div className="flex gap-2">
        <button className="btn" onClick={onPrev}>
          <span className="btn__face px-2 bg-surface font-bold h-7.5">
            {"<"}
          </span>
        </button>

        <button className="btn" onClick={onNext}>
          <span className="btn__face px-2 bg-surface font-bold">{">"}</span>
        </button>
      </div>
      <span className="w-30 font-extrabold text-black text-right">{label}</span>
    </div>
  );
}
