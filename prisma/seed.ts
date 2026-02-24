import { PrismaClient } from "../src/generated/prisma/client";
import { DEFAULT_IVA_RULES } from "../src/lib/tax/iva-categories";

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL!,
});

async function main() {
  console.log("Seeding IVA classification rules...");

  for (const rule of DEFAULT_IVA_RULES) {
    await prisma.ivaClassificationRule.upsert({
      where: {
        id: `global-${rule.keyword}`,
      },
      update: {
        ivaCategory: rule.ivaCategory,
        priority: rule.priority,
      },
      create: {
        id: `global-${rule.keyword}`,
        companyId: null,
        keyword: rule.keyword,
        ivaCategory: rule.ivaCategory,
        priority: rule.priority,
        isActive: true,
      },
    });
  }

  console.log(`Seeded ${DEFAULT_IVA_RULES.length} global IVA rules.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
