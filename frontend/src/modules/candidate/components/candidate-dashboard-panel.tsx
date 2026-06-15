"use client";

import { Bot, CheckCircle2, ClipboardList, FileText, GitBranch, Search, UserPlus } from "lucide-react";
import type { ReactNode } from "react";
import {
  candidateApplications,
  candidateProfile,
  careerPathRoutes,
  jobListings,
  registrationSteps
} from "../candidate-data";
import { KpiCard, ModuleCard, ScoreBar, Tag } from "./candidate-ui";

export function CandidateDashboardPanel() {
  const completedSteps = registrationSteps.filter((step) => step.complete).length;
  const topJob = jobListings[0];
  const activeApplications = candidateApplications.filter((application) => application.status !== "Draft").length;

  return (
    <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="grid gap-4">
        <ModuleCard className="overflow-hidden p-0">
          <div className="relative overflow-hidden bg-ink px-5 py-6 text-paper">
            <div className="absolute -right-24 top-0 size-72 rounded-full bg-[#DFA83C]/25 blur-3xl" />
            <div className="absolute -left-16 bottom-0 size-56 rounded-full bg-[#6EA8D8]/20 blur-3xl" />
            <div className="relative max-w-4xl">
              <p className="kicker text-[#D7C899]">Definitive CareerOS</p>
              <h2 className="mt-2 font-serif text-4xl font-semibold">Candidate command center</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[#E8DFC8]">
                One workspace for registration, Career DNA, resume building, job search, matching,
                applications, Jobby coaching, and quick apply approvals.
              </p>
            </div>
          </div>
          <div className="grid gap-3 p-4 md:grid-cols-5">
            <KpiCard label="Registration" value={`${completedSteps}/${registrationSteps.length}`} detail="Sign up and register flow" />
            <KpiCard label="Top match" value={`${topJob.match.overall}%`} detail={topJob.title} />
            <KpiCard label="Tree pay" value={careerPathRoutes[0].salaryRange} detail="Market route threshold" />
            <KpiCard label="Applications" value={String(activeApplications)} detail="In review or submitted" />
            <KpiCard label="Best path" value={`${careerPathRoutes[0].readiness}%`} detail={careerPathRoutes[0].title} />
          </div>
        </ModuleCard>

        <div className="grid gap-4 xl:grid-cols-2">
          <ModuleCard>
            <div className="mb-4 flex items-center gap-2">
              <UserPlus size={17} className="text-gold" aria-hidden="true" />
              <h3 className="font-semibold text-ink">Sign up and register</h3>
            </div>
            <div className="grid gap-2">
              {registrationSteps.map((step) => (
                <div key={step.label} className="flex items-center justify-between gap-3 rounded-[10px] border border-line bg-mist px-3 py-2">
                  <span className="text-sm font-semibold text-ink">{step.label}</span>
                  <Tag tone={step.complete ? "good" : "warn"}>{step.complete ? "Done" : "Pending"}</Tag>
                </div>
              ))}
            </div>
          </ModuleCard>

          <ModuleCard>
            <div className="mb-4 flex items-center gap-2">
              <FileText size={17} className="text-gold" aria-hidden="true" />
              <h3 className="font-semibold text-ink">Profile and resume builder</h3>
            </div>
            <p className="text-sm leading-6 text-muted">
              {candidateProfile.name}&apos;s Career DNA powers the ATS resume, matching scores, career tree,
              and AI-tailored quick apply resume versions.
            </p>
            <div className="mt-4 grid gap-3">
              <ScoreBar value={96} label="Profile completeness" tone="gold" />
              <ScoreBar value={91} label="ATS resume readiness" tone="good" />
              <ScoreBar value={84} label="Portfolio evidence strength" tone="info" />
            </div>
          </ModuleCard>
        </div>

        <div className="grid gap-4 xl:grid-cols-4">
          <CapabilityCard icon={<Search size={18} />} title="Keyword and job search" detail="Search roles by title, company, requirements, salary, mode, and live commute fit." />
          <CapabilityCard icon={<GitBranch size={18} />} title="Career tree" detail="Shows AI-parsed market routes, skill gaps, pay thresholds, projects, and Coursera branches from Career DNA." />
          <CapabilityCard icon={<Bot size={18} />} title="Jobby AI coach" detail="Answers candidate questions and explains route, pay, learning, and application decisions." />
        </div>
      </div>

      <aside className="grid content-start gap-4 2xl:sticky 2xl:top-20">
        <ModuleCard>
          <div className="mb-4 flex items-center gap-2">
            <ClipboardList size={17} className="text-gold" aria-hidden="true" />
            <h3 className="font-semibold text-ink">Application pipeline</h3>
          </div>
          <div className="grid gap-2">
            {candidateApplications.map((application) => {
              const job = jobListings.find((item) => item.id === application.jobId) ?? jobListings[0];

              return (
                <div key={application.id} className="rounded-[10px] border border-line bg-mist p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-ink">{job.title}</p>
                      <p className="mt-1 text-xs text-muted">{application.resumeVersion}</p>
                    </div>
                    <Tag tone={application.status === "Applied" || application.status === "Interview" ? "good" : "warn"}>
                      {application.status}
                    </Tag>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-muted">{application.nextStep}</p>
                </div>
              );
            })}
          </div>
        </ModuleCard>

        <ModuleCard>
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle2 size={17} className="text-good" aria-hidden="true" />
            <h3 className="font-semibold text-ink">Mandatory coverage</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {["Sign up", "Profile", "Listings", "Applications", "Matching", "Search", "Career tree pay", "Jobby.ai", "Candidate dashboard", "Employer dashboard"].map((item) => (
              <Tag key={item} tone="good">{item}</Tag>
            ))}
          </div>
        </ModuleCard>
      </aside>
    </div>
  );
}

function CapabilityCard({
  icon,
  title,
  detail
}: {
  icon: ReactNode;
  title: string;
  detail: string;
}) {
  return (
    <ModuleCard>
      <div className="mb-3 grid size-11 place-items-center rounded-[12px] bg-mist text-gold">{icon}</div>
      <h3 className="font-serif text-xl font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{detail}</p>
    </ModuleCard>
  );
}
