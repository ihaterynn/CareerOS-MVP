import "server-only";

/** Upper bound on extracted text handed to the model — a guard against prompt-size blowups. */
const MAX_CHARS = 40_000;

export type ExtractedDocument = { text: string; pages?: number };

/**
 * Pulls plain text out of an uploaded résumé. PDF and DOCX are handled locally; nothing is sent
 * to a third party to do the extraction.
 */
export async function extractText(file: {
  buffer: ArrayBuffer;
  mimeType: string;
  name: string;
}): Promise<ExtractedDocument> {
  const kind = classify(file.mimeType, file.name);

  if (kind === "pdf") {
    const { extractText: extractPdfText, getDocumentProxy } = await import("unpdf");
    const pdf = await getDocumentProxy(new Uint8Array(file.buffer));
    const { text, totalPages } = await extractPdfText(pdf, { mergePages: true });
    return { text: clamp(text), pages: totalPages };
  }

  if (kind === "docx") {
    const mammoth = (await import("mammoth")).default;
    const { value } = await mammoth.extractRawText({ buffer: Buffer.from(file.buffer) });
    return { text: clamp(value) };
  }

  return { text: clamp(new TextDecoder().decode(file.buffer)) };
}

function classify(mimeType: string, name: string): "pdf" | "docx" | "text" {
  const lower = name.toLowerCase();
  if (mimeType === "application/pdf" || lower.endsWith(".pdf")) return "pdf";
  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    lower.endsWith(".docx")
  ) {
    return "docx";
  }
  return "text";
}

function clamp(text: string): string {
  const normalized = text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  return normalized.length > MAX_CHARS ? normalized.slice(0, MAX_CHARS) : normalized;
}
