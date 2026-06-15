"use client";

import { attritionClusters } from "../employer-data";
import { EmployerPageHeader, HeaderCard, ScoreBar, TagList } from "./employer-ui";

export function AttritionPanel() {
  return (
    <div>
      <EmployerPageHeader moduleId="attrition" />
      <div className="grid gap-4">
        <HeaderCard
          label="Attrition Root Cause Engine"
          title="Cluster exit patterns instead of blaming individual cases"
          detail="The engine groups salary, promotion, performance, and engagement data to expose systemic retention issues."
        />
        <div className="grid gap-4 xl:grid-cols-3">
          {attritionClusters.map((cluster) => (
            <section key={cluster.label} className="rounded-[18px] border border-line bg-paper p-4 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="kicker">{cluster.share} of exits</p>
                  <h3 className="mt-2 font-serif text-xl font-semibold text-ink">{cluster.label}</h3>
                </div>
                <span className="rounded-full bg-ink px-3 py-1.5 text-sm font-bold text-paper">{cluster.risk}</span>
              </div>
              <div className="mt-4 rounded-[16px] border border-line bg-mist p-4">
                <ScoreBar label="Cluster risk" value={cluster.risk} />
                <p className="mt-3 rounded-[12px] border border-[#E3D2A6] bg-[#F3EAD3] p-3 text-sm leading-6 text-gold">
                  Root cause: {cluster.rootCause}
                </p>
              </div>
              <TagList title="Evidence" items={cluster.evidence} tone="warn" />
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
