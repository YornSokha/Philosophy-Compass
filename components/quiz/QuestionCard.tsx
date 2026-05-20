"use client";
import { motion } from "framer-motion";
import type { QuizQuestion } from "@/lib/types";

interface Props {
  question: QuizQuestion;
  selected: number | null;
  onSelect: (index: number) => void;
}

export default function QuestionCard({ question, selected, onSelect }: Props) {
  return (
    <motion.div
      key={question.id}
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -40, opacity: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full max-w-xl mx-auto flex flex-col gap-6"
    >
      <h2 className="font-serif text-2xl sm:text-3xl leading-snug text-[var(--text)] text-balance">
        {question.prompt}
      </h2>

      <div className="flex flex-col gap-3">
        {question.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className={`group w-full text-left px-5 py-4 rounded-xl border transition-all duration-200 ${
              selected === i
                ? "border-[var(--text-muted)] bg-[var(--surface-2)] text-[var(--text)]"
                : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:border-[var(--text-faint)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]"
            }`}
          >
            <span className="font-serif text-base leading-relaxed">{opt.label}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
