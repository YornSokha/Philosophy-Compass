"use client";
import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import type { QuizQuestion, Philosophy } from "@/lib/types";
import { useQuizStore, useProfileStore } from "@/lib/store";
import { computeBlend, computeTensions, encodeProfile } from "@/lib/scoring";
import QuestionCard from "./QuestionCard";
import ProgressDots from "./ProgressDots";

interface Props {
  questions: QuizQuestion[];
  philosophies: Philosophy[];
}

export default function QuizFlow({ questions, philosophies }: Props) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pendingAnswer, setPendingAnswer] = useState<number | null>(null);
  const { answers, setAnswer, reset } = useQuizStore();
  const { setProfile } = useProfileStore();

  const question = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  const handleSelect = useCallback(
    (optionIndex: number) => {
      setPendingAnswer(optionIndex);
    },
    []
  );

  const handleNext = useCallback(() => {
    if (pendingAnswer == null || !question) return;
    setAnswer(question.id, pendingAnswer);
    const newAnswers = { ...answers, [question.id]: pendingAnswer };

    if (isLast) {
      const partial = computeBlend(questions, newAnswers);
      const tensions = computeTensions(partial.top, philosophies);
      const profile = { ...partial, tensions };
      setProfile(profile);
      reset();
      const encoded = encodeProfile(profile);
      router.push(`/profile?blend=${encoded}`);
    } else {
      setCurrentIndex((i) => i + 1);
      setPendingAnswer(null);
    }
  }, [pendingAnswer, question, answers, isLast, questions, philosophies, setAnswer, setProfile, reset, router]);

  const handleBack = () => {
    if (currentIndex === 0) return;
    setCurrentIndex((i) => i - 1);
    setPendingAnswer(answers[questions[currentIndex - 1]?.id ?? ""] ?? null);
  };

  if (!question) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-24">
      <div className="w-full max-w-xl mb-10 flex items-center justify-between">
        <button
          onClick={handleBack}
          className={`text-sm text-[var(--text-faint)] hover:text-[var(--text-muted)] transition-colors ${
            currentIndex === 0 ? "invisible" : ""
          }`}
        >
          ← Back
        </button>
        <ProgressDots total={questions.length} current={currentIndex} />
        <span className="text-xs text-[var(--text-faint)]">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      <div className="w-full max-w-xl">
        <AnimatePresence mode="wait">
          <QuestionCard
            key={question.id}
            question={question}
            selected={pendingAnswer}
            onSelect={handleSelect}
          />
        </AnimatePresence>
      </div>

      <div className="mt-8 w-full max-w-xl flex justify-end">
        <button
          onClick={handleNext}
          disabled={pendingAnswer == null}
          className={`px-8 py-3 rounded-full text-sm transition-all ${
            pendingAnswer != null
              ? "bg-[var(--text)] text-[var(--bg)] hover:opacity-90"
              : "bg-[var(--surface-2)] text-[var(--text-faint)] cursor-not-allowed"
          }`}
        >
          {isLast ? "See my blend →" : "Next →"}
        </button>
      </div>
    </div>
  );
}
