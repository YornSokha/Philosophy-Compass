# CLAUDE.md — Philosophy Compass

> Working implementation plan. This is the source of truth for what we're building, in what order, and why.

---

## 1. The One-Line Pitch

**Philosophy Compass is a tool for understanding yourself through philosophical frameworks — not a reference site for studying them.**

Everything in this repo should be evaluated against that sentence. If a feature teaches philosophy but doesn't help the user understand themselves, deprioritize it.

---

## 2. North-Star Principles

Carry these into every design and code decision.

1. **Self-discovery over education.** The user's question is *"who am I and how should I live?"*, not *"what did Epictetus believe?"*.
2. **Visual relationships beat linear text.** Show how ideas connect. Prose is the fallback, not the default.
3. **No "right answer" framing.** Philosophies are *different responses to human existence*, never ranked, never opposed as right/wrong.
4. **Users are blends, not types.** Output is always a weighted mix (e.g. 65% Stoic / 45% Existentialist), never a single label.
5. **Problem-first navigation is a peer to topic-first.** "I feel anxious" is as valid an entry point as "tell me about Stoicism."
6. **Static, fast, no backend.** Everything ships as static files. State lives in the URL or `localStorage`.

---

## 3. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 15 (App Router, static export)** | Static-first, file-based routing, MDX support |
| Language | **TypeScript (strict)** | Data model is the heart of this app; types are non-negotiable |
| Styling | **TailwindCSS** + CSS variables for theming | Fast iteration, dark mode, design tokens |
| Animation | **Framer Motion** | Page transitions, profile reveal, quiz flow |
| Graph viz | **`react-force-graph-2d`** (D3 force sim under the hood) | Constellation feel out of the box; canvas-rendered = handles 100+ nodes smoothly |
| State | **Zustand** + URL params | Quiz progress, blend profile, evolution timeline |
| Persistence | `localStorage` (profile, timeline) | No accounts, no backend |
| Content | **Static JSON** for structured data, **MDX** for philosopher long-form pages | Structured queries + rich prose |
| Deploy | **Cloudflare Pages** or **Vercel** | Both fine; CF Pages preferred for cost |

**Explicitly rejected and why:**
- React Flow → too "diagram editor" aesthetic; we want celestial, not flowcharty.
- Cytoscape.js → powerful but heavyweight API for our scale (~50 nodes max).
- Pure D3 from scratch → reinventing force simulation costs a week; `react-force-graph` wraps it cleanly.
- Any backend / DB / auth → out of scope for v1.

---

## 4. Repository Structure

```
/
├── CLAUDE.md                    ← you are here
├── README.md                    ← user-facing
├── app/
│   ├── layout.tsx
│   ├── page.tsx                 ← home: the constellation
│   ├── discover/page.tsx        ← quiz
│   ├── profile/page.tsx         ← blend result + share
│   ├── problems/
│   │   ├── page.tsx             ← problem grid
│   │   └── [slug]/page.tsx      ← responses per problem
│   ├── philosophies/
│   │   ├── page.tsx             ← list / search
│   │   └── [slug]/page.tsx      ← single philosophy
│   ├── philosophers/[slug]/page.tsx
│   ├── compare/page.tsx         ← side-by-side
│   └── timeline/page.tsx        ← personal evolution
├── components/
│   ├── graph/                   ← ForceGraph wrapper, node renderers, legend
│   ├── quiz/                    ← QuestionCard, ProgressDots, ResultReveal
│   ├── profile/                 ← BlendBar, TensionCallout, ShareCard
│   ├── problem/                 ← ProblemCard, ResponseAccordion
│   └── ui/                      ← primitives (Button, Tag, Tooltip…)
├── content/
│   ├── philosophies/*.json      ← one file per philosophy
│   ├── philosophers/*.mdx
│   ├── problems/*.json
│   ├── quiz.json                ← question bank
│   └── relationships.json       ← edges (compatible / opposes / influences)
├── lib/
│   ├── types.ts                 ← TS contracts for all content
│   ├── content.ts               ← typed loaders, build-time validation
│   ├── scoring.ts               ← quiz → blend math
│   ├── graph.ts                 ← build nodes+edges from content
│   └── store.ts                 ← Zustand: profile, timeline
└── scripts/
    └── validate-content.ts      ← run in CI; fails build on bad data
```

---

## 5. Core Data Model

All content is typed. The validator script runs on every build — if a philosophy references a problem that doesn't exist, the build fails.

