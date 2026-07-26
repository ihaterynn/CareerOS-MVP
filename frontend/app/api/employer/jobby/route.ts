import { NextResponse } from "next/server";
import { getJobbyScope, type JobbyCandidate, type JobbyScope } from "@/modules/employer/jobby-db";

export const runtime = "nodejs";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = process.env.OPENROUTER_MODEL ?? "google/gemini-2.5-flash-lite";

type ChatMessage = { role: "user" | "assistant"; content: string };
type RequestBody = { jobId?: string; messages?: ChatMessage[] };
type Intent = "rank" | "compare" | "gaps" | "pipeline" | "interview" | "outreach" | "shortlist" | "general";
type AnalysisPlan = { intent: Intent; candidateRefs: string[]; focus: string };

const planSchema = {
  type: "object",
  additionalProperties: false,
  required: ["intent", "candidateRefs", "focus"],
  properties: {
    intent: {
      type: "string",
      enum: ["rank", "compare", "gaps", "pipeline", "interview", "outreach", "shortlist", "general"]
    },
    candidateRefs: {
      type: "array",
      maxItems: 4,
      items: { type: "string", pattern: "^C[0-9]+$" }
    },
    focus: { type: "string" }
  }
} as const;

function safeMessages(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((message): message is ChatMessage =>
      Boolean(
        message &&
        typeof message === "object" &&
        ((message as ChatMessage).role === "user" || (message as ChatMessage).role === "assistant") &&
        typeof (message as ChatMessage).content === "string"
      )
    )
    .slice(-8)
    .map((message) => ({ ...message, content: message.content.trim().slice(0, 1600) }))
    .filter((message) => message.content);
}

function maskCandidateNames(question: string, candidates: JobbyCandidate[]) {
  return candidates
    .map((candidate, index) => ({ candidate, reference: `C${index + 1}` }))
    .sort((a, b) => b.candidate.name.length - a.candidate.name.length)
    .reduce((masked, item) => {
      const escaped = item.candidate.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return masked.replace(new RegExp(escaped, "gi"), item.reference);
    }, question);
}

function localPlan(question: string): AnalysisPlan {
  const normalized = question.toLowerCase();
  const refs = [...question.matchAll(/\bC\d+\b/gi)].map((match) => match[0].toUpperCase()).slice(0, 4);
  const intent: Intent =
    /compare|versus| vs\b|difference/.test(normalized) ? "compare" :
    /gap|missing|risk|concern|weak/.test(normalized) ? "gaps" :
    /interview|question|screen/.test(normalized) ? "interview" :
    /outreach|message|email|invite/.test(normalized) ? "outreach" :
    /shortlist|advance|prioriti[sz]e/.test(normalized) ? "shortlist" :
    /pipeline|applied|applicant|status|how many/.test(normalized) ? "pipeline" :
    /rank|best|strongest|top|fit/.test(normalized) ? "rank" :
    "general";
  return { intent, candidateRefs: refs, focus: question.slice(0, 180) };
}

async function createPlan(question: string, scope: JobbyScope): Promise<AnalysisPlan> {
  const maskedQuestion = maskCandidateNames(question, scope.candidates);
  const fallback = localPlan(maskedQuestion);
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return fallback;

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        "X-OpenRouter-Title": "CareerOS Jobby.ai"
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content:
              "Classify an employer hiring-copilot request into one supported intent. Candidate names have already been replaced with references such as C1. " +
              "Return only the analysis plan. You receive no candidate evidence and must not invent any."
          },
          {
            role: "user",
            content: JSON.stringify({
              roleTitle: scope.job.title,
              roleRequirements: scope.job.requirements,
              request: maskedQuestion
            })
          }
        ],
        temperature: 0,
        max_tokens: 180,
        response_format: {
          type: "json_schema",
          json_schema: { name: "careeros_jobby_plan", strict: true, schema: planSchema }
        },
        provider: {
          require_parameters: true,
          data_collection: "deny",
          allow_fallbacks: true
        }
      }),
      signal: AbortSignal.timeout(15_000)
    });
    if (!response.ok) return fallback;
    const completion = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = completion.choices?.[0]?.message?.content
      ?.replace(/^```json\s*/i, "")
      .replace(/```\s*$/i, "");
    if (!content) return fallback;
    const plan = JSON.parse(content) as AnalysisPlan;
    if (!planSchema.properties.intent.enum.includes(plan.intent)) return fallback;
    return {
      intent: plan.intent,
      candidateRefs: Array.isArray(plan.candidateRefs)
        ? plan.candidateRefs.filter((item) => /^C\d+$/.test(item)).slice(0, 4)
        : fallback.candidateRefs,
      focus: typeof plan.focus === "string" ? plan.focus.slice(0, 180) : fallback.focus
    };
  } catch {
    return fallback;
  }
}

