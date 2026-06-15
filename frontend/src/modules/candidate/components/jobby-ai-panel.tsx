"use client";

import { Bot, BrainCircuit, BriefcaseBusiness, GitBranch, GraduationCap, MessageSquareText, Send, WalletCards } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { candidateApplications, candidateProfile, careerPathRoutes, courseRecommendations, jobListings } from "../candidate-data";
import { ModuleCard, Tag } from "./candidate-ui";

type JobbyMessage = {
  id: number;
  author: "assistant" | "candidate";
  text: string;
};

const suggestions = [
  "What career path should I choose?",
  "What salary should I ask for?",
  "What should I learn next?",
  "Which saved job should I apply to first?"
];

export function JobbyAiPanel() {
  const [input, setInput] = useState("");
  const savedJobsCount = candidateApplications.length;
  const [messages, setMessages] = useState<JobbyMessage[]>([
    {
      id: 1,
      author: "assistant",
      text: "Hi, I am Jobby.ai. I use curated Career DNA context, market-route retrieval, and agentic reasoning to answer career path, pay, course, project, resume, and application questions."
    }
  ]);

  function askJobby(prompt: string) {
    const cleaned = prompt.trim();
    if (!cleaned) return;

    const nextId = messages.length + 1;
    setMessages((current) => [
      ...current,
      { id: nextId, author: "candidate", text: cleaned },
      { id: nextId + 1, author: "assistant", text: buildJobbyReply(cleaned) }
    ]);
    setInput("");
  }

  return (
    <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="overflow-hidden rounded-[14px] border border-line bg-paper shadow-soft">
        <div className="relative overflow-hidden border-b border-line bg-ink px-5 py-5 text-paper">
          <div className="absolute -right-20 top-0 size-72 rounded-full bg-[#A9802F]/30 blur-3xl" />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="kicker text-[#D7C899]">Jobby.ai career advisor</p>
              <h2 className="mt-2 font-serif text-3xl font-semibold">Ask anything about the next move</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[#E8DFC8]">
                Jobby helps you make sense of your options using your Candidate DNA, strong job
                matches, career pathways, saved jobs, and upskilling suggestions.
              </p>
            </div>
            <div className="grid size-14 place-items-center rounded-[18px] bg-paper/10 text-[#F3EAD3]">
              <Bot size={28} aria-hidden="true" />
            </div>
          </div>
        </div>

        <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div className="grid min-h-[560px] content-between gap-4 p-4">
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => askJobby(suggestion)}
                  className="rounded-full border border-line bg-mist px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-gold hover:text-ink"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            <div className="grid max-h-[430px] gap-3 overflow-auto rounded-[14px] border border-line bg-mist p-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={[
                    "max-w-[88%] rounded-[14px] px-3 py-2 text-sm leading-6",
                    message.author === "assistant"
                      ? "justify-self-start border border-line bg-paper text-muted"
                      : "justify-self-end bg-ink text-paper"
                  ].join(" ")}
                >
                  <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
                    {message.author === "assistant" ? <MessageSquareText size={13} aria-hidden="true" /> : null}
                    {message.author === "assistant" ? "Jobby.ai" : "You"}
                  </div>
                  {message.text}
                </div>
              ))}
            </div>

            <form
              className="flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                askJobby(input);
              }}
            >
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about jobs, pay, skills, courses, or applications"
                className="min-w-0 flex-1 rounded-[12px] border border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition focus:border-gold"
              />
              <button
                type="submit"
                className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-gold text-paper transition hover:bg-ink"
                aria-label="Ask Jobby"
              >
                <Send size={17} aria-hidden="true" />
              </button>
            </form>
          </div>

          <aside className="border-t border-line bg-mist p-4 xl:border-l xl:border-t-0">
            <p className="kicker">Context Jobby uses</p>
            <div className="mt-4 grid gap-3">
              <ContextTile icon={<BriefcaseBusiness size={17} />} label="Scored jobs" value={`Uses high-scoring available jobs like ${jobListings[0].title} at ${jobListings[0].match.overall}% fit.`} />
              <ContextTile icon={<BrainCircuit size={17} />} label="Candidate DNA" value={`Reads skills, preferences, experience, and learning signals for ${candidateProfile.currentRole}.`} />
              <ContextTile icon={<GitBranch size={17} />} label="Career pathways" value={`Uses ${careerPathRoutes.length} generated market routes, including ${careerPathRoutes[0].title}.`} />
              <ContextTile icon={<WalletCards size={17} />} label="Saved jobs" value={`Considers ${savedJobsCount} saved or active application targets when prioritizing advice.`} />
              <ContextTile icon={<GraduationCap size={17} />} label="Upskilling" value={`Uses ${courseRecommendations.length} Coursera recommendations tied to missing skills and route gaps.`} />
            </div>
          </aside>
        </div>
      </section>

      <aside className="grid content-start gap-4 2xl:sticky 2xl:top-20">
        <ModuleCard>
          <p className="kicker">Fast recommendation</p>
          <h3 className="mt-2 font-serif text-2xl font-semibold text-ink">{careerPathRoutes[0].title}</h3>
          <p className="mt-3 text-sm leading-6 text-muted">
            This is the strongest near-term market route because it combines high Career DNA
            readiness, strong pay potential, and a small bridge-skill set.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Tag tone="good">{careerPathRoutes[0].readiness}% route readiness</Tag>
            <Tag tone="gold">{careerPathRoutes[0].unlockedPayRange}</Tag>
            {careerPathRoutes[0].bridgeSkills.map((skill) => (
              <Tag key={skill} tone="warn">{skill}</Tag>
            ))}
          </div>
        </ModuleCard>

        <ModuleCard>
          <p className="kicker">What Jobby can answer</p>
          <div className="mt-3 grid gap-2">
            {["Career route advice", "Pay threshold explanation", "Course recommendations", "Project suggestions", "Resume positioning", "Quick apply priority"].map((item) => (
              <div key={item} className="rounded-[10px] border border-line bg-mist px-3 py-2 text-sm font-semibold text-muted">
                {item}
              </div>
            ))}
          </div>
        </ModuleCard>
      </aside>
    </div>
  );
}

