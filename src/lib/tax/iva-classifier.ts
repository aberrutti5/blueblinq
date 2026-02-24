import { IvaCategory } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { IVA_RATES } from "@/types/tax";

interface ClassificationResult {
  category: IvaCategory;
  rate: number;
  method: "AI" | "RULE" | "DEFAULT";
}

function parseIvaIndicator(
  indicator: string
): { category: IvaCategory; rate: number } | null {
  const lower = indicator.toLowerCase().trim();

  if (
    lower.includes("22%") ||
    lower.includes("22,00") ||
    lower.includes("básica") ||
    lower.includes("basica") ||
    lower === "bás" ||
    lower === "bas"
  ) {
    return { category: "BASICA", rate: 22.0 };
  }

  if (
    lower.includes("10%") ||
    lower.includes("10,00") ||
    lower.includes("mínima") ||
    lower.includes("minima") ||
    lower === "mín" ||
    lower === "min"
  ) {
    return { category: "MINIMA", rate: 10.0 };
  }

  if (
    lower.includes("exento") ||
    lower.includes("exonerado") ||
    lower.includes("no gravado")
  ) {
    return { category: "EXONERADO", rate: 0.0 };
  }

  if (lower.includes("export") || lower.includes("0%")) {
    return { category: "EXPORTACION", rate: 0.0 };
  }

  return null;
}

export async function classifyIva(
  description: string,
  companyId: string,
  aiIndicator?: string | null
): Promise<ClassificationResult> {
  // 1. Try AI indicator
  if (aiIndicator) {
    const parsed = parseIvaIndicator(aiIndicator);
    if (parsed) {
      return { ...parsed, method: "AI" };
    }
  }

  // 2. Rule-based matching (company-specific first, then global)
  const rules = await db.ivaClassificationRule.findMany({
    where: {
      isActive: true,
      OR: [{ companyId }, { companyId: null }],
    },
    orderBy: [{ priority: "desc" }, { companyId: "desc" }],
  });

  const lowerDesc = description.toLowerCase();
  for (const rule of rules) {
    if (lowerDesc.includes(rule.keyword.toLowerCase())) {
      return {
        category: rule.ivaCategory,
        rate: IVA_RATES[rule.ivaCategory],
        method: "RULE",
      };
    }
  }

  // 3. Default to BASICA (22%)
  return { category: "BASICA", rate: 22.0, method: "DEFAULT" };
}

export function calculateIvaAmount(
  lineTotal: number,
  ivaRate: number
): number {
  // In Uruguay, the lineTotal on invoices typically INCLUDES IVA
  // IVA amount = lineTotal - (lineTotal / (1 + ivaRate/100))
  if (ivaRate === 0) return 0;
  const netAmount = lineTotal / (1 + ivaRate / 100);
  return Math.round((lineTotal - netAmount) * 100) / 100;
}
