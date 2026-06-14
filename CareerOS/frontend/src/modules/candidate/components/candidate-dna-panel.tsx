"use client";

import {
  Award,
  BriefcaseBusiness,
  Copy,
  Download,
  GraduationCap,
  MapPin,
  NotebookTabs,
  Plus,
  Radar,
  Sparkles,
  Trash2
} from "lucide-react";
import { jsPDF } from "jspdf";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { candidateProfile, skillSignals } from "../candidate-data";
import { KpiCard, ModuleCard, ScoreBar, Tag } from "./candidate-ui";
import { DnaHelixScene } from "./dna-helix-scene";

type CertificationEntry = {
  id: string;
  name: string;
  issuer: string;
  year: string;
};

type DnaForm = {
  name: string;
  summary: string;
  currentRole: string;
  email: string;
  phone: string;
  location: string;
  salaryExpectation: string;
  workPreference: string;
  relocationFlexibility: string;
  careerInterests: string;
  skills: string;
  education: string;
  experience: string;
  portfolio: string;
  learningSignals: string;
};

const roleOptions = [
  "Software Engineer",
  "Senior Software Engineer",
  "Backend Engineer",
  "Data Product Engineer",
  "Machine Learning Engineer",
  "Product Engineer"
];

const workPreferenceOptions = ["Hybrid", "Remote-first", "On-site"];
const relocationOptions = [
  "Open within Klang Valley",
  "KL only",
  "Open nationwide",
  "No relocation"
];

const initialCertifications: CertificationEntry[] = candidateProfile.certifications.map((name, index) => ({
  id: `cert-${index + 1}`,
  name,
  issuer: index === 0 ? "Amazon Web Services" : index === 1 ? "Meta" : "Google",
  year: index === 0 ? "2024" : index === 1 ? "2023" : "2022"
}));

const initialForm: DnaForm = {
  name: candidateProfile.name,
  summary: "Backend-focused engineer who turns operational logistics problems into reliable product systems with measurable business impact.",
  currentRole: candidateProfile.currentRole,
  email: "aishah.rahman@hantar.my",
  phone: "+60 12-345 6789",
  location: candidateProfile.location,
  salaryExpectation: candidateProfile.salaryExpectation,
  workPreference: candidateProfile.workPreferences[0],
  relocationFlexibility: candidateProfile.relocationFlexibility,
  careerInterests: candidateProfile.careerInterests.join(", "),
  skills: skillSignals.map((skill) => skill.name).join(", "),
  education: candidateProfile.education
    .map((item) => `${item.credential}, ${item.school}, ${item.year}`)
    .join("\n"),
  experience: candidateProfile.experience
    .map((item) => `${item.role} | ${item.company} | ${item.period}\n- ${item.impact}`)
    .join("\n\n"),
  portfolio: candidateProfile.portfolio.join("\n"),
  learningSignals: candidateProfile.learningSignals.join("\n")
};

