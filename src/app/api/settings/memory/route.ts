import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { encrypt, decrypt } from "@/lib/crypto";

async function getAdminCompany(userId: string) {
  return db.companyMembership.findFirst({
    where: { userId, isDefault: true, role: { in: ["ADMIN", "ACCOUNTANT"] } },
    select: { companyId: true, role: true },
  });
}

/** GET /api/settings/memory — returns email (password never sent) */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return Response.json({ error: "No autorizado" }, { status: 401 });

  const membership = await getAdminCompany(
    (session.user as { id: string }).id
  );
  if (!membership)
    return Response.json({ error: "Sin empresa o permiso" }, { status: 403 });

  const company = await db.company.findUnique({
    where: { id: membership.companyId },
    select: { memoryEmail: true, memoryPasswordEncrypted: true },
  });

  return Response.json({
    memoryEmail: company?.memoryEmail ?? null,
    configured: !!company?.memoryPasswordEncrypted,
  });
}

/** PATCH /api/settings/memory — saves or updates Memory credentials */
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return Response.json({ error: "No autorizado" }, { status: 401 });

  const membership = await getAdminCompany(
    (session.user as { id: string }).id
  );
  if (!membership)
    return Response.json({ error: "Sin empresa o permiso" }, { status: 403 });

  let body: { email: string; password: string };
  try {
    body = await request.json();
    if (!body.email || !body.password) throw new Error();
  } catch {
    return Response.json(
      { error: "Se requieren email y password" },
      { status: 400 }
    );
  }

  await db.company.update({
    where: { id: membership.companyId },
    data: {
      memoryEmail: body.email,
      memoryPasswordEncrypted: encrypt(body.password),
    },
  });

  return Response.json({ ok: true });
}

/** Helper used by other routes to get decrypted credentials */
export async function getMemoryCredentials(
  companyId: string
): Promise<{ email: string; password: string } | null> {
  const company = await db.company.findUnique({
    where: { id: companyId },
    select: { memoryEmail: true, memoryPasswordEncrypted: true },
  });

  if (!company?.memoryEmail || !company?.memoryPasswordEncrypted) return null;

  return {
    email: company.memoryEmail,
    password: decrypt(company.memoryPasswordEncrypted),
  };
}
