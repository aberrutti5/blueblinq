import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const u = await prisma.user.findUnique({ where: { email: "berruttiagus5@gmail.com" } });
  console.log("User found:", !!u);
  if (u?.passwordHash) {
    console.log("test1234 matches:", await bcrypt.compare("test1234", u.passwordHash));
    console.log("123456 matches:", await bcrypt.compare("123456", u.passwordHash));
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); });
