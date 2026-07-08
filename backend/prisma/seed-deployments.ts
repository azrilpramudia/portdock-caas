import { PrismaClient } from '@generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Fetching projects and users to attach deployments...');

  const users = await prisma.user.findMany({ take: 5 });
  const projects = await prisma.project.findMany({ take: 10, include: { user: true } });

  if (projects.length === 0) {
    console.log('No projects found. Please ensure there are projects before seeding deployments.');
    return;
  }

  // Create 10 deployments for the existing projects to match our frontend UI mockup
  const mockData = [
    { status: 'Success', progress: 100, duration: 135, domain: 'api.ecommerce.portdock.id' },
    { status: 'Success', progress: 100, duration: 105, domain: 'portfolio.portdock.id' },
    { status: 'In Progress', progress: 65, duration: null, domain: 'blog.portdock.id' },
    { status: 'Success', progress: 100, duration: 80, domain: 'staging.company.portdock.id' },
    { status: 'Failed', progress: 0, duration: 58, domain: 'landing.portdock.id' },
    { status: 'Success', progress: 100, duration: 160, domain: 'staging.tasks.portdock.id' },
    { status: 'In Progress', progress: 30, duration: null, domain: 'school.portdock.id' },
    { status: 'Success', progress: 100, duration: 115, domain: 'internal.portdock.id' },
    { status: 'Failed', progress: 0, duration: 62, domain: 'inventory.staging.portdock.id' },
    { status: 'Success', progress: 100, duration: 125, domain: 'api.mobile.portdock.id' },
  ];

  console.log('Creating deployments...');
  let created = 0;

  for (let i = 0; i < mockData.length; i++) {
    // Assign cyclically to available projects
    const project = projects[i % projects.length];
    const data = mockData[i];
    
    // Simulate startedAt in the past couple days
    const startedAt = new Date();
    startedAt.setDate(startedAt.getDate() - Math.floor(Math.random() * 3));
    startedAt.setHours(Math.floor(Math.random() * 12) + 8);
    
    let endedAt: Date | null = null;
    if (data.status === 'Success' || data.status === 'Failed') {
      endedAt = new Date(startedAt.getTime() + (data.duration || 60) * 1000);
    }

    await prisma.deployment.create({
      data: {
        projectId: project.id,
        status: data.status,
        progress: data.progress,
        domain: data.domain,
        startedAt,
        endedAt,
      }
    });
    created++;
  }

  console.log(`Successfully seeded ${created} deployments!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
