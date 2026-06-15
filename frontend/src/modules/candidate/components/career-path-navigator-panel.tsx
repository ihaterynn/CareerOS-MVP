"use client";

import {
  ArrowRight,
  Bot,
  BriefcaseBusiness,
  Compass,
  GitBranch,
  MessageSquareText,
  Send,
  Sparkles,
  TrendingUp
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  candidateProfile,
  careerPathRoutes,
  skillSignals,
  type CareerPathRoute
} from "../candidate-data";
import { Collapsible, ModuleCard, ScoreBar, Tag } from "./candidate-ui";

type ChatMessage = {
  id: number;
  author: "assistant" | "candidate";
  text: string;
};

const branchPositions = [
  { x: 67, y: 13 },
  { x: 79, y: 32 },
  { x: 76, y: 52 },
  { x: 70, y: 72 },
  { x: 58, y: 88 }
];

const trackTone = {
  Grow: "good",
  Pivot: "info",
  Specialize: "gold",
  Adjacent: "warn"
} as const;

export function CareerPathNavigatorPanel() {
  const [selectedRouteId, setSelectedRouteId] = useState(careerPathRoutes[0].id);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      author: "assistant",
      text: "I can explain each route using your Career DNA plus AI-parsed market trend signals from scraped role data."
    }
  ]);

  const selectedRoute = useMemo(
    () => careerPathRoutes.find((route) => route.id === selectedRouteId) ?? careerPathRoutes[0],
    [selectedRouteId]
  );

  function askNavigator(prompt: string) {
    const cleaned = prompt.trim();

    if (!cleaned) {
      return;
    }

    const nextId = messages.length + 1;

    setMessages((current) => [
      ...current,
      { id: nextId, author: "candidate", text: cleaned },
      { id: nextId + 1, author: "assistant", text: buildNavigatorReply(cleaned, selectedRoute) }
    ]);
    setChatInput("");
  }

  return (
    <div className="grid items-start gap-4 2xl:grid-cols-[minmax(0,1fr)_410px]">
      <div className="grid gap-4">
        <ModuleCard className="overflow-hidden p-0">
          <div className="relative overflow-hidden border-b border-line bg-ink px-5 py-5 text-paper">
            <div className="absolute inset-0 opacity-40">
              <div className="absolute -left-24 top-6 size-64 rounded-full bg-[#A9802F]/40 blur-3xl" />
              <div className="absolute right-0 top-0 size-72 rounded-full bg-[#3E6EA8]/30 blur-3xl" />
            </div>
            <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="kicker text-[#D7C899]">01 / Career Path Navigator</p>
                <h2 className="mt-2 font-serif text-3xl font-semibold">Market routes parsed from real role trends</h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-[#E8DFC8]">
                  Uses Career DNA plus scraped market signals that AI parses into role clusters, skills,
                  pay thresholds, projects, and learning branches. It can surface non-obvious moves
                  like consulting or management when soft signals suggest they are realistic.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <PathMetric label="Routes" value={String(careerPathRoutes.length).padStart(2, "0")} />
                <PathMetric label="Top readiness" value={`${careerPathRoutes[0].readiness}%`} />
                <PathMetric label="Fastest path" value="4-8m" />
              </div>
            </div>
          </div>

          <div className="grid gap-0 xl:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="border-b border-line bg-mist p-4 xl:border-b-0 xl:border-r">
              <div className="rounded-[14px] border border-line bg-paper p-4 shadow-soft">
                <div className="flex items-center gap-3">
                  <div className="grid size-12 place-items-center rounded-[12px] bg-ink text-paper">
                    <Compass size={21} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="kicker">Starting point</p>
                    <h3 className="mt-1 font-serif text-xl font-semibold text-ink">
                      {candidateProfile.currentRole}
                    </h3>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-muted">
                  CareerOS treats this as the source node, then compares the candidate&apos;s DNA to
                  AI-parsed market route clusters, not one employer&apos;s open requisition.
                </p>
              </div>

              <div className="mt-4 rounded-[14px] border border-line bg-paper p-4 shadow-soft">
                <p className="kicker">DNA evidence used</p>
                <div className="mt-3 grid gap-3">
                  {skillSignals.slice(0, 4).map((skill) => (
                    <ScoreBar key={skill.name} value={skill.level} label={skill.name} tone="gold" />
                  ))}
                </div>
              </div>

              <div className="mt-4 rounded-[14px] border border-line bg-paper p-4 shadow-soft">
                <p className="kicker">Preference constraints</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {candidateProfile.workPreferences.map((preference) => (
                    <Tag key={preference} tone="neutral">{preference}</Tag>
                  ))}
                  <Tag tone="gold">{candidateProfile.salaryExpectation}</Tag>
                </div>
              </div>
            </aside>

            <CareerBranchMap selectedRouteId={selectedRoute.id} onSelectRoute={setSelectedRouteId} />
          </div>
        </ModuleCard>

        <div className="grid gap-4 xl:grid-cols-2">
          {careerPathRoutes.map((route) => (
            <button
              key={route.id}
              type="button"
              onClick={() => setSelectedRouteId(route.id)}
              className={[
                "career-route-card rounded-[14px] border bg-paper p-4 text-left shadow-soft transition",
                selectedRoute.id === route.id
                  ? "border-gold ring-2 ring-[#E3D2A6]"
                  : "border-line hover:border-gold hover:-translate-y-0.5"
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Tag tone={trackTone[route.track]}>{route.track}</Tag>
                  <h3 className="mt-3 font-serif text-xl font-semibold text-ink">{route.title}</h3>
                </div>
                <span className="rounded-full bg-ink px-3 py-1.5 text-sm font-bold text-paper">
                  {route.readiness}%
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted">{route.marketSignal}</p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-semibold text-muted">
                <span className="rounded-[10px] border border-line bg-mist px-3 py-2">{route.horizon}</span>
                <span className="rounded-[10px] border border-line bg-mist px-3 py-2">{route.salaryRange}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <aside className="grid gap-4 2xl:sticky 2xl:top-4 2xl:self-start">
        <NavigatorChat
          messages={messages}
          input={chatInput}
          selectedRoute={selectedRoute}
          onInputChange={setChatInput}
          onAsk={askNavigator}
        />
        <RouteDossier route={selectedRoute} />
      </aside>
    </div>
  );
}

function CareerBranchMap({
  selectedRouteId,
  onSelectRoute
}: {
  selectedRouteId: string;
  onSelectRoute: (routeId: string) => void;
}) {
  return (
    <div className="relative min-h-[520px] overflow-hidden bg-[#FBF7EC] p-4">
      <div className="absolute inset-0 opacity-70">
        <div className="absolute left-[18%] top-[16%] size-56 rounded-full bg-[#F3EAD3] blur-3xl" />
        <div className="absolute right-[10%] top-[20%] size-64 rounded-full bg-[#E8EFF7] blur-3xl" />
        <div className="absolute bottom-[8%] left-[35%] size-52 rounded-full bg-[#EAF4EC] blur-3xl" />
      </div>

      <svg className="absolute inset-0 z-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="career-path-flow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#14223D" />
            <stop offset="50%" stopColor="#A9802F" />
            <stop offset="100%" stopColor="#3E6EA8" />
          </linearGradient>
        </defs>
        {careerPathRoutes.map((route, index) => {
          const position = branchPositions[index];
          const selected = route.id === selectedRouteId;

          return (
            <path
              key={route.id}
              className={selected ? "career-path-line is-selected" : "career-path-line"}
              d={`M 18 50 C 34 ${position.y}, 45 ${position.y}, ${position.x - 7} ${position.y}`}
              pathLength="100"
            />
          );
        })}
      </svg>

      <div className="relative z-10 h-full min-h-[480px]">
        <div className="absolute left-[4%] top-1/2 w-[230px] -translate-y-1/2 rounded-[18px] border border-line bg-paper/95 p-4 shadow-lifted backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-full bg-ink text-paper shadow-soft">
              <BriefcaseBusiness size={21} aria-hidden="true" />
            </div>
            <div>
              <p className="kicker">Now</p>
              <h3 className="font-serif text-xl font-semibold text-ink">Software Engineer</h3>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted">
            Backend services, dispatch dashboards, SQL-heavy operations, and route optimizer portfolio.
          </p>
        </div>

        {careerPathRoutes.map((route, index) => {
          const position = branchPositions[index];
          const selected = route.id === selectedRouteId;

          return (
            <button
              key={route.id}
              type="button"
              onClick={() => onSelectRoute(route.id)}
              className={[
                "career-branch-node absolute w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-[18px] border p-4 text-left shadow-soft transition",
                selected
                  ? "border-gold bg-paper ring-4 ring-[#F3EAD3]"
                  : "border-line bg-paper/90 hover:border-gold hover:bg-paper"
              ].join(" ")}
              style={{ left: `${position.x}%`, top: `${position.y}%`, animationDelay: `${index * 120}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-mist text-gold">
                  {route.track === "Grow" ? <TrendingUp size={18} aria-hidden="true" /> : null}
                  {route.track === "Pivot" ? <GitBranch size={18} aria-hidden="true" /> : null}
                  {route.track === "Specialize" ? <Sparkles size={18} aria-hidden="true" /> : null}
                  {route.track === "Adjacent" ? <Compass size={18} aria-hidden="true" /> : null}
                </div>
                <span className="rounded-full bg-ink px-2.5 py-1 text-xs font-bold text-paper">
                  {route.readiness}%
                </span>
              </div>
              <Tag tone={trackTone[route.track]}>{route.track}</Tag>
              <h3 className="mt-2 font-serif text-xl font-semibold leading-6 text-ink">{route.title}</h3>
              <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-muted">
                <span>{route.horizon}</span>
                <ArrowRight size={13} aria-hidden="true" />
                <span>{route.salaryRange}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RouteDossier({ route }: { route: CareerPathRoute }) {
  return (
    <ModuleCard>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="kicker">Selected route</p>
          <h3 className="mt-2 font-serif text-2xl font-semibold leading-7 text-ink">{route.title}</h3>
        </div>
        <Tag tone={trackTone[route.track]}>{route.track}</Tag>
      </div>

      <div className="mt-5">
        <ScoreBar value={route.readiness} label="Readiness from your Career DNA" tone="gold" />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-[12px] border border-line bg-mist p-3">
          <p className="kicker">Time horizon</p>
          <p className="mt-2 font-semibold text-ink">{route.horizon}</p>
        </div>
        <div className="rounded-[12px] border border-line bg-mist p-3">
          <p className="kicker">Salary range</p>
          <p className="mt-2 font-semibold text-ink">{route.salaryRange}</p>
        </div>
      </div>

      <div className="mt-5 rounded-[12px] border border-line bg-mist p-3">
        <p className="kicker">AI-parsed market signal</p>
        <p className="mt-2 text-sm leading-6 text-muted">{route.marketSignal}</p>
      </div>

      <div className="mt-5 grid gap-3">
        <Collapsible title="Scraped source signals">
          <div className="grid gap-2">
            {route.sourceSignals.map((signal) => (
              <div key={signal} className="rounded-[10px] border border-line bg-paper p-3 text-sm leading-6 text-muted">
                {signal}
              </div>
            ))}
          </div>
        </Collapsible>

        <Collapsible title="Why this is realistic">
          <div className="grid gap-2">
            {route.whyRealistic.map((reason) => (
              <div key={reason} className="rounded-[10px] border border-line bg-paper p-3 text-sm leading-6 text-muted">
                {reason}
              </div>
            ))}
          </div>
        </Collapsible>

        <Collapsible title="Bridge skills">
          <div className="flex flex-wrap gap-2">
            {route.bridgeSkills.map((skill) => (
              <Tag key={skill} tone="warn">{skill}</Tag>
            ))}
          </div>
        </Collapsible>

        <Collapsible title="Career tree branches">
          <CareerTreeBranches route={route} />
        </Collapsible>

        <Collapsible title="Next milestones" defaultOpen>
          <ol className="grid gap-2">
            {route.nextMilestones.map((milestone, index) => (
              <li key={milestone} className="flex gap-3 rounded-[10px] border border-line bg-paper p-3 text-sm text-muted">
                <span className="mono font-bold text-gold">0{index + 1}</span>
                <span>{milestone}</span>
              </li>
            ))}
          </ol>
        </Collapsible>
      </div>
    </ModuleCard>
  );
}

function NavigatorChat({
  messages,
  input,
  selectedRoute,
  onInputChange,
  onAsk
}: {
  messages: ChatMessage[];
  input: string;
  selectedRoute: CareerPathRoute;
  onInputChange: (value: string) => void;
  onAsk: (prompt: string) => void;
}) {
  const suggestions = [
    "Why this route?",
    "What should I learn first?",
    "Which path is fastest?",
    "What is the riskiest option?"
  ];

  return (
    <ModuleCard className="border-gold bg-[#fff9ef]">
      <div className="flex items-center gap-3">
        <div className="grid size-11 place-items-center rounded-[12px] bg-ink text-paper">
          <Bot size={20} aria-hidden="true" />
        </div>
        <div>
          <p className="kicker">Ask Jobby now</p>
          <h3 className="font-serif text-xl font-semibold text-ink">Jobby career advisor AI</h3>
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-muted">
        Ask about the selected route, missing signals, pay thresholds, projects, or what to learn first.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => onAsk(suggestion)}
            className="rounded-full border border-line bg-mist px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-gold hover:text-ink"
          >
            {suggestion}
          </button>
        ))}
      </div>

      <div className="mt-4 grid max-h-[360px] gap-3 overflow-auto rounded-[14px] border border-line bg-mist p-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={[
              "max-w-[92%] rounded-[14px] px-3 py-2 text-sm leading-6",
              message.author === "assistant"
                ? "justify-self-start border border-line bg-paper text-muted"
                : "justify-self-end bg-ink text-paper"
            ].join(" ")}
          >
            <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
              {message.author === "assistant" ? <MessageSquareText size={13} aria-hidden="true" /> : null}
              {message.author === "assistant" ? "Navigator" : "You"}
            </div>
            {message.text}
          </div>
        ))}
      </div>

      <form
        className="mt-3 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          onAsk(input);
        }}
      >
        <input
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          placeholder={`Ask Jobby about ${selectedRoute.title}`}
          className="min-w-0 flex-1 rounded-[12px] border border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition focus:border-gold"
        />
        <button
          type="submit"
          className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-gold text-paper transition hover:bg-ink"
          aria-label="Ask navigator"
        >
          <Send size={17} aria-hidden="true" />
        </button>
      </form>
    </ModuleCard>
  );
}

function PathMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[90px] rounded-[12px] border border-[#E3D2A6]/40 bg-paper/10 px-3 py-2 backdrop-blur">
      <p className="mono text-lg font-bold leading-none text-[#F3EAD3]">{value}</p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-[#D7C899]">{label}</p>
    </div>
  );
}

function CareerTreeBranches({ route }: { route: CareerPathRoute }) {
  return (
    <div className="grid gap-3">
        <div className="rounded-[10px] border border-line bg-paper p-3">
          <p className="text-sm font-semibold text-ink">Skills branch</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {route.bridgeSkills.map((skill) => (
              <Tag key={skill} tone="warn">{skill}</Tag>
            ))}
          </div>
        </div>
        <div className="rounded-[10px] border border-line bg-paper p-3">
          <p className="text-sm font-semibold text-ink">Fair pay branch</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            Current expectation {route.currentExpectedPay}; market route range {route.salaryRange};
            unlocked range {route.unlockedPayRange} after more required signals are proven.
          </p>
          <div className="mt-3 grid gap-2">
            {route.payEvidence.map((item) => (
              <div key={item} className="rounded-[9px] border border-line bg-mist px-3 py-2 text-xs leading-5 text-muted">
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[10px] border border-line bg-paper p-3">
          <p className="text-sm font-semibold text-ink">Required signals branch</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {route.requiredSignals.map((signal) => (
              <Tag key={signal} tone="info">{signal}</Tag>
            ))}
          </div>
        </div>
        <div className="rounded-[10px] border border-line bg-paper p-3">
          <p className="text-sm font-semibold text-ink">Project branch</p>
          <div className="mt-2 grid gap-2">
            {route.projects.map((project, index) => (
              <div key={project} className="rounded-[9px] border border-line bg-mist px-3 py-2 text-sm leading-5 text-muted">
                <span className="mono mr-2 font-bold text-gold">0{index + 1}</span>
                {project}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[10px] border border-line bg-paper p-3">
          <p className="text-sm font-semibold text-ink">Course branch</p>
          <div className="mt-2 grid gap-2">
            {route.courses.map((course) => (
              <a
                key={`${route.id}-${course.targetSkill}`}
                href={course.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-[9px] border border-[#E3D2A6] bg-[#F3EAD3] px-3 py-2 text-sm font-semibold text-gold transition hover:border-gold hover:bg-paper"
              >
                {course.targetSkill}: {course.title}
              </a>
            ))}
          </div>
        </div>
      </div>
  );
}

function buildNavigatorReply(prompt: string, route: CareerPathRoute) {
  const normalized = prompt.toLowerCase();

  if (normalized.includes("fastest")) {
    return "The fastest practical move is Data Product Engineer at 4-8 months. It reuses Python, SQL, dashboards, and operations context instead of requiring a full career reset.";
  }

  if (normalized.includes("risky") || normalized.includes("risk")) {
    return "The riskiest route is Engineering Manager because your profile has limited people-leadership evidence. ML Routing is also a longer bet until MLOps and statistics are proven in a portfolio project.";
  }

  if (normalized.includes("learn") || normalized.includes("first")) {
    return `For ${route.title}, start with ${route.bridgeSkills[0]}. It is the highest-leverage gap because it appears directly between the current evidence and the next role requirements.`;
  }

  if (normalized.includes("why")) {
    return `${route.title} is realistic because ${route.whyRealistic.join(" ")}`;
  }

  if (normalized.includes("salary")) {
    return `${route.title} is currently modeled at ${route.salaryRange}. That comes from AI-parsed market route signals, then adjusted by the candidate's Career DNA readiness.`;
  }

  return `${route.title} has ${route.readiness}% readiness over a ${route.horizon} horizon. The next useful action is: ${route.nextMilestones[0]}.`;
}
