"use client";

import { useMemo, useState } from "react";
import { Copy, Ear, Sparkles, Target, Wand2 } from "lucide-react";
import { generateInterviewKit, type TalentMatch } from "../employer-data";

export function InterviewKit({ candidate, roleTitle }: { candidate: TalentMatch; roleTitle: string }) {
  const [generatedFor, setGeneratedFor] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [activeCategory, setActiveCategory] = useState<"role" | "personality" | "culture">("role");
  const [copiedQuestion, setCopiedQuestion] = useState<string | null>(null);

  const kit = useMemo(() => generateInterviewKit(candidate, roleTitle), [candidate, roleTitle]);
  const isReady = generatedFor === candidate.id && !generating;
  const category = kit.categories.find((item) => item.id === activeCategory) ?? kit.categories[0];
  const evidenceLight = candidate.score < 80;
  const gap = candidate.missingSignals[0] ?? "a role requirement";
  const secondGap = candidate.missingSignals[1] ?? gap;
  const questions = evidenceLight ? gapQuestions(activeCategory, roleTitle, gap, secondGap) : category.questions;

  function generate() {
    setGenerating(true);
    setActiveCategory("role");
    window.setTimeout(() => {
      setGeneratedFor(candidate.id);
      setGenerating(false);
    }, 650);
  }

  async function copyQuestion(prompt: string) {
    await navigator.clipboard?.writeText(prompt);
    setCopiedQuestion(prompt);
  }

  return (
    <section className="overflow-hidden rounded-[18px] border border-line bg-paper shadow-soft">
      <div className="flex flex-col gap-3 border-b border-line bg-[linear-gradient(135deg,#14223d_0%,#233456_58%,#a9802f_155%)] p-4 text-paper sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Wand2 size={16} className="text-[#D7C899]" aria-hidden="true" />
            <p className="kicker text-[#D7C899]">Dynamic interview kit</p>
          </div>
          <h3 className="mt-1 font-serif text-2xl font-semibold">Questions built for {candidate.name.split(" ")[0]}</h3>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-paper/75">
            Role-specific, working-style, and collaboration prompts grounded in the submitted profile. They guide human interviews; they do not assess personality or culture automatically.
          </p>
        </div>
        <button
          type="button"
          onClick={generate}
          disabled={generating}
          className="inline-flex shrink-0 items-center gap-2 rounded-[12px] bg-paper px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-gold hover:text-[#1c1402] disabled:opacity-70"
        >
          <Sparkles size={15} aria-hidden="true" />
          {generating ? "Generating…" : isReady ? "Regenerate" : "Generate kit"}
        </button>
      </div>

      {!isReady ? (
        <div className="grid place-items-center gap-3 p-8 text-center">
          {generating ? (
            <>
              <div className="flex gap-1.5" aria-hidden="true">
                {[0, 1, 2].map((index) => (
                  <span
                    key={index}
                    className="size-2.5 rounded-full bg-gold"
                    style={{ animation: `dot-bounce 1.2s ${index * 0.15}s infinite ease-in-out` }}
                  />
                ))}
              </div>
              <p className="text-sm text-muted">Reading resume, Career DNA, and role requirements…</p>
            </>
          ) : (
            <>
              <div className="grid size-12 place-items-center rounded-[14px] bg-mist text-gold">
                <Wand2 size={22} aria-hidden="true" />
              </div>
              <p className="max-w-sm text-sm leading-6 text-muted">
                Generate a tailored interview kit for <span className="font-semibold text-ink">{candidate.name}</span> targeting the {roleTitle} role.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="p-4">
          <p className="mb-3 text-xs italic leading-5 text-muted">{kit.headline}</p>
          {evidenceLight ? (
            <div className="mb-3 rounded-[12px] border border-[#E3D2A6] bg-[#FFF8E8] px-3 py-2 text-xs leading-5 text-ink">
              Evidence-light profile: these prompts ask for examples that could verify missing evidence. They do not infer traits from absent information.
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {kit.categories.map((item) => {
              const active = item.id === activeCategory;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveCategory(item.id)}
                  className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${
                    active ? "border-gold bg-[#FFF8E8] text-gold" : "border-line bg-mist text-muted hover:border-gold"
                  }`}
                >
                  {item.id === "personality" ? "Working style" : item.label}
                </button>
              );
            })}
          </div>

          <p className="mt-3 rounded-[12px] border border-line bg-mist px-3 py-2 text-xs leading-5 text-muted">
            {evidenceLight ? `Source: missing or limited evidence for ${gap} and ${secondGap} in the submitted profile.` : category.basis}
          </p>

          <div className="mt-3 grid gap-3">
            {questions.map((question, index) => (
              <article key={question.prompt} className="rounded-[14px] border border-line bg-paper p-4 shadow-soft">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="mono grid size-7 shrink-0 place-items-center rounded-full bg-ink text-xs font-bold text-paper">
                      {index + 1}
                    </span>
                    <p className="text-sm font-semibold leading-6 text-ink">{question.prompt}</p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Copy question ${index + 1}`}
                    onClick={() => void copyQuestion(question.prompt)}
                    className="shrink-0 rounded-[8px] border border-line bg-mist p-1.5 text-muted transition hover:border-gold hover:text-gold"
                  >
                    <Copy size={14} aria-hidden="true" />
                  </button>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-[10px] border border-line bg-mist px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <Target size={12} className="text-info" aria-hidden="true" />
                      <p className="kicker">Probes</p>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-muted">{question.probes}</p>
                  </div>
                  <div className="rounded-[10px] border border-[#BFDCC8] bg-[#EAF4EC] px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <Ear size={12} className="text-good" aria-hidden="true" />
                      <p className="kicker text-good">Listen for</p>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-[#2f6a48]">{question.lookFor}</p>
                  </div>
                </div>
                {copiedQuestion === question.prompt ? <p className="mt-2 text-xs font-semibold text-good">Question copied</p> : null}
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function gapQuestions(category: "role" | "personality" | "culture", roleTitle: string, gap: string, secondGap: string) {
  if (category === "role") {
    return [
      {
        prompt: `This submission does not include direct evidence of ${gap}. What work, study, or portfolio example would best demonstrate readiness for the ${roleTitle} role?`,
        probes: "Evidence that can verify the missing requirement, not an assumed weakness.",
        lookFor: "A specific example, the candidate's contribution, and observable results."
      },
      {
        prompt: `What experience would you use to show how you approach ${secondGap}, even if it is not represented in this resume?`,
        probes: "Transferable evidence and an honest account of scope.",
        lookFor: "Relevant constraints, decisions, and a clear distinction between direct and adjacent experience."
      }
    ];
  }

  if (category === "personality") {
    return [
      {
        prompt: "The submitted profile does not establish a working-style pattern. Can you share a time you received difficult feedback and what you changed afterward?",
        probes: "A concrete behavior and response, without assigning a personality label.",
        lookFor: "Specific context, ownership, and a change the interviewer can understand."
      },
      {
        prompt: "When a problem has no obvious owner, what do you do first? Please use a recent example.",
        probes: "How the candidate frames ambiguity in practice.",
        lookFor: "Clear communication, appropriate escalation, and evidence of follow-through."
      }
    ];
  }

  return [
    {
      prompt: `What about the day-to-day context of this ${roleTitle} role would help you decide whether it is the right next move?`,
      probes: "Alignment with the role's actual context rather than a culture label.",
      lookFor: "Questions about the work, team expectations, and how success is measured."
    },
    {
      prompt: "Tell us about a collaboration where you had to work through disagreement. What did you do, and what was the outcome?",
      probes: "Observed collaboration behavior, not a predicted culture fit.",
      lookFor: "Respectful disagreement, evidence-based reasoning, and a shared outcome."
    }
  ];
}
