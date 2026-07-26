import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { parseResumeImport } from "./document";
import { pdfItemsToText } from "./file-text";

test("cloud-engineer.pdf imports into the editable résumé fields", async () => {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const bytes = new Uint8Array(await readFile(new URL("../../../../../resume_samples/cloud-engineer.pdf", import.meta.url)));
  const pdf = await pdfjs.getDocument({ data: bytes }).promise;
  const pages: string[] = [];
  for (let page = 1; page <= pdf.numPages; page += 1) {
    const content = await (await pdf.getPage(page)).getTextContent();
    pages.push(pdfItemsToText(content.items.flatMap((item) => "str" in item ? [{ str: item.str, hasEOL: item.hasEOL }] : [])));
  }

  const result = parseResumeImport(pages.join("\n"));
  assert.equal(result.resume.name, "NUR AINA RAHMAN");
  assert.equal(result.resume.experience.length, 6);
  assert.equal(result.resume.experience[0]?.role, "Cloud Engineer · Nimbus Learning, Kuala Lumpur, Malaysia");
  assert.equal(result.resume.experience[0]?.period, "06/2023 - Present");
  assert.ok(result.resume.experience[0]?.bullets.some((bullet) => bullet.includes("15 cloud architectural solutions")));
  assert.ok(result.resume.skills.includes("Kubernetes"));
  assert.match(result.resume.other || "", /AWS Solutions Architect/);
});

test("before-optimization cloud engineer sample stays editable and evidential", async () => {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const bytes = new Uint8Array(await readFile(new URL("../../../../../resume_samples/cloud-engineer-before-optimization.pdf", import.meta.url)));
  const pdf = await pdfjs.getDocument({ data: bytes }).promise;
  const pages: string[] = [];
  for (let page = 1; page <= pdf.numPages; page += 1) {
    const content = await (await pdf.getPage(page)).getTextContent();
    pages.push(pdfItemsToText(content.items.flatMap((item) => "str" in item ? [{ str: item.str, hasEOL: item.hasEOL }] : [])));
  }

  const result = parseResumeImport(pages.join("\n"));
  assert.equal(result.resume.name, "NUR AINA RAHMAN");
  assert.equal(result.resume.experience.length, 6);
  assert.match(result.resume.summary, /do alot cloud work/i);
  assert.ok(result.resume.experience[0]?.bullets.some((bullet) => bullet.includes("AWS services")));
});
