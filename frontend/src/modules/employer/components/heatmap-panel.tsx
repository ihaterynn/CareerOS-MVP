"use client";

import { useState } from "react";
import { skillHeatmap, type SkillHeatmapPoint } from "../employer-data";
import { EmployerPageHeader, InfoRow, ScoreBar, heatmapRecommendation, pressureTone, salaryPressureValue } from "./employer-ui";

export function SkillHeatmapPanel() {
  const [selectedSkill, setSelectedSkill] = useState(skillHeatmap[0].skill);
  const selectedPoint = skillHeatmap.find((point) => point.skill === selectedSkill) ?? skillHeatmap[0];

  return (
    <div>
      <EmployerPageHeader moduleId="heatmap" />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_370px]">
        <section className="overflow-hidden rounded-[18px] border border-line bg-paper shadow-soft">
          <div className="border-b border-line bg-mist px-4 py-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="kicker">Skill Supply-Demand Heatmap</p>
                <h3 className="mt-1 font-serif text-2xl font-semibold text-ink">Klang Valley talent pressure map</h3>
                <p className="mt-1 text-sm text-muted">Bubble size shows demand gap. Ring color shows salary pressure.</p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-bold">
                <span className="rounded-full border border-[#BFDCC8] bg-[#EAF4EC] px-3 py-1 text-good">Low pressure</span>
                <span className="rounded-full border border-[#E3D2A6] bg-[#F7EFD9] px-3 py-1 text-warn">Medium</span>
                <span className="rounded-full border border-[#E8BDB7] bg-[#F7E5E1] px-3 py-1 text-bad">High</span>
              </div>
            </div>
          </div>
          <div className="relative min-h-[610px] overflow-hidden bg-[#DDE8F2]">
            <div
              className="absolute inset-0 opacity-60"
              style={{
                backgroundImage:
                  "url(https://a.tile.openstreetmap.org/11/1651/1015.png), linear-gradient(#cbd9e7 1px, transparent 1px), linear-gradient(90deg, #cbd9e7 1px, transparent 1px)",
                backgroundPosition: "center, 0 0, 0 0",
                backgroundRepeat: "repeat",
                backgroundSize: "256px 256px, 42px 42px, 42px 42px"
              }}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_62%_34%,rgba(192,84,77,.26),transparent_16%),radial-gradient(circle_at_44%_79%,rgba(192,84,77,.22),transparent_15%),radial-gradient(circle_at_48%_54%,rgba(169,128,47,.20),transparent_16%)]" />

            {skillHeatmap.map((point) => (
              <HeatmapMarker
                key={`${point.skill}-${point.location}`}
                point={point}
                selected={point.skill === selectedSkill}
                onSelect={() => setSelectedSkill(point.skill)}
              />
            ))}

            <div className="absolute left-4 top-4 w-[min(360px,calc(100%-32px))] rounded-[16px] border border-line bg-paper/95 p-4 shadow-lifted backdrop-blur">
              <p className="kicker">Map interpretation</p>
              <h4 className="mt-2 font-serif text-xl font-semibold text-ink">Where hiring will cost more or take longer</h4>
              <div className="mt-3 grid gap-2">
                {skillHeatmap.map((point) => {
                  const gap = point.demand - point.supply;

                  return (
                    <button
                      key={`summary-${point.skill}`}
                      type="button"
                      onClick={() => setSelectedSkill(point.skill)}
                      className={`rounded-[12px] border p-3 text-left transition ${
                        point.skill === selectedSkill ? "border-gold bg-[#FFF8E8]" : "border-line bg-mist hover:border-gold"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-ink">{point.skill}</span>
                        <span className={`rounded-full border px-2 py-0.5 text-xs font-bold ${pressureTone[point.salaryPressure]}`}>
                          {point.salaryPressure}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted">{point.location} - demand gap {gap > 0 ? `+${gap}` : gap}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="absolute bottom-4 left-4 rounded-[10px] border border-line bg-paper/90 px-3 py-2 text-xs font-semibold text-muted shadow-soft backdrop-blur">
              OpenStreetMap-based skill pressure prototype
            </div>
          </div>
        </section>

        <aside className="grid content-start gap-4">
          <section className="rounded-[18px] border border-line bg-paper p-4 shadow-soft">
            <p className="kicker">{selectedPoint.location}</p>
            <h3 className="mt-1 font-serif text-2xl font-semibold text-ink">{selectedPoint.skill}</h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              Demand is {selectedPoint.demand}% against {selectedPoint.supply}% available supply. This market needs either salary adjustment, adjacent-source hiring, or targeted upskilling.
            </p>
            <div className="mt-4 grid gap-3">
              <ScoreBar label="Demand concentration" value={selectedPoint.demand} />
              <ScoreBar label="Talent availability" value={selectedPoint.supply} />
              <ScoreBar label="Salary pressure" value={salaryPressureValue(selectedPoint)} />
            </div>
          </section>
          <section className="rounded-[18px] border border-line bg-ink p-4 text-paper shadow-soft">
            <p className="kicker text-[#D7C899]">Suggested action</p>
            <h3 className="mt-2 text-xl font-semibold">{heatmapRecommendation(selectedPoint)}</h3>
            <p className="mt-2 text-sm leading-6 text-paper/70">
              Use Career Root to source adjacent candidates, then assign courses or portfolio projects to close the visible supply gap.
            </p>
          </section>
          <section className="rounded-[18px] border border-line bg-paper p-4 shadow-soft">
            <p className="kicker">Location cards</p>
            <div className="mt-3 grid gap-2">
              {skillHeatmap.map((point) => (
                <InfoRow
                  key={`row-${point.skill}`}
                  label={`${point.location} - ${point.skill}`}
                  value={`${point.demand - point.supply > 0 ? "+" : ""}${point.demand - point.supply}`}
                />
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function HeatmapMarker({
  point,
  selected,
  onSelect
}: {
  point: SkillHeatmapPoint;
  selected: boolean;
  onSelect: () => void;
}) {
  const gap = Math.max(0, point.demand - point.supply);
  const size = 58 + gap * 0.75;
  const ringColor = point.salaryPressure === "High" ? "rgba(192,84,77,.38)" : point.salaryPressure === "Medium" ? "rgba(169,128,47,.34)" : "rgba(63,143,94,.28)";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-paper/95 text-center shadow-lifted backdrop-blur transition hover:scale-105 ${
        selected ? "border-ink ring-4 ring-[#F3EAD3]" : "border-paper"
      }`}
      style={{
        left: `${point.x}%`,
        top: `${point.y}%`,
        width: `${size}px`,
        height: `${size}px`,
        boxShadow: `0 0 0 13px ${ringColor}, 0 18px 36px rgba(20,34,61,.20)`
      }}
      title={`${point.skill} in ${point.location}`}
    >
      <span className="block px-2 text-[11px] font-extrabold leading-tight text-ink">{point.skill}</span>
      <span className="mt-1 block text-[10px] font-bold text-gold">+{point.demand - point.supply}</span>
    </button>
  );
}
