import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

async function getUserCompanyId(userId: string): Promise<string | null> {
  const membership = await db.companyMembership.findFirst({
    where: { userId, isDefault: true },
    select: { companyId: true },
  });
  return membership?.companyId ?? null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const companyId = await getUserCompanyId(userId);
  if (!companyId) {
    return NextResponse.json(
      { error: "Sin empresa asociada" },
      { status: 400 }
    );
  }

  const { id } = await params;

  const invoice = await db.invoice.findUnique({
    where: { id },
    include: {
      lineItems: { orderBy: { lineNumber: "asc" } },
      vendor: true,
    },
  });

  if (!invoice) {
    return NextResponse.json(
      { error: "Factura no encontrada" },
      { status: 404 }
    );
  }

  if (invoice.companyId !== companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  return NextResponse.json(invoice);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const companyId = await getUserCompanyId(userId);
  if (!companyId) {
    return NextResponse.json(
      { error: "Sin empresa asociada" },
      { status: 400 }
    );
  }

  const { id } = await params;
  const body = await req.json();

  const existing = await db.invoice.findUnique({
    where: { id },
    select: { companyId: true },
  });

  if (!existing) {
    return NextResponse.json(
      { error: "Factura no encontrada" },
      { status: 404 }
    );
  }

  if (existing.companyId !== companyId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const invoice = await db.invoice.update({
    where: { id },
    data: body,
    include: { lineItems: true },
  });

  return NextResponse.json(invoice);
}
