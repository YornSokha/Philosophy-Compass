interface Props {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: Props) {
  return (
    <div className="w-full h-0.5 bg-[var(--border)] rounded-full overflow-hidden">
      <div
        className="h-full bg-[var(--text-muted)] rounded-full transition-all duration-500 ease-out"
        style={{ width: `${((current + 1) / total) * 100}%` }}
      />
    </div>
  );
}
