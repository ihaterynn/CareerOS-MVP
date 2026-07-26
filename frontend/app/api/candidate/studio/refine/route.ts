import { parseStudioPayload, readJsonBody } from "@/modules/candidate/studio/analysis";
import { openRouterErrorMessage, requestOpenRouter } from "@/modules/candidate/studio/openrouter";
import { validateRefinement } from "@/modules/candidate/studio/refinement";
import type { Resume } from "@/modules/candidate/studio/types";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function contentFrom(response: unknown) {
  const content = (response as { choices?: Array<{ message?: { content?: unknown } }> }).choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new Error("Refinement service returned an invalid response.");
  return JSON.parse(content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "")) as unknown;
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  let payload;
  try {
    const raw = await readJsonBody(request);
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("Invalid request.");
    body = raw as Record<string, unknown>;
    payload = parseStudioPayload({ resume: body.resume, jobDescriptions: [body.jobDescription] });
  } catch (cause) {
    return NextResponse.json({ error: cause instanceof Error ? cause.message : "Invalid request." }, { status: 400 });
  }

  const target = body.target === "summary" || body.target === "experience" ? body.target : undefined;
  const experienceIndex = body.experienceIndex;
  const evidence = typeof body.evidence === "string" ? body.evidence.trim().slice(0, 1_200) : "";
  if (!target || (target === "experience" && (typeof experienceIndex !== "number" || !Number.isInteger(experienceIndex) || experienceIndex < 0))) return NextResponse.json({ error: "Invalid refinement target." }, { status: 400 });
  if (!process.env.OPENROUTER_API_KEY) return NextResponse.json({ error: "AI refinement is not configured." }, { status: 503 });

  try {
    const resume = payload.resume as Resume;
    const jobDescription = payload.jobDescriptions[0];
    const response = await requestOpenRouter(process.env.OPENROUTER_API_KEY, {
      model: "openai/gpt-5.4-mini", temperature: 0, response_format: { type: "json_object" },
      messages: [{ role: "user", content: `Rewrite exactly one résumé section for the target role. Return JSON only. You may improve grammar, clarity, ordering, and emphasis, but never add a fact, metric, tool, qualification, duty, or claim absent from the résumé. ${evidence ? `The user has explicitly verified this additional evidence and it may be included: ${JSON.stringify(evidence)}` : ""} ${target === "summary" ? 'Return {"target":"summary","title":string,"rationale":string,"replacement":string,"coverage":string[]}.' : 'Return {"target":"experience","experienceIndex":number,"title":string,"rationale":string,"bullets":string[],"coverage":string[]}. Preserve only grounded bullets; make the rewrite concise and ATS-readable.'} Coverage contains up to three concise JD requirements this rewrite strengthens.\n\nTarget role:\n${JSON.stringify(jobDescription)}\n\nRésumé:\n${JSON.stringify(resume)}\n\nSection target: ${target === "summary" ? "profile summary" : `experience index ${experienceIndex}`}` }]
    });
    if (!response.ok) return NextResponse.json({ error: "AI refinement is unavailable." }, { status: 502 });
    return NextResponse.json({ refinement: validateRefinement(contentFrom(await response.json()), resume), source: "openrouter" });
  } catch (cause) {
    console.error("OpenRouter refinement failed", cause);
    return NextResponse.json({ error: openRouterErrorMessage(cause) }, { status: 502 });
  }
}
