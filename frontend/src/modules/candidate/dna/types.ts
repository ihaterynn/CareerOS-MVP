export type InstrumentId = "mbti" | "disc" | "enneagram";

export type Instrument = {
  id: InstrumentId;
  label: string;
  total: number; // question count
  result: string; // display result (DISPLAY-ONLY mock — spec §5)
};

export type TraitBar = { label: string; value: number; color: string };

export type BestFit = { role: string; level: string; color: string };

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
};

export type DnaData = {
  profile: DnaProfile;
  instruments: Instrument[];
};
