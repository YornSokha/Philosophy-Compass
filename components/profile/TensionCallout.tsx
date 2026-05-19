import type { Tension, Philosophy } from "@/lib/types";

interface Props {
  tensions: Tension[];
  philosophies: Philosophy[];
}

export default function TensionCallout({ tensions, philosophies }: Props) {
  if (tensions.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-[var(--text-faint)] uppercase tracking-wider">Tensions in your blend</p>
      {tensions.map((t) => {
        const a = philosophies.find((p) => p.id === t.a);
        const b = philosophies.find((p) => p.id === t.b);
        return (
          <div
            key={`${t.a}-${t.b}`}
            className="flex items-start gap-3 px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--surface)]"
          >
            <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
              <span className="w-2 h-2 rounded-full" style={{ background: a?.color ?? "#888" }} />
              <span className="text-[var(--text-faint)]">↔</span>
              <span className="w-2 h-2 rounded-full" style={{ background: b?.color ?? "#888" }} />
            </div>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">{t.note}</p>
          </div>
        );
      })}
    </div>
  );
}
