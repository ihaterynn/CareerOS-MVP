export type SuggestionStatus = "pending" | "accepted" | "rejected";

export type Suggestion = {
  id: string;
  tag: string;
  text: string;
  field: "summary" | "exp";
  ei?: number; // experience index
  bi?: number; // bullet index
  replacement: string;
  removeKw?: string;
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
};

export type ChatMessage = { role: "bot" | "user"; text: string };

export type Jd = { label: string; missing: string[] };

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
