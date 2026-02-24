import OpenAI from "openai";
import { EXTRACTION_SYSTEM_PROMPT, EXTRACTION_USER_PROMPT } from "./prompts";
import { parseExtractionResponse } from "./parse-response";
import type { ExtractionResult } from "@/types/invoice";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function extractInvoiceData(
  fileUrl: string
): Promise<{ result: ExtractionResult; raw: unknown }> {
  const response = await openai.chat.completions.create({
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

export async function extractInvoiceFromBase64(
  base64Data: string,
  mimeType: string
): Promise<{ result: ExtractionResult; raw: unknown }> {
  const dataUrl = `data:${mimeType};base64,${base64Data}`;

  const response = await openai.chat.completions.create({
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
