import { db } from "@/lib/db";
import { extractInvoiceFromBase64, extractInvoiceFromText } from "@/lib/ai/extract-invoice";
import { extractTextFromPdf } from "@/lib/pdf/extract-text";
import { classifyIva, calculateIvaAmount } from "@/lib/tax/iva-classifier";
import { validateRut } from "@/lib/tax/rut-validator";
import { matchLineItemsToProducts } from "@/lib/products/match-products";

export function processInvoiceInBackground(
  invoiceId: string,
  base64: string,
  mimeType: string,
  companyId: string
) {
  processInvoice(invoiceId, base64, mimeType, companyId).catch((err) => {
    console.error(`[processInvoice] Error for invoice ${invoiceId}:`, err);
  });
}

async function processInvoice(
  invoiceId: string,
  base64: string,
  mimeType: string,
  companyId: string
) {
  try {
    // ─── STEP 1: Extract invoice data ──────────────────────────────
    // For PDFs: try text extraction first (cheap), fall back to vision (expensive)
    // For images: always use vision
    let result;
    let raw;
    let extractionMethod: "TEXT" | "VISION";

    if (mimeType === "application/pdf") {
      const buffer = Buffer.from(base64, "base64");
      const pdfResult = await extractTextFromPdf(buffer);

      if (pdfResult.hasText) {
        // PDF has extractable text — use cheap text-based extraction
        console.log(`[processInvoice] PDF has text (${pdfResult.text.length} chars), using text extraction`);
        const extraction = await extractInvoiceFromText(pdfResult.text);
        result = extraction.result;
        raw = extraction.raw;
        extractionMethod = "TEXT";
      } else {
        // Scanned PDF without text layer — fall back to vision
        console.log(`[processInvoice] PDF is scanned image, falling back to vision`);
        const extraction = await extractInvoiceFromBase64(base64, mimeType);
        result = extraction.result;
        raw = extraction.raw;
        extractionMethod = "VISION";
      }
    } else {
      // Image file — use vision
      const extraction = await extractInvoiceFromBase64(base64, mimeType);
      result = extraction.result;
      raw = extraction.raw;
      extractionMethod = "VISION";
    }

    // ─── STEP 2: Classify IVA for each line item ──────────────────
    const classifiedItems = await Promise.all(
      result.lineItems.map(async (item, index) => {
        const classification = await classifyIva(
          item.description,
          companyId,
          item.ivaIndicator
        );

        // Verify quantity: quantity * unitPrice * (1 - discount/100) should equal lineTotal
        let verifiedQuantity = item.quantity;
        const discount = item.discount ?? 0;
        if (item.unitPrice > 0) {
          const effectivePrice = item.unitPrice * (1 - discount / 100);
          const expectedTotal = item.quantity * effectivePrice;
          const tolerance = 0.02; // allow small rounding differences
          if (Math.abs(expectedTotal - item.lineTotal) > tolerance) {
            // Recalculate the correct quantity from lineTotal
            verifiedQuantity = Math.round((item.lineTotal / effectivePrice) * 10000) / 10000;
          }
        }

        const ivaAmount = calculateIvaAmount(
          item.lineTotal,
          classification.rate
        );
        return {
          lineNumber: index + 1,
          description: item.description,
          quantity: verifiedQuantity,
          unitPrice: item.unitPrice,
          discount,
          lineTotal: item.lineTotal,
          ivaCategory: classification.category,
          ivaRate: classification.rate,
          ivaAmount,
          classifiedBy: classification.method,
        };
      })
    );

    // ─── STEP 3: Resolve vendor ───────────────────────────────────
    let vendorId: string | undefined;
    if (result.vendor.rut) {
      const rutValidation = validateRut(result.vendor.rut);
      if (rutValidation.valid) {
        const existingVendor = await db.vendor.findUnique({
          where: {
            companyId_rut: { companyId, rut: rutValidation.clean },
          },
        });

        if (existingVendor) {
          vendorId = existingVendor.id;
        } else if (result.vendor.name) {
          const newVendor = await db.vendor.create({
            data: {
              companyId,
              name: result.vendor.name,
              rut: rutValidation.clean,
              address: result.vendor.address,
            },
          });
          vendorId = newVendor.id;
        }
      }
    }

    // ─── STEP 4: Match line items to product catalog ──────────────
    const productMatches = await matchLineItemsToProducts(
      classifiedItems.map((item) => ({ description: item.description })),
      companyId,
      vendorId
    );

    // Merge product matches into classified items
    const itemsWithProducts = classifiedItems.map((item, index) => {
      const match = productMatches[index];
      return {
        ...item,
        productId: match?.productId ?? undefined,
        matchedBy: match?.matchedBy ?? undefined,
      };
    });

    // ─── STEP 5: Save to database ─────────────────────────────────
    await db.invoice.update({
      where: { id: invoiceId },
      data: {
        status: "EXTRACTED",
        extractionRaw: raw as object,
        confidence: result.confidence,
        invoiceType: result.invoiceType,
        invoiceNumber: result.invoiceNumber,
        invoiceDate: result.invoiceDate ? new Date(result.invoiceDate) : null,
        dueDate: result.dueDate ? new Date(result.dueDate) : null,
        vendorName: result.vendor.name,
        vendorRut: result.vendor.rut,
        vendorId,
        currency: result.currency,
        subtotal: result.subtotal,
        totalIva: result.totalIva,
        totalAmount: result.totalAmount,
        lineItems: {
          createMany: { data: itemsWithProducts },
        },
      },
    });

    console.log(
      `[processInvoice] Invoice ${invoiceId} extracted via ${extractionMethod}, ` +
      `${itemsWithProducts.filter((i) => i.productId).length}/${itemsWithProducts.length} products matched`
    );
  } catch (error) {
    await db.invoice.update({
      where: { id: invoiceId },
      data: {
        status: "ERROR",
        extractionError:
          error instanceof Error
            ? error.message
            : "Error desconocido en la extracción",
      },
    });
  }
}
