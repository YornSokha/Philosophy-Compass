import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  DIMENSION_AXES,
  DIMENSION_VALUES,
  type DimensionAxis,
  type Philosophy,
  type Problem,
  type QuizQuestion,
} from "../lib/types";

const CONTENT = join(process.cwd(), "content");
const errors: string[] = [];
const err = (where: string, msg: string) => errors.push(`  ✗ [${where}] ${msg}`);

function loadJsonDir<T>(dir: string): T[] {
  const path = join(CONTENT, dir);
  return readdirSync(path)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(readFileSync(join(path, f), "utf8")) as T);
}

function loadJsonFile<T>(file: string): T {
  return JSON.parse(readFileSync(join(CONTENT, file), "utf8")) as T;
}

const philosophies = loadJsonDir<Philosophy>("philosophies");
const problems     = loadJsonFile<Problem[]>("problems.json");
const quiz         = loadJsonFile<QuizQuestion[]>("quiz.json");

const philosophyIds = new Set(philosophies.map((p) => p.id));
const problemIds    = new Set(problems.map((p) => p.id));

const seen = new Set<string>();
for (const p of philosophies) {
  const w = `philosophy:${p.id}`;
  if (seen.has(p.id)) err(w, `duplicate id`);
  seen.add(p.id);
  if (!p.name || !p.tagline || !p.summary) err(w, `missing name/tagline/summary`);
  if (p.tagline?.length > 90) err(w, `tagline > 90 chars (${p.tagline.length})`);
  if (!/^#[0-9A-Fa-f]{6}$/.test(p.color || "")) err(w, `color must be 6-digit hex, got ${p.color}`);
  if (!p.themes?.length || p.themes.length < 3) err(w, `needs ≥ 3 themes`);
  if (!p.quotes?.length || p.quotes.length < 3) err(w, `needs ≥ 3 quotes`);
  for (const q of p.quotes ?? []) {
    const words = q.text.trim().split(/\s+/).length;
    if (words >= 15) err(w, `quote ≥ 15 words by ${q.author}`);
  }
  for (const [axis, val] of Object.entries(p.dimensions ?? {})) {
    if (!DIMENSION_AXES.includes(axis as DimensionAxis))
      err(w, `unknown dimension axis "${axis}"`);
    else if (!DIMENSION_VALUES[axis as DimensionAxis].includes(val as string))
      err(w, `bad value for ${axis}: "${val}"`);
  }
  for (const id of p.problems_helped ?? [])
    if (!problemIds.has(id)) err(w, `unknown problem "${id}"`);
  for (const id of p.compatible_with ?? [])
    if (!philosophyIds.has(id)) err(w, `unknown compatible_with "${id}"`);
  for (const id of p.opposes ?? [])
    if (!philosophyIds.has(id)) err(w, `unknown opposes "${id}"`);
  for (const id of p.influenced_by ?? [])
    if (!philosophyIds.has(id)) err(w, `unknown influenced_by "${id}"`);
}

const byId = new Map(philosophies.map((p) => [p.id, p]));
for (const p of philosophies) {
  for (const id of p.compatible_with ?? []) {
    const other = byId.get(id);
    if (other && !other.compatible_with?.includes(p.id))
      err(`philosophy:${p.id}`, `compatible_with ${id} not reciprocated`);
  }
  for (const id of p.opposes ?? []) {
    const other = byId.get(id);
    if (other && !other.opposes?.includes(p.id))
      err(`philosophy:${p.id}`, `opposes ${id} not reciprocated`);
  }
}

const pSeen = new Set<string>();
for (const p of problems) {
  const w = `problem:${p.id}`;
  if (pSeen.has(p.id)) err(w, `duplicate id`);
  pSeen.add(p.id);
  if (!p.name || !p.description) err(w, `missing name/description`);
  if (!p.responses?.length) err(w, `no responses`);
  for (const r of p.responses ?? []) {
    if (!philosophyIds.has(r.philosophy_id))
      err(w, `unknown philosophy_id "${r.philosophy_id}"`);
    if (!r.angle || r.angle.length < 20)
      err(w, `angle for ${r.philosophy_id} is missing or too thin`);
  }
}

if (quiz.length < 10 || quiz.length > 20)
  err("quiz", `expected 10–20 questions, got ${quiz.length}`);

const qSeen = new Set<string>();
for (const q of quiz) {
  const w = `quiz:${q.id}`;
  if (qSeen.has(q.id)) err(w, `duplicate id`);
  qSeen.add(q.id);
  if (!DIMENSION_AXES.includes(q.axis)) err(w, `bad axis "${q.axis}"`);
  if (!q.options?.length || q.options.length < 3 || q.options.length > 4)
    err(w, `need 3–4 options, got ${q.options?.length}`);
  for (const o of q.options ?? []) {
    for (const [pid, wt] of Object.entries(o.weights ?? {})) {
      if (!philosophyIds.has(pid)) err(w, `option weights reference unknown philosophy "${pid}"`);
      if (typeof wt !== "number" || wt < -1 || wt > 1)
        err(w, `weight for ${pid} out of range: ${wt}`);
    }
  }
}

const reached = new Set<string>();
for (const q of quiz)
  for (const o of q.options ?? [])
    for (const pid of Object.keys(o.weights ?? {})) reached.add(pid);
for (const pid of philosophyIds)
  if (!reached.has(pid))
    err("quiz", `philosophy "${pid}" is unreachable from any quiz question`);

if (errors.length) {
  console.error(`\n✗ Content validation failed (${errors.length} issue${errors.length > 1 ? "s" : ""}):\n`);
  for (const e of errors) console.error(e);
  process.exit(1);
}

console.log(`✓ Content OK — ${philosophies.length} philosophies, ${problems.length} problems, ${quiz.length} quiz questions.`);
