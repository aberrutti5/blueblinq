import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { extractInvoiceFromBase64 } from "@/lib/ai/extract-invoice";
import { classifyIva, calculateIvaAmount } from "@/lib/tax/iva-classifier";
import { validateRut } from "@/lib/tax/rut-validator";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

async function getUserCompanyId(userId: string): Promise<string | null> {
  const membership = await db.companyMembership.findFirst({
    where: { userId, isDefault: true },
    select: { companyId: true },
  });
  return membership?.companyId ?? null;
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const companyId = await getUserCompanyId(userId);
  if (!companyId) {
    return NextResponse.json({ error: "Sin empresa" }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");

  const where = {
    companyId,
    ...(status ? { status: status as never } : {}),
  };

  const [invoices, total] = await Promise.all([
    db.invoice.findMany({
      where,
      include: { lineItems: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.invoice.count({ where }),
  ]);

  return NextResponse.json({ invoices, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const companyId = await getUserCompanyId(userId);
  if (!companyId) {
    return NextResponse.json({ error: "Sin empresa" }, { status: 400 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó archivo" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
      return NextResponse.json(
        { error: "Tipo de archivo no permitido. Usá JPG, PNG, WebP o PDF." },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    // Store file as base64 data URL for now (MVP - in production use S3/Blob)
    const fileUrl = `data:${file.type};base64,${base64}`;

    // Create invoice record
    const invoice = await db.invoice.create({
      data: {
        companyId,
        fileUrl,
        fileName: file.name,
        fileType: file.type,
        fileSizeBytes: file.size,
        status: "PROCESSING",
      },
    });

    try {
      // Run AI extraction
      const { result, raw } = await extractInvoiceFromBase64(
        base64,
        file.type
      );

      // Classify IVA for each line item
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

      // Match or create vendor
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

      // Update invoice with extracted data
      await db.invoice.update({
        where: { id: invoice.id },
        data: {
          status: "EXTRACTED",
          extractionRaw: raw as object,
          confidence: result.confidence,
          invoiceType: result.invoiceType,
          invoiceNumber: result.invoiceNumber,
          invoiceDate: result.invoiceDate
            ? new Date(result.invoiceDate)
            : null,
          dueDate: result.dueDate ? new Date(result.dueDate) : null,
          vendorName: result.vendor.name,
          vendorRut: result.vendor.rut,
          vendorId,
          currency: result.currency,
          subtotal: result.subtotal,
          totalIva: result.totalIva,
          totalAmount: result.totalAmount,
          lineItems: {
            createMany: {
              data: classifiedItems,
            },
          },
        },
      });

      const updatedInvoice = await db.invoice.findUnique({
        where: { id: invoice.id },
        include: { lineItems: true },
      });

      return NextResponse.json(updatedInvoice, { status: 201 });
    } catch (extractionError) {
      // Mark as error if AI extraction fails
      await db.invoice.update({
        where: { id: invoice.id },
        data: {
          status: "ERROR",
          extractionError:
            extractionError instanceof Error
              ? extractionError.message
              : "Error desconocido en la extracción",
        },
      });

      return NextResponse.json(
        {
          error: "Error en la extracción de datos",
          invoiceId: invoice.id,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Invoice upload error:", error);
    return NextResponse.json(
      { error: "Error al procesar la factura" },
      { status: 500 }
    );
  }
}
