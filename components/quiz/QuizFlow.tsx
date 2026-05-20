"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import type { QuizQuestion, Philosophy } from "@/lib/types";
import { useQuizStore, useProfileStore } from "@/lib/store";
import { computeBlend, computeTensions, encodeProfile } from "@/lib/scoring";
import QuestionCard from "./QuestionCard";
import ProgressBar from "./ProgressBar";

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
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const question = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  useEffect(() => {
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, []);

  const handleSelect = useCallback(
    (optionIndex: number) => {
      if (timer.current) { clearTimeout(timer.current); timer.current = null; }
      setPendingAnswer(optionIndex);

      if (!isLast) {
        timer.current = setTimeout(() => {
          setAnswer(question.id, optionIndex);
          setCurrentIndex((i) => i + 1);
          setPendingAnswer(null);
          timer.current = null;
        }, 350);
      }
    },
    [isLast, question, setAnswer]
  );

  const handleNext = useCallback(() => {
    if (pendingAnswer == null || !question) return;
    setAnswer(question.id, pendingAnswer);
    const newAnswers = { ...answers, [question.id]: pendingAnswer };
    const partial = computeBlend(questions, newAnswers);
    const tensions = computeTensions(partial.top, philosophies);
    const profile = { ...partial, tensions };
    setProfile(profile);
    reset();
    router.push(`/profile?blend=${encodeProfile(profile)}`);
  }, [pendingAnswer, question, answers, questions, philosophies, setAnswer, setProfile, reset, router]);

  const handleBack = () => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null; }
    if (currentIndex === 0) return;
    setCurrentIndex((i) => i - 1);
    setPendingAnswer(answers[questions[currentIndex - 1]?.id ?? ""] ?? null);
  };

  if (!question) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16 md:py-24">
      <div className="w-full max-w-xl mb-8 flex flex-col gap-4">
        <ProgressBar current={currentIndex} total={questions.length} />
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className={`text-sm text-[var(--text-faint)] hover:text-[var(--text-muted)] transition-colors ${
              currentIndex === 0 ? "invisible" : ""
            }`}
          >
            ← Back
          </button>
          <span className="text-xs text-[var(--text-faint)]">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>
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

      {isLast && (
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
            See my blend →
          </button>
        </div>
      )}
    </div>
  );
}
