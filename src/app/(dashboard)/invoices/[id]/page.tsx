import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import InvoiceDetailClient from "./InvoiceDetailClient";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as { id: string }).id;
  const membership = await db.companyMembership.findFirst({
    where: { userId, isDefault: true },
    select: { companyId: true },
  });
  if (!membership) redirect("/invoices");

  const { id } = await params;
  const invoice = await db.invoice.findUnique({
    where: { id },
    include: { lineItems: { orderBy: { lineNumber: "asc" } } },
  });

  if (!invoice || invoice.companyId !== membership.companyId) notFound();

  // Serialize Decimal fields to strings for the client component
  const serialized = {
    id: invoice.id,
    fileUrl: invoice.fileUrl,
    fileName: invoice.fileName,
    fileType: invoice.fileType,
    status: invoice.status,
    invoiceType: invoice.invoiceType,
    invoiceNumber: invoice.invoiceNumber,
    invoiceDate: invoice.invoiceDate?.toISOString() ?? null,
    vendorName: invoice.vendorName,
    vendorRut: invoice.vendorRut,
    currency: invoice.currency,
    subtotal: invoice.subtotal?.toString() ?? null,
    totalIva: invoice.totalIva?.toString() ?? null,
    totalAmount: invoice.totalAmount?.toString() ?? null,
    confidence: invoice.confidence,
    extractionError: invoice.extractionError,
    lineItems: invoice.lineItems.map((item) => ({
      id: item.id,
      lineNumber: item.lineNumber,
      description: item.description,
      quantity: item.quantity.toString(),
      unitPrice: item.unitPrice.toString(),
      lineTotal: item.lineTotal.toString(),
      ivaCategory: item.ivaCategory,
      ivaRate: item.ivaRate.toString(),
      ivaAmount: item.ivaAmount.toString(),
      classifiedBy: item.classifiedBy,
    })),
  };

  return <InvoiceDetailClient initialInvoice={serialized} />;
}
