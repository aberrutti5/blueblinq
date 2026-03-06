import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { enqueueJobs, getAllJobs } from "@/lib/memory-rpa/queue";
import { getMemoryCredentials } from "@/app/api/settings/memory/route";

async function getMembership(userId: string) {
  return db.companyMembership.findFirst({
    where: { userId, isDefault: true, role: { in: ["ADMIN", "ACCOUNTANT"] } },
    select: { companyId: true },
  });
}

/**
 * POST /api/invoices/memory-sync/batch
 * Body: { invoiceIds: string[] }
 * Enqueues all APPROVED invoices using stored Memory credentials.
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return Response.json({ error: "No autorizado" }, { status: 401 });

  const membership = await getMembership(
    (session.user as { id: string }).id
  );
  if (!membership)
    return Response.json({ error: "Sin empresa o permiso" }, { status: 403 });

  const credentials = await getMemoryCredentials(membership.companyId);
  if (!credentials) {
    return Response.json(
      {
        error:
          "No hay credenciales de Memory configuradas. Configurálas en Ajustes.",
      },
      { status: 400 }
    );
  }

  let body: { invoiceIds: string[] };
  try {
    body = await request.json();
    if (!Array.isArray(body.invoiceIds) || body.invoiceIds.length === 0)
      throw new Error();
  } catch {
    return Response.json(
      { error: "Se requiere invoiceIds (array no vacío)" },
      { status: 400 }
    );
  }

  // Verify all invoices belong to this company and are APPROVED
  const invoices = await db.invoice.findMany({
    where: {
      id: { in: body.invoiceIds },
      companyId: membership.companyId,
      status: "APPROVED",
    },
    select: { id: true },
  });

  if (invoices.length === 0) {
    return Response.json(
      { error: "No se encontraron facturas aprobadas para sincronizar" },
      { status: 400 }
    );
  }

  const validIds = invoices.map((inv) => inv.id);
  const skipped = body.invoiceIds.filter((id) => !validIds.includes(id));

  const jobIds = enqueueJobs(validIds, credentials);

  return Response.json(
    {
      enqueued: validIds.length,
      skipped: skipped.length,
      jobIds,
    },
    { status: 202 }
  );
}

/**
 * GET /api/invoices/memory-sync/batch
 * Returns all jobs (active and completed).
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return Response.json({ error: "No autorizado" }, { status: 401 });

  return Response.json({ jobs: getAllJobs() });
}
