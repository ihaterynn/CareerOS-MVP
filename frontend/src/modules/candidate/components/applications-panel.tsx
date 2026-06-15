"use client";

import {
  BookOpenCheck,
  CheckCircle2,
  ClipboardCheck,
  FileSearch,
  FileText,
  GraduationCap,
  Sparkles,
  Target
} from "lucide-react";
import { useState } from "react";
import { candidateApplications, candidateProfile, courseRecommendations, jobListings } from "../candidate-data";
import { ModuleCard, ScoreBar, Tag } from "./candidate-ui";

const quickApplySteps = ["Apply", "Generate", "Review and approve", "Applied"] as const;
const savedJobIds = ["senior-platform", "data-product", "ml-routing"];

export function ApplicationsPanel() {
  const [selectedJobId, setSelectedJobId] = useState(jobListings[1].id);
  const [step, setStep] = useState(1);
  const selectedJob = jobListings.find((job) => job.id === selectedJobId) ?? jobListings[0];
  const savedJobs = jobListings.filter((job) => savedJobIds.includes(job.id));
  const recommendations = courseRecommendations.filter((course) => course.jobIds.includes(selectedJob.id));
  const tailoredBullets = buildTailoredBullets(selectedJob.id);

  return (
    <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_390px]">
      <div className="grid gap-4">
        <ModuleCard>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="kicker">Job applications</p>
              <h2 className="mt-2 font-serif text-3xl font-semibold text-ink">Saved jobs and quick apply</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
                Review saved jobs, see the missing skills for each role, open recommended Coursera
                courses, then generate and approve a role-specific application.
              </p>
            </div>
            <Tag tone="gold">{savedJobs.length} saved jobs</Tag>
          </div>
        </ModuleCard>

        <div className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)]">
          <ModuleCard>
            <p className="kicker">Saved jobs</p>
            <div className="mt-4 grid gap-2">
              {savedJobs.map((job) => (
                <button
                  key={job.id}
                  type="button"
                  onClick={() => {
                    setSelectedJobId(job.id);
                    setStep(1);
                  }}
                  className={[
                    "rounded-[10px] border p-3 text-left transition",
                    selectedJob.id === job.id
                      ? "border-gold bg-[#F3EAD3] text-ink"
                      : "border-line bg-mist text-muted hover:border-gold hover:text-ink"
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">{job.title}</span>
                    <span className="mono text-xs font-bold">{job.match.overall}%</span>
                  </div>
                  <p className="mt-1 text-xs">{job.company}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Tag tone="gold">{job.salary}</Tag>
                    <Tag tone={job.missingSkills.length <= 2 ? "good" : "warn"}>
                      {job.missingSkills.length} gaps
                    </Tag>
                  </div>
                </button>
              ))}
            </div>
          </ModuleCard>

          <ModuleCard>
            <div className="mb-4 flex items-center gap-2">
              <Sparkles size={17} className="text-gold" aria-hidden="true" />
              <h3 className="font-semibold text-ink">AI generated resume version</h3>
            </div>
            <div className="grid gap-3 md:grid-cols-4">
              {quickApplySteps.map((label, index) => (
                <div
                  key={label}
                  className={[
                    "rounded-[10px] border px-3 py-3 text-sm font-semibold",
                    index <= step ? "border-[#E3D2A6] bg-[#F3EAD3] text-gold" : "border-line bg-mist text-muted"
                  ].join(" ")}
                >
                  <span className="mono mr-2 text-xs">0{index + 1}</span>
                  {label}
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-4 xl:grid-cols-2">
              <div className="rounded-[12px] border border-line bg-mist p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Target size={17} className="text-gold" aria-hidden="true" />
                  <p className="font-semibold text-ink">Missing skills to upskill</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.missingSkills.map((skill) => (
                    <Tag key={skill} tone="warn">{skill}</Tag>
                  ))}
                </div>
              </div>

              <div className="rounded-[12px] border border-line bg-mist p-4">
                <div className="mb-3 flex items-center gap-2">
                  <BookOpenCheck size={17} className="text-gold" aria-hidden="true" />
                  <p className="font-semibold text-ink">Coursera path</p>
                </div>
                <p className="text-sm leading-6 text-muted">
                  {recommendations.length
                    ? `${recommendations.length} course recommendation${recommendations.length > 1 ? "s" : ""} matched to this saved job.`
                    : "No direct course mapped yet for this role."}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-[12px] border border-line bg-mist p-4">
              <p className="kicker">Resume headline</p>
              <h4 className="mt-2 font-serif text-2xl font-semibold text-ink">
                {candidateProfile.name} for {selectedJob.title}
              </h4>
              <p className="mt-2 text-sm leading-6 text-muted">
                Tailored to {selectedJob.company} using matched requirements, missing skills, portfolio
                evidence, commute preference, and salary fit.
              </p>
            </div>

            <div className="mt-4 grid gap-3">
              <ScoreBar value={selectedJob.match.skills} label="Requirement keyword coverage" tone="good" />
              <ScoreBar value={selectedJob.match.salary} label="Fair pay alignment" tone="gold" />
              <ScoreBar value={selectedJob.match.preference} label="Candidate preference fit" tone="info" />
            </div>

            <div className="mt-5 grid gap-2">
              {tailoredBullets.map((bullet) => (
                <div key={bullet} className="rounded-[10px] border border-line bg-paper px-3 py-2 text-sm leading-6 text-muted">
                  {bullet}
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setStep((current) => Math.min(3, current + 1))}
                className="inline-flex items-center gap-2 rounded-[10px] bg-ink px-4 py-2 text-sm font-semibold text-paper transition hover:bg-gold hover:text-[#1c1402]"
              >
                <ClipboardCheck size={16} aria-hidden="true" />
                {step >= 3 ? "Applied" : "Approve next step"}
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 rounded-[10px] border border-line bg-paper px-4 py-2 text-sm font-semibold text-muted hover:text-ink"
              >
                <FileSearch size={16} aria-hidden="true" />
              Regenerate
              </button>
            </div>
          </ModuleCard>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {recommendations.map((course) => (
            <ModuleCard key={course.id}>
              <div className="flex items-start gap-3">
                <div className="grid size-11 shrink-0 place-items-center rounded-[10px] border border-line bg-mist text-gold">
                  <GraduationCap size={20} aria-hidden="true" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Tag tone="gold">{course.provider}</Tag>
                    <Tag tone="neutral">{course.duration}</Tag>
                  </div>
                  <h3 className="mt-3 font-semibold text-ink">{course.title}</h3>
                  <p className="mt-1 text-sm text-muted">{course.partner}</p>
                </div>
              </div>
              <div className="mt-4 rounded-[10px] border border-line bg-mist p-3">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
                  <BookOpenCheck size={16} className="text-gold" aria-hidden="true" />
                  Targets {course.targetSkill}
                </div>
                <p className="text-sm leading-6 text-muted">{course.reason}</p>
              </div>
              <a
                href={course.url}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex rounded-[10px] bg-ink px-4 py-2 text-sm font-semibold text-paper transition hover:bg-gold hover:text-[#1c1402]"
              >
                Open Coursera course
              </a>
            </ModuleCard>
          ))}
        </div>
      </div>

      <aside className="grid content-start gap-4 2xl:sticky 2xl:top-20">
        <ModuleCard>
          <div className="mb-4 flex items-center gap-2">
            <FileText size={17} className="text-gold" aria-hidden="true" />
            <h3 className="font-semibold text-ink">Tracked applications</h3>
          </div>
          <div className="grid gap-3">
            {candidateApplications.map((application) => {
              const job = jobListings.find((item) => item.id === application.jobId) ?? jobListings[0];

              return (
                <div key={application.id} className="rounded-[12px] border border-line bg-mist p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">{job.title}</p>
                      <p className="mt-1 text-sm text-muted">{job.company}</p>
                    </div>
                    <Tag tone={application.status === "Applied" || application.status === "Interview" ? "good" : "warn"}>
                      {application.status}
                    </Tag>
                  </div>
                  <p className="mt-3 text-sm leading-5 text-muted">{application.resumeVersion}</p>
                  <p className="mt-2 text-xs font-semibold text-faint">{application.submittedAt}</p>
                </div>
              );
            })}
          </div>
        </ModuleCard>

        <ModuleCard>
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle2 size={17} className="text-good" aria-hidden="true" />
            <h3 className="font-semibold text-ink">Consent guardrails</h3>
          </div>
          <p className="text-sm leading-6 text-muted">
            AI can generate and score the application, but the candidate must approve before CareerOS
            marks it as submitted.
          </p>
        </ModuleCard>
      </aside>
    </div>
  );
}

function buildTailoredBullets(jobId: string) {
  const job = jobListings.find((item) => item.id === jobId) ?? jobListings[0];

  return [
    `Prioritizes keywords: ${job.requirements.slice(0, 4).join(", ")}.`,
    `Highlights proof: route optimization, operational dashboards, PostgreSQL tuning, and backend service ownership.`,
    `Explains bridge plan for missing skills: ${job.missingSkills.join(", ")}.`,
    `Keeps salary and work mode aligned to ${job.salary} and ${job.mode}.`
  ];
}
