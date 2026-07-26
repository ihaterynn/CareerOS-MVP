import { NextResponse } from "next/server";
import { renderResumePdf } from "@/modules/candidate/studio/export-pdf";
import type { Resume } from "@/modules/candidate/studio/types";

export const runtime = "nodejs";

function isResume(value: unknown): value is Resume {
  const resume = value as Partial<Resume>;
  return Boolean(resume && typeof resume.name === "string" && typeof resume.title === "string" && typeof resume.loc === "string" && typeof resume.email === "string" && typeof resume.summary === "string" && Array.isArray(resume.skills) && Array.isArray(resume.experience));
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { resume?: unknown } | null;
  if (!isResume(body?.resume)) return NextResponse.json({ error: "A complete résumé is required for PDF export." }, { status: 400 });
  try {
    const pdf = await renderResumePdf(body.resume);
    const name = (body.resume.name || "resume").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "resume";
    return new Response(new Uint8Array(pdf), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${name}.pdf"` } });
  } catch {
    return NextResponse.json({ error: "PDF export could not be generated." }, { status: 500 });
  }
}
