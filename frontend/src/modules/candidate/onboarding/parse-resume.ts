import "server-only";

import { callTool, llmConfigured } from "@/lib/llm/openrouter";
import { PARSED_FACTS, PARSE_STEPS } from "./mock";
import { ALLOWED_KEYS, groundFacts, type RawFact } from "./grounding";
import type { FactInput } from "./repository";

const PARSE_TOOL = {
  name: "record_resume_facts",
  description:
    "Record the facts you actually read in the résumé. Never guess. Every fact must quote the " +
    "text it came from, verbatim.",
  parameters: {
    type: "object",
    properties: {
      facts: {
        type: "array",
        items: {
          type: "object",
          properties: {
            key: { type: "string", enum: Object.keys(ALLOWED_KEYS) },
            value: {
              anyOf: [{ type: "string" }, { type: "array", items: { type: "string" } }],
              description: "The value as it should be displayed to the candidate."
            },
            evidence: {
              type: "string",
              description:
                "A span copied VERBATIM from the résumé that supports this fact. If you cannot " +
                "quote one, omit the fact entirely."
            },
            confidence: { type: "number", minimum: 0, maximum: 1 }
          },
          required: ["key", "value", "evidence", "confidence"]
        }
      },
      steps: {
        type: "array",
        items: { type: "string" },
        description: "Short factual status lines about what you found, e.g. 'Found 2 roles across 5 years'."
      }
    },
    required: ["facts", "steps"]
  }
} as const;

const SYSTEM_PROMPT = [
  "You extract structured facts from a candidate's résumé for a career platform.",
  "Rules you must not break:",
  "- Only record what the document actually says. Never infer an employer, title, date, or skill.",
  "- Every fact must include an `evidence` span copied verbatim from the résumé.",
  "- If something is absent or ambiguous, omit it. A missing fact is correct; a guessed one is not.",
  "- Do not embellish values. Copy names and titles as written.",
  "The candidate will review everything you record, so accuracy matters more than coverage."
].join("\n");

export type ParseOutcome = { steps: string[]; facts: FactInput[] };

/**
 * Parses résumé text into facts.
 *
 * Without an OPENROUTER_API_KEY this returns the scripted demo set so the flow stays usable —
 * the caller is told which path ran so the UI never implies a real parse happened.
 */
export async function parseResume(text: string, signal?: AbortSignal): Promise<ParseOutcome & { simulated: boolean }> {
  if (!llmConfigured()) {
    return { steps: PARSE_STEPS, facts: PARSED_FACTS.map(toInput), simulated: true };
  }

  const result = await callTool<{ facts: RawFact[]; steps: string[] }>({
    signal,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Résumé text:\n\n${text}` }
    ],
    tool: PARSE_TOOL as unknown as Parameters<typeof callTool>[0]["tool"]
  });

  const facts = groundFacts(result.facts ?? [], text);
  const steps = (result.steps ?? []).filter((step) => typeof step === "string").slice(0, 6);

  return {
    steps: steps.length ? steps : ["Read the document", `Recovered ${facts.length} facts`],
    facts,
    simulated: false
  };
}

function toInput(fact: (typeof PARSED_FACTS)[number]): FactInput {
  return {
    dimension: fact.dimension,
    key: fact.key,
    label: fact.label,
    value: fact.value,
    source: fact.source,
    confidence: fact.confidence,
    evidence: fact.evidence
  };
}
