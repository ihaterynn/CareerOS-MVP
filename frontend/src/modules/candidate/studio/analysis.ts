export const MAX_REQUEST_BYTES = 512 * 1024;
const MAX_RESUME_CHARS = 100_000;
const MAX_JD_CHARS = 20_000;
const MAX_JDS = 5;

export type JobDescriptionInput = { id: string; label: string; text: string };

export type AnalysisSuggestion = {
  id: string;
  kind: "recommendation" | "suggestion";
  tag: string;
  text: string;
  field: "summary" | "exp";
  replacement: string;
  jdRequirement?: string;
  evidence?: string;
  delta: number;
  ei?: number;
  bi?: number;
  removeKw?: string;
  status: "pending";
};

export type RefinementTarget = { target: "summary" | "experience"; experienceIndex?: number; title: string; reason: string; jdRequirement: string };

export type AnalysisResult = {
  jobDescriptionId: string;
  atsScore: number;
  qualityScore: number;
  missing: string[];
  suggestions: AnalysisSuggestion[];
  refinementTargets: RefinementTarget[];
};

export function freshAnalysisSuggestions<T extends { id: string; status: unknown }>(suggestions: T[], acceptedIds = new Set<string>()) {
  return suggestions.map((suggestion) => ({ ...suggestion, status: acceptedIds.has(suggestion.id) ? "accepted" as const : "pending" as const }));
}

export function calibrateQualityScore(aiScore: number, documentScore: number) {
  return Math.max(0, Math.min(100, Math.round((aiScore * .65) + (documentScore * .35))));
}

export type StudioPayload = { resume: Record<string, unknown>; resumeId?: string; jobDescriptions: JobDescriptionInput[] };

const STOP_WORDS = new Set([
  "and", "are", "for", "from", "have", "into", "job", "our", "role", "that", "the", "this", "with", "you"
]);

function text(value: unknown, name: string, maxLength: number) {
  if (typeof value !== "string") throw new Error(`${name} is required.`);
  const result = value.trim();
  if (!result) throw new Error(`${name} is required.`);
  if (result.length > maxLength) throw new Error(`${name} is too long.`);
  return result;
}

export function parseStudioPayload(value: unknown, { requireJobDescriptions = true }: { requireJobDescriptions?: boolean } = {}): StudioPayload {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Request body must be an object.");
  const body = value as Record<string, unknown>;
  if (!body.resume || typeof body.resume !== "object" || Array.isArray(body.resume)) throw new Error("resume is required.");
  if (JSON.stringify(body.resume).length > MAX_RESUME_CHARS) throw new Error("resume is too large.");
  if (!Array.isArray(body.jobDescriptions) || body.jobDescriptions.length > MAX_JDS || (requireJobDescriptions && body.jobDescriptions.length === 0)) {
    throw new Error(`jobDescriptions must contain ${requireJobDescriptions ? "1" : "0"} to ${MAX_JDS} items.`);
  }

  return {
    resume: body.resume as Record<string, unknown>,
    ...(typeof body.resumeId === "undefined" ? {} : { resumeId: text(body.resumeId, "resumeId", 100) }),
    jobDescriptions: body.jobDescriptions.map((jd, index) => {
      if (!jd || typeof jd !== "object" || Array.isArray(jd)) throw new Error(`jobDescriptions[${index}] must be an object.`);
      const item = jd as Record<string, unknown>;
      return {
        id: text(item.id, `jobDescriptions[${index}].id`, 100),
        label: text(item.label, `jobDescriptions[${index}].label`, 160),
        text: text(item.text, `jobDescriptions[${index}].text`, MAX_JD_CHARS)
      };
    })
  };
}

