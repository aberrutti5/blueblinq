import type { Page } from "playwright";
import type { MemoryInvoiceInput, MemoryLineItemInput } from "../types";
import { getMemoryInvoiceTypeLabel } from "../mapper";

// ─── Selectors (TODO: update with real Memory selectors) ────────
const SELECTORS = {
  // Navigation
  purchasesMenu: '.menu-compras, [data-menu="compras"], a[href*="compras"]',
  newInvoiceButton: '.btn-nueva-factura, [data-action="new-invoice"]',

  // General data
  vendorSearch: '#proveedor-search, input[name="vendor"], .vendor-input',
  vendorRutInput: '#proveedor-rut, input[name="vendorRut"]',
  invoiceTypeSelect: '#tipo-comprobante, select[name="invoiceType"]',
  invoiceNumberInput: '#numero-factura, input[name="invoiceNumber"]',
  invoiceDateInput: '#fecha, input[name="invoiceDate"], input[type="date"]',
  dueDateInput: '#vencimiento, input[name="dueDate"]',
  currencySelect: '#moneda, select[name="currency"]',

  // Line items
  addLineButton: '.btn-agregar-linea, [data-action="add-line"], .add-item-btn',
  lineDescriptionInput: '.line-description, input[name="description"]',
  lineQuantityInput: '.line-quantity, input[name="quantity"]',
  lineUnitPriceInput: '.line-unit-price, input[name="unitPrice"]',
  lineIvaSelect: '.line-iva, select[name="ivaCategory"]',
  lineConfirmButton: '.line-confirm, .btn-confirm-line',

  // Actions
  saveButton: '.btn-guardar, button[type="submit"], #save-invoice',
  confirmDialog: ".confirm-dialog, .modal-confirm",
  confirmYesButton: ".confirm-yes, .btn-confirm",

  // Results
  successMessage: ".success-message, .alert-success",
  errorMessage: ".error-message, .alert-danger",
} as const;

const MEMORY_BASE_URL =
  process.env.MEMORY_BASE_URL ?? "https://app.memory.com.uy";

const DEFAULT_TIMEOUT = 10_000;
const LINE_ITEM_DELAY = 500; // ms between line items to let UI settle

export class PurchaseInvoicePage {
  constructor(private page: Page) {}

  async navigateToNew(): Promise<void> {
    // Navigate to purchases section
    await this.page.click(SELECTORS.purchasesMenu);
    await this.page.waitForSelector(SELECTORS.newInvoiceButton, {
      timeout: DEFAULT_TIMEOUT,
    });
    await this.page.click(SELECTORS.newInvoiceButton);
    await this.page.waitForSelector(SELECTORS.vendorSearch, {
      timeout: DEFAULT_TIMEOUT,
    });
  }

  async fillGeneralData(invoice: MemoryInvoiceInput): Promise<void> {
    // Vendor
    await this.page.fill(SELECTORS.vendorSearch, invoice.vendorName);
    await this.page.waitForTimeout(300); // wait for autocomplete
    // Try clicking first autocomplete result, fallback to manual RUT entry
    try {
      await this.page.click(".autocomplete-item:first-child", {
        timeout: 3_000,
      });
    } catch {
      // Vendor not found in autocomplete, fill RUT manually
      const rutInput = await this.page.$(SELECTORS.vendorRutInput);
      if (rutInput) {
        await rutInput.fill(invoice.vendorRut);
      }
    }

    // Invoice type
    const typeLabel = getMemoryInvoiceTypeLabel(invoice.invoiceType);
    await this.page.selectOption(SELECTORS.invoiceTypeSelect, {
      label: typeLabel,
    });

    // Invoice number
    await this.page.fill(SELECTORS.invoiceNumberInput, invoice.invoiceNumber);

    // Date
    await this.page.fill(SELECTORS.invoiceDateInput, invoice.invoiceDate);

    // Due date (optional)
    if (invoice.dueDate) {
      await this.page.fill(SELECTORS.dueDateInput, invoice.dueDate);
    }

    // Currency
    await this.page.selectOption(SELECTORS.currencySelect, {
      label: invoice.currency,
    });
  }

  async addLineItem(
    item: MemoryLineItemInput,
    index: number
  ): Promise<void> {
    if (index > 0) {
      await this.page.click(SELECTORS.addLineButton);
      await this.page.waitForTimeout(LINE_ITEM_DELAY);
    }

    // Use nth selectors for multiple line rows
    const nthSuffix = index > 0 ? `:nth-of-type(${index + 1})` : "";

    const descSelector = `${SELECTORS.lineDescriptionInput}${nthSuffix}`;
    const qtySelector = `${SELECTORS.lineQuantityInput}${nthSuffix}`;
    const priceSelector = `${SELECTORS.lineUnitPriceInput}${nthSuffix}`;
    const ivaSelector = `${SELECTORS.lineIvaSelect}${nthSuffix}`;

    await this.page.fill(descSelector, item.description);
    await this.page.fill(qtySelector, item.quantity.toString());
    await this.page.fill(priceSelector, item.unitPrice.toString());

    // Map IVA category to Memory's label
    const ivaLabel = this.getIvaLabel(item.ivaCategory);
    await this.page.selectOption(ivaSelector, { label: ivaLabel });

    // Confirm line if there's a confirm button per line
    const confirmBtn = await this.page.$(SELECTORS.lineConfirmButton);
    if (confirmBtn) {
      await confirmBtn.click();
      await this.page.waitForTimeout(LINE_ITEM_DELAY);
    }
  }

  async save(): Promise<void> {
    await this.page.click(SELECTORS.saveButton);

    // Handle confirmation dialog if it appears
    try {
      await this.page.waitForSelector(SELECTORS.confirmDialog, {
        timeout: 3_000,
      });
      await this.page.click(SELECTORS.confirmYesButton);
    } catch {
      // No confirmation dialog — that's fine
    }

    // Wait for result
    await Promise.race([
      this.page.waitForSelector(SELECTORS.successMessage, {
        timeout: DEFAULT_TIMEOUT,
      }),
      this.page.waitForSelector(SELECTORS.errorMessage, {
        timeout: DEFAULT_TIMEOUT,
      }),
    ]);
  }

  async getConfirmation(): Promise<{ success: boolean; message: string }> {
    const successEl = await this.page.$(SELECTORS.successMessage);
    if (successEl) {
      const msg = (await successEl.textContent()) ?? "Saved successfully";
      return { success: true, message: msg };
    }

    const errorEl = await this.page.$(SELECTORS.errorMessage);
    if (errorEl) {
      const msg = (await errorEl.textContent()) ?? "Unknown error";
      return { success: false, message: msg };
    }

    return { success: false, message: "No confirmation message found" };
  }

  async takeScreenshot(path: string): Promise<void> {
    await this.page.screenshot({ path, fullPage: true });
  }

  private getIvaLabel(category: string): string {
    // TODO: map to exact Memory dropdown labels
    const labels: Record<string, string> = {
      BASICA: "IVA Básica (22%)",
      MINIMA: "IVA Mínima (10%)",
      EXPORTACION: "Exportación (0%)",
      EXONERADO: "Exonerado",
    };
    return labels[category] ?? category;
  }
}
