import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { enqueueJob, getJobStatus } from "@/lib/memory-rpa/queue";
import type { MemoryCredentials } from "@/lib/memory-rpa/types";

async function getUserRole(
  userId: string
): Promise<{ companyId: string; role: string } | null> {
  const membership = await db.companyMembership.findFirst({
    where: { userId, isDefault: true },
    select: { companyId: true, role: true },
  });
  return membership ?? null;
}

/**
 * POST /api/invoices/[id]/memory-sync
 * Enqueues an RPA job to enter the invoice into Memory.
 * Body: { email: string, password: string, companyId?: string }
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const membership = await getUserRole(userId);
  if (!membership) {
    return Response.json({ error: "Sin empresa" }, { status: 400 });
  }

  if (membership.role !== "ADMIN" && membership.role !== "ACCOUNTANT") {
    return Response.json(
      { error: "Se requiere rol ADMIN o ACCOUNTANT" },
      { status: 403 }
    );
  }

  const { id: invoiceId } = await params;

  // Verify invoice belongs to user's company and is approved
  const invoice = await db.invoice.findFirst({
    where: { id: invoiceId, companyId: membership.companyId },
    select: { id: true, status: true },
  });

  if (!invoice) {
    return Response.json({ error: "Factura no encontrada" }, { status: 404 });
  }
  if (invoice.status !== "APPROVED") {
    return Response.json(
      { error: "La factura debe estar aprobada para sincronizar con Memory" },
      { status: 400 }
    );
  }

  let body: MemoryCredentials;
  try {
    body = await request.json();
    if (!body.email || !body.password) {
      throw new Error("Missing credentials");
    }
  } catch {
    return Response.json(
      { error: "Se requieren credenciales de Memory (email, password)" },
      { status: 400 }
    );
  }

  const jobId = enqueueJob(invoiceId, body);

  return Response.json({ jobId, status: "PENDING" }, { status: 202 });
}

/**
 * GET /api/invoices/[id]/memory-sync?jobId=xxx
 * Returns the status of an RPA job.
 */
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("jobId");

  if (!jobId) {
    return Response.json(
      { error: "Se requiere jobId como query parameter" },
      { status: 400 }
    );
  }

  const status = getJobStatus(jobId);
  if (!status) {
    return Response.json({ error: "Job no encontrado" }, { status: 404 });
  }

  return Response.json(status);
}