```ts
// lib/types.ts

export type DimensionAxis =
  | "meaning"      // created | discovered | illusion
  | "emotion"      // control | express | observe
  | "morality"     // objective | subjective | utility | virtue
  | "self"         // fixed | fluid | illusory
  | "suffering";   // meaningful | avoidable | inherent

export interface Philosophy {
  id: string;                          // "stoicism"
  name: string;                        // "Stoicism"
  tagline: string;                     // one-line essence, < 80 chars
  summary: string;                     // 2–3 sentence overview
  era: string;                         // "Ancient Greek / Roman, ~300 BCE"
  color: string;                       // hex; drives node color in graph
  themes: string[];                    // ["discipline", "resilience"]
  dimensions: Partial<Record<DimensionAxis, string>>;
  problems_helped: string[];           // problem ids
  compatible_with: string[];           // philosophy ids
  opposes: string[];                   // philosophy ids
  influences: string[];                // philosophy ids (directed)
  philosophers: string[];              // philosopher ids
  quotes: { text: string; author: string }[];
  modern_echoes: string[];             // ["CBT therapy", "discipline culture"]
}

export interface Philosopher {
  id: string;
  name: string;
  years: string;                       // "121–180 CE"
  schools: string[];                   // philosophy ids
  // long-form bio lives in /content/philosophers/{id}.mdx
}

export interface Problem {
  id: string;                          // "fear_of_death"
  name: string;                        // "Fear of death"
  description: string;
  responses: {
    philosophy_id: string;
    angle: string;                     // *why* this tradition speaks to it
  }[];
}

export interface QuizQuestion {
  id: string;
  prompt: string;                      // "Is suffering meaningful?"
  axis: DimensionAxis;
  options: {
    label: string;                     // "It teaches us what matters"
    weights: Record<string, number>;   // philosophy_id → -1..+1
  }[];
}

export interface BlendProfile {
  scores: Record<string, number>;      // normalized 0..1
  top: string[];                       // top 3 philosophy ids
  tensions: { a: string; b: string; note: string }[];
  createdAt: string;                   // ISO
}
```

---

## 6. The Three Hero Features

These are the differentiators. Everything else supports them.

### 6.1 The Constellation (`/`)

The homepage is not a nav menu. It's a zoomable, draggable force-directed graph of philosophies.

- **Nodes**: philosophies, sized by "breadth of influence" (manual weight in JSON).
- **Edges**: three kinds, visually distinct.
  - `compatible_with` → soft solid line
  - `influences` → arrow, dashed
  - `opposes` → red, semi-transparent
- **Interaction**:
  - Hover → halo + tooltip with tagline.
  - Click → side panel slides in with full summary, themes, philosophers, "explore nearby" CTA.
  - Double-click → navigate to `/philosophies/{id}`.
  - Pinch / scroll → zoom. Drag empty space → pan. Drag node → repel.
- **Filter chips above the canvas**: by problem (`anxiety`, `meaning`…), by dimension axis. Selecting one dims unrelated nodes.
- **Performance budget**: 60fps with 30 nodes + 80 edges on a mid-range phone. Canvas, not SVG.

### 6.2 The Discovery Quiz (`/discover` → `/profile`)

12–15 questions, one per screen, big-touch-target answers, no skip.

- Each option carries a `weights` map. After all answers, normalize → `BlendProfile`.
- **Result page** has four parts:
  1. **Blend bar** — horizontal stack of top philosophies with percentages.
  2. **Mini constellation** — same graph component, but only your top 5 + their edges, animated in.
  3. **Tensions callout** — algorithm flags any pair in your top 3 that have an `opposes` relationship. Shown as `"You're pulled between {A}'s {theme} and {B}'s {theme}."`
  4. **Share card** — generates a PNG via `<canvas>` for socials. URL encodes the blend so the link reproduces the result.
- Profile saves to `localStorage` and appends to the **evolution timeline**.

**Scoring** (see `lib/scoring.ts`):
```ts
// 1. Sum option weights per philosophy across all answers.
// 2. Min-max normalize across philosophies → 0..1.
// 3. Soften with sqrt to avoid one philosophy dominating.
// 4. Top N where score > 0.4 = primary; 0.25–0.4 = secondary.
```

### 6.3 The Problem Explorer (`/problems`, `/problems/[slug]`)

Entry point for users who don't want to take a quiz.

- Grid of problem cards: *anxiety, lack of meaning, fear of death, loneliness, burnout, identity crisis, attachment, social alienation, overthinking, nihilism, lack of discipline, emotional suffering.*
- Each problem page lists 3–5 philosophies, **each with a distinct *angle*** — not a generic summary.
  - Example for "Fear of death":
    - Stoicism → *"Death is a natural process, not a misfortune."*
    - Epicureanism → *"Where death is, you are not."*
    - Buddhism → *"The self that fears death is itself the illusion."*
    - Existentialism → *"Mortality is what makes choice meaningful."*
- Each angle links to its philosophy page and to philosopher quotes that articulate it.

---

## 7. Secondary Features

