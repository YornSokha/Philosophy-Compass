import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllPhilosophers, getPhilosopher, getAllPhilosophies } from "@/lib/content";
import Tag from "@/components/ui/Tag";

export async function generateStaticParams() {
  const philosophers = getAllPhilosophers();
  return philosophers.map((p) => ({ slug: p.id }));
}

export default async function PhilosopherPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const philosopher = getPhilosopher(slug);
  if (!philosopher) notFound();

  const allPhilosophies = getAllPhilosophies();
  const schools = philosopher.schools
    .map((id) => allPhilosophies.find((p) => p.id === id))
    .filter(Boolean);

  const quotes = schools.flatMap((s) =>
    (s?.quotes ?? []).filter(
      (q) => q.author.toLowerCase().includes(philosopher.name.split(" ").slice(-1)[0].toLowerCase())
    )
  );

  return (
    <main className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-2xl mx-auto flex flex-col gap-10">
        <div>
          <div className="flex flex-wrap gap-2 mb-4">
            {schools.map((s) =>
              s ? (
                <Link
                  key={s.id}
                  href={`/philosophies/${s.id}`}
                  className="text-xs px-2.5 py-1 rounded-full border border-[var(--border)] hover:border-[var(--text-faint)] transition-colors"
                  style={{ color: s.color }}
                >
                  {s.name}
                </Link>
              ) : null
            )}
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl text-[var(--text)]">{philosopher.name}</h1>
          <p className="text-[var(--text-faint)] mt-1 text-sm">{philosopher.years}</p>
        </div>

        {philosopher.bio && (
          <p className="text-base text-[var(--text)] leading-relaxed">{philosopher.bio}</p>
        )}

        {philosopher.key_ideas && philosopher.key_ideas.length > 0 && (
          <div>
            <p className="text-xs text-[var(--text-faint)] uppercase tracking-wider mb-3">
              Key ideas
            </p>
            <div className="flex flex-wrap gap-2">
              {philosopher.key_ideas.map((idea) => (
                <Tag key={idea} label={idea} />
              ))}
            </div>
          </div>
        )}

        {schools.length > 0 && (
          <div>
            <p className="text-xs text-[var(--text-faint)] uppercase tracking-wider mb-3">
              Schools of thought
            </p>
            <div className="flex flex-col gap-3">
              {schools.map((s) =>
                s ? (
                  <Link
                    key={s.id}
                    href={`/philosophies/${s.id}`}
                    className="group flex items-start gap-3 p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)] transition-all"
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5"
                      style={{ background: s.color, boxShadow: `0 0 6px ${s.color}55` }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-serif text-base text-[var(--text)] group-hover:text-white transition-colors">
                          {s.name}
                        </span>
                        <span className="text-xs text-[var(--text-faint)] flex-shrink-0">
                          {s.era}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                        {s.tagline}
                      </p>
                    </div>
                  </Link>
                ) : null
              )}
            </div>
          </div>
        )}

        {quotes.length > 0 && (
          <div>
            <p className="text-xs text-[var(--text-faint)] uppercase tracking-wider mb-4">
              Selected quotes
            </p>
            <div className="flex flex-col gap-4">
              {quotes.map((q, i) => (
                <blockquote
                  key={i}
                  className="border-l-2 pl-4"
                  style={{ borderColor: (schools[0]?.color ?? "#888") + "66" }}
                >
                  <p className="font-serif italic text-base sm:text-lg text-[var(--text)] leading-relaxed">
                    &ldquo;{q.text}&rdquo;
                  </p>
                </blockquote>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-[var(--border)] flex gap-3">
          <Link
            href="/discover"
            className="flex-1 py-2.5 text-center text-sm rounded-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] hover:opacity-80 transition-opacity"
          >
            Discover your blend →
          </Link>
          <Link
            href="/philosophies"
            className="py-2.5 px-4 text-sm rounded-full text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
          >
            ← Philosophies
          </Link>
        </div>
      </div>
    </main>
  );
}
