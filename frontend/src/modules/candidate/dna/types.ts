export type InstrumentId = "mbti" | "disc" | "enneagram";

export type Instrument = {
  id: InstrumentId;
  label: string;
  total: number; // question count
  result: string; // display result (DISPLAY-ONLY mock — spec §5)
};

export type TraitBar = { label: string; value: number; color: string };

export type BestFit = { role: string; level: string; color: string };

export type CompatibilityDimension = { label: string; value: number; detail: string; evidence: string };

export type CareerSuggestion = {
  path: "Explore" | "Promotion";
  role: string;
  score: number;
  reason: string;
  evidence: string;
  nextStep: string;
};

export type WorkProfile = {
  satisfactionScore: number;
  summary: string;
  energizers: string[];
  drains: string[];
};

export type CareerGuidance = {
  workProfile: WorkProfile;
  currentRole: {
    role: string;
    score: number;
    summary: string;
    dimensions: CompatibilityDimension[];
  };
  suggestions: CareerSuggestion[];
};

export type Visibility = { label: string; value: "private" | "employer" | "public" };

export type DnaProfile = {
  name: string;
  short: string;
  meta: string;
  skills: string[];
  extraSkills: number;
  instruments: { mbti: string; disc: string; enneagram: string };
  traitBars: TraitBar[];
  bestFit: BestFit[];
  summary: string;
  careerGuidance: CareerGuidance;
};

export type DnaData = {
  profile: DnaProfile;
  instruments: Instrument[];
};
