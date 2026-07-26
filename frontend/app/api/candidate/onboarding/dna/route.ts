import { guardRoute, ndjsonStream } from "@/lib/api-guards";
import { callTool, llmConfigured } from "@/lib/llm/openrouter";
import { DNA_DRAFT } from "@/modules/candidate/onboarding/mock";
import { loadFacts, writeFacts } from "@/modules/candidate/onboarding/repository";
import type { Fact } from "@/modules/candidate/onboarding/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DNA_TOOL = {
  name: "draft_career_dna",
  description: "Write the candidate's Career DNA summary from confirmed facts only.",
  parameters: {
    type: "object",
    properties: {
      summaryMd: {
        type: "string",
        description:
          "3-5 sentences, second person, plain prose. Describe only what the facts support. " +
          "Where a signal is thin, say so plainly rather than padding."
      },
      bestFit: {
        type: "array",
        maxItems: 3,
        items: {
          type: "object",
          properties: {
            role: { type: "string" },
            level: { type: "string", enum: ["Strong", "Good", "Stretch"] }
          },
          required: ["role", "level"]
        }
      }
    },
    required: ["summaryMd", "bestFit"]
  }
};

const SYSTEM_PROMPT = [
  "You write a short career summary for a candidate, from facts they have confirmed about themselves.",
  "Rules:",
  "- Use only the supplied facts. Never invent an employer, skill, achievement, or trait.",
  "- Be honest about gaps: if a dimension is thin, name it as thin rather than inflating it.",
  "- No flattery, no filler, no marketing voice. The candidate will edit this and employers may read it.",
  "- Address the candidate as 'you'."
].join("\n");

export async function POST(request: Request) {
  const guard = await guardRoute({ route: "onboarding.dna", limit: 6, windowSeconds: 300 });
  if (!guard.ok) return guard.response;
  const { db } = guard;

  return ndjsonStream(async (emit) => {
    const facts = await loadFacts(db);

    // Only vouched-for facts feed the summary — a provisional parse must not become a claim
    // about the candidate.
    const confirmed = facts.filter(
      (fact) => fact.source === "confirmed" || fact.source === "self-reported"
    );

    let summaryMd: string;
    let bestFit: Array<{ role: string; level: string }>;

    if (!llmConfigured()) {
      summaryMd = DNA_DRAFT.summaryMd;
      bestFit = DNA_DRAFT.bestFit;
      emit({ type: "delta", text: summaryMd });
    } else {
      const result = await callTool<{ summaryMd: string; bestFit: Array<{ role: string; level: string }> }>({
        signal: request.signal,
        maxTokens: 900,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Confirmed facts:\n${describe(confirmed)}` }
        ],
        tool: DNA_TOOL
      });
      summaryMd = String(result.summaryMd ?? "").trim();
      bestFit = Array.isArray(result.bestFit) ? result.bestFit.slice(0, 3) : [];
      if (!summaryMd) throw new Error("The model returned an empty summary");
      emit({ type: "delta", text: summaryMd });
    }

    // Stored as `inferred`: it is model output until the candidate reads and accepts it.
    await writeFacts(db, [
      {
        dimension: "dna",
        key: "dna.summary",
        label: "DNA summary",
        value: summaryMd,
        source: "inferred",
        confidence: 0.8
      }
    ]);

    emit({ type: "done", summaryMd, bestFit });
  });
}

function describe(facts: Fact[]): string {
  if (facts.length === 0) return "(none)";
  return facts
    .map((fact) => {
      const value = Array.isArray(fact.value) ? fact.value.join(", ") : String(fact.value);
      return `- ${fact.label}: ${value}`;
    })
    .join("\n");
}
