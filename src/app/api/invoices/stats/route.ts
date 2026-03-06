import { NextResponse } from "next/server";
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

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const companyId = await getUserCompanyId(userId);
  if (!companyId) {
    return NextResponse.json({ error: "Sin empresa" }, { status: 400 });
  }

  const grouped = await db.invoice.groupBy({
    by: ["status"],
    where: { companyId },
    _count: true,
  });

  const counts = Object.fromEntries(grouped.map((g) => [g.status, g._count]));

  return NextResponse.json({
    total:
      (counts.PENDING ?? 0) +
      (counts.PROCESSING ?? 0) +
      (counts.EXTRACTED ?? 0) +
      (counts.APPROVED ?? 0) +
      (counts.REJECTED ?? 0) +
      (counts.ERROR ?? 0),
    extracted: counts.EXTRACTED ?? 0,
    approved: counts.APPROVED ?? 0,
    pending: (counts.PENDING ?? 0) + (counts.PROCESSING ?? 0),
    errors: counts.ERROR ?? 0,
  });
}
