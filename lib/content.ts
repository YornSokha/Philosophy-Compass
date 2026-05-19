import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import type { Philosophy, Philosopher, Problem, QuizQuestion } from "./types";

const CONTENT = join(process.cwd(), "content");

function readJson<T>(rel: string): T {
  return JSON.parse(readFileSync(join(CONTENT, rel), "utf8")) as T;
}

export function getAllPhilosophies(): Philosophy[] {
  const dir = join(CONTENT, "philosophies");
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => readJson<Philosophy>(`philosophies/${f}`))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getPhilosophy(id: string): Philosophy | null {
  try {
    return readJson<Philosophy>(`philosophies/${id}.json`);
  } catch {
    return null;
  }
}

export function getAllPhilosophers(): Philosopher[] {
  return readJson<Philosopher[]>("philosophers.json");
}

export function getPhilosopher(id: string): Philosopher | null {
  return getAllPhilosophers().find((p) => p.id === id) ?? null;
}

export function getAllProblems(): Problem[] {
  return readJson<Problem[]>("problems.json");
}

export function getProblem(id: string): Problem | null {
  return getAllProblems().find((p) => p.id === id) ?? null;
}

export function getQuiz(): QuizQuestion[] {
  return readJson<QuizQuestion[]>("quiz.json");
}
