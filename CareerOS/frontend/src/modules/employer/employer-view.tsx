"use client";

import type { EmployerModuleId } from "@careeros/shared";
import { employerMetrics, employerModules } from "./employer-data";

export function EmployerView({ activeModule }: { activeModule: EmployerModuleId }) {
  const active = employerModules.find((item) => item.id === activeModule) ?? employerModules[0];

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="kicker">Employer / Admin</p>
          <h2 className="mt-1 font-serif text-3xl font-semibold text-ink">Cempaka Digital</h2>
          <p className="mt-1 text-sm text-muted">{active.description}</p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <section className="rounded-[14px] border border-line bg-paper p-4 shadow-soft">
          <p className="text-sm font-semibold text-gold">{active.label}</p>
          <h3 className="mt-1 font-serif text-xl font-semibold text-ink">{active.description}</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {employerMetrics.map((metric) => (
              <div key={metric.label} className="rounded-[10px] border border-line bg-mist p-3">
                <p className="kicker">{metric.label}</p>
                <p className="mt-2 font-serif text-2xl font-semibold text-ink">{metric.value}</p>
                <p className="mt-1 text-sm text-muted">{metric.detail}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-[10px] border border-line bg-mist p-4">
            <p className="text-sm font-semibold text-ink">Current focus</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Prioritize urgent requisitions, review high-confidence talent matches, and monitor
              retention risk before the next hiring sync.
            </p>
          </div>
        </section>

        <aside className="rounded-[14px] border border-line bg-ink p-4 text-paper shadow-soft">
          <p className="text-sm font-semibold text-paper/70">Hiring command center</p>
          <h3 className="mt-2 text-xl font-semibold">Role demand and retention signals</h3>
          <p className="mt-2 text-sm leading-6 text-paper/70">
            Live workforce signals help the talent team see role pressure, candidate supply,
            onboarding progress, and retention risks in one place.
          </p>
        </aside>
      </div>
    </div>
  );
}
