const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Get the admin user
  const admin = await prisma.user.findFirst({
    where: {
      email: 'admin@example.com'
    }
  });

  if (!admin) {
    throw new Error('Admin user not found');
  }

  // Create a test project
  const project = await prisma.project.create({
    data: {
      name: 'Test Project',
      description: 'A test project to verify database functionality',
      status: 'PLANNING',
      priority: 'MEDIUM',
      phase: 'PLANNING',
      progress: 0,
      riskLevel: 'LOW',
      budget: 50000,
      street: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      managerId: admin.id
    }
  });

  console.log('Created test project:', project);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
