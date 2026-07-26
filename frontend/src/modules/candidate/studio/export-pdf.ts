import PDFDocument from "pdfkit";
import type { Resume } from "./types";

const page = { width: 595.28, height: 841.89, left: 52, right: 52, top: 46, bottom: 48 };
const contentWidth = page.width - page.left - page.right;

export function renderResumePdf(resume: Resume): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 0, info: { Title: `${resume.name || "Resume"} résumé`, Author: "CareerOS Resume Studio" } });
    const chunks: Buffer[] = [];
    let y = page.top;
    const nextPage = () => { doc.addPage(); y = page.top; };
    const ensure = (height: number) => { if (y + height > page.height - page.bottom) nextPage(); };
    const text = (value: string, options: PDFKit.Mixins.TextOptions = {}) => {
      doc.text(value, page.left, y, { width: contentWidth, lineGap: 1.6, ...options });
      y = doc.y;
    };
    const heading = (value: string) => {
      ensure(24); doc.font("Times-Bold").fontSize(9).fillColor("#2D2D2D");
      text(value, { characterSpacing: 0.7, lineGap: 0 }); y += 4;
    };
    const rule = () => { doc.moveTo(page.left, y).lineTo(page.width - page.right, y).lineWidth(0.7).strokeColor("#A0A0A0").stroke(); y += 12; };
    const bullet = (value: string) => {
      doc.font("Helvetica").fontSize(9.4).fillColor("#595959");
      const height = doc.heightOfString(value, { width: contentWidth - 20, lineGap: 1.6 });
      ensure(height + 4);
      doc.fillColor("#8A641C").text("•", page.left + 8, y);
      doc.fillColor("#595959").text(value, page.left + 20, y, { width: contentWidth - 20, lineGap: 1.6 });
      y = doc.y + 2;
    };

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.font("Times-Roman").fontSize(29).fillColor("#2D2D2D");
    text(resume.name || "Your name", { align: "center", lineGap: 0 });
    doc.font("Times-Italic").fontSize(11).fillColor("#666666");
    text(resume.title || "Professional", { align: "center", lineGap: 0 }); y += 8;
    rule();
    doc.font("Helvetica").fontSize(8.8).fillColor("#595959");
    text([resume.loc, resume.email].filter(Boolean).join(" | "), { align: "center", lineGap: 0 }); y += 8;
    rule();

    heading("PROFESSIONAL OVERVIEW");
    doc.font("Helvetica").fontSize(9.4).fillColor("#595959");
    text(resume.summary, { align: "justify" }); y += 8;

    heading("WORK EXPERIENCE");
    for (const experience of resume.experience) {
      doc.font("Helvetica-Bold").fontSize(9.5).fillColor("#2D2D2D");
      const roleHeight = doc.heightOfString(experience.role, { width: contentWidth - 110, lineGap: 1.4 });
      ensure(roleHeight + 18);
      doc.text(experience.role, page.left, y, { width: contentWidth - 110, lineGap: 1.4 });
      const roleY = y;
      doc.font("Helvetica").fontSize(8.6).fillColor("#666666").text(experience.period, page.left + contentWidth - 104, roleY, { width: 104, align: "right", lineGap: 1.4 });
      y = Math.max(doc.y, roleY + roleHeight) + 3;
      for (const item of experience.bullets.filter(Boolean)) bullet(item);
      y += 4;
    }

    heading("SKILLS");
    doc.font("Helvetica").fontSize(9.4).fillColor("#595959");
    text(resume.skills.filter(Boolean).join(" · ")); y += 8;

    if (resume.other) {
      heading("ADDITIONAL DETAILS");
      doc.font("Helvetica").fontSize(9.4).fillColor("#595959");
      text(resume.other);
    }
    doc.end();
  });
}
