import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create default admin user
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
    },
  });

  // Create default client user
  const clientUser = await prisma.user.create({
    data: {
      name: 'Client User',
      email: 'client@example.com',
      role: 'client',
    },
  });

  // Create default manager user
  const managerUser = await prisma.user.create({
    data: {
      name: 'Project Manager',
      email: 'manager@example.com',
      role: 'manager',
    },
  });

  // Create a sample project
  const project = await prisma.project.create({
    data: {
      name: 'Sample Construction Project',
      description: 'A demonstration project with all phases of construction',
      status: 'planning',
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      budget: 500000,
      location: '123 Main St, Anytown, USA',
      client: {
        connect: { id: clientUser.id },
      },
      manager: {
        connect: { id: managerUser.id },
      },
      siteDetails: {
        create: {
          address: '123 Main St, Anytown, USA',
          zoning: 'Residential',
          lotSize: 5000,
          existingStructure: true,
          soilType: 'Clay',
          utilities: JSON.stringify({
            water: 'available',
            electricity: 'available',
            gas: 'needed',
          }),
        },
      },
    },
  });

  // Create default project phases
  const phases = [
    {
      name: 'Initial Planning',
      description: 'Project scope definition and initial planning phase',
      status: 'in_progress',
      order: 0,
    },
    {
      name: 'Design Development',
      description: 'Architectural and engineering design phase',
      status: 'not_started',
      order: 1,
    },
    {
      name: 'Permitting',
      description: 'Obtaining necessary permits and approvals',
      status: 'not_started',
      order: 2,
    },
    {
      name: 'Construction',
      description: 'Main construction phase',
      status: 'not_started',
      order: 3,
    },
    {
      name: 'Final Inspection',
      description: 'Final inspections and project closeout',
      status: 'not_started',
      order: 4,
    },
  ];

  for (const phase of phases) {
    await prisma.projectPhase.create({
      data: {
        ...phase,
        project: {
          connect: { id: project.id },
        },
      },
    });
  }

  // Create sample tasks
  const tasks = [
    {
      title: 'Site Analysis',
      description: 'Conduct detailed site analysis and survey',
      status: 'in_progress',
      priority: 'high',
      project: {
        connect: { id: project.id },
      },
    },
    {
      title: 'Budget Planning',
      description: 'Develop detailed project budget',
      status: 'todo',
      priority: 'high',
      project: {
        connect: { id: project.id },
      },
    },
    {
      title: 'Team Assembly',
      description: 'Assemble project team and assign roles',
      status: 'todo',
      priority: 'medium',
      project: {
        connect: { id: project.id },
      },
    },
  ];

  for (const task of tasks) {
    await prisma.task.create({
      data: task,
    });
  }

  console.log('Database has been seeded. 🌱');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
