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

function escapeCsvField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new Response(JSON.stringify({ error: "No autorizado" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const userId = (session.user as { id: string }).id;
  const companyId = await getUserCompanyId(userId);
  if (!companyId) {
    return new Response(JSON.stringify({ error: "Sin empresa" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const invoices = await db.invoice.findMany({
    where: { companyId },
    orderBy: { invoiceDate: "desc" },
    select: {
      invoiceNumber: true,
      invoiceDate: true,
      vendorName: true,
      vendorRut: true,
      invoiceType: true,
      subtotal: true,
      totalIva: true,
      totalAmount: true,
      currency: true,
      status: true,
    },
  });

  const header = "Numero,Fecha,Proveedor,RUT Proveedor,Tipo,Subtotal,IVA,Total,Moneda,Estado";

  const rows = invoices.map((inv) => {
    const numero = escapeCsvField(inv.invoiceNumber ?? "");
    const fecha = inv.invoiceDate
      ? inv.invoiceDate.toISOString().split("T")[0]
      : "";
    const proveedor = escapeCsvField(inv.vendorName ?? "");
    const rut = escapeCsvField(inv.vendorRut ?? "");
    const tipo = escapeCsvField(inv.invoiceType ?? "");
    const subtotal = inv.subtotal != null ? inv.subtotal.toString() : "";
    const iva = inv.totalIva != null ? inv.totalIva.toString() : "";
    const total = inv.totalAmount != null ? inv.totalAmount.toString() : "";
    const moneda = escapeCsvField(inv.currency);
    const estado = escapeCsvField(inv.status);

    return [numero, fecha, proveedor, rut, tipo, subtotal, iva, total, moneda, estado].join(",");
  });

  const csvContent = [header, ...rows].join("\r\n");

  return new Response(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="facturas.csv"',
    },
  });
}