function ContextTile({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-[12px] border border-line bg-paper p-3">
      <div className="flex items-center gap-2 text-gold">
        {icon}
        <span className="kicker">{label}</span>
      </div>
      <p className="mt-2 text-sm font-semibold leading-5 text-ink">{value}</p>
    </div>
  );
}

function buildJobbyReply(prompt: string) {
  const normalized = prompt.toLowerCase();
  const bestJob = jobListings[0];
  const bestRoute = careerPathRoutes[0];

  if (normalized.includes("salary") || normalized.includes("pay") || normalized.includes("ask")) {
    return `For the ${bestRoute.title} route, the current expected pay is ${bestRoute.currentExpectedPay}; the unlocked range is ${bestRoute.unlockedPayRange} after proving ${bestRoute.requiredSignals.slice(0, 2).join(" and ")}.`;
  }

  if (normalized.includes("learn") || normalized.includes("course") || normalized.includes("skill")) {
    return `Start with ${bestRoute.bridgeSkills[0]}. The Career Tree maps it to ${bestRoute.courses[0].title}, then you should complete the project: ${bestRoute.projects[0]}`;
  }

  if (normalized.includes("apply") || normalized.includes("job")) {
    return `Apply first to ${bestJob.title} at ${bestJob.company}. It has the highest employer-job match score, while the Career Tree shows which market-route signals and pay thresholds to build toward next.`;
  }

  if (normalized.includes("path") || normalized.includes("career")) {
    return `The most realistic market route is ${bestRoute.title}, but Career DNA also surfaces adjacent paths like Technology Consultant when soft signals indicate business-context potential. ${bestRoute.title} is ${bestRoute.readiness}% ready over ${bestRoute.horizon}.`;
  }

  if (normalized.includes("resume")) {
    return `Position the resume around backend platform ownership: dispatch latency reduction, PostgreSQL tuning, Go exposure, AWS, and route optimization portfolio evidence.`;
  }

  return `Jobby recommends starting with ${bestRoute.title}: close ${bestRoute.bridgeSkills.join(" and ")}, build the project "${bestRoute.projects[0]}", and use the tree pay threshold ${bestRoute.unlockedPayRange} once those signals are proven.`;
}
