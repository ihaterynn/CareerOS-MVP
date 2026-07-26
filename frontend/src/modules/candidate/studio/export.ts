"use client";

import { renderResumeTemplate } from "./export-template";
import type { Resume } from "./types";

const filename = (resume: Resume, extension: string) => `${(resume.name || "resume").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "resume"}.${extension}`;

function download(blob: Blob, name: string) {
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = name;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

async function createResumeDocx(resume: Resume) {
  const response = await fetch("/resume-templates/ats-resume.docx");
  if (!response.ok) throw new Error("The ATS export template is unavailable.");
  return renderResumeTemplate(await response.arrayBuffer(), resume);
}

export async function downloadResumeDocx(resume: Resume) {
  download(await createResumeDocx(resume), filename(resume, "docx"));
}

export async function downloadResumePdf(resume: Resume) {
  const response = await fetch("/api/candidate/studio/export", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resume }) });
  if (!response.ok) throw new Error((await response.json().catch(() => null))?.error || "PDF export is unavailable.");
  download(await response.blob(), filename(resume, "pdf"));
}
