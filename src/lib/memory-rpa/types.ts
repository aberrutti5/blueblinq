import type { InvoiceType, IvaCategory } from "@/generated/prisma/enums";

// ─── Credentials ────────────────────────────────────────────────

export interface MemoryCredentials {
  email: string;
  password: string;
  /** Memory company/tenant identifier */
  companyId?: string;
}

// ─── Invoice Input (mapped from our DB to Memory's format) ──────

export interface MemoryLineItemInput {
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  ivaCategory: IvaCategory;
  ivaRate: number;
  ivaAmount: number;
}

export interface MemoryInvoiceInput {
  vendorName: string;
  vendorRut: string;
  invoiceType: InvoiceType;
  invoiceNumber: string;
  invoiceDate: string; // YYYY-MM-DD
  dueDate?: string;
  currency: string;
  lineItems: MemoryLineItemInput[];
  subtotal: number;
  totalIva: number;
  totalAmount: number;
}

// ─── RPA Job ────────────────────────────────────────────────────

export type RpaJobStatus = "PENDING" | "RUNNING" | "SUCCESS" | "FAILED";

export interface RpaStepLog {
  step: string;
  status: "ok" | "error";
  timestamp: Date;
  screenshotPath?: string;
  error?: string;
}

export interface RpaJobResult {
  jobId: string;
  invoiceId: string;
  status: RpaJobStatus;
  steps: RpaStepLog[];
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}
