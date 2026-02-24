import { IvaCategory, InvoiceType, InvoiceStatus } from "@/generated/prisma/enums";

export interface ExtractionResult {
  invoiceType: InvoiceType | null;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  dueDate: string | null;
  vendor: {
    name: string | null;
    rut: string | null;
    address: string | null;
  };
  currency: string;
  lineItems: ExtractedLineItem[];
  subtotal: number | null;
  totalIva: number | null;
  totalAmount: number | null;
  confidence: number;
}

export interface ExtractedLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  ivaIndicator: string | null;
}

export interface ClassifiedLineItem extends ExtractedLineItem {
  ivaCategory: IvaCategory;
  ivaRate: number;
  ivaAmount: number;
  classifiedBy: "AI" | "RULE" | "DEFAULT";
}

export interface InvoiceWithLineItems {
  id: string;
  companyId: string;
  fileUrl: string;
  fileName: string;
  status: InvoiceStatus;
  invoiceType: InvoiceType | null;
  invoiceNumber: string | null;
  invoiceDate: Date | null;
  vendorName: string | null;
  vendorRut: string | null;
  currency: string;
  subtotal: number | null;
  totalIva: number | null;
  totalAmount: number | null;
  confidence: number | null;
  lineItems: {
    id: string;
    lineNumber: number;
    description: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    ivaCategory: IvaCategory;
    ivaRate: number;
    ivaAmount: number;
    classifiedBy: string;
  }[];
  createdAt: Date;
}
