/**
 * Script de setup para testing: crea empresa de prueba y la vincula al usuario.
 * Uso: npx tsx prisma/setup-test-company.ts
 */
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const TEST_EMAIL = "berruttiagus5@gmail.com";

async function main() {
  let user = await prisma.user.findUnique({ where: { email: TEST_EMAIL } });
  if (!user) {
    // bcrypt hash de "test1234"
    const { createHash } = await import("crypto");
    user = await prisma.user.create({
      data: {
        email: TEST_EMAIL,
        name: "Agus Test",
        // Hash bcrypt generado para "test1234" — cámbialo si querés otra contraseña
        passwordHash: "$2b$10$rxQBTzMljs22NT3YIrq5keOGXV5memzimw81y1fIxcKdDFFf1.pZ6",
      },
    });
    console.log(`Usuario creado: ${user.id} (${user.email}) — contraseña: test1234`);
  } else {
    console.log(`Usuario encontrado: ${user.id} (${user.email})`);
  }

  const company = await prisma.company.upsert({
    where: { rut: "000000000010" },
    update: {},
    create: {
      name: "Empresa Test BlueBlinq",
      rut: "000000000010",
      contributorType: "NO_CEDE",
      defaultCurrency: "UYU",
    },
  });
  console.log(`Empresa lista: ${company.id} (${company.name})`);

  await prisma.companyMembership.upsert({
    where: { userId_companyId: { userId: user.id, companyId: company.id } },
    update: { isDefault: true, role: "ADMIN" },
    create: {
      userId: user.id,
      companyId: company.id,
      role: "ADMIN",
      isDefault: true,
    },
  });
  console.log("Membresía creada con isDefault=true y rol ADMIN");
  console.log("Listo. Ya podés subir facturas.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
