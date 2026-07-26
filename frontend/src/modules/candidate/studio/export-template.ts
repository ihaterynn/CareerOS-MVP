import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import type { Resume } from "./types";

export type ResumeTemplateData = {
  name: string;
  title: string;
  contact: string;
  summary: string;
  experience: Array<{ role: string; period: string; bullets: Array<{ text: string }> }>;
  skills: string;
  other: string;
};

export function toResumeTemplateData(resume: Resume): ResumeTemplateData {
  return {
    name: resume.name || "Your name",
    title: resume.title || "Professional",
    contact: [resume.loc, resume.email].filter(Boolean).join(" | "),
    summary: resume.summary,
    experience: resume.experience.map((experience) => ({
      role: experience.role,
      period: experience.period,
      bullets: experience.bullets.filter(Boolean).map((text) => ({ text }))
    })),
    skills: resume.skills.filter(Boolean).join(" · "),
    other: resume.other || ""
  };
}

const p = (text: string, pPr = "", rPr = "") => `<w:p><w:pPr>${pPr}</w:pPr><w:r><w:rPr>${rPr}</w:rPr><w:t xml:space="preserve">${text}</w:t></w:r></w:p>`;
const rule = `<w:p><w:pPr><w:spacing w:after="80"/></w:pPr><w:r><w:pict><v:rect style="width:0.0pt;height:1.5pt" o:hr="t" o:hrstd="t" o:hralign="center" fillcolor="#A0A0A0" stroked="f"/></w:pict></w:r></w:p>`;
const heading = (text: string) => p(text, `<w:spacing w:before="180" w:after="40"/><w:keepNext/><w:rPr><w:rFonts w:ascii="Garamond" w:hAnsi="Garamond"/><w:b/><w:color w:val="2D2D2D"/><w:sz w:val="18"/></w:rPr>`, `<w:rFonts w:ascii="Garamond" w:hAnsi="Garamond"/><w:b/><w:color w:val="2D2D2D"/><w:sz w:val="18"/>`);
const bodyRun = `<w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:color w:val="595959"/><w:sz w:val="20"/>`;
const bodyP = `<w:spacing w:after="55"/><w:rPr>${bodyRun}</w:rPr>`;
const bulletP = `<w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr><w:spacing w:after="25"/><w:ind w:left="405" w:hanging="315"/><w:rPr>${bodyRun}</w:rPr>`;
const roleP = `<w:tabs><w:tab w:val="right" w:pos="10440"/></w:tabs><w:spacing w:before="70" w:after="25"/><w:keepNext/><w:rPr>${bodyRun}</w:rPr>`;

function taggedDocument(xml: string) {
  const bodyStart = xml.indexOf("<w:body>");
  const section = xml.match(/<w:sectPr[\s\S]*?<\/w:sectPr>/)?.[0];
  if (bodyStart < 0 || !section) throw new Error("The ATS DOCX template is invalid.");
  const prefix = xml.slice(0, bodyStart);
  const body = [
    p("{name}", `<w:jc w:val="center"/><w:spacing w:after="40"/><w:rPr><w:rFonts w:ascii="Garamond" w:hAnsi="Garamond"/><w:color w:val="2D2D2D"/><w:sz w:val="60"/></w:rPr>`, `<w:rFonts w:ascii="Garamond" w:hAnsi="Garamond"/><w:color w:val="2D2D2D"/><w:sz w:val="60"/>`),
    p("{title}", `<w:jc w:val="center"/><w:spacing w:after="35"/><w:rPr><w:rFonts w:ascii="Georgia" w:hAnsi="Georgia"/><w:i/><w:color w:val="666666"/><w:sz w:val="24"/></w:rPr>`, `<w:rFonts w:ascii="Georgia" w:hAnsi="Georgia"/><w:i/><w:color w:val="666666"/><w:sz w:val="24"/>`),
    rule,
    p("{contact}", `<w:jc w:val="center"/><w:spacing w:after="80"/><w:rPr>${bodyRun}</w:rPr>`, bodyRun),
    rule,
    heading("PROFESSIONAL OVERVIEW"),
    p("{summary}", bodyP, bodyRun),
    heading("WORK EXPERIENCE"),
    p("{#experience}"),
    p("{role}\t{period}", roleP, bodyRun),
    p("{#bullets}"),
    p("{text}", bulletP, bodyRun),
    p("{/bullets}"),
    p("{/experience}"),
    heading("SKILLS"),
    p("{skills}", bodyP, bodyRun),
    p("{#other}"),
    heading("ADDITIONAL DETAILS"),
    p("{other}", bodyP, bodyRun),
    p("{/other}"),
    section
  ].join("");
  return `${prefix}<w:body>${body}</w:body></w:document>`;
}

export function renderResumeTemplate(template: ArrayBuffer, resume: Resume) {
  const zip = new PizZip(template);
  const document = zip.file("word/document.xml");
  if (!document) throw new Error("The ATS DOCX template is missing its document body.");
  zip.file("word/document.xml", taggedDocument(document.asText()));
  const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
  doc.render(toResumeTemplateData(resume));
  return doc.getZip().generate({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }) as Blob;
}
