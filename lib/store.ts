"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BlendProfile } from "./types";

interface QuizState {
  answers: Record<string, number>;
  setAnswer: (questionId: string, optionIndex: number) => void;
  reset: () => void;
}

interface ProfileState {
  current: BlendProfile | null;
  timeline: BlendProfile[];
  setProfile: (profile: BlendProfile) => void;
  clearProfile: () => void;
}

export const useQuizStore = create<QuizState>()((set) => ({
  answers: {},
  setAnswer: (questionId, optionIndex) =>
    set((s) => ({ answers: { ...s.answers, [questionId]: optionIndex } })),
  reset: () => set({ answers: {} }),
}));

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      current: null,
      timeline: [],
      setProfile: (profile) =>
        set((s) => ({
          current: profile,
          timeline: [...s.timeline, profile].slice(-10),
        })),
      clearProfile: () => set({ current: null }),
    }),
    { name: "philosophy-compass-profile" }
  )
);
