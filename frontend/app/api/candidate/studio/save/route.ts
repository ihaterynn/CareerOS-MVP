import { createHash } from "node:crypto";

import { parseStudioPayload, readJsonBody } from "@/modules/candidate/studio/analysis";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function error(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function config() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const candidateId = process.env.DEMO_CANDIDATE_ID;
  if (!key || !candidateId) throw new Error("Resume saving is unavailable: set SUPABASE_SERVICE_ROLE_KEY and DEMO_CANDIDATE_ID.");
  if (!url) throw new Error("Resume saving is unavailable: set NEXT_PUBLIC_SUPABASE_URL.");
  return { url, key, candidateId };
}

function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function resumeTitle(resume: Record<string, unknown>) {
  return typeof resume.title === "string" && resume.title.trim() ? resume.title.trim().slice(0, 160) : "Resume";
}

export async function GET(request: Request) {
  const resumeId = new URL(request.url).searchParams.get("resumeId");
  if (!resumeId) return error("resumeId is required.");
  let settings;
  try {
    settings = config();
  } catch (cause) {
    return error(cause instanceof Error ? cause.message : "Resume history is unavailable.", 503);
  }
  const supabase = createClient(settings.url, settings.key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error: versionError } = await supabase
    .from("resume_versions")
    .select("id, version_number, content_json, created_at")
    .eq("resume_id", resumeId)
    .eq("candidate_id", settings.candidateId)
    .not("content_json", "is", null)
    .order("version_number", { ascending: false });
  if (versionError) return error("Resume history could not be loaded.", 502);
  return NextResponse.json({ versions: (data ?? []).map((version) => ({ id: version.id, number: version.version_number, content: version.content_json, createdAt: version.created_at })) });
}

export async function POST(request: Request) {
  let payload;
  let mode: "save" | "version" = "save";
  let versionId: string | undefined;
  try {
    const body = await readJsonBody(request);
    payload = parseStudioPayload(body, { requireJobDescriptions: false });
    if (body && typeof body === "object" && !Array.isArray(body)) {
      const input = body as Record<string, unknown>;
      mode = input.mode === "version" ? "version" : "save";
      if (typeof input.versionId === "string" && input.versionId.length <= 100) versionId = input.versionId;
    }
  } catch (cause) {
    return error(cause instanceof Error ? cause.message : "Invalid request.");
  }

  let settings;
  try {
    settings = config();
  } catch (cause) {
    return error(cause instanceof Error ? cause.message : "Resume saving is unavailable.", 503);
  }
  const supabase = createClient(settings.url, settings.key, { auth: { persistSession: false, autoRefreshToken: false } });

  try {
    let resumeId = payload.resumeId;
    if (resumeId) {
      const { data, error: resumeError } = await supabase
        .from("resumes")
        .select("id")
        .eq("id", resumeId)
        .eq("candidate_id", settings.candidateId)
        .maybeSingle();
      if (resumeError || !data) throw resumeError ?? new Error("Resume was not found.");
    } else {
      const { data, error: resumeError } = await supabase
        .from("resumes")
        .insert({ candidate_id: settings.candidateId, title: resumeTitle(payload.resume), source_kind: "manual" })
        .select("id")
        .single();
      if (resumeError || !data) throw resumeError ?? new Error("Resume could not be created.");
      resumeId = data.id;
    }

    const rows = payload.jobDescriptions.map((jd) => ({
      candidate_id: settings.candidateId,
      client_id: jd.id,
      title: jd.label,
      content_text: jd.text,
      content_hash: hash(jd.text)
    }));
    const { data: jobDescriptions, error: jdError } = await supabase
      .from("resume_job_descriptions")
      .upsert(rows, { onConflict: "candidate_id,content_hash" })
      .select("id, client_id, title");
    if (jdError) throw jdError;

    let version: { id: string; version_number: number } | null = null;
    if (mode === "save" && versionId) {
      const { data, error: existingError } = await supabase
        .from("resume_versions")
        .update({ content_json: payload.resume, content_hash: hash(JSON.stringify(payload.resume)), source: "manual" })
        .eq("id", versionId)
        .eq("resume_id", resumeId)
        .eq("candidate_id", settings.candidateId)
        .select("id, version_number")
        .maybeSingle();
      if (existingError) throw existingError;
      version = data;
    }

    if (!version) {
      const { data: latestVersion, error: latestVersionError } = await supabase
        .from("resume_versions")
        .select("version_number")
        .eq("resume_id", resumeId)
        .order("version_number", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (latestVersionError) throw latestVersionError;

      const { data, error: versionError } = await supabase
        .from("resume_versions")
        .insert({
          resume_id: resumeId,
          candidate_id: settings.candidateId,
          version_number: (latestVersion?.version_number ?? 0) + 1,
          source: "manual",
          content_json: payload.resume,
          content_hash: hash(JSON.stringify(payload.resume))
        })
        .select("id, version_number")
        .single();
      if (versionError || !data) throw versionError ?? new Error("Resume version could not be created.");
      version = data;
    }

    const { error: activeError } = await supabase.from("resumes").update({ active_version_id: version.id }).eq("id", resumeId).eq("candidate_id", settings.candidateId);
    if (activeError) throw activeError;

    return NextResponse.json({ resumeId, versionId: version.id, versionNumber: version.version_number, jobDescriptions: jobDescriptions ?? [] });
  } catch (cause) {
    console.error("Resume save failed", cause);
    return error("Resume could not be saved. Your previous saved version was not changed.", 502);
  }
}
