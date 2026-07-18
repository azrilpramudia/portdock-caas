const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function update() {
  const c = await prisma.container.findFirst({ where: { name: { contains: 'ikmal' } } });
  if (c && c.hostPort) {
    console.log(`Port is ${c.hostPort}`);
  }
}
update();
