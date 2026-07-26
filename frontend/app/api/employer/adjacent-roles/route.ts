import { NextResponse } from "next/server";
import type { CareerRootBranchRecord } from "@/modules/employer/career-root-db";

export const runtime = "nodejs";

const MODEL = process.env.OPENROUTER_MODEL ?? "google/gemini-2.5-flash-lite";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

type Body = {
  role?: { id?: string; title?: string; signals?: string[] };
  branches?: CareerRootBranchRecord[];
};

type Recommendation = {
  id: string;
  fitReason: string;
  thresholdRelaxed: string;
};

const text = (value: unknown, maximum = 300) =>
  typeof value === "string" ? value.trim().slice(0, maximum) : "";

const strings = (value: unknown, maximumItems = 10, maximumLength = 120) =>
  Array.isArray(value)
    ? value.map((item) => text(item, maximumLength)).filter(Boolean).slice(0, maximumItems)
    : [];

function validRecommendations(
  value: unknown,
  allowedIds: Set<string>
): value is { recommendations: Recommendation[] } {
  if (!value || typeof value !== "object") return false;
  const recommendations = (value as { recommendations?: unknown }).recommendations;
  if (!Array.isArray(recommendations) || !recommendations.length) return false;
  const ids = new Set<string>();
  return recommendations.every((item) => {
    if (!item || typeof item !== "object") return false;
    const recommendation = item as Partial<Recommendation>;
    if (!recommendation.id || !allowedIds.has(recommendation.id) || ids.has(recommendation.id)) return false;
    ids.add(recommendation.id);
    return Boolean(text(recommendation.fitReason, 500) && text(recommendation.thresholdRelaxed, 500));
  });
}

const responseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["recommendations"],
  properties: {
    recommendations: {
      type: "array",
      minItems: 1,
      maxItems: 4,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "fitReason", "thresholdRelaxed"],
        properties: {
          id: { type: "string" },
          fitReason: { type: "string" },
          thresholdRelaxed: { type: "string" }
        }
      }
    }
  }
} as const;

export async function POST(request: Request) {
  let body: Body;
  try {
    body = await request.json() as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON request." }, { status: 400 });
  }

  const roleId = text(body.role?.id, 80);
  const roleTitle = text(body.role?.title, 140);
  const roleSignals = strings(body.role?.signals);
  const branches = Array.isArray(body.branches) ? body.branches.slice(0, 5) : [];
  const direct = branches.find((branch) => branch.isPrimary);
  const adjacent = branches.filter((branch) => !branch.isPrimary);
  if (!roleId || !roleTitle || !direct || !adjacent.length) {
    return NextResponse.json({ error: "A role and seeded adjacent-role options are required." }, { status: 400 });
  }

  const fallback = { branches: [direct, ...adjacent], source: "fallback" };
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return NextResponse.json(fallback);

  // Only public job-listing information is sent: titles and required skills.
  // Candidate names and profile evidence never enter this recommendation call.
  const marketOptions = adjacent.map((branch) => ({
    id: branch.id,
    title: branch.roleTitle ?? branch.field,
    requiredSkills: branch.matchSignals ?? [],
    deterministicRationale: branch.fitReason
  }));

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
              "You are a labour-market role adjacency analyst. Rank only the supplied seeded market roles against the vacancy title and requirements. Do not invent roles, IDs, employers, skills, or labour-market claims. Explain transferable evidence concisely and state exactly which conventional title threshold is relaxed."
          },
          {
            role: "user",
            content: JSON.stringify({
              vacancy: { title: roleTitle, requiredSkills: roleSignals },
              seededMarketOptions: marketOptions
            })
          }
        ],
        temperature: 0.2,
        max_tokens: 1000,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "career_os_adjacent_roles",
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
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = completion.choices?.[0]?.message?.content;
    const generated = content ? JSON.parse(content) as unknown : null;
    const allowedIds = new Set(adjacent.map((branch) => branch.id));
    if (!validRecommendations(generated, allowedIds)) throw new Error("Invalid adjacent-role response");

    const branchById = new Map(adjacent.map((branch) => [branch.id, branch]));
    const refined = generated.recommendations.map((recommendation) => ({
      ...branchById.get(recommendation.id)!,
      fitReason: recommendation.fitReason,
      thresholdRelaxed: recommendation.thresholdRelaxed
    }));
    const included = new Set(refined.map((branch) => branch.id));
    const remaining = adjacent.filter((branch) => !included.has(branch.id));

    return NextResponse.json({
      branches: [direct, ...refined, ...remaining],
      source: "refined"
    });
  } catch (error) {
    console.error("Adjacent-role refinement failed; using seeded-market ranking", error);
    return NextResponse.json(fallback);
  }
}
