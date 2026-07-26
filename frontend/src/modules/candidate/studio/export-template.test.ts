import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import PizZip from "pizzip";
import { renderResumeTemplate, toResumeTemplateData } from "./export-template";

test("maps the editable resume into stable ATS template fields", () => {
  const data = toResumeTemplateData({
    name: "Nur Aina Rahman",
    title: "Cloud Engineer",
    loc: "Petaling Jaya, Selangor · +60 12-345 6789",
    email: "aina@example.com",
    version: "Draft · unsaved",
    summary: "Cloud engineer with hands-on AWS experience.",
    experience: [{
      role: "Cloud Engineer · Nimbus Learning, Kuala Lumpur, Malaysia",
      period: "06/2023 - Present",
      bullets: ["Automated log shipping.", "Administered AWS services."]
    }],
    skills: ["Technical: AWS, Docker", "Languages: Python"],
    other: "Universiti Teknologi Malaysia | BSc Computer Science\nAWS Certified Cloud Practitioner"
  });

  assert.equal(data.name, "Nur Aina Rahman");
  assert.equal(data.contact, "Petaling Jaya, Selangor · +60 12-345 6789 | aina@example.com");
  assert.deepEqual(data.experience, [{
    role: "Cloud Engineer · Nimbus Learning, Kuala Lumpur, Malaysia",
    period: "06/2023 - Present",
    bullets: [{ text: "Automated log shipping." }, { text: "Administered AWS services." }]
  }]);
  assert.equal(data.skills, "Technical: AWS, Docker · Languages: Python");
  assert.equal(data.other, "Universiti Teknologi Malaysia | BSc Computer Science\nAWS Certified Cloud Practitioner");
});

test("renders the supplied ATS DOCX without leftover template tags", async () => {
  const template = await readFile("public/resume-templates/ats-resume.docx");
  const file = renderResumeTemplate(template.buffer.slice(template.byteOffset, template.byteOffset + template.byteLength), {
    name: "Nur Aina Rahman", title: "Cloud Engineer", loc: "Petaling Jaya, Selangor", email: "aina@example.com", version: "Draft · unsaved",
    summary: "Cloud engineer with hands-on AWS experience.",
    experience: [{ role: "Cloud Engineer · Nimbus Learning", period: "06/2023 - Present", bullets: ["Automated log shipping."] }],
    skills: ["AWS", "Docker"], other: "AWS Certified Cloud Practitioner"
  });
  const xml = new PizZip(await file.arrayBuffer()).file("word/document.xml")?.asText() || "";

  assert.match(xml, /Nur Aina Rahman/);
  assert.match(xml, /Automated log shipping\./);
  assert.doesNotMatch(xml, /\{#experience\}|\{name\}|\{text\}/);
});
