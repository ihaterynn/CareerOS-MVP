import { calibrateQualityScore, fallbackAnalyses, parseStudioPayload, readJsonBody, validateModelResults } from "@/modules/candidate/studio/analysis";
import { openRouterErrorMessage, requestOpenRouter } from "@/modules/candidate/studio/openrouter";
import { resumeQuality } from "@/modules/candidate/studio/optimization";
import type { Resume } from "@/modules/candidate/studio/types";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function error(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function contentFrom(response: unknown) {
  const content = (response as { choices?: Array<{ message?: { content?: unknown } }> }).choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new Error("Analysis service returned an invalid response.");
  const json = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  return JSON.parse(json) as unknown;
}

export async function POST(request: Request) {
  let payload;
  try {
    payload = parseStudioPayload(await readJsonBody(request));
  } catch (cause) {
    return error(cause instanceof Error ? cause.message : "Invalid request.");
  }

  if (!process.env.OPENROUTER_API_KEY) {
    return NextResponse.json({ results: fallbackAnalyses(payload.resume, payload.jobDescriptions), source: "fallback" });
  }

  try {
    const response = await requestOpenRouter(process.env.OPENROUTER_API_KEY, {
        model: "openai/gpt-5.4-mini",
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [{
          role: "user",
          content: `Analyze this resume against every job description. Return JSON only: {"results":[{"jobDescriptionId":string,"atsScore":number,"qualityScore":number,"missing":string[],"refinementTargets":[{"target":"summary"|"experience","experienceIndex"?:number,"title":string,"reason":string,"jdRequirement":string}],"recommendations":[{"id":string,"tag":string,"text":string,"field":"summary"|"exp","replacement":string,"delta":number,"jdRequirement":string,"evidence":string,"ei"?:number,"bi"?:number,"removeKw"?:string}],"suggestions":[{"id":string,"tag":string,"text":string,"delta":number,"jdRequirement":string,"evidence":string}]}]}. qualityScore is a calibrated product score: 0–34 unusable/incomplete, 35–49 basic but sparse, 50–64 complete but needs refinement, 65–79 targeted and compelling, 80–89 strong, 90+ exceptional. Missing one JD skill alone must not make an otherwise complete résumé score below 50. Return at most three refinementTargets only when a section has a meaningful grounded improvement; otherwise return []. Return at most three recommendations and three suggestions, ordered by score impact. Every item must name one concise JD requirement and the exact résumé evidence; use "Not evidenced" when absent. Keep every text value to one direct sentence, under 180 characters. Do not return grammar, punctuation, tone, or clarity rewrites: section refinement handles those together with stronger content rewrites. Recommendations are grounded, concrete role-specific rewrites only where a one-field change is genuinely useful. Suggestions are score opportunities or missing evidence/requirements: explain what the user should add or verify, but do not give a replacement, target field, or invented claim. Never invent experience, metrics, qualifications, responsibilities, or unsupported claims.\n\n${JSON.stringify(payload)}`
        }]
    });
    if (!response.ok) {
      console.error("OpenRouter analysis failed", response.status);
      return error("Analysis service is unavailable.", 502);
    }
    const documentScore = resumeQuality(payload.resume as Resume).score;
    const results = validateModelResults(contentFrom(await response.json()), payload.jobDescriptions).map((result) => ({ ...result, qualityScore: calibrateQualityScore(result.qualityScore, documentScore) }));
    return NextResponse.json({ results, source: "openrouter" });
  } catch (cause) {
    console.error("OpenRouter analysis response failed", cause);
    return error(openRouterErrorMessage(cause), 502);
  }
}
