import { readJsonBody } from "@/modules/candidate/studio/analysis";
import { openRouterErrorMessage, requestOpenRouter } from "@/modules/candidate/studio/openrouter";
import { validateStructuredResume } from "@/modules/candidate/studio/structure";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function modelJson(value: unknown) {
  const content = (value as { choices?: Array<{ message?: { content?: unknown } }> }).choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new Error("Structuring service returned an invalid response.");
  return JSON.parse(content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "")) as unknown;
}

export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request);
    const text = body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>).text : undefined;
    if (typeof text !== "string" || !text.trim() || text.length > 100_000) return NextResponse.json({ error: "A resume text export up to 100,000 characters is required." }, { status: 400 });
    if (!process.env.OPENROUTER_API_KEY) return NextResponse.json({ error: "AI structuring is not configured." }, { status: 503 });

    const response = await requestOpenRouter(process.env.OPENROUTER_API_KEY, {
        model: "openai/gpt-5.4-nano", temperature: 0, response_format: { type: "json_object" },
        messages: [{ role: "user", content: `Extract this resume into JSON only: {"name":string,"title":string,"loc":string,"email":string,"summary":string,"experience":[{"role":string,"period":string,"bullets":string[]}],"skills":string[],"other":string}. Use only facts in the source. Never invent metrics, dates, employers, skills, or contact information. Put details that do not fit the fields in other. Include an empty string or array where unknown. In role, keep employer information after a middle dot when there is no separate company field.\n\nRESUME SOURCE:\n${text}` }]
    });
    if (!response.ok) return NextResponse.json({ error: "AI structuring is temporarily unavailable." }, { status: 502 });
    return NextResponse.json({ resume: validateStructuredResume(modelJson(await response.json())), source: "openrouter" });
  } catch (cause) {
    console.error("Resume structuring failed", cause);
    return NextResponse.json({ error: openRouterErrorMessage(cause) }, { status: 502 });
  }
}
