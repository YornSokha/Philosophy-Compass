import Link from "next/link";
import type { Problem } from "@/lib/types";

interface Props {
  problem: Problem;
}

export default function ProblemCard({ problem }: Props) {
  return (
    <Link
      href={`/problems/${problem.id}`}
      className="group block p-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)] hover:border-[var(--text-faint)] transition-all"
    >
      <h3 className="font-serif text-lg text-[var(--text)] group-hover:text-white transition-colors">
        {problem.name}
      </h3>
      <p className="text-sm text-[var(--text-muted)] mt-1.5 leading-relaxed">
        {problem.description}
      </p>
      <p className="text-xs text-[var(--text-faint)] mt-3">
        {problem.responses.length} perspectives →
      </p>
    </Link>
  );
}
