import { describe, it, expect } from "vitest";
import { mapInvoiceToMemoryInput, getMemoryInvoiceTypeLabel, getIvaRateForCategory } from "../mapper";

describe("mapper", () => {
  const validInvoice = {
    invoiceType: "FACTURA_E" as const,
    invoiceNumber: "A-001-0001234",
    invoiceDate: new Date("2026-02-15"),
    dueDate: new Date("2026-03-15"),
    vendorName: "Proveedor Test S.A.",
    vendorRut: "211234560019",
    currency: "UYU",
    subtotal: 1000,
    totalIva: 220,
    totalAmount: 1220,
    lineItems: [
      {
        description: "Servicio de consultoría",
        quantity: 2,
        unitPrice: 500,
        lineTotal: 1000,
        ivaCategory: "BASICA" as const,
        ivaRate: 22,
        ivaAmount: 220,
      },
    ],
  };

  describe("mapInvoiceToMemoryInput", () => {
    it("maps a valid invoice correctly", () => {
      const result = mapInvoiceToMemoryInput(validInvoice);

      expect(result.vendorName).toBe("Proveedor Test S.A.");
      expect(result.vendorRut).toBe("211234560019");
      expect(result.invoiceType).toBe("FACTURA_E");
      expect(result.invoiceNumber).toBe("A-001-0001234");
      expect(result.invoiceDate).toBe("2026-02-15");
      expect(result.dueDate).toBe("2026-03-15");
      expect(result.currency).toBe("UYU");
      expect(result.subtotal).toBe(1000);
      expect(result.totalIva).toBe(220);
      expect(result.totalAmount).toBe(1220);
      expect(result.lineItems).toHaveLength(1);
      expect(result.lineItems[0].description).toBe("Servicio de consultoría");
    });

    it("handles Prisma Decimal-like objects", () => {
      const invoice = {
        ...validInvoice,
        subtotal: { toNumber: () => 1000 },
        totalIva: { toNumber: () => 220 },
        totalAmount: { toNumber: () => 1220 },
        lineItems: [
          {
            ...validInvoice.lineItems[0],
            quantity: { toNumber: () => 2 },
            unitPrice: { toNumber: () => 500 },
            lineTotal: { toNumber: () => 1000 },
            ivaRate: { toNumber: () => 22 },
            ivaAmount: { toNumber: () => 220 },
          },
        ],
      };

      const result = mapInvoiceToMemoryInput(invoice);
      expect(result.subtotal).toBe(1000);
      expect(result.lineItems[0].quantity).toBe(2);
    });

    it("handles string numeric values", () => {
      const invoice = {
        ...validInvoice,
        subtotal: "1000.00",
        totalIva: "220.00",
        totalAmount: "1220.00",
      };

      const result = mapInvoiceToMemoryInput(invoice);
      expect(result.subtotal).toBe(1000);
      expect(result.totalIva).toBe(220);
    });

    it("handles null dueDate", () => {
      const invoice = { ...validInvoice, dueDate: null };
      const result = mapInvoiceToMemoryInput(invoice);
      expect(result.dueDate).toBeUndefined();
    });

    it("throws if invoiceType is null", () => {
      const invoice = { ...validInvoice, invoiceType: null };
      expect(() => mapInvoiceToMemoryInput(invoice)).toThrow(
        "Invoice type is required"
      );
    });

    it("throws if vendor name is null", () => {
      const invoice = { ...validInvoice, vendorName: null };
      expect(() => mapInvoiceToMemoryInput(invoice)).toThrow(
        "Vendor name and RUT are required"
      );
    });

    it("throws if vendor RUT is null", () => {
      const invoice = { ...validInvoice, vendorRut: null };
      expect(() => mapInvoiceToMemoryInput(invoice)).toThrow(
        "Vendor name and RUT are required"
      );
    });

    it("throws if invoiceNumber is null", () => {
      const invoice = { ...validInvoice, invoiceNumber: null };
      expect(() => mapInvoiceToMemoryInput(invoice)).toThrow(
        "Invoice number is required"
      );
    });

    it("throws if invoiceDate is null", () => {
      const invoice = { ...validInvoice, invoiceDate: null };
      expect(() => mapInvoiceToMemoryInput(invoice)).toThrow(
        "Invoice date is required"
      );
    });

    it("throws if lineItems is empty", () => {
      const invoice = { ...validInvoice, lineItems: [] };
      expect(() => mapInvoiceToMemoryInput(invoice)).toThrow(
        "At least one line item is required"
      );
    });
  });

  describe("getMemoryInvoiceTypeLabel", () => {
    it("maps FACTURA_E to e-Factura", () => {
      expect(getMemoryInvoiceTypeLabel("FACTURA_E")).toBe("e-Factura");
    });

    it("maps NOTA_CREDITO to Nota de Crédito", () => {
      expect(getMemoryInvoiceTypeLabel("NOTA_CREDITO")).toBe("Nota de Crédito");
    });

    it("maps TICKET to Ticket", () => {
      expect(getMemoryInvoiceTypeLabel("TICKET")).toBe("Ticket");
    });
  });

  describe("getIvaRateForCategory", () => {
    it("returns 22 for BASICA", () => {
      expect(getIvaRateForCategory("BASICA")).toBe(22);
    });

    it("returns 10 for MINIMA", () => {
      expect(getIvaRateForCategory("MINIMA")).toBe(10);
    });

    it("returns 0 for EXONERADO", () => {
      expect(getIvaRateForCategory("EXONERADO")).toBe(0);
    });

    it("returns 0 for EXPORTACION", () => {
      expect(getIvaRateForCategory("EXPORTACION")).toBe(0);
    });
  });
});
