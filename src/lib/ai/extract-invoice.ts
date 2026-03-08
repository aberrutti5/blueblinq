import OpenAI from "openai";
import {
  EXTRACTION_SYSTEM_PROMPT,
  EXTRACTION_USER_PROMPT,
  TEXT_EXTRACTION_SYSTEM_PROMPT,
  TEXT_EXTRACTION_USER_PROMPT,
} from "./prompts";
import { parseExtractionResponse } from "./parse-response";
import type { ExtractionResult } from "@/types/invoice";

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

/**
 * Extract invoice data from pre-extracted PDF text.
 * This is MUCH cheaper than vision — uses only text tokens (no image tokens).
 */
export async function extractInvoiceFromText(
  pdfText: string
): Promise<{ result: ExtractionResult; raw: unknown }> {
  const response = await getOpenAIClient().chat.completions.create({
    model: "gpt-4o-mini", // Text-only = can use cheaper model
    messages: [
      { role: "system", content: TEXT_EXTRACTION_SYSTEM_PROMPT },
      {
        role: "user",
        content: TEXT_EXTRACTION_USER_PROMPT(pdfText),
      },
    ],
    response_format: { type: "json_object" },
    max_tokens: 4096,
    temperature: 0,
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("OpenAI returned empty response");
  }

  const raw = JSON.parse(content);
  const result = parseExtractionResponse(raw);

  return { result, raw };
}

/**
 * Extract invoice data from an image URL (vision API).
 * More expensive — only used as fallback for scanned PDFs or image files.
 */
export async function extractInvoiceData(
  fileUrl: string
): Promise<{ result: ExtractionResult; raw: unknown }> {
  const response = await getOpenAIClient().chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: EXTRACTION_SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          { type: "text", text: EXTRACTION_USER_PROMPT },
          { type: "image_url", image_url: { url: fileUrl, detail: "high" } },
        ],
      },
    ],
    response_format: { type: "json_object" },
    max_tokens: 4096,
    temperature: 0,
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("OpenAI returned empty response");
  }

  const raw = JSON.parse(content);
  const result = parseExtractionResponse(raw);

  return { result, raw };
}

/**
 * Extract invoice data from base64 image (vision API fallback).
 */
export async function extractInvoiceFromBase64(
  base64Data: string,
  mimeType: string
): Promise<{ result: ExtractionResult; raw: unknown }> {
  const dataUrl = `data:${mimeType};base64,${base64Data}`;

  const response = await getOpenAIClient().chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: EXTRACTION_SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          { type: "text", text: EXTRACTION_USER_PROMPT },
          { type: "image_url", image_url: { url: dataUrl, detail: "high" } },
        ],
      },
    ],
    response_format: { type: "json_object" },
    max_tokens: 4096,
    temperature: 0,
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("OpenAI returned empty response");
  }

  const raw = JSON.parse(content);
  const result = parseExtractionResponse(raw);

  return { result, raw };
}
