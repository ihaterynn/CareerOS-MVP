"use client";

import { BookOpenCheck, CheckCircle2, GraduationCap, Target } from "lucide-react";
import { useState } from "react";
import { courseRecommendations, jobListings } from "../candidate-data";
import { ModuleCard, ScoreBar, Tag } from "./candidate-ui";

export function UpskillingPanel() {
  const [selectedJobId, setSelectedJobId] = useState(jobListings[0].id);
  const selectedJob = jobListings.find((job) => job.id === selectedJobId) ?? jobListings[0];
  const recommendations = courseRecommendations.filter((course) => course.jobIds.includes(selectedJob.id));

  return (
    <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
      <ModuleCard>
        <p className="kicker">Target job</p>
        <h2 className="mt-2 font-serif text-2xl font-semibold text-ink">Upskilling planner</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Select a role to show missing skills and Coursera recommendations based on the job
          requirements.
        </p>

        <div className="mt-4 grid gap-2">
          {jobListings.map((job) => {
            const selected = job.id === selectedJobId;

            return (
              <button
                key={job.id}
                type="button"
                onClick={() => setSelectedJobId(job.id)}
                className={[
                  "rounded-[10px] border p-3 text-left transition",
                  selected
                    ? "border-gold bg-[#F3EAD3] text-ink shadow-sm"
                    : "border-line bg-mist text-muted hover:border-gold hover:text-ink"
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{job.title}</span>
                  <span className="mono text-xs font-bold">{job.match.overall}%</span>
                </div>
                <p className="mt-1 text-xs">{job.company} - {job.location}</p>
              </button>
            );
          })}
        </div>
      </ModuleCard>

      <div className="grid gap-4">
        <ModuleCard>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="kicker">Requirement gap analysis</p>
              <h3 className="mt-2 font-serif text-2xl font-semibold text-ink">{selectedJob.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                Match scoring is split by skill fit, geography, salary, and preference alignment so
                you can see what to improve.
              </p>
            </div>
            <div className="rounded-[12px] border border-line bg-mist px-4 py-3">
              <p className="kicker">Overall fit</p>
              <p className="mt-1 font-serif text-3xl font-semibold text-ink">{selectedJob.match.overall}%</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <ScoreBar value={selectedJob.match.skills} label="Skill fit" tone="good" />
            <ScoreBar value={selectedJob.match.geo} label="Location and commute" tone="info" />
            <ScoreBar value={selectedJob.match.salary} label="Salary alignment" tone="gold" />
            <ScoreBar value={selectedJob.match.preference} label="Work preference" tone="warn" />
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div>
              <div className="mb-2 flex items-center gap-2 font-semibold text-ink">
                <CheckCircle2 size={17} className="text-good" aria-hidden="true" />
                Role requirements
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedJob.requirements.map((skill) => (
                  <Tag key={skill} tone={selectedJob.missingSkills.includes(skill) ? "warn" : "good"}>
                    {skill}
                  </Tag>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2 font-semibold text-ink">
                <Target size={17} className="text-gold" aria-hidden="true" />
                Skills to bridge
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedJob.missingSkills.map((skill) => (
                  <Tag key={skill} tone="warn">{skill}</Tag>
                ))}
              </div>
            </div>
          </div>
        </ModuleCard>

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
            </ModuleCard>
          ))}
        </div>
      </div>
    </div>
  );
}
