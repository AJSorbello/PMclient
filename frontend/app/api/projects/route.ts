import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { Prisma } from '@prisma/client';

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
    const projectData: Prisma.ProjectCreateInput = {
      name: data.name.trim(),
      description: data.type || 'New Project',
      status: 'PLANNING',
      priority: 'MEDIUM',
      phase: 'PLANNING',
      progress: 0,
      riskLevel: 'MEDIUM',
      budget: data.budget ? Number(data.budget) : 0,
      actualCost: 0,
      grandTotal: 0,
      
      // Explicitly set all date fields to undefined
      startDate: undefined,
      endDate: undefined,
      appointmentDate: undefined,
      actualStartDate: undefined,
      actualEndDate: undefined,
      
      // Optional location fields
      location: null,
      street: null,
      city: null,
      state: null,
      zipCode: null,
      country: 'USA',
      
      // Optional estimate fields
      coverage: null,
      policyNumber: null,
      deductible: 0,
      rcv: 0,
      acv: 0,
      depreciation: 0,
      
      // Connect to default user as manager
      manager: {
        connect: {
          id: defaultUser.id
        }
      },
      
      // Timestamps
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
        priority: true,
        phase: true,
        progress: true,
        riskLevel: true,
        budget: true,
        actualCost: true,
        grandTotal: true,
        createdAt: true,
        updatedAt: true,
        manager: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    console.log('Project created:', project);
    return NextResponse.json({ success: true, project });
    
  } catch (error) {
    console.error('Full error details:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { 
          error: 'Database error',
          code: error.code,
          details: error.message,
          meta: error.meta
        },
        { status: 400 }
      );
    }
    
    if (error instanceof Prisma.PrismaClientValidationError) {
      const errorMessage = error.message;
      console.error('Validation error details:', errorMessage);
      return NextResponse.json(
        { 
          error: 'Invalid data provided',
          details: errorMessage
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create project',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
