import assert from "node:assert/strict";
import test from "node:test";
import { renderResumePdf } from "./export-pdf";

test("renders a selectable ATS PDF directly from resume data", async () => {
  const pdf = await renderResumePdf({
    name: "Nur Aina Rahman", title: "Cloud Engineer", loc: "Petaling Jaya, Selangor", email: "aina@example.com", version: "Draft · unsaved",
    summary: "Cloud engineer with hands-on AWS experience.",
    experience: [{ role: "Cloud Engineer · Nimbus Learning", period: "06/2023 - Present", bullets: ["Automated log shipping."] }],
    skills: ["AWS", "Docker"], other: "AWS Certified Cloud Practitioner"
  });

  assert.equal(pdf.subarray(0, 4).toString(), "%PDF");
  assert.ok(pdf.length > 1_000);
});
