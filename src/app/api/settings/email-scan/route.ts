import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { encrypt, decrypt } from "@/lib/crypto";

async function getAdminCompany(userId: string) {
  return db.companyMembership.findFirst({
    where: { userId, isDefault: true, role: { in: ["ADMIN", "ACCOUNTANT"] } },
    select: { companyId: true },
  });
}

/** GET /api/settings/email-scan — returns current config (password never sent) */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return Response.json({ error: "No autorizado" }, { status: 401 });

  const membership = await getAdminCompany((session.user as { id: string }).id);
  if (!membership)
    return Response.json({ error: "Sin empresa o permiso" }, { status: 403 });

  const company = await db.company.findUnique({
    where: { id: membership.companyId },
    select: {
      emailScanHost: true,
      emailScanPort: true,
      emailScanUser: true,
      emailScanPasswordEncrypted: true,
      emailScanFolder: true,
      emailScanEnabled: true,
      emailScanLastRun: true,
    },
  });

  return Response.json({
    host: company?.emailScanHost ?? null,
    port: company?.emailScanPort ?? null,
    user: company?.emailScanUser ?? null,
    folder: company?.emailScanFolder ?? "INBOX",
    enabled: company?.emailScanEnabled ?? false,
    lastRun: company?.emailScanLastRun ?? null,
    configured: !!company?.emailScanPasswordEncrypted,
  });
}

/** PATCH /api/settings/email-scan — save or update IMAP config */
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return Response.json({ error: "No autorizado" }, { status: 401 });

  const membership = await getAdminCompany((session.user as { id: string }).id);
  if (!membership)
    return Response.json({ error: "Sin empresa o permiso" }, { status: 403 });

  let body: {
    host: string;
    port: number;
    user: string;
    password?: string;
    folder?: string;
    enabled?: boolean;
  };

  try {
    body = await request.json();
    if (!body.host || !body.port || !body.user) throw new Error();
  } catch {
    return Response.json(
      { error: "Se requieren host, port y user" },
      { status: 400 }
    );
  }

  // If no new password provided, keep existing one
  let encryptedPassword: string | undefined;
  if (body.password) {
    encryptedPassword = encrypt(body.password);
  } else {
    const existing = await db.company.findUnique({
      where: { id: membership.companyId },
      select: { emailScanPasswordEncrypted: true },
    });
    if (!existing?.emailScanPasswordEncrypted) {
      return Response.json(
        { error: "Se requiere contraseña en la configuración inicial" },
        { status: 400 }
      );
    }
    encryptedPassword = existing.emailScanPasswordEncrypted;
  }

  await db.company.update({
    where: { id: membership.companyId },
    data: {
      emailScanHost: body.host,
      emailScanPort: body.port,
      emailScanUser: body.user,
      emailScanPasswordEncrypted: encryptedPassword,
      emailScanFolder: body.folder ?? "INBOX",
      emailScanEnabled: body.enabled ?? false,
    },
  });

  return Response.json({ ok: true });
}

/** Helper used by other routes to get decrypted IMAP credentials */
export async function getEmailScanCredentials(
  companyId: string
): Promise<{
  host: string;
  port: number;
  user: string;
  password: string;
  folder: string;
} | null> {
  const company = await db.company.findUnique({
    where: { id: companyId },
    select: {
      emailScanHost: true,
      emailScanPort: true,
      emailScanUser: true,
      emailScanPasswordEncrypted: true,
      emailScanFolder: true,
    },
  });

  if (
    !company?.emailScanHost ||
    !company.emailScanPort ||
    !company.emailScanUser ||
    !company.emailScanPasswordEncrypted
  )
    return null;

  return {
    host: company.emailScanHost,
    port: company.emailScanPort,
    user: company.emailScanUser,
    password: decrypt(company.emailScanPasswordEncrypted),
    folder: company.emailScanFolder ?? "INBOX",
  };
}
