"use client";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_PDF_PAGES = 10;
const MAX_OCR_PIXELS = 4_000_000;

export async function extractResumeText(file: File) {
  if (file.size > MAX_FILE_BYTES) throw new Error("Choose a file smaller than 10 MB.");
  if (file.name.toLowerCase().endsWith(".docx")) {
    const mammoth = await import("mammoth");
    return (await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })).value.trim();
  }
  if (file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt")) return (await file.text()).trim();
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) return extractPdfText(file);
  throw new Error("Choose a PDF, DOCX, or TXT résumé.");
}

export async function extractScannedPdfText(file: File) {
  if (file.size > MAX_FILE_BYTES) throw new Error("Choose a file smaller than 10 MB.");
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.mjs", import.meta.url).toString();
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  if (pdf.numPages > MAX_PDF_PAGES) throw new Error("Choose a PDF with 10 pages or fewer.");
  const { recognize } = await import("tesseract.js");
  const pages: string[] = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const baseViewport = page.getViewport({ scale: 1 });
    const scale = Math.min(1.5, Math.sqrt(MAX_OCR_PIXELS / (baseViewport.width * baseViewport.height)));
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Your browser could not prepare the scanned PDF.");
    await page.render({ canvas, canvasContext: context, viewport }).promise;
    pages.push((await recognize(canvas, "eng")).data.text);
  }
  return pages.join("\n").trim();
}

export function pdfItemsToText(items: Array<{ str: string; hasEOL?: boolean }>) {
  return items.map((item) => `${item.str}${item.hasEOL ? "\n" : " "}`).join("").replace(/[ \t]+\n/g, "\n").trim();
}

async function extractPdfText(file: File) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.mjs", import.meta.url).toString();
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  if (pdf.numPages > MAX_PDF_PAGES) throw new Error("Choose a PDF with 10 pages or fewer.");
  const pages: string[] = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const content = await (await pdf.getPage(pageNumber)).getTextContent();
    pages.push(pdfItemsToText(content.items.flatMap((item) => "str" in item ? [{ str: item.str, hasEOL: item.hasEOL }] : [])));
  }
  return pages.join("\n").trim();
}