function keywords(value: string) {
  const seen = new Set<string>();
  return (value.match(/[A-Za-z][A-Za-z0-9+#./-]*/g) ?? []).filter((word) => {
    const key = word.toLowerCase();
    if (word.length < 3 || STOP_WORDS.has(key) || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function fallbackAnalyses(resume: unknown, jobDescriptions: JobDescriptionInput[]): AnalysisResult[] {
  const resumeText = JSON.stringify(resume).toLowerCase();
  return jobDescriptions.map((jd) => {
    const required = keywords(jd.text);
    const missing = required.filter((word) => !resumeText.includes(word.toLowerCase()));
    return {
      jobDescriptionId: jd.id,
      atsScore: required.length ? Math.round(((required.length - missing.length) / required.length) * 100) : 0,
      qualityScore: required.length ? Math.round(((required.length - missing.length) / required.length) * 100) : 0,
      missing,
      suggestions: [],
      refinementTargets: []
    };
  });
}

export async function readJsonBody(request: Request): Promise<unknown> {
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_REQUEST_BYTES) throw new Error("Request body is too large.");
  if (!request.body) throw new Error("Request body is required.");

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_REQUEST_BYTES) {
      await reader.cancel();
      throw new Error("Request body is too large.");
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new Error("Request body must be valid JSON.");
  }
}

function strings(value: unknown, limit: number) {
  if (!Array.isArray(value) || value.length > limit || value.some((item) => typeof item !== "string" || item.length > 300)) return null;
  return value;
}

function concise(value: string) {
  const firstSentence = value.trim().match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim();
  const result = firstSentence || value.trim();
  return result.length > 240 ? `${result.slice(0, 237).trimEnd()}…` : result;
}

function suggestion(value: unknown, kind: AnalysisSuggestion["kind"]): AnalysisSuggestion | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const item = value as Record<string, unknown>;
  if (typeof item.id !== "string" || typeof item.tag !== "string" || typeof item.text !== "string" || typeof item.delta !== "number" || !Number.isFinite(item.delta)) return null;
  if (kind === "recommendation" && ((item.field !== "summary" && item.field !== "exp") || typeof item.replacement !== "string")) return null;
  return {
    id: item.id.slice(0, 100), kind, tag: item.tag.slice(0, 100), text: concise(item.text),
    field: item.field === "exp" ? "exp" : "summary", replacement: typeof item.replacement === "string" ? item.replacement.slice(0, 5_000) : "", delta: Math.round(item.delta), status: "pending",
    ...(typeof item.ei === "number" && Number.isInteger(item.ei) && item.ei >= 0 ? { ei: item.ei } : {}),
    ...(typeof item.bi === "number" && Number.isInteger(item.bi) && item.bi >= 0 ? { bi: item.bi } : {}),
    ...(typeof item.removeKw === "string" ? { removeKw: item.removeKw.slice(0, 300) } : {}),
    ...(typeof item.jdRequirement === "string" && item.jdRequirement.trim() ? { jdRequirement: concise(item.jdRequirement).slice(0, 180) } : {}),
    ...(typeof item.evidence === "string" && item.evidence.trim() ? { evidence: concise(item.evidence).slice(0, 220) } : {})
  };
}

function refinementTargets(value: unknown) {
  if (typeof value === "undefined") return [];
  if (!Array.isArray(value) || value.length > 3) return null;
  return value.map((entry): RefinementTarget | null => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return null;
    const item = entry as Record<string, unknown>;
    if ((item.target !== "summary" && item.target !== "experience") || typeof item.title !== "string" || !item.title.trim() || typeof item.reason !== "string" || !item.reason.trim() || typeof item.jdRequirement !== "string" || !item.jdRequirement.trim()) return null;
    const experienceIndex = item.experienceIndex;
    if (item.target === "experience" && (typeof experienceIndex !== "number" || !Number.isInteger(experienceIndex) || experienceIndex < 0)) return null;
    return { target: item.target, title: concise(item.title).slice(0, 120), reason: concise(item.reason).slice(0, 180), jdRequirement: concise(item.jdRequirement).slice(0, 120), ...(item.target === "experience" ? { experienceIndex: experienceIndex as number } : {}) };
  });
}

export function validateModelResults(value: unknown, jobDescriptions: JobDescriptionInput[]): AnalysisResult[] {
  if (!value || typeof value !== "object" || Array.isArray(value) || !Array.isArray((value as { results?: unknown }).results)) {
    throw new Error("Analysis service returned an invalid response.");
  }
  const results = (value as { results: unknown[] }).results;
  if (results.length !== jobDescriptions.length) throw new Error("Analysis service returned incomplete results.");
  const byId = new Map<string, AnalysisResult>();
  for (const result of results) {
    if (!result || typeof result !== "object" || Array.isArray(result)) throw new Error("Analysis service returned an invalid result.");
    const item = result as Record<string, unknown>;
    const missing = strings(item.missing, 50);
    const legacy = Array.isArray(item.suggestions) && !Array.isArray(item.recommendations);
    const recommendations = (legacy ? item.suggestions : item.recommendations);
    const scoreSuggestions = legacy ? [] : item.suggestions;
    const parsedRecommendations = Array.isArray(recommendations) && recommendations.length <= 12 ? recommendations.map((value) => suggestion(value, "recommendation")) : null;
    const parsedSuggestions = Array.isArray(scoreSuggestions) && scoreSuggestions.length <= 12 ? scoreSuggestions.map((value) => suggestion(value, "suggestion")) : null;
    const parsedTargets = refinementTargets(item.refinementTargets);
    if (typeof item.jobDescriptionId !== "string" || typeof item.atsScore !== "number" || !Number.isFinite(item.atsScore) || typeof item.qualityScore !== "number" || !Number.isFinite(item.qualityScore) || !missing || !parsedRecommendations || !parsedSuggestions || !parsedTargets || parsedRecommendations.some((item) => !item) || parsedSuggestions.some((item) => !item) || parsedTargets.some((item) => !item)) {
      throw new Error("Analysis service returned an invalid result.");
    }
    if (byId.has(item.jobDescriptionId)) throw new Error("Analysis service returned duplicate results.");
    byId.set(item.jobDescriptionId, {
      jobDescriptionId: item.jobDescriptionId,
      atsScore: Math.max(0, Math.min(100, Math.round(item.atsScore))),
      qualityScore: Math.max(0, Math.min(100, Math.round(item.qualityScore))),
      missing,
      suggestions: [...parsedRecommendations.slice(0, 3), ...parsedSuggestions.slice(0, 3)] as AnalysisSuggestion[],
      refinementTargets: parsedTargets as RefinementTarget[]
    });
  }
  return jobDescriptions.map((jd) => {
    const result = byId.get(jd.id);
    if (!result) throw new Error("Analysis service returned an unknown job description.");
    return result;
  });
}
