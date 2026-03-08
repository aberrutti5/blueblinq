import pdfParse from "pdf-parse";

export interface PdfExtractionResult {
  text: string;
  pageCount: number;
  hasText: boolean;
}

/**
 * Extracts text from a PDF buffer.
 * If the PDF has selectable text (digital/text-layer PDF), returns it directly.
 * If not (scanned image PDF), returns hasText=false so the caller can fall back to vision.
 */
export async function extractTextFromPdf(
  buffer: Buffer
): Promise<PdfExtractionResult> {
  const data = await pdfParse(buffer);

  const text = data.text.trim();
  const hasText = text.length > 50; // Minimum threshold to consider it has real text

  return {
    text,
    pageCount: data.numpages,
    hasText,
  };
}
