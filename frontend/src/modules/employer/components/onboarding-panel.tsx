"use client";

import { onboardingPredictions } from "../employer-data";
import { EmployerPageHeader, HeaderCard, InfoTile, ScoreBar, TagList } from "./employer-ui";

export function OnboardingPanel() {
  return (
    <div>
      <EmployerPageHeader moduleId="onboarding" />
      <div className="grid gap-4">
        <HeaderCard
          label="Onboarding Success Predictor"
          title="Forecast first impact, ramp risk, and next milestone"
          detail="The predictor uses prior turnover patterns, time to first tangible impact, mentor fit, and milestone clarity."
        />
        <div className="grid gap-4 xl:grid-cols-3">
          {onboardingPredictions.map((hire) => (
            <section key={hire.hire} className="rounded-[18px] border border-line bg-paper p-4 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="kicker">{hire.role}</p>
                  <h3 className="mt-2 font-serif text-xl font-semibold text-ink">{hire.hire}</h3>
                </div>
                <span className="rounded-full bg-ink px-3 py-1.5 text-sm font-bold text-paper">{hire.successProbability}%</span>
              </div>
              <div className="mt-4 rounded-[16px] border border-line bg-mist p-4">
                <ScoreBar label="Success probability" value={hire.successProbability} />
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <InfoTile label="Time to impact" value={hire.timeToImpact} />
                  <InfoTile label="Turnover risk" value={`${hire.turnoverRisk}%`} />
                </div>
              </div>
              <div className="mt-4 rounded-[12px] border border-[#E3D2A6] bg-[#F3EAD3] p-3">
                <p className="kicker text-gold">Next milestone</p>
                <p className="mt-1 text-sm font-semibold text-ink">{hire.nextMilestone}</p>
              </div>
              <TagList title="Prediction drivers" items={hire.drivers} tone="info" />
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
