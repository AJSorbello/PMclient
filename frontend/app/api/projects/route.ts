import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching projects...');
    const projects = await prisma.project.findMany({
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    console.log('Projects fetched successfully:', projects);
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { error: 'Failed to fetch projects', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log('Received data:', JSON.stringify(data, null, 2));

    if (!data.name || typeof data.name !== 'string') {
      return NextResponse.json(
        { error: 'Project name is required and must be a string' },
        { status: 400 }
      );
    }

    // Get the default user
    const defaultUser = await prisma.user.findUnique({
      where: {
        email: 'admin@example.com'
      }
    });

    if (!defaultUser) {
      return NextResponse.json(
        { error: 'Default user not found. Please run the seed script.' },
        { status: 500 }
      );
    }

    const now = new Date();

    // Create project data with all required and optional fields
    const projectData = {
      name: data.name.trim(),
      description: data.description || '',
      status: data.status || 'planning',
      budget: data.budget ? Number(data.budget) : null,
      location: data.location || null,
      client: {
        connect: {
          id: defaultUser.id 
        }
      },
      manager: {
        connect: {
          id: defaultUser.id
        }
      },
      teamMembers: {
        create: []
      },
      tasks: {
        create: []
      },
      phases: {
        create: []
      },
      budgetItems: {
        create: []
      },
      createdAt: now,
      updatedAt: now
    };

    console.log('Creating project with data:', JSON.stringify(projectData, null, 2));

    const project = await prisma.project.create({
      data: projectData,
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        budget: true,
        location: true,
        createdAt: true,
        updatedAt: true,
        manager: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Create appointment if provided
    if (data.appointment) {
      const appointment = await prisma.appointment.create({
        data: {
          type: data.appointment.type,
          date: new Date(data.appointment.date),
          time: new Date(data.appointment.time),
          notes: data.appointment.notes || '',
          project: {
            connect: {
              id: project.id
            }
          }
        }
      });
      console.log('Appointment created:', appointment);
    }

    console.log('Project created successfully:', project);
    return NextResponse.json({ success: true, project });
    
  } catch (error) {
    console.error('Error creating project:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { error: 'Failed to create project', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
