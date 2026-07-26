import type { Resume, Suggestion } from "./types";

export type OptimizationPhase = "ats" | "content" | "recommendations";

export function isRecommendation(suggestion: Suggestion) { return suggestion.kind !== "suggestion"; }

export function isGrammarRewrite(suggestion: Suggestion) { return /grammar|clarity|punctuation|tone/i.test(`${suggestion.tag} ${suggestion.text}`); }

export function isOneClickSafe(suggestion: Suggestion, source: string) {
  const evidenceTerms = (value: string) => new Set((value.match(/\b(?:[A-Z][A-Za-z0-9/-]*|\d+(?:[.,]\d+)?%?)\b/g) || []).map((term) => term.toLowerCase()));
  const sourceTerms = evidenceTerms(source);
  return isRecommendation(suggestion) && suggestion.tag.trim().toUpperCase() === "GRAMMAR · SAFE" && [...evidenceTerms(suggestion.replacement)].every((term) => sourceTerms.has(term));
}

export function personalDetailChecks(resume: Resume) {
  return [
    ...(!resume.name.trim() || resume.name === "Your name" ? ["Add your full name."] : []),
    ...(!resume.title.trim() || resume.title === "Professional" ? ["Add a clear target job title."] : []),
    ...(!resume.loc.trim() ? ["Add a location so recruiters can assess eligibility."] : []),
    ...(!resume.email.trim() ? ["Add a professional contact email."] : [])
  ];
}

export function formattingChecks(resume: Resume) {
  return [
    ...(resume.summary.trim().toLowerCase() === resume.title.trim().toLowerCase() ? ["Replace the duplicate profile with a two-line value proposition."] : []),
    ...(resume.experience.some((experience) => !experience.bullets.length) ? ["Add at least one outcome-focused bullet for each role."] : []),
    ...(!resume.skills.length ? ["Add a focused skills section with tools named in the target role."] : [])
  ];
}

export function resumeQuality(resume: Resume) {
  const checks = [
    ...personalDetailChecks(resume),
    ...(resume.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resume.email) ? ["Use a valid professional email address."] : []),
    ...(resume.summary.trim().length < 45 || resume.summary.trim().toLowerCase() === resume.title.trim().toLowerCase() ? ["Write a concise profile that explains your specialty and impact."] : []),
    ...(!resume.experience.length ? ["Add at least one relevant experience entry."] : []),
    ...(resume.experience.some((experience) => !experience.role.trim() || !experience.period.trim()) ? ["Complete the role title and dates for every experience entry."] : []),
    ...(resume.experience.some((experience) => experience.bullets.length < 2) ? ["Use at least two outcome-focused bullets for each recent role."] : []),
    ...(resume.experience.some((experience) => experience.bullets.some((bullet) => bullet.trim().length < 30)) ? ["Replace short duty statements with specific outcomes and scope."] : []),
    ...(resume.experience.length && !resume.experience.some((experience) => experience.bullets.some((bullet) => /\d|%|\$/.test(bullet))) ? ["Quantify at least one result with scale, time, cost, or impact."] : []),
    ...(resume.skills.length < 6 ? ["List at least six relevant tools, methods, or domain skills."] : [])
  ];
  const score = Math.max(0, 100 - (
    (personalDetailChecks(resume).length * 5) +
    (resume.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resume.email) ? 5 : 0) +
    (resume.summary.trim().length < 45 || resume.summary.trim().toLowerCase() === resume.title.trim().toLowerCase() ? 15 : 0) +
    (!resume.experience.length ? 25 : 0) +
    (resume.experience.some((experience) => !experience.role.trim() || !experience.period.trim()) ? 10 : 0) +
    (resume.experience.some((experience) => experience.bullets.length < 2) ? 10 : 0) +
    (resume.experience.some((experience) => experience.bullets.some((bullet) => bullet.trim().length < 30)) ? 10 : 0) +
    (resume.experience.length && !resume.experience.some((experience) => experience.bullets.some((bullet) => /\d|%|\$/.test(bullet))) ? 10 : 0) +
    (resume.skills.length < 6 ? 10 : 0)
  ));
  return { score, checks };
}

export function suggestionPhase(suggestion: Suggestion): OptimizationPhase {
  const text = `${suggestion.tag} ${suggestion.text}`;
  if (isGrammarRewrite(suggestion)) return "content";
  if (/format|ats|heading|layout|section/i.test(text)) return "ats";
  if (/evidence|keyword|technical|skill|experience|impact|quantif/i.test(text) || suggestion.field === "exp" || suggestion.kind === "suggestion") return "content";
  return "recommendations";
}
