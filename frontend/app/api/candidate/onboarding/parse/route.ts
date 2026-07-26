import { NextResponse } from "next/server";
import { guardRoute, ndjsonStream } from "@/lib/api-guards";
import { extractText } from "@/lib/llm/extract-text";
import { parseResume } from "@/modules/candidate/onboarding/parse-resume";
import { currentCandidateId, ensureSession, writeFacts } from "@/modules/candidate/onboarding/repository";
import type { IntakeSourceKind } from "@/modules/candidate/onboarding/types";

// The PDF/DOCX extractors and the streaming client are not Edge-safe, and a token-gated stream
// must never be cached.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const MIN_TEXT_CHARS = 40;

export async function POST(request: Request) {
  const guard = await guardRoute({ route: "onboarding.parse", limit: 8, windowSeconds: 300 });
  if (!guard.ok) return guard.response;
  const { db } = guard;

  let sourceKind: IntakeSourceKind;
  let text: string;
  let storagePath: string | null = null;

  const contentType = request.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file");
      if (!(file instanceof File)) return bad("No file received");
      if (file.size > MAX_UPLOAD_BYTES) return bad("That file is larger than 10 MB");

      const candidateId = await currentCandidateId(db);
      if (!candidateId) return bad("No candidate profile for this account", 403);

      const buffer = await file.arrayBuffer();

      // The storage path is built from the server-resolved candidate id — a client-supplied path
      // could otherwise reach another candidate's folder.
      storagePath = `${candidateId}/${Date.now()}-${safeName(file.name)}`;
      const { error: uploadError } = await db.storage
        .from("candidate-uploads")
        .upload(storagePath, buffer, { contentType: file.type || "application/octet-stream" });
      if (uploadError) return bad(`Upload failed: ${uploadError.message}`, 500);

      const extracted = await extractText({ buffer, mimeType: file.type, name: file.name });
      text = extracted.text;
      sourceKind = "resume";
    } else {
      const body = (await request.json()) as { sourceKind?: unknown; payload?: unknown };
      if (body.sourceKind !== "paste" && body.sourceKind !== "linkedin") {
        return bad("Unsupported source");
      }
      if (body.sourceKind === "linkedin") {
        // Fetching a LinkedIn profile server-side is a separate piece of work (auth walls, ToS).
        // Refusing is better than silently returning an empty parse.
        return bad("LinkedIn import isn't wired up yet — paste your résumé text instead.", 501);
      }
      if (typeof body.payload !== "string") return bad("Missing résumé text");
      text = body.payload;
      sourceKind = "paste";
    }
  } catch {
    return bad("Could not read that request");
  }

  if (text.trim().length < MIN_TEXT_CHARS) {
    return bad("I couldn't get readable text out of that. Try pasting the text instead.");
  }

  const session = await ensureSession(db, sourceKind);
  if (storagePath) {
    await db
      .from("candidate_onboarding_sessions")
      .update({ storage_path: storagePath, updated_at: new Date().toISOString() })
      .eq("id", session.id);
  }

  return ndjsonStream(async (emit) => {
    emit({ type: "step", text: "Reading the document" });

    const { steps, facts, simulated } = await parseResume(text, request.signal);

    if (simulated) {
      emit({
        type: "step",
        text: "Demo parse — no model key configured, showing sample facts"
      });
    }
    for (const step of steps) emit({ type: "step", text: step });

    const stored = await writeFacts(db, facts);
    emit({ type: "facts", facts: stored });
  });
}

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

function safeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
}
