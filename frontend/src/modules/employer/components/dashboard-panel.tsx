"use client";

import { employerMetrics, retentionSignals, skillHeatmap, talentMatches } from "../employer-data";
import { EmployerPageHeader, InsightCard, MetricCard } from "./employer-ui";

export function EmployerDashboardPanel() {
  const highRiskCount = retentionSignals.filter((signal) => !signal.optOut && signal.score >= 75).length;
  const averageMatch = Math.round(talentMatches.reduce((sum, candidate) => sum + candidate.score, 0) / talentMatches.length);
  const totalDemandGap = skillHeatmap.reduce((sum, point) => sum + Math.max(0, point.demand - point.supply), 0);

  return (
    <div>
      <EmployerPageHeader moduleId="dashboard" />
      <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="overflow-hidden rounded-[18px] border border-line bg-paper shadow-soft">
          <div className="border-b border-line bg-[linear-gradient(135deg,#14223d_0%,#233456_55%,#a9802f_140%)] p-5 text-paper">
            <p className="kicker text-[#D7C899]">Talent command center</p>
            <div className="mt-2 grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-end">
              <div>
                <h3 className="font-serif text-3xl font-semibold">Hiring, retention, and workforce pressure in one view</h3>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-paper/75">
                  CareerOS prioritizes high-match applicants, shows where new talent can come from, and flags workforce risk before it becomes churn.
                </p>
              </div>
              <div className="rounded-[14px] border border-paper/15 bg-paper/10 p-4 backdrop-blur">
                <p className="text-sm font-semibold text-paper/70">This week</p>
                <p className="mt-2 font-serif text-4xl font-semibold text-[#F3EAD3]">{averageMatch}%</p>
                <p className="mt-1 text-sm text-paper/70">Average score across active high-fit candidates</p>
              </div>
            </div>
          </div>
          <div className="p-4">
            <div className="grid gap-3 md:grid-cols-4">
              {employerMetrics.map((metric) => (
                <MetricCard key={metric.label} {...metric} />
              ))}
            </div>
            <div className="mt-4 grid gap-4 xl:grid-cols-3">
              <InsightCard title="Smart matching" value="42" detail="High-confidence candidates from composite scoring." />
              <InsightCard title="Retention risk" value={String(highRiskCount)} detail="Employees above 75 risk, excluding opt-outs." />
              <InsightCard title="Supply gap" value={String(totalDemandGap)} detail="Demand-minus-supply pressure across tracked locations." />
            </div>
          </div>
        </section>

        <aside className="grid gap-4">
          <section className="rounded-[18px] border border-line bg-ink p-4 text-paper shadow-soft">
            <p className="text-sm font-semibold text-paper/70">Recommended action</p>
            <h3 className="mt-2 text-xl font-semibold">Open Career Root for the Platform Engineer search</h3>
            <p className="mt-2 text-sm leading-6 text-paper/70">
              The strongest pipeline is not only CS. Economics and product candidates are showing consulting, analytics, and technical learning signals.
            </p>
          </section>
          <section className="rounded-[18px] border border-line bg-paper p-4 shadow-soft">
            <p className="kicker">Live employer modules</p>
            <div className="mt-3 grid gap-2">
              {["Career Root", "Talent Match", "Skill Heatmap", "Review"].map((label, index) => (
                <div key={label} className="flex items-center gap-3 rounded-[12px] border border-line bg-mist p-3">
                  <span className="grid size-8 place-items-center rounded-full bg-ink text-xs font-bold text-paper">0{index + 1}</span>
                  <span className="text-sm font-semibold text-ink">{label}</span>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
