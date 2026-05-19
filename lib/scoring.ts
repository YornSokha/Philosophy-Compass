import type { BlendProfile, QuizQuestion, Philosophy, Tension } from "./types";

export function computeBlend(
  questions: QuizQuestion[],
  answers: Record<string, number>
): Omit<BlendProfile, "tensions"> {
  const raw: Record<string, number> = {};

  for (const q of questions) {
    const idx = answers[q.id];
    if (idx == null) continue;
    const option = q.options[idx];
    if (!option) continue;
    for (const [id, w] of Object.entries(option.weights)) {
      raw[id] = (raw[id] ?? 0) + w;
    }
  }

  const values = Object.values(raw);
  if (values.length === 0) {
    return { scores: {}, top: [], createdAt: new Date().toISOString() };
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const normalized: Record<string, number> = {};
  for (const [id, val] of Object.entries(raw)) {
    normalized[id] = Math.sqrt((val - min) / range);
  }

  const sorted = Object.entries(normalized).sort((a, b) => b[1] - a[1]);

  const top: string[] = sorted
    .filter(([, s]) => s > 0.4)
    .slice(0, 3)
    .map(([id]) => id);

  if (top.length < 3) {
    const needed = 3 - top.length;
    sorted
      .filter(([id, s]) => !top.includes(id) && s >= 0.25)
      .slice(0, needed)
      .forEach(([id]) => top.push(id));
  }

  while (top.length < Math.min(3, sorted.length)) {
    const next = sorted[top.length];
    if (next) top.push(next[0]);
  }

  return { scores: normalized, top, createdAt: new Date().toISOString() };
}

export function computeTensions(top: string[], philosophies: Philosophy[]): Tension[] {
  const byId = new Map(philosophies.map((p) => [p.id, p]));
  const tensions: Tension[] = [];

  for (let i = 0; i < top.length - 1; i++) {
    for (let j = i + 1; j < top.length; j++) {
      const a = byId.get(top[i]);
      const b = byId.get(top[j]);
      if (a && b && a.opposes.includes(b.id)) {
        tensions.push({
          a: a.id,
          b: b.id,
          note: `You're pulled between ${a.name}'s ${a.themes[0]} and ${b.name}'s ${b.themes[0]}.`,
        });
      }
    }
  }

  return tensions;
}

export function encodeProfile(profile: BlendProfile): string {
  return btoa(encodeURIComponent(JSON.stringify(profile)));
}

export function decodeProfile(encoded: string): BlendProfile | null {
  try {
    return JSON.parse(decodeURIComponent(atob(encoded))) as BlendProfile;
  } catch {
    return null;
  }
}
