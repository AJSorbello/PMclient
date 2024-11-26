const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Checking database contents...\n');

  // Check users
  const users = await prisma.user.findMany();
  console.log('Users:', users);

  // Check projects
  const projects = await prisma.project.findMany({
    include: {
      manager: true
    }
  });
  console.log('\nProjects:', projects);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
