import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { processInvoiceInBackground } from "@/lib/ai/process-invoice";

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

    // Fire-and-forget: process in background
    processInvoiceInBackground(invoice.id, base64, file.type, companyId);

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error("Invoice upload error:", error);
    return NextResponse.json(
      { error: "Error al procesar la factura" },
      { status: 500 }
    );
  }
}
