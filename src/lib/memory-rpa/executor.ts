import { join } from "path";
import { db } from "@/lib/db";
import { createContext, closeBrowser, getScreenshotsDir } from "./browser";
import { mapInvoiceToMemoryInput } from "./mapper";
import { LoginPage } from "./pages/login.page";
import { PurchaseInvoicePage } from "./pages/purchase-invoice.page";
import type {
  MemoryCredentials,
  RpaJobResult,
  RpaStepLog,
} from "./types";

function logStep(
  steps: RpaStepLog[],
  step: string,
  status: "ok" | "error",
  extra?: { screenshotPath?: string; error?: string }
): void {
  steps.push({
    step,
    status,
    timestamp: new Date(),
    ...extra,
  });
}

/**
 * Executes the full RPA flow to enter an invoice into Memory.
 * Each step is logged and screenshots are taken for auditing.
 */
export async function executeInvoiceEntry(
  invoiceId: string,
  credentials: MemoryCredentials
): Promise<RpaJobResult> {
  const result: RpaJobResult = {
    jobId: crypto.randomUUID(),
    invoiceId,
    status: "RUNNING",
    steps: [],
    startedAt: new Date(),
  };

  let context = null;
  let page = null;

  try {
    // Step 1: Fetch invoice from DB
    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId },
      include: { lineItems: { orderBy: { lineNumber: "asc" } } },
    });

    if (!invoice) {
      throw new Error(`Invoice ${invoiceId} not found`);
    }
    if (invoice.status !== "APPROVED") {
      throw new Error(
        `Invoice must be APPROVED for Memory sync (current: ${invoice.status})`
      );
    }
    logStep(result.steps, "fetch-invoice", "ok");

    // Step 2: Map to Memory format
    const memoryInput = mapInvoiceToMemoryInput({
      ...invoice,
      lineItems: invoice.lineItems,
      subtotal: invoice.subtotal,
      totalIva: invoice.totalIva,
      totalAmount: invoice.totalAmount,
    });
    logStep(result.steps, "map-invoice", "ok");

    // Step 3: Launch browser
    context = await createContext();
    page = await context.newPage();
    logStep(result.steps, "launch-browser", "ok");

    const screenshotsDir = getScreenshotsDir();

    // Step 4: Login
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(credentials);
    const loginScreenshot = join(screenshotsDir, `${result.jobId}-login.png`);
    await loginPage.takeScreenshot(loginScreenshot);
    logStep(result.steps, "login", "ok", { screenshotPath: loginScreenshot });

    // Step 5: Navigate to new purchase invoice
    const invoicePage = new PurchaseInvoicePage(page);
    await invoicePage.navigateToNew();
    logStep(result.steps, "navigate-to-new-invoice", "ok");

    // Step 6: Fill general data
    await invoicePage.fillGeneralData(memoryInput);
    const generalScreenshot = join(
      screenshotsDir,
      `${result.jobId}-general.png`
    );
    await invoicePage.takeScreenshot(generalScreenshot);
    logStep(result.steps, "fill-general-data", "ok", {
      screenshotPath: generalScreenshot,
    });

    // Step 7: Add line items one by one
    for (let i = 0; i < memoryInput.lineItems.length; i++) {
      const item = memoryInput.lineItems[i];
      await invoicePage.addLineItem(item, i);
      logStep(result.steps, `add-line-item-${i + 1}`, "ok");
    }

    const linesScreenshot = join(
      screenshotsDir,
      `${result.jobId}-lines.png`
    );
    await invoicePage.takeScreenshot(linesScreenshot);
    logStep(result.steps, "all-line-items-added", "ok", {
      screenshotPath: linesScreenshot,
    });

    // Step 8: Save
    await invoicePage.save();
    const confirmation = await invoicePage.getConfirmation();

    const saveScreenshot = join(screenshotsDir, `${result.jobId}-save.png`);
    await invoicePage.takeScreenshot(saveScreenshot);

    if (!confirmation.success) {
      throw new Error(`Memory save failed: ${confirmation.message}`);
    }

    logStep(result.steps, "save-invoice", "ok", {
      screenshotPath: saveScreenshot,
    });

    result.status = "SUCCESS";
    result.completedAt = new Date();
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    const lastStep = result.steps.at(-1)?.step ?? "unknown";
    logStep(result.steps, `error-after-${lastStep}`, "error", {
      error: errorMsg,
    });
    result.status = "FAILED";
    result.error = errorMsg;
    result.completedAt = new Date();

    // Try to capture error screenshot
    if (page) {
      try {
        const errScreenshot = join(
          getScreenshotsDir(),
          `${result.jobId}-error.png`
        );
        await page.screenshot({ path: errScreenshot, fullPage: true });
      } catch {
        // Screenshot failed — ignore
      }
    }
  } finally {
    if (context) {
      await context.close();
    }
  }

  return result;
}
