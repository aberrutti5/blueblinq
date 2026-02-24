import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const userId = (session.user as { id: string }).id;

  const invoice = await db.invoice.update({
    where: { id },
    data: {
      status: "APPROVED",
      reviewedBy: userId,
      reviewedAt: new Date(),
    },
    include: { lineItems: true },
  });

  return NextResponse.json(invoice);
}
