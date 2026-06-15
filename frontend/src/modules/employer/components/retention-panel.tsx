"use client";

import { retentionSignals } from "../employer-data";
import { EmployerPageHeader, HeaderCard, RiskDial } from "./employer-ui";

export function RetentionPanel() {
  return (
    <div>
      <EmployerPageHeader moduleId="retention" />
      <div className="grid gap-4">
        <HeaderCard
          label="Talent Retention Signals"
          title="Explainable retention risk with opt-out awareness"
          detail="Risk is computed from weighted signals: stagnation 25%, compensation gap 25%, engagement 20%, mobility 15%, and skill growth 15%."
        />
        <div className="grid gap-4 xl:grid-cols-3">
          {retentionSignals.map((signal) => (
            <section key={signal.employee} className="overflow-hidden rounded-[18px] border border-line bg-paper shadow-soft">
              <div className={`p-4 ${signal.optOut ? "bg-mist" : signal.score >= 75 ? "bg-[#FFF4EF]" : "bg-[#FFF8E8]"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="kicker">{signal.team}</p>
                    <h3 className="mt-2 font-serif text-xl font-semibold text-ink">{signal.employee}</h3>
                    <p className="mt-1 text-sm text-muted">{signal.role}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1.5 text-sm font-bold ${signal.optOut ? "bg-muted text-paper" : "bg-ink text-paper"}`}>
                    {signal.optOut ? "Opt out" : `${signal.score}/100`}
                  </span>
                </div>
                {!signal.optOut ? <RiskDial value={signal.score} /> : null}
              </div>
              {signal.optOut ? (
                <p className="m-4 rounded-[12px] border border-line bg-mist p-3 text-sm leading-6 text-muted">
                  This employee opted out of CareerOS retention monitoring. Only aggregate team metrics are shown.
                </p>
              ) : (
                <div className="grid gap-2 p-4">
                  {signal.factors.map((factor) => (
                    <div key={factor.label} className="rounded-[12px] border border-line bg-mist p-3">
                      <div className="flex items-center justify-between gap-3 text-sm font-semibold text-ink">
                        <span>{factor.label} ({factor.weight})</span>
                        <span className="text-gold">+{factor.contribution}</span>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-muted">{factor.detail}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
