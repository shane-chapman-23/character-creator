type Props = {
  label: string;
  onPrev: () => void | Promise<void>;
  onNext: () => void | Promise<void>;
};

export default function CycleSelector({ label, onPrev, onNext }: Props) {
  return (
    <div className="flex items-center gap-3 font-inter justify-between">
      <div className="flex gap-2">
        <button className="px-2 bg-surface font-bold btn" onClick={onPrev}>
          {"<"}
        </button>
        <button className="px-2 bg-surface font-bold btn" onClick={onNext}>
          {">"}
        </button>
      </div>
      <span className="w-30 font-extrabold text-black text-right">{label}</span>
    </div>
  );
}
