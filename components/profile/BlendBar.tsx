"use client";
import { motion } from "framer-motion";
import type { Philosophy } from "@/lib/types";

interface Props {
  scores: Record<string, number>;
  philosophies: Philosophy[];
}

export default function BlendBar({ scores, philosophies }: Props) {
  const sorted = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .filter(([, s]) => s > 0.1);

  const total = sorted.reduce((sum, [, s]) => sum + s, 0);

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex h-8 rounded-full overflow-hidden">
        {sorted.map(([id, score], i) => {
          const phil = philosophies.find((p) => p.id === id);
          const pct = (score / total) * 100;
          return (
            <motion.div
              key={id}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: "easeOut" }}
              title={`${phil?.name ?? id}: ${Math.round(pct)}%`}
              style={{ background: phil?.color ?? "#888" }}
              className="h-full"
            />
          );
        })}
      </div>

      <div className="flex flex-col gap-2.5">
        {sorted.map(([id, score], i) => {
          const phil = philosophies.find((p) => p.id === id);
          const pct = Math.round((score / total) * 100);
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
              className="flex items-center gap-3"
            >
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: phil?.color ?? "#888", boxShadow: `0 0 6px ${phil?.color ?? "#888"}66` }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-serif text-sm text-[var(--text)]">{phil?.name ?? id}</span>
                  <span className="text-xs text-[var(--text-muted)] tabular-nums">{pct}%</span>
                </div>
                <p className="text-xs text-[var(--text-faint)] truncate mt-0.5">{phil?.tagline}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
