type Props = {
  label: string;
  onPrev: () => void | Promise<void>;
  onNext: () => void | Promise<void>;
};

export default function CycleSelector({ label, onPrev, onNext }: Props) {
  return (
    <div className="flex items-center gap-3 font-inter justify-between">
      <span className="w-28 font-extrabold text-black ">{label}</span>
      <div className="flex gap-2">
        <button className="px-2 py-1 bg-surface font-bold" onClick={onPrev}>
          Prev
        </button>
        <button className="px-2 py-1 bg-surface font-bold" onClick={onNext}>
          Next
        </button>
      </div>
    </div>
  );
}
