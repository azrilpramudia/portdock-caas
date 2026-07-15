import { PrismaClient } from './node_modules/@generated/prisma';
const prisma = new PrismaClient();
async function main() {
  const setting = await prisma.systemSetting.findUnique({ where: { key: 'notifyDeployments' } });
  console.log('notifyDeployments:', setting);
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
