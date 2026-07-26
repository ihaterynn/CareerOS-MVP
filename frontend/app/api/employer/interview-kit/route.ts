import { NextResponse } from "next/server";
import {
  generateInterviewKit,
  type InterviewKit,
  type TalentMatch
} from "@/modules/employer/employer-data";

export const runtime = "nodejs";

const MODEL = process.env.OPENROUTER_MODEL ?? "google/gemini-2.5-flash-lite";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

type RequestBody = {
  candidate?: TalentMatch;
  roleTitle?: string;
  roleSignals?: string[];
};

const text = (value: unknown, maximum = 240) =>
  typeof value === "string" ? value.trim().slice(0, maximum) : "";

const strings = (value: unknown, maximumItems = 8, maximumLength = 180) =>
  Array.isArray(value)
    ? value.map((item) => text(item, maximumLength)).filter(Boolean).slice(0, maximumItems)
    : [];

function safeCandidate(value: unknown): TalentMatch | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<TalentMatch>;
  const name = text(candidate.name, 100);
  const id = text(candidate.id, 80);
  if (!name || !id) return null;

  const score = (input: unknown) =>
    typeof input === "number" && Number.isFinite(input)
      ? Math.max(0, Math.min(100, Math.round(input)))
      : 0;

  return {
    id,
    name,
    avatar: text(candidate.avatar, 4),
    currentTrack: text(candidate.currentTrack, 120),
    sourceField: text(candidate.sourceField, 100),
    location: text(candidate.location, 120),
    summary: text(candidate.summary, 500),
    score: score(candidate.score),
    educationFit: score(candidate.educationFit),
    skillFit: score(candidate.skillFit),
    experienceFit: score(candidate.experienceFit),
    interestSignal: score(candidate.interestSignal),
    skills: strings(candidate.skills),
    education: text(candidate.education, 260),
    experience: strings(candidate.experience, 6, 240),
    certifications: strings(candidate.certifications, 6),
    portfolio: strings(candidate.portfolio, 6, 240),
    careerInterests: strings(candidate.careerInterests, 6),
    learningSignals: strings(candidate.learningSignals, 6),
    dnaSignals: strings(candidate.dnaSignals, 6),
    mobilityIntent: text(candidate.mobilityIntent, 200),
    highlights: strings(candidate.highlights, 6),
    missingSignals: strings(candidate.missingSignals, 6)
  };
}

function isInterviewKit(value: unknown): value is InterviewKit {
  if (!value || typeof value !== "object") return false;
  const kit = value as Partial<InterviewKit>;
  if (!text(kit.headline, 500) || !Array.isArray(kit.categories) || kit.categories.length !== 3) return false;
  const ids = new Set(kit.categories.map((category) => category?.id));
  if (!ids.has("role") || !ids.has("personality") || !ids.has("culture")) return false;
  return kit.categories.every((category) =>
    Boolean(
      category &&
      text(category.label, 100) &&
      text(category.basis, 400) &&
      Array.isArray(category.questions) &&
      category.questions.length >= 3 &&
      category.questions.every((question) =>
        text(question?.prompt, 600) &&
        text(question?.probes, 400) &&
        text(question?.lookFor, 400)
      )
    )
  );
}

const responseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["headline", "categories"],
  properties: {
    headline: { type: "string", description: "A short sentence explaining the candidate and role evidence used." },
    categories: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "label", "basis", "questions"],
        properties: {
          id: { type: "string", enum: ["role", "personality", "culture"] },
          label: { type: "string" },
          basis: { type: "string" },
          questions: {
            type: "array",
            minItems: 3,
            maxItems: 4,
            items: {
              type: "object",
              additionalProperties: false,
              required: ["prompt", "probes", "lookFor"],
              properties: {
                prompt: { type: "string" },
                probes: { type: "string" },
                lookFor: { type: "string" }
              }
            }
          }
        }
      }
    }
  }
} as const;

export async function POST(request: Request) {
  let body: RequestBody;
  try {
    body = await request.json() as RequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON request." }, { status: 400 });
  }

  const candidate = safeCandidate(body.candidate);
  const roleTitle = text(body.roleTitle, 140);
  const roleSignals = strings(body.roleSignals, 10, 100);
  if (!candidate || !roleTitle) {
    return NextResponse.json({ error: "Candidate and role are required." }, { status: 400 });
  }

  const fallback = generateInterviewKit(candidate, roleTitle);
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      kit: fallback,
      source: "fallback",
      warning: "OPENROUTER_API_KEY is not configured."
    });
  }

  // External inference receives only de-identified professional signals. Names,
  // contacts, locations, employers, schools, and raw resume text stay in CareerOS.
  const roleEvidence = candidate.experience.map((item) => {
    const parts = item.split("·").map((part) => part.trim());
    return [parts[0], parts.at(-1)].filter(Boolean).join(" · ");
  });
  const credentialEvidence = candidate.education.split(",")[0]?.trim() || "Credential on file";
  const certificationEvidence = candidate.certifications.map((item) => item.split("·")[0]?.trim()).filter(Boolean);
  const evidence = {
    candidate: {
      reference: "Candidate A",
      currentRole: candidate.currentTrack,
      skills: candidate.skills,
      experience: roleEvidence,
      education: credentialEvidence,
      certifications: certificationEvidence,
      proofOfWork: candidate.portfolio,
      careerInterests: candidate.careerInterests,
      learningSignals: candidate.learningSignals,
      careerDna: candidate.dnaSignals,
      evidenceGaps: candidate.missingSignals
    },
    role: { title: roleTitle, requirements: roleSignals }
  };

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        "X-OpenRouter-Title": "CareerOS Hiring Pipeline"
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are a senior structured-interview designer. Create concise, non-discriminatory interview questions grounded only in the supplied professional evidence. Do not infer protected traits. Role questions test capability and gaps; personality questions test observable working style; culture questions test contribution and values without demanding sameness. Use concrete follow-up probes and observable scoring signals."
          },
          {
            role: "user",
            content: `Build a 30-minute evidence-based interview kit from this data:\n${JSON.stringify(evidence)}`
          }
        ],
        temperature: 0.35,
        max_tokens: 1800,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "career_os_interview_kit",
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
    const generated = content ? JSON.parse(content) as unknown : null;
    if (!isInterviewKit(generated)) throw new Error("Model response did not match the interview schema");

    return NextResponse.json({
      kit: generated,
      source: "openrouter",
      model: completion.model ?? MODEL
    });
  } catch (error) {
    console.error("Interview generation failed; using deterministic fallback", error);
    return NextResponse.json({
      kit: fallback,
      source: "fallback",
      warning: "AI generation was unavailable; an evidence-based local kit was generated."
    });
  }
}
