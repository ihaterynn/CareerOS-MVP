import { NextResponse } from "next/server";
import type {
  CareerRootCandidate,
  CareerRootRoute
} from "@/modules/employer/career-root-db";

export const runtime = "nodejs";

const MODEL = process.env.OPENROUTER_MODEL ?? "google/gemini-2.5-flash-lite";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

type Body = {
  candidate?: CareerRootCandidate;
  role?: { title?: string; signals?: string[] };
  existingRoute?: CareerRootRoute;
};

type GeneratedPlan = Pick<
  CareerRootRoute,
  | "track"
  | "readiness"
  | "horizon"
  | "marketSignal"
  | "whyRealistic"
  | "bridgeSkills"
  | "requiredSignals"
  | "projects"
  | "nextMilestones"
  | "sourceSignals"
>;

const text = (value: unknown, maximum = 220) =>
  typeof value === "string" ? value.trim().slice(0, maximum) : "";

const strings = (value: unknown, maximumItems = 8, maximumLength = 180) =>
  Array.isArray(value)
    ? value.map((item) => text(item, maximumLength)).filter(Boolean).slice(0, maximumItems)
    : [];

function isPlan(value: unknown): value is GeneratedPlan {
  if (!value || typeof value !== "object") return false;
  const plan = value as Partial<GeneratedPlan>;
  return (
    ["Grow", "Pivot", "Specialize", "Adjacent"].includes(plan.track ?? "") &&
    typeof plan.readiness === "number" &&
    plan.readiness >= 0 &&
    plan.readiness <= 100 &&
    Boolean(text(plan.horizon)) &&
    Boolean(text(plan.marketSignal, 500)) &&
    [plan.whyRealistic, plan.bridgeSkills, plan.requiredSignals, plan.projects, plan.nextMilestones, plan.sourceSignals]
      .every((items) => Array.isArray(items) && items.length >= 2 && items.every((item) => Boolean(text(item, 500))))
  );
}

const stringList = {
  type: "array",
  minItems: 2,
  maxItems: 4,
  items: { type: "string" }
} as const;

const responseSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "track", "readiness", "horizon", "marketSignal", "whyRealistic",
    "bridgeSkills", "requiredSignals", "projects", "nextMilestones", "sourceSignals"
  ],
  properties: {
    track: { type: "string", enum: ["Grow", "Pivot", "Specialize", "Adjacent"] },
    readiness: { type: "integer", minimum: 0, maximum: 100 },
    horizon: { type: "string" },
    marketSignal: { type: "string" },
    whyRealistic: stringList,
    bridgeSkills: stringList,
    requiredSignals: stringList,
    projects: stringList,
    nextMilestones: stringList,
    sourceSignals: stringList
  }
} as const;

export async function POST(request: Request) {
  let body: Body;
  try {
    body = await request.json() as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON request." }, { status: 400 });
  }

  const candidate = body.candidate;
  const existingRoute = body.existingRoute;
  const roleTitle = text(body.role?.title, 140);
  const roleSignals = strings(body.role?.signals, 10, 100);
  if (!candidate || !existingRoute || !roleTitle) {
    return NextResponse.json({ error: "Candidate, role, and current route are required." }, { status: 400 });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      route: existingRoute,
      source: "fallback",
      warning: "OPENROUTER_API_KEY is not configured."
    });
  }

  // De-identify before external inference. CareerOS keeps names, employers,
  // schools, location, contact details, and raw profile text in the application.
  const roleHistory = strings(candidate.experience, 5, 200).map((item) => {
    const parts = item.split("·").map((part) => part.trim());
    return [parts[0], parts.at(-1)].filter(Boolean).join(" · ");
  });
  const evidence = {
    candidateReference: "Candidate A",
    currentRole: text(candidate.currentTrack, 120),
    sourceField: text(candidate.sourceField, 100),
    skillSignals: strings(candidate.skills),
    roleHistory,
    careerInterests: strings(candidate.careerInterests),
    learningSignals: strings(candidate.learningSignals),
    careerDna: strings(candidate.dnaSignals),
    strengths: strings(candidate.highlights),
    evidenceGaps: strings(candidate.missingSignals),
    scores: {
      overall: candidate.score,
      skill: candidate.skillFit,
      experience: candidate.experienceFit,
      intent: candidate.interestSignal
    },
    targetRole: { title: roleTitle, requirements: roleSignals }
  };

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        "X-OpenRouter-Title": "CareerOS Career Root"
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content:
              "You design practical, evidence-based career bridges. Use only the supplied professional signals. Never infer protected traits or invent credentials. Produce concise milestones that create observable proof for the target role. Treat the route as a recommendation, not a guarantee."
          },
          {
            role: "user",
            content: `Refine this candidate-to-role bridge plan:\n${JSON.stringify(evidence)}`
          }
        ],
        temperature: 0.3,
        max_tokens: 1500,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "career_os_career_route",
            strict: true,
            schema: responseSchema
          }
        },
        provider: {
          require_parameters: true,
          data_collection: "deny",
          allow_fallbacks: true
        }
      }),
      signal: AbortSignal.timeout(25_000)
    });

    if (!response.ok) throw new Error(`OpenRouter returned ${response.status}`);
    const completion = await response.json() as {
      model?: string;
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = completion.choices?.[0]?.message?.content;
    const plan = content ? JSON.parse(content) as unknown : null;
    if (!isPlan(plan)) throw new Error("Model response did not match the career route schema");

    return NextResponse.json({
      route: { ...existingRoute, ...plan },
      source: "openrouter",
      model: completion.model ?? MODEL
    });
  } catch (error) {
    console.error("Career route generation failed; using evidence-derived route", error);
    return NextResponse.json({
      route: existingRoute,
      source: "fallback",
      warning: "AI refinement was unavailable; the evidence-derived route remains active."
    });
  }
}
