import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Prisma
vi.mock("@/lib/db", () => ({
  db: {
    invoice: {
      findUnique: vi.fn(),
    },
  },
}));

// Mock browser module
vi.mock("../browser", () => ({
  createContext: vi.fn(),
  closeBrowser: vi.fn(),
  getScreenshotsDir: vi.fn(() => "/tmp/test-screenshots"),
}));

// Mock page objects
const mockLoginNavigate = vi.fn();
const mockLoginLogin = vi.fn();
const mockLoginIsLoggedIn = vi.fn(() => true);
const mockLoginScreenshot = vi.fn();
const mockInvoiceNavigateToNew = vi.fn();
const mockInvoiceFillGeneralData = vi.fn();
const mockInvoiceAddLineItem = vi.fn();
const mockInvoiceSave = vi.fn();
const mockInvoiceGetConfirmation = vi.fn(() => ({
  success: true,
  message: "Guardado",
}));
const mockInvoiceScreenshot = vi.fn();

vi.mock("../pages/login.page", () => ({
  LoginPage: vi.fn().mockImplementation(() => ({
    navigate: mockLoginNavigate,
    login: mockLoginLogin,
    isLoggedIn: mockLoginIsLoggedIn,
    takeScreenshot: mockLoginScreenshot,
  })),
}));

vi.mock("../pages/purchase-invoice.page", () => ({
  PurchaseInvoicePage: vi.fn().mockImplementation(() => ({
    navigateToNew: mockInvoiceNavigateToNew,
    fillGeneralData: mockInvoiceFillGeneralData,
    addLineItem: mockInvoiceAddLineItem,
    save: mockInvoiceSave,
    getConfirmation: mockInvoiceGetConfirmation,
    takeScreenshot: mockInvoiceScreenshot,
  })),
}));

import { db } from "@/lib/db";
import { createContext } from "../browser";
import { executeInvoiceEntry } from "../executor";

const mockPage = {
  screenshot: vi.fn(),
};

const mockContext = {
  newPage: vi.fn(() => mockPage),
  close: vi.fn(),
};

describe("executor", () => {
  const credentials = {
    email: "test@memory.com",
    password: "password123",
  };

  const mockInvoice = {
    id: "inv-123",
    status: "APPROVED",
    invoiceType: "FACTURA_E",
    invoiceNumber: "A-001-0001234",
    invoiceDate: new Date("2026-02-15"),
    dueDate: null,
    vendorName: "Test Vendor",
    vendorRut: "211234560019",
    currency: "UYU",
    subtotal: { toNumber: () => 1000 },
    totalIva: { toNumber: () => 220 },
    totalAmount: { toNumber: () => 1220 },
    lineItems: [
      {
        lineNumber: 1,
        description: "Producto A",
        quantity: { toNumber: () => 1 },
        unitPrice: { toNumber: () => 1000 },
        lineTotal: { toNumber: () => 1000 },
        ivaCategory: "BASICA",
        ivaRate: { toNumber: () => 22 },
        ivaAmount: { toNumber: () => 220 },
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createContext).mockResolvedValue(mockContext as never);
    vi.mocked(db.invoice.findUnique).mockResolvedValue(mockInvoice as never);
  });

  it("executes full flow successfully", async () => {
    const result = await executeInvoiceEntry("inv-123", credentials);

    expect(result.status).toBe("SUCCESS");
    expect(result.invoiceId).toBe("inv-123");
    expect(result.steps.length).toBeGreaterThan(0);
    expect(result.steps.every((s) => s.status === "ok")).toBe(true);

    // Verify flow order
    expect(mockLoginNavigate).toHaveBeenCalled();
    expect(mockLoginLogin).toHaveBeenCalledWith(credentials);
    expect(mockInvoiceNavigateToNew).toHaveBeenCalled();
    expect(mockInvoiceFillGeneralData).toHaveBeenCalled();
    expect(mockInvoiceAddLineItem).toHaveBeenCalledTimes(1);
    expect(mockInvoiceSave).toHaveBeenCalled();
    expect(mockInvoiceGetConfirmation).toHaveBeenCalled();
  });

  it("captures screenshots at key steps", async () => {
    const result = await executeInvoiceEntry("inv-123", credentials);

    expect(result.status).toBe("SUCCESS");
    const screenshotSteps = result.steps.filter((s) => s.screenshotPath);
    expect(screenshotSteps.length).toBeGreaterThanOrEqual(3); // login, general, lines, save
  });

  it("fails when invoice not found", async () => {
    vi.mocked(db.invoice.findUnique).mockResolvedValue(null);

    const result = await executeInvoiceEntry("inv-999", credentials);

    expect(result.status).toBe("FAILED");
    expect(result.error).toContain("not found");
  });

  it("fails when invoice is not APPROVED", async () => {
    vi.mocked(db.invoice.findUnique).mockResolvedValue({
      ...mockInvoice,
      status: "PENDING",
    } as never);

    const result = await executeInvoiceEntry("inv-123", credentials);

    expect(result.status).toBe("FAILED");
    expect(result.error).toContain("APPROVED");
  });

  it("fails and captures error screenshot when save fails", async () => {
    mockInvoiceGetConfirmation.mockReturnValueOnce({
      success: false,
      message: "Error de Memory",
    });

    const result = await executeInvoiceEntry("inv-123", credentials);

    expect(result.status).toBe("FAILED");
    expect(result.error).toContain("Memory save failed");
  });

  it("cleans up browser context even on error", async () => {
    mockLoginLogin.mockRejectedValueOnce(new Error("Login timeout"));

    const result = await executeInvoiceEntry("inv-123", credentials);

    expect(result.status).toBe("FAILED");
    expect(mockContext.close).toHaveBeenCalled();
  });

  it("handles multiple line items", async () => {
    const multiLineInvoice = {
      ...mockInvoice,
      lineItems: [
        mockInvoice.lineItems[0],
        {
          ...mockInvoice.lineItems[0],
          lineNumber: 2,
          description: "Producto B",
        },
        {
          ...mockInvoice.lineItems[0],
          lineNumber: 3,
          description: "Producto C",
        },
      ],
    };
    vi.mocked(db.invoice.findUnique).mockResolvedValue(
      multiLineInvoice as never
    );

    const result = await executeInvoiceEntry("inv-123", credentials);

    expect(result.status).toBe("SUCCESS");
    expect(mockInvoiceAddLineItem).toHaveBeenCalledTimes(3);
  });
});
