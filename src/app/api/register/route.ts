import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { z } from "zod";
import { validateRut } from "@/lib/tax/rut-validator";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  companyName: z.string().min(2),
  companyRut: z.string().min(12).max(12),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    const rutValidation = validateRut(data.companyRut);
    const isDev = process.env.NODE_ENV === "development";
    if (!rutValidation.valid && !isDev) {
      return NextResponse.json(
        { error: "RUT de empresa inválido" },
        { status: 400 }
      );
    }

    const existingUser = await db.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Ya existe un usuario con ese email" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await db.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
      },
    });

    const company = await db.company.create({
      data: {
        name: data.companyName,
        rut: rutValidation.clean || data.companyRut.replace(/\D/g, ""),
      },
    });

    await db.companyMembership.create({
      data: {
        userId: user.id,
        companyId: company.id,
        role: "ADMIN",
        isDefault: true,
      },
    });

    return NextResponse.json(
      { message: "Usuario creado exitosamente" },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", detail: String(error) },
      { status: 500 }
    );
  }
}