export function CandidateDnaPanel() {
  const [form, setForm] = useState<DnaForm>(initialForm);
  const [certifications, setCertifications] = useState<CertificationEntry[]>(initialCertifications);
  const resume = useMemo(() => buildResume(form, certifications), [certifications, form]);
  const profileDepth = calculateProfileDepth(form, certifications);
  const skills = splitList(form.skills);
  const interests = splitList(form.careerInterests);
  const portfolioItems = splitLines(form.portfolio);
  const learningSignals = splitLines(form.learningSignals);
  const skillStrength = Math.min(100, skills.length * 12);
  const summaryWordCount = countWords(form.summary);

  const updateField = (field: keyof DnaForm, value: string) => {
    if (field === "summary") {
      setForm((current) => ({ ...current, [field]: limitWords(value, 20) }));
      return;
    }
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateCertification = (id: string, field: keyof Omit<CertificationEntry, "id">, value: string) => {
    setCertifications((current) =>
      current.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry))
    );
  };

  const addCertification = () => {
    setCertifications((current) => [
      ...current,
      { id: `cert-${Date.now()}`, name: "", issuer: "", year: "" }
    ]);
  };

  const removeCertification = (id: string) => {
    setCertifications((current) => current.filter((entry) => entry.id !== id));
  };

  const downloadResume = () => {
    const model = buildResumeModel(form, certifications);
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const left = 44;
    const right = pageWidth - 44;
    const contentWidth = right - left;
    let y = 46;

    const ensureSpace = (needed: number) => {
      if (y + needed > pageHeight - 42) {
        pdf.addPage();
        y = 46;
      }
    };

    const writeSectionTitle = (title: string) => {
      ensureSpace(26);
      pdf.setDrawColor(222, 213, 195);
      pdf.setLineWidth(0.8);
      pdf.line(left, y, right, y);
      y += 14;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.setTextColor(90, 100, 120);
      pdf.text(title.toUpperCase(), left, y);
      y += 14;
    };

    const writeWrapped = (
      text: string,
      opts?: { indent?: number; font?: "normal" | "bold"; size?: number; color?: [number, number, number] }
    ) => {
      const indent = opts?.indent ?? 0;
      const size = opts?.size ?? 10.5;
      const font = opts?.font ?? "normal";
      const color = opts?.color ?? [20, 34, 61];
      pdf.setFont("helvetica", font);
      pdf.setFontSize(size);
      pdf.setTextColor(color[0], color[1], color[2]);
      const lines = pdf.splitTextToSize(text, contentWidth - indent);
      ensureSpace(lines.length * (size + 3) + 4);
      pdf.text(lines, left + indent, y);
      y += lines.length * (size + 3) + 4;
    };

    const writeBullets = (items: string[]) => {
      items.forEach((item) => {
        const lines = pdf.splitTextToSize(item, contentWidth - 16);
        ensureSpace(lines.length * 13 + 2);
        pdf.setFillColor(169, 128, 47);
        pdf.circle(left + 4, y - 3, 2, "F");
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10.5);
        pdf.setTextColor(20, 34, 61);
        pdf.text(lines, left + 14, y);
        y += lines.length * 13 + 2;
      });
    };

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(22);
    pdf.setTextColor(20, 34, 61);
    pdf.text(model.name, left, y);
    y += 20;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(169, 128, 47);
    pdf.text(model.role, left, y);
    y += 16;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(90, 100, 120);
    pdf.text(
      `${model.location}  |  ${model.email}  |  ${model.phone}`,
      left,
      y
    );
    y += 14;
    pdf.text(
      `${model.workPreference}  |  ${model.salaryExpectation}  |  ${model.relocation}`,
      left,
      y
    );
    y += 18;

    writeSectionTitle("Professional Summary");
    writeWrapped(model.summary, { size: 10.5, color: [50, 61, 74] });

    writeSectionTitle("Core Skills");
    writeWrapped(model.skills.join("  •  "), { size: 10.5, color: [20, 34, 61] });

    writeSectionTitle("Experience");
    model.experience.forEach((entry) => {
      writeWrapped(`${entry.role}  |  ${entry.company}`, { font: "bold", size: 11 });
      writeWrapped(entry.period, { size: 9.5, color: [90, 100, 120] });
      writeBullets(entry.bullets);
      y += 4;
    });

    writeSectionTitle("Education");
    model.education.forEach((entry) => {
      writeWrapped(entry, { size: 10.5 });
    });

    writeSectionTitle("Certifications");
    writeBullets(model.certifications.length ? model.certifications : ["Add certifications"]);

    writeSectionTitle("Selected Projects");
    writeBullets(model.portfolio.length ? model.portfolio : ["Add portfolio work"]);

    writeSectionTitle("Career Interests");
    writeWrapped(model.interests.join("  •  "), { size: 10.5, color: [20, 34, 61] });

    writeSectionTitle("Recent Learning Signals");
    writeBullets(model.learningSignals.length ? model.learningSignals : ["Add learning signals"]);

    pdf.save(`${form.name.replace(/\s+/g, "-").toLowerCase()}-resume.pdf`);
  };

  const copyResume = async () => {
    await navigator.clipboard.writeText(resume);
  };

  return (
    <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_430px]">
      <div className="grid gap-4">
        <div className="grid gap-4 xl:grid-cols-[minmax(360px,.82fr)_minmax(0,1fr)]">
          <DnaHelixScene
            profileDepth={profileDepth}
            skillStrength={skillStrength}
            skills={skills}
            interests={interests}
            preferences={[form.workPreference, form.relocationFlexibility]}
            portfolio={portfolioItems}
            learningSignals={learningSignals}
          />

          <ModuleCard>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="kicker">Unified profile identity</p>
                <h2 className="mt-2 font-serif text-3xl font-semibold text-ink">Candidate DNA</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
                  Capture your profile once, then generate explainable signals and a polished resume from the same data.
                </p>
              </div>
              <div className="rounded-[12px] border border-[#E3D2A6] bg-[#F3EAD3] px-4 py-3 text-sm font-semibold text-gold">
                {profileDepth}% profile depth
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <KpiCard label="Skills captured" value={String(skills.length)} detail="Structured capability signals" />
              <KpiCard label="Certifications" value={String(certifications.filter((entry) => entry.name.trim()).length)} detail="Credential rows with issuer and year" />
              <KpiCard label="Summary" value={`${summaryWordCount}/20`} detail="Biography word count" />
            </div>
          </ModuleCard>
        </div>

        <ModuleCard>
          <div className="mb-4 flex items-center gap-2">
            <Sparkles size={17} className="text-gold" aria-hidden="true" />
            <h3 className="font-semibold text-ink">Candidate inputs</h3>
          </div>

          <div className="mb-4">
            <TextArea
              label="Summary / biography"
              value={form.summary}
              onChange={(value) => updateField("summary", value)}
              rows={3}
              helper={`${summaryWordCount}/20 words`}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <Field label="Full name" value={form.name} onChange={(value) => updateField("name", value)} />
            <SelectField
              label="Current role"
              value={form.currentRole}
              options={roleOptions}
              onChange={(value) => updateField("currentRole", value)}
            />
            <Field label="Email" value={form.email} onChange={(value) => updateField("email", value)} />
            <Field label="Phone" value={form.phone} onChange={(value) => updateField("phone", value)} />
            <Field label="Location / home base" value={form.location} onChange={(value) => updateField("location", value)} />
            <Field label="Salary expectation" value={form.salaryExpectation} onChange={(value) => updateField("salaryExpectation", value)} />
            <SelectField
              label="Preferred work mode"
              value={form.workPreference}
              options={workPreferenceOptions}
              onChange={(value) => updateField("workPreference", value)}
            />
            <SelectField
              label="Relocation flexibility"
              value={form.relocationFlexibility}
              options={relocationOptions}
              onChange={(value) => updateField("relocationFlexibility", value)}
            />
          </div>
        </ModuleCard>

        <ModuleCard>
          <div className="mb-4 flex items-center gap-2">
            <Radar size={17} className="text-gold" aria-hidden="true" />
            <h3 className="font-semibold text-ink">Signals used by matching</h3>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <TextArea label="Skills" value={form.skills} onChange={(value) => updateField("skills", value)} rows={4} helper="Comma-separated" />
            <TextArea label="Career interests" value={form.careerInterests} onChange={(value) => updateField("careerInterests", value)} rows={4} helper="Comma-separated" />
            <TextArea label="Experience" value={form.experience} onChange={(value) => updateField("experience", value)} rows={8} />
            <TextArea label="Education" value={form.education} onChange={(value) => updateField("education", value)} rows={8} />
            <TextArea label="Portfolio work" value={form.portfolio} onChange={(value) => updateField("portfolio", value)} rows={5} />
            <TextArea label="Learning signals" value={form.learningSignals} onChange={(value) => updateField("learningSignals", value)} rows={5} />
          </div>
        </ModuleCard>

        <ModuleCard>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Award size={17} className="text-gold" aria-hidden="true" />
              <h3 className="font-semibold text-ink">Certifications</h3>
            </div>
            <button
              type="button"
              onClick={addCertification}
              className="inline-flex items-center gap-2 rounded-[9px] border border-[#E3D2A6] bg-[#F3EAD3] px-3 py-2 text-sm font-semibold text-gold"
            >
              <Plus size={15} aria-hidden="true" />
              Add certification
            </button>
          </div>

          <div className="grid gap-3">
            {certifications.map((entry) => (
              <div key={entry.id} className="grid gap-3 rounded-[12px] border border-line bg-mist p-3 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_110px_40px]">
                <input
                  value={entry.name}
                  onChange={(event) => updateCertification(entry.id, "name", event.target.value)}
                  placeholder="Certification name"
                  className="rounded-[10px] border border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition focus:border-gold"
                />
                <input
                  value={entry.issuer}
                  onChange={(event) => updateCertification(entry.id, "issuer", event.target.value)}
                  placeholder="Issuer"
                  className="rounded-[10px] border border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition focus:border-gold"
                />
                <input
                  value={entry.year}
                  onChange={(event) => updateCertification(entry.id, "year", event.target.value)}
                  placeholder="Year"
                  className="rounded-[10px] border border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition focus:border-gold"
                />
                <button
                  type="button"
                  onClick={() => removeCertification(entry.id)}
                  className="grid size-10 place-items-center rounded-[10px] border border-line bg-paper text-muted hover:text-bad"
                  title="Remove certification"
                >
                  <Trash2 size={15} aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </ModuleCard>

        <div className="grid gap-4 lg:grid-cols-2">
          <SignalCard icon={<BriefcaseBusiness size={17} className="text-gold" />} title="Experience parsed" items={splitLines(form.experience).slice(0, 4)} />
          <SignalCard icon={<NotebookTabs size={17} className="text-gold" />} title="Portfolio parsed" items={portfolioItems} />
          <SignalCard icon={<GraduationCap size={17} className="text-gold" />} title="Education parsed" items={splitLines(form.education)} />
          <SignalCard
            icon={<Award size={17} className="text-gold" />}
            title="Certifications parsed"
            items={certifications.filter((entry) => entry.name.trim()).map((entry) => `${entry.name} | ${entry.issuer || "Issuer pending"} | ${entry.year || "Year pending"}`)}
          />
        </div>
      </div>

      <aside className="grid content-start gap-4 2xl:sticky 2xl:top-20">
        <ModuleCard>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="kicker">Generated CV</p>
              <h3 className="mt-1 font-serif text-2xl font-semibold text-ink">Resume draft</h3>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={copyResume}
                className="grid size-9 place-items-center rounded-[9px] border border-line bg-mist text-muted hover:text-ink"
                title="Copy resume"
              >
                <Copy size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={downloadResume}
                className="grid size-9 place-items-center rounded-[9px] border border-[#E3D2A6] bg-[#F3EAD3] text-gold"
                title="Download resume PDF"
              >
                <Download size={16} aria-hidden="true" />
              </button>
            </div>
          </div>

          <pre className="max-h-[720px] overflow-auto whitespace-pre-wrap rounded-[10px] border border-line bg-mist p-4 text-sm leading-6 text-ink">
            {resume}
          </pre>
        </ModuleCard>

        <ModuleCard>
          <div className="mb-4 flex items-center gap-2">
            <MapPin size={17} className="text-gold" aria-hidden="true" />
            <h3 className="font-semibold text-ink">Profile scoring inputs</h3>
          </div>
          <div className="grid gap-3">
            <ScoreBar value={profileDepth} label="Profile completeness" tone="gold" />
            <ScoreBar value={skillStrength} label="Skill signal density" tone="good" />
            <ScoreBar value={Math.min(100, splitLines(form.experience).length * 16)} label="Experience evidence" tone="info" />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Tag tone="gold">{form.workPreference}</Tag>
            <Tag tone="info">{form.relocationFlexibility}</Tag>
          </div>
        </ModuleCard>
      </aside>
    </div>
  );
}

function Field({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="kicker">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-[10px] border border-line bg-mist px-3 py-2 text-sm font-semibold text-ink outline-none transition focus:border-gold focus:bg-paper"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="kicker">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-[10px] border border-line bg-mist px-3 py-2 text-sm font-semibold text-ink outline-none transition focus:border-gold focus:bg-paper"
      >
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function TextArea({
  label,
  value,
  rows,
  onChange,
  helper
}: {
  label: string;
  value: string;
  rows: number;
  onChange: (value: string) => void;
  helper?: string;
}) {
  return (
    <label className="block">
      <div className="flex items-center justify-between gap-3">
        <span className="kicker">{label}</span>
        {helper ? <span className="text-xs font-semibold text-faint">{helper}</span> : null}
      </div>
      <textarea
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full resize-y rounded-[10px] border border-line bg-mist px-3 py-2 text-sm leading-6 text-ink outline-none transition focus:border-gold focus:bg-paper"
      />
    </label>
  );
}

function SignalCard({
  icon,
  title,
  items
}: {
  icon: ReactNode;
  title: string;
  items: string[];
}) {
  return (
    <ModuleCard>
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <h3 className="font-semibold text-ink">{title}</h3>
      </div>
      <ul className="grid gap-2">
        {items.length ? items.map((item) => (
          <li key={item} className="rounded-[10px] border border-line bg-mist px-3 py-2 text-sm leading-5 text-muted">
            {item}
          </li>
        )) : (
          <li className="rounded-[10px] border border-line bg-mist px-3 py-2 text-sm leading-5 text-muted">
            Add details to improve this section.
          </li>
        )}
      </ul>
    </ModuleCard>
  );
}

function buildResume(form: DnaForm, certifications: CertificationEntry[]) {
  const model = buildResumeModel(form, certifications);

  return [
    model.name.toUpperCase(),
    `${model.role} | ${model.location}`,
    `${model.email} | ${model.phone}`,
    "",
    "PROFESSIONAL SUMMARY",
    model.summary || "Add a short summary.",
    "",
    "CORE SKILLS",
    model.skills.join(" | ") || "Add skills",
    "",
    "CAREER INTERESTS",
    model.interests.join(" | ") || "Add interests",
    "",
    "EXPERIENCE",
    ...model.experience.flatMap((entry) => [
      `${entry.role} | ${entry.company}`,
      entry.period,
      ...entry.bullets.map((bullet) => `- ${bullet}`),
      ""
    ]),
    "EDUCATION",
    ...formatSection(model.education),
    "",
    "CERTIFICATIONS",
    ...formatSection(model.certifications),
    "",
    "SELECTED PROJECTS",
    ...formatSection(model.portfolio),
    "",
    "LEARNING SIGNALS",
    ...formatSection(model.learningSignals),
    "",
    "PREFERENCES",
    `Preferred work mode: ${model.workPreference}`,
    `Salary expectation: ${model.salaryExpectation}`,
    `Relocation: ${model.relocation}`
  ].join("\n");
}

function buildResumeModel(form: DnaForm, certifications: CertificationEntry[]) {
  const skills = splitList(form.skills);
  const interests = splitList(form.careerInterests);
  const education = splitLines(form.education);
  const certificationLines = certifications
    .filter((entry) => entry.name.trim())
    .map((entry) => `${entry.name} | ${entry.issuer || "Issuer pending"} | ${entry.year || "Year pending"}`);
  const portfolio = splitLines(form.portfolio);
  const learning = splitLines(form.learningSignals);

  return {
    name: form.name,
    role: form.currentRole,
    location: form.location,
    email: form.email,
    phone: form.phone,
    summary: form.summary,
    skills,
    interests,
    experience: parseExperience(form.experience),
    education,
    certifications: certificationLines,
    portfolio,
    learningSignals: learning,
    workPreference: form.workPreference,
    salaryExpectation: form.salaryExpectation,
    relocation: form.relocationFlexibility
  };
}

function formatSection(items: string[]) {
  return items.length ? items.map((item) => `- ${item}`) : ["- Add details"];
}

function calculateProfileDepth(form: DnaForm, certifications: CertificationEntry[]) {
  const fields = Object.values(form);
  const filled = fields.filter((value) => value.trim().length > 0).length;
  const certificationCount = certifications.filter((entry) => entry.name.trim()).length;
  const richness =
    splitList(form.skills).length +
    splitLines(form.experience).length +
    splitLines(form.portfolio).length +
    splitLines(form.learningSignals).length +
    certificationCount;
  return Math.min(100, Math.round((filled / fields.length) * 60 + Math.min(40, richness * 2.2)));
}

function splitList(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function splitLines(value: string) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

function countWords(value: string) {
  return value.trim() ? value.trim().split(/\s+/).length : 0;
}

function limitWords(value: string, maxWords: number) {
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return value;
  return words.slice(0, maxWords).join(" ");
}

function parseExperience(value: string) {
  const blocks = value
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  const parsed = blocks.map((block) => {
    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    const [header = "", ...rest] = lines;
    const [role = "", company = "", period = ""] = header.split("|").map((part) => part.trim());
    const bullets = rest.map((line) => line.replace(/^-+\s*/, "").trim()).filter(Boolean);

    return {
      role: role || "Role",
      company: company || "Company",
      period: period || "Period",
      bullets: bullets.length ? bullets : ["Add impact bullet"]
    };
  });

  return parsed.length
    ? parsed
    : [{ role: "Role", company: "Company", period: "Period", bullets: ["Add impact bullet"] }];
}
