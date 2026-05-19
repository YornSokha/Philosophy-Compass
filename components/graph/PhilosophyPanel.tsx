"use client";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import type { GraphNode } from "@/lib/graph";
import type { Philosophy } from "@/lib/types";

interface Props {
  node: GraphNode;
  philosophies: Philosophy[];
  onClose: () => void;
}

export default function PhilosophyPanel({ node, philosophies, onClose }: Props) {
  const phil = philosophies.find((p) => p.id === node.id);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const motionProps = isMobile
    ? { initial: { y: "100%", opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: "100%", opacity: 0 } }
    : { initial: { x: 24, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: 24, opacity: 0 } };

  const panelClass = isMobile
    ? "fixed bottom-0 left-0 right-0 h-[70vh] bg-[var(--surface)] border-t border-[var(--border)] rounded-t-2xl flex flex-col overflow-hidden z-50"
    : "absolute right-0 top-0 bottom-0 w-80 bg-[var(--surface)] border-l border-[var(--border)] flex flex-col overflow-hidden";

  return (
    <AnimatePresence>
      <motion.div
        key={node.id}
        {...motionProps}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={panelClass}
      >
        {isMobile && (
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-10 h-1 rounded-full bg-[var(--border)]" />
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div
                className="w-3 h-3 rounded-full mb-3"
                style={{ background: node.color, boxShadow: `0 0 8px ${node.color}66` }}
              />
              <h2 className="font-serif text-2xl leading-tight text-[var(--text)]">{node.name}</h2>
              <p className="text-sm text-[var(--text-muted)] mt-1 italic">{node.tagline}</p>
            </div>
            <button
              onClick={onClose}
              className="text-[var(--text-faint)] hover:text-[var(--text-muted)] transition-colors mt-1 flex-shrink-0"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {phil && (
            <>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">{phil.summary}</p>

              <div className="flex flex-wrap gap-1.5">
                {phil.themes.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded-full text-xs border border-[var(--border)] text-[var(--text-muted)]"
                  >
                    {t}
                  </span>
                ))}
              </div>

              {phil.quotes.slice(0, 2).map((q, i) => (
                <blockquote key={i} className="border-l-2 pl-3" style={{ borderColor: node.color + "66" }}>
                  <p className="font-serif italic text-sm text-[var(--text)] leading-relaxed">
                    &ldquo;{q.text}&rdquo;
                  </p>
                  <cite className="text-xs text-[var(--text-faint)] mt-1 block not-italic">
                    — {q.author}
                  </cite>
                </blockquote>
              ))}

              {(phil.compatible_with.length > 0 || phil.opposes.length > 0) && (
                <div className="space-y-2">
                  {phil.compatible_with.length > 0 && (
                    <div>
                      <p className="text-xs text-[var(--text-faint)] uppercase tracking-wider mb-1.5">
                        Compatible with
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {phil.compatible_with.map((id) => {
                          const p = philosophies.find((x) => x.id === id);
                          return (
                            <span
                              key={id}
                              className="px-2 py-0.5 rounded-full text-xs"
                              style={{ background: (p?.color ?? "#aaa") + "22", color: p?.color ?? "#aaa" }}
                            >
                              {p?.name ?? id}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {phil.opposes.length > 0 && (
                    <div>
                      <p className="text-xs text-[var(--text-faint)] uppercase tracking-wider mb-1.5">
                        In tension with
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {phil.opposes.map((id) => {
                          const p = philosophies.find((x) => x.id === id);
                          return (
                            <span
                              key={id}
                              className="px-2 py-0.5 rounded-full text-xs border border-red-900/40 text-red-400/70"
                            >
                              {p?.name ?? id}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-4 border-t border-[var(--border)] flex gap-2 flex-shrink-0">
          <Link
            href={`/philosophies/${node.id}`}
            className="flex-1 py-2 text-center text-sm rounded-lg border border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors"
            style={{ borderColor: node.color + "44" }}
          >
            Explore →
          </Link>
          <Link
            href="/discover"
            className="py-2 px-3 text-sm rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
          >
            Take quiz
          </Link>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
