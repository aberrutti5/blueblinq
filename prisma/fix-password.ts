import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const hash = await bcrypt.hash("123456", 10);
  console.log("Generated hash:", hash);

  await prisma.user.update({
    where: { email: "berruttiagus5@gmail.com" },
    data: { passwordHash: hash },
  });
  console.log("Password updated.");

  // Verify
  const u = await prisma.user.findUnique({ where: { email: "berruttiagus5@gmail.com" } });
  const match = await bcrypt.compare("test1234", u!.passwordHash!);
  console.log("Verification - password matches:", match);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); });
