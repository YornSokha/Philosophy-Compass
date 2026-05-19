import { getAllProblems } from "@/lib/content";
import ProblemCard from "@/components/problem/ProblemCard";

export default function ProblemsPage() {
  const problems = getAllProblems();

  return (
    <main className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h1 className="font-serif text-4xl text-[var(--text)]">Problems</h1>
          <p className="text-[var(--text-muted)] mt-2 text-sm max-w-md">
            Start here if you have a specific struggle. Each problem maps to the philosophies
            that address it — and explains exactly how.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {problems.map((p) => (
            <ProblemCard key={p.id} problem={p} />
          ))}
        </div>
      </div>
    </main>
  );
}
