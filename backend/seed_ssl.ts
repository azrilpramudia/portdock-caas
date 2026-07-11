import { PrismaClient } from '@generated/prisma';
const prisma = new PrismaClient();

async function main() {
  const projects = await prisma.project.findMany({
    where: { status: 'ACTIVE', domain: { not: null } },
    take: 1
  });
  
  if (projects.length > 0) {
    const thirtyDaysFromNow = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000); // 15 days from now
    await prisma.project.update({
      where: { id: projects[0].id },
      data: { sslExpiresAt: thirtyDaysFromNow }
    });
    console.log(`Updated project ${projects[0].name} with sslExpiresAt: ${thirtyDaysFromNow}`);
  } else {
    console.log("No active projects with domains found.");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