function focusCandidates(scope: JobbyScope, plan: AnalysisPlan, originalQuestion: string) {
  const fromRefs = plan.candidateRefs
    .map((reference) => scope.candidates[Number(reference.slice(1)) - 1])
    .filter((candidate): candidate is JobbyCandidate => Boolean(candidate));
  if (fromRefs.length) return [...new Map(fromRefs.map((candidate) => [candidate.id, candidate])).values()];

  const mentioned = scope.candidates.filter((candidate) =>
    originalQuestion.toLowerCase().includes(candidate.name.toLowerCase()) ||
    originalQuestion.toLowerCase().includes(candidate.name.split(" ")[0].toLowerCase())
  );
  if (mentioned.length) return mentioned.slice(0, 4);
  return [...scope.candidates].sort((a, b) => b.score - a.score).slice(0, plan.intent === "compare" ? 3 : 4);
}

const evidence = (candidate: JobbyCandidate) =>
  candidate.highlights[0] ?? candidate.skills[0] ?? candidate.experience[0] ?? "Profile evidence requires validation";

function gapSummary(candidates: JobbyCandidate[]) {
  const counts = new Map<string, number>();
  for (const gap of candidates.flatMap((candidate) => candidate.gaps)) {
    counts.set(gap, (counts.get(gap) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
}

function composeAnswer(scope: JobbyScope, plan: AnalysisPlan, question: string) {
  const candidates = focusCandidates(scope, plan, question);
  const ranked = [...candidates].sort((a, b) => b.score - a.score);
  const empty =
    `There are no submitted, shortlisted, or curated relevant candidates in the ${scope.job.title} pipeline yet. ` +
    "I have not searched the wider candidate database.";
  if (!ranked.length) {
    return {
      answer: empty,
      candidates: [] as JobbyCandidate[],
      followUps: ["Define the evidence bar for this role", "Build a structured screening plan"]
    };
  }

  if (plan.intent === "compare") {
    return {
      answer: [
        `Comparison for ${scope.job.title}`,
        ...ranked.map((candidate, index) =>
          `${index + 1}. ${candidate.name} — ${candidate.score}% ${candidate.source.toLowerCase()} match\n` +
          `   Strength: ${evidence(candidate)}\n` +
          `   Validate: ${candidate.gaps[0] ?? "Depth against the role's highest-priority requirement"}`
        ),
        "Recommendation: use the evidence gaps as structured interview checkpoints; the score is review support, not a hiring decision."
      ].join("\n\n"),
      candidates: ranked,
      followUps: ["Turn this into an interview scorecard", "Show only skill evidence", "Draft interview invitations"]
    };
  }

  if (plan.intent === "gaps") {
    const gaps = gapSummary(scope.candidates);
    return {
      answer: [
        `Evidence gaps across the ${scope.job.title} pipeline`,
        ...(gaps.length
          ? gaps.map(([gap, count]) => `• ${gap} — appears in ${count} ${count === 1 ? "profile" : "profiles"}`)
          : ["• No repeated gap is recorded; validate depth through structured interviews."]),
        `These findings cover ${scope.candidates.length} role-scoped profiles only.`
      ].join("\n\n"),
      candidates: ranked.slice(0, 4),
      followUps: ["Which gaps are trainable?", "Create validation questions", "Compare gaps for the top three"]
    };
  }

  if (plan.intent === "pipeline") {
    return {
      answer:
        `${scope.job.title} pipeline snapshot\n\n` +
        `• ${scope.appliedCount} submitted ${scope.appliedCount === 1 ? "applicant" : "applicants"}\n` +
        `• ${scope.shortlistedCount} shortlisted ${scope.shortlistedCount === 1 ? "profile" : "profiles"}\n` +
        `• ${scope.relevantCount} curated relevant ${scope.relevantCount === 1 ? "match" : "matches"}\n` +
        `• ${scope.candidates.length} total visible in this role scope\n\n` +
        "No profiles outside this job's applied, shortlisted, or curated relevant pipeline were queried.",
      candidates: ranked.slice(0, 4),
      followUps: ["Rank this scoped pipeline", "Who needs a next step?", "Show repeated evidence gaps"]
    };
  }

  if (plan.intent === "interview") {
    const candidate = ranked[0];
    const requirement = scope.job.requirements[0] ?? "the role's core capability";
    const gap = candidate.gaps[0] ?? requirement;
    return {
      answer:
        `Interview focus for ${candidate.name}\n\n` +
        `1. Evidence depth — “Walk me through a recent outcome where you applied ${candidate.skills[0] ?? requirement}. What changed because of your work?”\n\n` +
        `2. Gap validation — “Your current evidence leaves ${gap} unresolved. Describe the closest comparable situation and how you would close that gap.”\n\n` +
        `3. Working style — “When priorities conflict, how do you surface trade-offs and keep stakeholders aligned?”\n\n` +
        `Look for specific actions, measurable outcomes, ownership boundaries, and honest uncertainty.`,
      candidates: [candidate],
      followUps: ["Create a scorecard", "Add culture contribution questions", "Compare interview risks"]
    };
  }

  if (plan.intent === "outreach") {
    const candidate = ranked[0];
    return {
      answer:
        `Subject: Next conversation — ${scope.job.title}\n\n` +
        `Hi ${candidate.name.split(" ")[0]},\n\n` +
        `Your background stood out for ${evidence(candidate)}. We would like to explore how that experience could translate to our ${scope.job.title} role, ` +
        `including a focused discussion around ${candidate.gaps[0] ?? scope.job.requirements[0] ?? "role readiness"}.\n\n` +
        `Would you be open to a short conversation with the hiring team this week?\n\nBest,\nTalent Team`,
      candidates: [candidate],
      followUps: ["Make it warmer", "Prepare a screening agenda", "Draft outreach for the next candidate"]
    };
  }

  if (plan.intent === "shortlist") {
    const shortlist = [...scope.candidates].sort((a, b) => b.score - a.score).slice(0, 4);
    return {
      answer: [
        `Review priority for ${scope.job.title}`,
        ...shortlist.map((candidate, index) =>
          `${index + 1}. ${candidate.name} — ${candidate.score}%\n   ${evidence(candidate)}\n   Next validation: ${candidate.gaps[0] ?? "Confirm role-specific depth"}`
        ),
        "Advance decisions should follow a consistent structured assessment; this ordering reflects current evidence completeness only."
      ].join("\n\n"),
      candidates: shortlist,
      followUps: ["Compare the first two", "Create interview priorities", "Show why each candidate ranked here"]
    };
  }

  const top = [...scope.candidates].sort((a, b) => b.score - a.score).slice(0, 3);
  return {
    answer:
      `I can work across ${scope.candidates.length} candidates currently connected to the ${scope.job.title} pipeline: ` +
      `${scope.appliedCount} applied, ${scope.shortlistedCount} shortlisted, and ${scope.relevantCount} curated relevant matches.\n\n` +
      `The strongest current evidence is attached to ${top[0].name} (${top[0].score}%): ${evidence(top[0])}.\n\n` +
      "Ask me to compare candidates, surface gaps, summarize pipeline status, prepare interview questions, or draft outreach.",
    candidates: top,
    followUps: ["Compare the top three", "Show the largest gaps", "Prepare interview questions"]
  };
}

function sourceCards(candidates: JobbyCandidate[]) {
  return candidates.map((candidate) => ({
    id: candidate.id,
    name: candidate.name,
    initials: candidate.initials,
    currentRole: candidate.currentRole,
    source: candidate.source,
    status: candidate.status,
    score: candidate.score
  }));
}

export async function GET(request: Request) {
  const jobId = new URL(request.url).searchParams.get("jobId")?.trim();
  if (!jobId) return NextResponse.json({ error: "A job is required." }, { status: 400 });
  try {
    return NextResponse.json({ scope: await getJobbyScope(jobId) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load this hiring pipeline.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  let body: RequestBody;
  try {
    body = await request.json() as RequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON request." }, { status: 400 });
  }

  const jobId = body.jobId?.trim();
  const messages = safeMessages(body.messages);
  const question = messages.at(-1)?.content;
  if (!jobId || !question || messages.at(-1)?.role !== "user") {
    return NextResponse.json({ error: "A job and user message are required." }, { status: 400 });
  }

  try {
    const scope = await getJobbyScope(jobId);
    const plan = await createPlan(question, scope);
    const result = composeAnswer(scope, plan, question);
    return NextResponse.json({
      answer: result.answer,
      followUps: result.followUps,
      sources: sourceCards(result.candidates),
      scope
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to query this hiring pipeline.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
