import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { validateCareerGuidance } from "@/modules/candidate/dna/guidance";
import { WORK_PROFILE_QUESTIONS, validateWorkProfileAnswers } from "@/modules/candidate/dna/assessment";
import { profileFromResume } from "@/modules/candidate/dna/profile";
import { sampleResume } from "@/modules/candidate/dna/sample-resume";
import { readJsonBody } from "@/modules/candidate/studio/analysis";
import { openRouterErrorMessage, requestOpenRouter } from "@/modules/candidate/studio/openrouter";
import { validateStructuredResume } from "@/modules/candidate/studio/structure";

export const runtime = "nodejs";

function config() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const candidateId = process.env.DEMO_CANDIDATE_ID ?? process.env.CAREEROS_CANDIDATE_ID;
  if (!url || !key || !candidateId) return undefined;
  return { url, key, candidateId };
}

function jsonContent(value: unknown) {
  const content = (value as { choices?: Array<{ message?: { content?: unknown } }> }).choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new Error("Career guidance returned an invalid response.");
  return JSON.parse(content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "")) as unknown;
}

async function activeResume() {
  const settings = config();
  if (!settings) return { resume: await sampleResume(), source: "sample" as const };
  const supabase = createClient(settings.url, settings.key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: active, error: activeError } = await supabase
    .from("resumes")
    .select("active_version_id")
    .eq("candidate_id", settings.candidateId)
    .not("active_version_id", "is", null)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (activeError) throw activeError;
  if (!active?.active_version_id) return { resume: await sampleResume(), source: "sample" as const };

  const { data: version, error: versionError } = await supabase
    .from("resume_versions")
    .select("content_json")
    .eq("id", active.active_version_id)
    .eq("candidate_id", settings.candidateId)
    .maybeSingle();
  if (versionError) throw versionError;
  if (!version?.content_json) return { resume: await sampleResume(), source: "sample" as const };
  return { resume: validateStructuredResume(version.content_json), source: "active" as const };
}

export async function GET() {
  try {
    const active = await activeResume();
    return NextResponse.json({ profile: profileFromResume(active.resume), source: active.source });
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "Your active résumé could not be read.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function POST(request: Request) {
  if (!process.env.OPENROUTER_API_KEY) return NextResponse.json({ error: "AI career guidance is not configured." }, { status: 503 });

  try {
    const body = await readJsonBody(request);
    const answers = validateWorkProfileAnswers(body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>).answers : undefined);
    const active = await activeResume();
    const resume = active.resume;
    const checkIn = WORK_PROFILE_QUESTIONS.map((question) => ({ prompt: question.prompt, low: question.low, high: question.high, answer: answers[question.id] }));
    const response = await requestOpenRouter(process.env.OPENROUTER_API_KEY, {
      model: process.env.OPENROUTER_MODEL ?? "openai/gpt-5.4-mini",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [{
        role: "user",
        content: `Create a personalised career dashboard from the résumé and private self-reported work check-in. Return JSON only: {"workProfile":{"satisfactionScore":integer,"summary":string,"energizers":string[],"drains":string[]},"currentRole":{"role":string,"score":integer,"summary":string,"dimensions":[{"label":string,"value":integer,"detail":string,"evidence":string}]},"suggestions":[{"path":"Explore"|"Promotion","role":string,"score":integer,"reason":string,"evidence":string,"nextStep":string}]}. Return one to three concise energizers and one to three concise drains. Use exactly five dimensions: technical craft, ownership and decision scope, collaboration and customer impact, delivery environment, and leadership/managerial working style. For leadership/managerial style, describe only the self-reported preference plus résumé evidence or evidence gap; do not claim leadership readiness. Use self-report only for work preferences, satisfaction, energizers, and drains; use résumé evidence for every compatibility dimension and career suggestion. Do not infer personality, intelligence, protected traits, health, or motivation. Do not use MBTI or claim this is a validated assessment. A Promotion suggestion is a development path, not a claim that the person is promotion-ready. State evidence limitations plainly. Never invent achievements, requirements, or future potential. Keep every string under 300 characters.\n\nRÉSUMÉ:\n${JSON.stringify(resume)}\n\nPRIVATE SELF-REPORTED CHECK-IN (1 = low-end label, 10 = high-end label):\n${JSON.stringify(checkIn)}`
      }]
    });
    if (!response.ok) return NextResponse.json({ error: "AI career guidance is temporarily unavailable." }, { status: 502 });
    return NextResponse.json({ guidance: validateCareerGuidance(jsonContent(await response.json())), source: "openrouter" });
  } catch (cause) {
    console.error("Career guidance failed", cause);
    return NextResponse.json({ error: openRouterErrorMessage(cause) }, { status: 502 });
  }
}