| Feature | Priority | Notes |
|---|---|---|
| Philosophy pages (`/philosophies/[slug]`) | P1 | Summary, themes, dimensions visualized, philosophers, compatible/opposing list, "nearby" mini-graph, quotes |
| Philosopher pages (`/philosophers/[slug]`) | P1 | MDX content, schools they belong to, key ideas, influence arrows |
| Compare view (`/compare?a=stoicism&b=existentialism`) | P2 | Two-column dimension-by-dimension table + Venn-style overlap |
| Evolution timeline (`/timeline`) | P2 | Reads from `localStorage`, shows how blend has shifted over re-takes |
| Daily reflection | P3 | Picks a quote based on user's primary philosophy, rotates daily |
| AI guide | P4 | Out of scope for static build; revisit if API budget appears |

---

## 8. Initial Content Scope (MVP)

Ship with **10 philosophies**. Each is roughly equal effort — pick a coherent set, not the most obscure.

1. Stoicism
2. Existentialism
3. Nihilism
4. Absurdism
5. Buddhism
6. Taoism
7. Epicureanism
8. Utilitarianism
9. Pragmatism
10. Cynicism

Plus:
- **12 problems** (list in §6.3)
- **15 quiz questions** (3 per axis)
- **~25 philosophers** (2–3 per philosophy on average)
- **~80 quotes** (distributed)

**Content is gating, not code.** Block out 3–4 days for writing alone. Tone target: *thoughtful, accessible, never academic.*

---

## 9. Build Order (Phased)

Each phase ends with something demoable.

### Phase 0 — Foundation (½ day)
- `create-next-app` with TS, Tailwind, App Router, static export configured.
- Add `lib/types.ts`, content folder skeleton, validator script wired into `npm run build`.
- One sample philosophy JSON + one philosopher MDX to prove the pipeline.

### Phase 1 — Content + static pages (2–3 days, parallelizable with writing)
- Philosophy and philosopher detail pages render from content.
- No interactivity yet; just routing, layout, typography.

### Phase 2 — The constellation (2 days)
- `react-force-graph-2d` integrated, node/edge styling matches design.
- Side panel on click. Filters working.
- This is the homepage and the moment the product feels like itself.

### Phase 3 — Quiz + profile (2 days)
- Question flow, scoring lib with unit tests, result reveal.
- Blend profile saved to localStorage, share URL encoding.

### Phase 4 — Problem explorer (1 day)
- Grid + detail pages from problems JSON.

### Phase 5 — Compare + timeline (1 day)

### Phase 6 — Polish (1–2 days)
- Motion passes, empty states, mobile QA, OG images for sharing, copy edit.

**Total: ~10 working days** assuming content is being written in parallel.

---

## 10. Design System Notes

- **Mood**: late-night observatory. Deep blues, off-white type, soft glows on interactive elements. Not "academic paper."
- **Type**: a serif for prose (e.g. *Newsreader*), a tight sans for UI (e.g. *Inter*).
- **Color per philosophy**: each philosophy gets a hex in its JSON. Used as node fill and as accent on its detail page. Pick colors with enough perceptual distance — pre-validate with a contrast script.
- **Motion**: slow, deliberate. Easing is `ease-out` ~400ms. Nothing snappy. The feeling should be contemplative.
- **Dark mode is default**, light mode is toggleable.

---

## 11. Accessibility

- The constellation must have a **text fallback**: a list view of philosophies with the same filters. Keyboard-navigable.
- Quiz is fully operable with keyboard; option selection via number keys.
- Color is never the only signal (edge types use color + stroke pattern).
- Respect `prefers-reduced-motion` — disable Framer Motion transitions when set.

---

## 12. Definition of Done (v1 launch)

- [ ] 10 philosophies, 12 problems, 15 quiz questions, ~25 philosophers, all validated at build.
- [ ] Constellation loads in under 2s on a throttled 4G connection.
- [ ] Quiz produces a blend profile and a shareable URL that reproduces it.
- [ ] Problem explorer covers all 12 problems with distinct angles per philosophy.
- [ ] Site works without JavaScript well enough to read philosophy pages (graceful degradation on hero features is acceptable).
- [ ] Lighthouse: Performance ≥ 90, Accessibility ≥ 95.
- [ ] No backend, no analytics that require consent banners (use Cloudflare Web Analytics or none).

---

## 13. Things to Resist

These are tempting and wrong:

- **Don't add more philosophies before the experience is great.** 10 done well beats 30 thin.
- **Don't make the quiz longer than 15 questions.** Drop-off is real; trust the math on small N.
- **Don't write "Philosophy 101" intros on every page.** Users came for self-understanding, not a syllabus.
- **Don't gate anything behind sign-up.** There is no sign-up.
- **Don't build the AI guide first.** It's a P4 because the static experience must stand alone.
- **Don't let the graph become a flowchart.** If it stops feeling like a sky, stop.
