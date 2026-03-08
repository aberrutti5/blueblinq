import { db } from "@/lib/db";
import OpenAI from "openai";
import {
  PRODUCT_MATCHING_SYSTEM_PROMPT,
  PRODUCT_MATCHING_USER_PROMPT,
} from "@/lib/ai/prompts";

export interface ProductMatch {
  lineIndex: number;
  productId: string | null;
  productName: string | null;
  matchedBy: "EXACT" | "ALIAS" | "AI" | null;
  confidence: number;
}

/**
 * Match invoice line items against the company's product catalog.
 * Strategy (cheapest to most expensive):
 * 1. EXACT match: description matches product.name exactly (case-insensitive)
 * 2. ALIAS match: description matches a ProductAlias (case-insensitive)
 * 3. AI match: use LLM to fuzzy-match remaining unmatched items (only if catalog exists)
 */
export async function matchLineItemsToProducts(
  lineItems: { description: string }[],
  companyId: string,
  vendorId?: string | null
): Promise<ProductMatch[]> {
  // Fetch all active products for this company (optionally filtered by vendor)
  const products = await db.product.findMany({
    where: {
      companyId,
      isActive: true,
      ...(vendorId ? { OR: [{ vendorId }, { vendorId: null }] } : {}),
    },
    include: {
      aliases: true,
    },
  });

  // If no products in catalog, return all unmatched
  if (products.length === 0) {
    return lineItems.map((_, i) => ({
      lineIndex: i,
      productId: null,
      productName: null,
      matchedBy: null,
      confidence: 0,
    }));
  }

  const results: ProductMatch[] = new Array(lineItems.length);
  const unmatchedIndices: number[] = [];

  // Step 1 & 2: Try exact and alias matches (free - no AI cost)
  for (let i = 0; i < lineItems.length; i++) {
    const desc = lineItems[i].description.toLowerCase().trim();

    // Step 1: Exact match on product name
    const exactMatch = products.find(
      (p) => p.name.toLowerCase().trim() === desc
    );
    if (exactMatch) {
      results[i] = {
        lineIndex: i,
        productId: exactMatch.id,
        productName: exactMatch.name,
        matchedBy: "EXACT",
        confidence: 1.0,
      };
      continue;
    }

    // Step 2: Alias match
    let aliasMatch: (typeof products)[number] | undefined;
    for (const product of products) {
      const hasAlias = product.aliases.some(
        (a) => a.alias.toLowerCase().trim() === desc
      );
      if (hasAlias) {
        aliasMatch = product;
        break;
      }
    }
    if (aliasMatch) {
      results[i] = {
        lineIndex: i,
        productId: aliasMatch.id,
        productName: aliasMatch.name,
        matchedBy: "ALIAS",
        confidence: 0.95,
      };
      continue;
    }

    // Not matched yet
    unmatchedIndices.push(i);
  }

  // Step 3: AI matching for remaining unmatched items
  if (unmatchedIndices.length > 0 && products.length > 0) {
    try {
      const aiMatches = await matchWithAI(
        unmatchedIndices.map((i) => ({
          index: i,
          description: lineItems[i].description,
        })),
        products.map((p) => ({ id: p.id, name: p.name, sku: p.sku }))
      );

      for (const match of aiMatches) {
        const product = products.find((p) => p.id === match.productId);
        results[match.lineIndex] = {
          lineIndex: match.lineIndex,
          productId: match.productId,
          productName: product?.name ?? null,
          matchedBy: match.productId ? "AI" : null,
          confidence: match.confidence,
        };
      }
    } catch (error) {
      console.error("[matchProducts] AI matching failed:", error);
    }
  }

  // Fill any remaining unmatched
  for (let i = 0; i < lineItems.length; i++) {
    if (!results[i]) {
      results[i] = {
        lineIndex: i,
        productId: null,
        productName: null,
        matchedBy: null,
        confidence: 0,
      };
    }
  }

  return results;
}

async function matchWithAI(
  lineItems: { index: number; description: string }[],
  products: { id: string; name: string; sku: string | null }[]
): Promise<{ lineIndex: number; productId: string | null; confidence: number }[]> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini", // Cheap model is enough for matching
    messages: [
      { role: "system", content: PRODUCT_MATCHING_SYSTEM_PROMPT },
      {
        role: "user",
        content: PRODUCT_MATCHING_USER_PROMPT(lineItems, products),
      },
    ],
    response_format: { type: "json_object" },
    max_tokens: 2048,
    temperature: 0,
  });

  const content = response.choices[0].message.content;
  if (!content) return [];

  const parsed = JSON.parse(content);
  // The response might be { matches: [...] } or directly [...]
  const matches = Array.isArray(parsed) ? parsed : parsed.matches ?? [];

  return matches.map(
    (m: { lineIndex: number; productId: string | null; confidence: number }) => ({
      lineIndex: m.lineIndex,
      productId: m.confidence >= 0.7 ? m.productId : null,
      confidence: m.confidence,
    })
  );
}
