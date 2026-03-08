import { z } from "zod";
import type { ExtractionResult } from "@/types/invoice";

const lineItemSchema = z.object({
  description: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  discount: z.number().default(0),
  lineTotal: z.number(),
  ivaIndicator: z.string().nullable(),
});

const extractionSchema = z.object({
  invoiceType: z
    .enum([
      "FACTURA_A",
      "FACTURA_B",
      "FACTURA_C",
      "FACTURA_E",
      "TICKET",
      "NOTA_CREDITO",
      "NOTA_DEBITO",
      "RESGUARDO",
    ])
    .nullable(),
  invoiceNumber: z.string().nullable(),
  invoiceDate: z.string().nullable(),
  dueDate: z.string().nullable(),
  vendor: z.object({
    name: z.string().nullable(),
    rut: z.string().nullable(),
    address: z.string().nullable(),
  }),
  currency: z.enum(["UYU", "USD"]).default("UYU"),
  lineItems: z.array(lineItemSchema),
  subtotal: z.number().nullable(),
  totalIva: z.number().nullable(),
  totalAmount: z.number().nullable(),
  confidence: z.number().min(0).max(1),
});

export function parseExtractionResponse(raw: unknown): ExtractionResult {
  const parsed = extractionSchema.parse(raw);
  return parsed as ExtractionResult;
}
