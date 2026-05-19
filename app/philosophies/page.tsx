import Link from "next/link";
import { getAllPhilosophies } from "@/lib/content";
import Tag from "@/components/ui/Tag";

export default function PhilosophiesPage() {
  const philosophies = getAllPhilosophies();

  return (
    <main className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h1 className="font-serif text-4xl text-[var(--text)]">Philosophies</h1>
          <p className="text-[var(--text-muted)] mt-2 text-sm">
            Ten frameworks for understanding yourself.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {philosophies.map((p) => (
            <Link
              key={p.id}
              href={`/philosophies/${p.id}`}
              className="group block p-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)] transition-all"
            >
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
                  style={{ background: p.color, boxShadow: `0 0 8px ${p.color}44` }}
                />
                <div className="flex-1 min-w-0">
                  <h2 className="font-serif text-xl text-[var(--text)] group-hover:text-white transition-colors">
                    {p.name}
                  </h2>
                  <p className="text-xs text-[var(--text-faint)] mt-0.5">{p.era}</p>
                </div>
              </div>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-3 line-clamp-2">
                {p.tagline}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {p.themes.slice(0, 3).map((t) => (
                  <Tag key={t} label={t} />
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
