type Props = {
  label: string;
  onPrev: () => void;
  onNext: () => void;
};

export default function CycleSelector({ label, onPrev, onNext }: Props) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-28">{label}</span>

      <button className="px-2 py-1 rounded bg-white/20" onClick={onPrev}>
        Prev
      </button>
      <button className="px-2 py-1 rounded bg-white/20" onClick={onNext}>
        Next
      </button>
    </div>
  );
}
