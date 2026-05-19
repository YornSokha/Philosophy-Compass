interface Props {
  total: number;
  current: number;
}

export default function ProgressDots({ total, current }: Props) {
  return (
    <div className="flex items-center gap-1.5" role="progressbar" aria-valuenow={current + 1} aria-valuemax={total}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`rounded-full transition-all duration-300 ${
            i < current
              ? "w-2 h-2 bg-[var(--text-muted)]"
              : i === current
              ? "w-3 h-3 bg-[var(--text)]"
              : "w-1.5 h-1.5 bg-[var(--text-faint)]"
          }`}
        />
      ))}
    </div>
  );
}
