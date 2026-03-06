import type { InvoiceType, IvaCategory } from "@/generated/prisma/enums";
import type { MemoryInvoiceInput, MemoryLineItemInput } from "./types";

/** Maps our InvoiceType enum to Memory's display label */
const INVOICE_TYPE_MAP: Record<InvoiceType, string> = {
  FACTURA_A: "Factura A",
  FACTURA_B: "Factura B",
  FACTURA_C: "Factura C",
  FACTURA_E: "e-Factura",
  TICKET: "Ticket",
  NOTA_CREDITO: "Nota de Crédito",
  NOTA_DEBITO: "Nota de Débito",
  RESGUARDO: "Resguardo",
};

/** Maps our IvaCategory to the IVA rate percentage */
const IVA_RATE_MAP: Record<IvaCategory, number> = {
  BASICA: 22,
  MINIMA: 10,
  EXPORTACION: 0,
  EXONERADO: 0,
};

export function getMemoryInvoiceTypeLabel(type: InvoiceType): string {
  return INVOICE_TYPE_MAP[type] ?? type;
}

export function getIvaRateForCategory(category: IvaCategory): number {
  return IVA_RATE_MAP[category] ?? 0;
}

interface InvoiceRecord {
  invoiceType: InvoiceType | null;
  invoiceNumber: string | null;
  invoiceDate: Date | null;
  dueDate?: Date | null;
  vendorName: string | null;
  vendorRut: string | null;
  currency: string;
  subtotal: number | string | { toNumber(): number } | null;
  totalIva: number | string | { toNumber(): number } | null;
  totalAmount: number | string | { toNumber(): number } | null;
  lineItems: LineItemRecord[];
}

interface LineItemRecord {
  description: string;
  quantity: number | string | { toNumber(): number };
  unitPrice: number | string | { toNumber(): number };
  lineTotal: number | string | { toNumber(): number };
  ivaCategory: IvaCategory;
  ivaRate: number | string | { toNumber(): number };
  ivaAmount: number | string | { toNumber(): number };
}

/** Converts a Prisma Decimal-like value to a plain number */
function toNum(
  val: number | string | { toNumber(): number } | null | undefined
): number {
  if (val == null) return 0;
  if (typeof val === "number") return val;
  if (typeof val === "string") return parseFloat(val) || 0;
  if (typeof val.toNumber === "function") return val.toNumber();
  return 0;
}

function formatDate(date: Date | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toISOString().split("T")[0];
}

function mapLineItem(item: LineItemRecord): MemoryLineItemInput {
  return {
    description: item.description,
    quantity: toNum(item.quantity),
    unitPrice: toNum(item.unitPrice),
    lineTotal: toNum(item.lineTotal),
    ivaCategory: item.ivaCategory,
    ivaRate: toNum(item.ivaRate),
    ivaAmount: toNum(item.ivaAmount),
  };
}

/**
 * Maps our internal invoice data to the format needed for Memory RPA input.
 * Throws if required fields are missing.
 */
export function mapInvoiceToMemoryInput(
  invoice: InvoiceRecord
): MemoryInvoiceInput {
  if (!invoice.invoiceType) {
    throw new Error("Invoice type is required for Memory sync");
  }
  if (!invoice.vendorName || !invoice.vendorRut) {
    throw new Error("Vendor name and RUT are required for Memory sync");
  }
  if (!invoice.invoiceNumber) {
    throw new Error("Invoice number is required for Memory sync");
  }
  if (!invoice.invoiceDate) {
    throw new Error("Invoice date is required for Memory sync");
  }
  if (invoice.lineItems.length === 0) {
    throw new Error("At least one line item is required for Memory sync");
  }

  return {
    vendorName: invoice.vendorName,
    vendorRut: invoice.vendorRut,
    invoiceType: invoice.invoiceType,
    invoiceNumber: invoice.invoiceNumber,
    invoiceDate: formatDate(invoice.invoiceDate),
    dueDate: invoice.dueDate ? formatDate(invoice.dueDate) : undefined,
    currency: invoice.currency,
    lineItems: invoice.lineItems.map(mapLineItem),
    subtotal: toNum(invoice.subtotal),
    totalIva: toNum(invoice.totalIva),
    totalAmount: toNum(invoice.totalAmount),
  };
}
