import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllProblems, getProblem, getPhilosophy } from "@/lib/content";
import Tag from "@/components/ui/Tag";

export async function generateStaticParams() {
  const problems = getAllProblems();
  return problems.map((p) => ({ slug: p.id }));
}

export default async function ProblemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const problem = getProblem(slug);
  if (!problem) notFound();

  return (
    <main className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-2xl mx-auto flex flex-col gap-8">
        <div>
          <Link
            href="/problems"
            className="text-xs text-[var(--text-faint)] hover:text-[var(--text-muted)] transition-colors mb-4 block"
          >
            ← All problems
          </Link>
          <h1 className="font-serif text-4xl text-[var(--text)]">{problem.name}</h1>
          <p className="text-[var(--text-muted)] mt-2 text-base leading-relaxed">
            {problem.description}
          </p>
        </div>

        <div className="flex flex-col gap-5">
          <p className="text-xs text-[var(--text-faint)] uppercase tracking-wider">
            {problem.responses.length} philosophical perspectives
          </p>

          {problem.responses.map((r) => {
            const phil = getPhilosophy(r.philosophy_id);
            if (!phil) return null;
            return (
              <div
                key={r.philosophy_id}
                className="p-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] flex gap-4"
              >
                <div
                  className="w-1 rounded-full flex-shrink-0 mt-1"
                  style={{ background: phil.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2 mb-2">
                    <Link
                      href={`/philosophies/${phil.id}`}
                      className="font-serif text-lg hover:opacity-80 transition-opacity"
                      style={{ color: phil.color }}
                    >
                      {phil.name}
                    </Link>
                    <div className="flex flex-wrap gap-1">
                      {phil.themes.slice(0, 2).map((t) => (
                        <Tag key={t} label={t} />
                      ))}
                    </div>
                  </div>
                  <p className="text-[var(--text)] leading-relaxed">{r.angle}</p>

                  {phil.quotes.length > 0 && (
                    <blockquote
                      className="mt-3 border-l-2 pl-3"
                      style={{ borderColor: phil.color + "55" }}
                    >
                      <p className="font-serif italic text-sm text-[var(--text-muted)]">
                        &ldquo;{phil.quotes[0].text}&rdquo;
                      </p>
                      <cite className="text-xs text-[var(--text-faint)] not-italic">
                        — {phil.quotes[0].author}
                      </cite>
                    </blockquote>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-[var(--border)]">
          <Link
            href="/discover"
            className="inline-block px-8 py-3 rounded-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] text-sm hover:opacity-80 transition-opacity"
          >
            Find your blend →
          </Link>
        </div>
      </div>
    </main>
  );
}
