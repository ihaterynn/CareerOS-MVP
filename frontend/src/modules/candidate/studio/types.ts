export type SuggestionStatus = "pending" | "accepted" | "rejected";
export type SuggestionKind = "recommendation" | "suggestion";

export type Suggestion = {
  id: string;
  /** Missing on legacy locally-saved drafts; those remain actionable recommendations. */
  kind?: SuggestionKind;
  tag: string;
  text: string;
  field: "summary" | "exp";
  ei?: number; // experience index
  bi?: number; // bullet index
  replacement: string;
  jdRequirement?: string;
  evidence?: string;
  removeKw?: string;
  baseText?: string;
  delta: number;
  status: SuggestionStatus;
};

export type Experience = { role: string; period: string; bullets: string[] };

export type Resume = {
  name: string;
  title: string;
  loc: string;
  email: string;
  version: string;
  summary: string;
  experience: Experience[];
  skills: string[];
  other?: string;
};

export type ChatMessage = { role: "bot" | "user"; text: string };

export type Jd = { label: string; text?: string; missing: string[] };

export type StudioData = {
  resume: Resume;
  jds: Jd[];
  matchedKeywords: string[];
  keywordTotal: number;
  atsScore: number;
  suggestions: Suggestion[];
  chat: ChatMessage[];
  templates: string[];
};
