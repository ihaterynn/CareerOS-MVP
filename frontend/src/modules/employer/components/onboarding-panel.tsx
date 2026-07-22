"use client";

import { useMemo, useState } from "react";
import { Bot, CalendarClock, CheckCircle2, CircleDot, Clock, FileText, UserRound, Zap } from "lucide-react";
import {
  buildOnboardingWorkflow,
  onboardingPredictions,
  type OnboardingPhase,
  type OnboardingTask
} from "../employer-data";
import { EmployerPageHeader, HeaderCard, MiniMetric, ScoreBar } from "./employer-ui";

export function OnboardingPanel() {
  const [selectedHire, setSelectedHire] = useState(onboardingPredictions[0].hire);
  const prediction = onboardingPredictions.find((item) => item.hire === selectedHire) ?? onboardingPredictions[0];
  const workflow = useMemo(() => buildOnboardingWorkflow(prediction), [prediction]);
  const automationRate = Math.round((workflow.automatedCount / workflow.totalCount) * 100);
  const humanOwnedCount = workflow.totalCount - workflow.automatedCount;

  return (
    <div>
      <EmployerPageHeader moduleId="onboarding" />
      <div className="grid gap-4">
        <HeaderCard
          label="Automated onboarding"
          title="Generate a tailored onboarding workflow the moment a hire is confirmed"
          detail="This demo starts with three confirmed hires. CareerOS scaffolds pre-boarding, week one, first-30-day, and ramp phases — while HR, managers, and buddies retain their human responsibilities."
        />

        <p className="kicker -mb-1">Confirmed hires · select a role-aware workflow</p>
        <div className="grid gap-3 md:grid-cols-3">
          {onboardingPredictions.map((hire) => {
            const active = hire.hire === selectedHire;
            return (
              <button
                key={hire.hire}
                type="button"
                onClick={() => setSelectedHire(hire.hire)}
                className={`rounded-[16px] border bg-paper p-4 text-left shadow-soft transition ${
                  active ? "border-gold ring-4 ring-[#F3EAD3]" : "border-line hover:border-gold"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="kicker">{hire.role}</p>
                    <h3 className="mt-1 font-serif text-xl font-semibold text-ink">{hire.hire}</h3>
                  </div>
                  <span className="rounded-full bg-ink px-3 py-1 text-xs font-bold text-paper">{hire.successProbability}%</span>
                </div>
                <div className="mt-3">
                  <ScoreBar label="Predicted success" value={hire.successProbability} />
                </div>
                <div className="mt-3 flex items-center gap-3 text-xs text-muted">
                  <span className="inline-flex items-center gap-1"><Clock size={12} aria-hidden="true" />{hire.timeToImpact} to impact</span>
                  <span className="inline-flex items-center gap-1"><CircleDot size={12} aria-hidden="true" />{hire.turnoverRisk}% risk</span>
                </div>
              </button>
            );
          })}
        </div>

        <section className="overflow-hidden rounded-[18px] border border-line bg-paper shadow-soft">
          <div className="flex flex-col gap-4 border-b border-line bg-[linear-gradient(135deg,#14223d_0%,#233456_58%,#a9802f_155%)] p-4 text-paper lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-[#D7C899]" aria-hidden="true" />
                <p className="kicker text-[#D7C899]">Generated workflow</p>
              </div>
              <h3 className="mt-1 font-serif text-2xl font-semibold">{workflow.hire} — {workflow.role}</h3>
              <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-paper/75">
                <span className="inline-flex items-center gap-1.5"><CalendarClock size={14} aria-hidden="true" />Starts {workflow.startDate}</span>
                <span className="inline-flex items-center gap-1.5"><UserRound size={14} aria-hidden="true" />Manager {workflow.manager}</span>
                <span className="inline-flex items-center gap-1.5"><UserRound size={14} aria-hidden="true" />Buddy {workflow.buddy}</span>
              </p>
            </div>
            <div className="grid shrink-0 grid-cols-3 gap-2 lg:w-72">
              <MiniMetric label="Automated" value={`${automationRate}%`} />
              <MiniMetric label="Human-owned" value={String(humanOwnedCount)} />
              <MiniMetric label="Tasks" value={String(workflow.totalCount)} />
            </div>
          </div>

          <div className="border-b border-line bg-mist px-4 py-3">
            <div className="flex items-center justify-between text-xs font-semibold text-muted">
              <span>{workflow.automatedCount} of {workflow.totalCount} tasks run automatically</span>
              <span className="inline-flex items-center gap-1.5 text-gold"><Bot size={13} aria-hidden="true" />{humanOwnedCount} human-owned tasks remain</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#F1EDE3]">
              <div className="h-full rounded-full bg-[linear-gradient(90deg,#a9802f,#d9b65d)]" style={{ width: `${automationRate}%` }} />
            </div>
          </div>

          <div className="grid gap-4 p-4 xl:grid-cols-2">
            {workflow.phases.map((phase, index) => (
              <PhaseCard key={phase.name} phase={phase} index={index} />
            ))}
          </div>

          <aside className="mx-4 mb-4 rounded-[12px] border border-[#B9CDE6] bg-[#E8EFF7] px-3 py-2.5 text-xs leading-5 text-info">
            <span className="font-bold">Planning guardrail:</span> success and ramp-risk signals guide support and workload planning, never employment decisions. Sensitive documents show status only; managers own goals, buddies own connection, and HR owns documentation.
          </aside>
        </section>
      </div>
    </div>
  );
}

function PhaseCard({ phase, index }: { phase: OnboardingPhase; index: number }) {
  return (
    <section className="rounded-[16px] border border-line bg-mist p-4">
      <div className="flex items-start gap-3">
        <span className="mono grid size-8 shrink-0 place-items-center rounded-full bg-ink text-xs font-bold text-paper">
          {index + 1}
        </span>
        <div>
          <h4 className="font-serif text-lg font-semibold text-ink">{phase.name}</h4>
          <p className="kicker mt-0.5">{phase.window}</p>
        </div>
      </div>
      <p className="mt-2 text-sm leading-6 text-muted">{phase.goal}</p>
      <div className="mt-3 grid gap-2">
        {phase.tasks.map((task) => (
          <TaskRow key={task.title} task={task} />
        ))}
      </div>
    </section>
  );
}

const typeBadge: Record<OnboardingTask["type"], { label: string; className: string; Icon: typeof Bot }> = {
  Automated: { label: "Automated", className: "border-[#BFDCC8] bg-[#EAF4EC] text-good", Icon: Bot },
  Manual: { label: "Manual", className: "border-[#E3D2A6] bg-[#F3EAD3] text-gold", Icon: UserRound },
  Document: { label: "Document", className: "border-[#B9CDE6] bg-[#E8EFF7] text-info", Icon: FileText }
};

function TaskRow({ task }: { task: OnboardingTask }) {
  const badge = typeBadge[task.type];
  const StatusIcon = task.status === "Done" ? CheckCircle2 : task.status === "In progress" ? CircleDot : Clock;
  const statusColor = task.status === "Done" ? "text-good" : task.status === "In progress" ? "text-warn" : "text-faint";

  return (
    <div className="flex items-start gap-3 rounded-[12px] border border-line bg-paper px-3 py-2.5">
      <StatusIcon size={16} className={`mt-0.5 shrink-0 ${statusColor}`} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-5 text-ink">{task.title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
          <span>{task.owner}</span>
          <span className="text-faint">•</span>
          <span>{task.due}</span>
        </div>
      </div>
      <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${badge.className}`}>
        <badge.Icon size={11} aria-hidden="true" />
        {badge.label}
      </span>
    </div>
  );
}
