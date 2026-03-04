import { db } from "@/lib/db";
import { extractInvoiceFromBase64 } from "@/lib/ai/extract-invoice";
import { classifyIva, calculateIvaAmount } from "@/lib/tax/iva-classifier";
import { validateRut } from "@/lib/tax/rut-validator";

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
    const { result, raw } = await extractInvoiceFromBase64(base64, mimeType);

    const classifiedItems = await Promise.all(
      result.lineItems.map(async (item, index) => {
        const classification = await classifyIva(
          item.description,
          companyId,
          item.ivaIndicator
        );
        const ivaAmount = calculateIvaAmount(
          item.lineTotal,
          classification.rate
        );
        return {
          lineNumber: index + 1,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: item.lineTotal,
          ivaCategory: classification.category,
          ivaRate: classification.rate,
          ivaAmount,
          classifiedBy: classification.method,
        };
      })
    );

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
          createMany: { data: classifiedItems },
        },
      },
    });
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
