import type { Experience, Resume } from "./types";

const headings = {
  summary: /^(summary|profile|professional summary|career summary|about)$/i,
  experience: /^(experience|work experience|relevant work experience|professional experience|previous experience|employment|employment history|work history)$/i,
  skills: /^(skills|technical skills|core skills|competencies|technologies)$/i,
  other: /^(education|education and certifications|education & certifications|certifications|projects|awards|additional information|other)$/i
};
const heading = (line: string) => Object.values(headings).some((pattern) => pattern.test(line.trim()));
const bullet = (line: string) => line.trim().replace(/^[•●▪◦\-*]+\s*/, "").trim();
const dateRange = /(?:\d{1,2}[/-]\d{2,4}|\d{4})\s*(?:-|–|—|to)\s*(?:present|current|\d{1,2}[/-]\d{2,4}|\d{4})/i;

export type ResumeImport = { resume: Resume; confidence: number; unmatchedText: string };

export function resumeContentKey(resume: Resume) {
  const { version: _version, ...content } = resume;
  return JSON.stringify(content);
}

export function parseResumeImport(source: string): ResumeImport {
  const lines = source.replace(/\r/g, "").split("\n").map((line) => line.trim()).filter(Boolean);
  const name = lines[0] || "Your name";
  const email = lines.find((line) => /[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/.test(line))?.match(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/)?.[0] || "";
  const contact = lines.find((line) => line.includes(email) || /\+?\d[\d\s()-]{7,}/.test(line)) || "";
  const title = lines[1] && !heading(lines[1]) && !lines[1].includes("@") ? lines[1] : "Professional";
  const sections: Record<keyof typeof headings, string[]> = { summary: [], experience: [], skills: [], other: [] };
  let section: keyof typeof headings | null = null;
  for (const line of lines) {
    const next = (Object.entries(headings) as Array<[keyof typeof headings, RegExp]>).find(([, pattern]) => pattern.test(line));
    if (next) { section = next[0]; continue; }
    if (section) sections[section].push(line);
  }
  const summary = sections.summary.length
    ? sections.summary.join(" ")
    : lines.slice(1, Math.min(lines.length, 5)).filter((line) => (!email || !line.includes(email)) && !heading(line) && !dateRange.test(line)).join(" ");
  const experienceLines = sections.experience;
  const experience: Experience[] = [];
  let current: Experience | undefined;
  let awaitingCompany = false;
  for (const line of experienceLines) {
    if (/^[•●▪◦\-*]/.test(line)) {
      current?.bullets.push(bullet(line));
      awaitingCompany = false;
    } else {
      const parts = line.split(/\s*[|·]\s*/).filter(Boolean);
      const dated = parts.findIndex((part) => dateRange.test(part));
      if (dated < 0 && current && awaitingCompany) {
        current.role = `${current.role} · ${line}`;
        awaitingCompany = false;
        continue;
      }
      if (dated < 0 && current?.period) {
        const previous = current.bullets.at(-1);
        if (previous && !/[.!?;:]$/.test(previous)) current.bullets[current.bullets.length - 1] = `${previous} ${line}`;
        else current.bullets.push(line);
        continue;
      }
      const range = line.match(dateRange);
      const inlineRange = parts.length === 1 && Boolean(range);
      const period = inlineRange ? range?.[0] || "" : dated >= 0 ? parts[dated] : range?.[0] || "";
      const role = inlineRange
        ? line.slice(0, range?.index || 0).trim()
        : dated >= 0
        ? parts.slice(0, dated).join(" · ")
        : range
          ? line.slice(0, range.index).trim()
          : parts.join(" · ");
      current = { role, period, bullets: [] };
      experience.push(current);
      awaitingCompany = inlineRange;
    }
  }
  const skills = sections.skills.join(",").split(/[,|•]/).map((skill) => skill.trim()).filter(Boolean);
  const unmatchedText = sections.other.join("\n");
  const confidence = Math.min(1, (name !== "Your name" ? .16 : 0) + (title !== "Professional" ? .12 : 0) + (email ? .12 : 0) + (experience.length ? .35 : 0) + (skills.length ? .15 : 0) + (summary ? .1 : 0));

  return { resume: { name, title, loc: contact.replace(email, "").replace(/[|·]/g, "").trim(), email, version: "Draft · unsaved", summary, experience, skills, ...(unmatchedText ? { other: unmatchedText } : {}) }, confidence, unmatchedText };
}

export function parseResumeText(source: string): Resume { return parseResumeImport(source).resume; }

export function formatResumeText(resume: Resume) {
  return [
    resume.name.toUpperCase(),
    [resume.title, resume.loc, resume.email].filter(Boolean).join(" · "),
    "", "SUMMARY", resume.summary,
    "", "EXPERIENCE",
    ...resume.experience.flatMap((experience) => [experience.role, experience.period, ...experience.bullets.map((item) => `• ${item}`), ""]),
    "SKILLS", resume.skills.join(", "),
    ...(resume.other ? ["", "ADDITIONAL DETAILS", resume.other] : [])
  ].join("\n");
}
