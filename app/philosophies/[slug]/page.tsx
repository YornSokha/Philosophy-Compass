import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllPhilosophies, getPhilosophy, getAllPhilosophers } from "@/lib/content";
import Tag from "@/components/ui/Tag";

export async function generateStaticParams() {
  const philosophies = getAllPhilosophies();
  return philosophies.map((p) => ({ slug: p.id }));
}

export default async function PhilosophyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const phil = getPhilosophy(slug);
  if (!phil) notFound();

  const allPhils = getAllPhilosophies();
  const allPhilosophers = getAllPhilosophers();
  const philMap = new Map(allPhils.map((p) => [p.id, p]));
  const philosophers = phil.philosophers
    .map((id) => allPhilosophers.find((p) => p.id === id))
    .filter(Boolean);

  const dimensionLabels: Record<string, string> = {
    meaning: "Meaning",
    emotion: "Emotion",
    morality: "Morality",
    self: "Self",
    suffering: "Suffering",
  };

  return (
    <main className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-2xl mx-auto flex flex-col gap-10">
        <div>
          <div
            className="w-4 h-4 rounded-full mb-4"
            style={{ background: phil.color, boxShadow: `0 0 16px ${phil.color}66` }}
          />
          <h1
            className="font-serif text-5xl leading-tight"
            style={{ color: phil.color }}
          >
            {phil.name}
          </h1>
          <p className="font-serif italic text-xl text-[var(--text-muted)] mt-2">
            {phil.tagline}
          </p>
          <p className="text-xs text-[var(--text-faint)] mt-3">{phil.era}</p>
        </div>

        <p className="text-base text-[var(--text)] leading-relaxed">{phil.summary}</p>

        <div>
          <p className="text-xs text-[var(--text-faint)] uppercase tracking-wider mb-3">Themes</p>
          <div className="flex flex-wrap gap-2">
            {phil.themes.map((t) => (
              <Tag key={t} label={t} color={phil.color} />
            ))}
          </div>
        </div>

        {Object.keys(phil.dimensions).length > 0 && (
          <div>
            <p className="text-xs text-[var(--text-faint)] uppercase tracking-wider mb-3">
              Dimensions
            </p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(phil.dimensions).map(([axis, val]) => (
                <div
                  key={axis}
                  className="flex flex-col gap-0.5 px-3 py-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)]"
                >
                  <span className="text-xs text-[var(--text-faint)]">
                    {dimensionLabels[axis] ?? axis}
                  </span>
                  <span className="text-sm text-[var(--text)] capitalize">{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="text-xs text-[var(--text-faint)] uppercase tracking-wider mb-4">Quotes</p>
          <div className="flex flex-col gap-4">
            {phil.quotes.map((q, i) => (
              <blockquote
                key={i}
                className="border-l-2 pl-4"
                style={{ borderColor: phil.color + "66" }}
              >
                <p className="font-serif italic text-lg text-[var(--text)] leading-relaxed">
                  &ldquo;{q.text}&rdquo;
                </p>
                <cite className="text-sm text-[var(--text-faint)] mt-1.5 block not-italic">
                  — {q.author}
                </cite>
              </blockquote>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {phil.compatible_with.length > 0 && (
            <div>
              <p className="text-xs text-[var(--text-faint)] uppercase tracking-wider mb-3">
                Compatible with
              </p>
              <div className="flex flex-col gap-2">
                {phil.compatible_with.map((id) => {
                  const p = philMap.get(id);
                  return (
                    <Link
                      key={id}
                      href={`/philosophies/${id}`}
                      className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                    >
                      <span className="w-2 h-2 rounded-full" style={{ background: p?.color ?? "#888" }} />
                      {p?.name ?? id}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
          {phil.opposes.length > 0 && (
            <div>
              <p className="text-xs text-[var(--text-faint)] uppercase tracking-wider mb-3">
                In tension with
              </p>
              <div className="flex flex-col gap-2">
                {phil.opposes.map((id) => {
                  const p = philMap.get(id);
                  return (
                    <Link
                      key={id}
                      href={`/philosophies/${id}`}
                      className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                    >
                      <span className="w-2 h-2 rounded-full bg-red-700/50" />
                      {p?.name ?? id}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {philosophers.length > 0 && (
          <div>
            <p className="text-xs text-[var(--text-faint)] uppercase tracking-wider mb-3">
              Key thinkers
            </p>
            <div className="flex flex-wrap gap-2">
              {philosophers.map((p) => p && (
                <Link
                  key={p.id}
                  href={`/philosophers/${p.id}`}
                  className="px-3 py-1.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] hover:border-[var(--text-faint)] transition-all"
                >
                  {p.name}
                  <span className="text-[var(--text-faint)] ml-1.5 text-xs">{p.years}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {phil.modern_echoes.length > 0 && (
          <div>
            <p className="text-xs text-[var(--text-faint)] uppercase tracking-wider mb-3">
              Modern echoes
            </p>
            <div className="flex flex-wrap gap-2">
              {phil.modern_echoes.map((e) => (
                <span
                  key={e}
                  className="px-3 py-1 rounded-full text-xs border border-[var(--border)] text-[var(--text-muted)]"
                >
                  {e}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-[var(--border)] flex gap-3">
          <Link
            href="/discover"
            className="flex-1 py-2.5 text-center text-sm rounded-full bg-[var(--surface-2)] text-[var(--text)] hover:opacity-80 transition-opacity border border-[var(--border)]"
            style={{ borderColor: phil.color + "33" }}
          >
            Discover your blend
          </Link>
          <Link
            href="/philosophies"
            className="py-2.5 px-4 text-sm rounded-full text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
          >
            ← All
          </Link>
        </div>
      </div>
    </main>
  );
}
