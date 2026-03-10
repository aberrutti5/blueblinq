import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { scanEmailInbox } from "@/lib/email-scan/imap-scanner";

async function getUserCompanyId(userId: string): Promise<string | null> {
  const membership = await db.companyMembership.findFirst({
    where: { userId, isDefault: true, role: { in: ["ADMIN", "ACCOUNTANT"] } },
    select: { companyId: true },
  });
  return membership?.companyId ?? null;
}

/** POST /api/email-scan/run — trigger inbox scan manually */
export async function POST(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return Response.json({ error: "No autorizado" }, { status: 401 });

  const companyId = await getUserCompanyId((session.user as { id: string }).id);
  if (!companyId)
    return Response.json({ error: "Sin empresa o permiso" }, { status: 403 });

  const company = await db.company.findUnique({
    where: { id: companyId },
    select: { emailScanEnabled: true, emailScanPasswordEncrypted: true },
  });

  if (!company?.emailScanPasswordEncrypted) {
    return Response.json(
      { error: "Configuración IMAP no encontrada. Configurala en Ajustes." },
      { status: 400 }
    );
  }

  try {
    const result = await scanEmailInbox(companyId);
    return Response.json(result);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error desconocido al escanear";
    return Response.json({ error: message }, { status: 500 });
  }
}
