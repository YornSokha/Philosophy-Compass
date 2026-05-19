export const DIMENSION_AXES = [
  "meaning",
  "emotion",
  "morality",
  "self",
  "suffering",
] as const;

export type DimensionAxis = typeof DIMENSION_AXES[number];

export const DIMENSION_VALUES: Record<DimensionAxis, readonly string[]> = {
  meaning:   ["created", "discovered", "illusion", "indifferent"],
  emotion:   ["controlled", "expressed", "observed", "enjoyed"],
  morality:  ["objective", "subjective", "utility", "virtue"],
  self:      ["fixed", "fluid", "illusory", "constructed"],
  suffering: ["meaningful", "avoidable", "inherent", "indifferent"],
} as const;

export interface Philosophy {
  id: string;
  name: string;
  tagline: string;
  summary: string;
  era: string;
  color: string;
  themes: string[];
  dimensions: Partial<Record<DimensionAxis, string>>;
  problems_helped: string[];
  compatible_with: string[];
  opposes: string[];
  influenced_by: string[];
  philosophers: string[];
  quotes: Quote[];
  modern_echoes: string[];
}

export interface Quote {
  text: string;
  author: string;
}

export interface Philosopher {
  id: string;
  name: string;
  years: string;
  schools: string[];
  bio?: string;
  key_ideas?: string[];
}

export interface Problem {
  id: string;
  name: string;
  description: string;
  responses: ProblemResponse[];
}

export interface ProblemResponse {
  philosophy_id: string;
  angle: string;
}

export interface QuizQuestion {
  id: string;
  axis: DimensionAxis;
  prompt: string;
  options: QuizOption[];
}

export interface QuizOption {
  label: string;
  weights: Record<string, number>;
}

export interface BlendProfile {
  scores: Record<string, number>;
  top: string[];
  tensions: Tension[];
  createdAt: string;
}

export interface Tension {
  a: string;
  b: string;
  note: string;
}
