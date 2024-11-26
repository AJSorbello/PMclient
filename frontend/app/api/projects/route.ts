import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const projects = await prisma.project.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
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

    // Create minimal project data
    const projectData = {
      name: data.name.trim(),
      description: data.type || 'New Project',
      status: 'PLANNING',
      priority: 'MEDIUM',
      phase: 'PLANNING',
      progress: 0,
      riskLevel: 'MEDIUM',
      budget: data.budget ? Number(data.budget) : 0,
      actualCost: 0,
      grandTotal: 0
    };

    console.log('Creating project with data:', JSON.stringify(projectData, null, 2));

    const project = await prisma.project.create({
      data: projectData,
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
      return NextResponse.json(
        { 
          error: 'Invalid data provided',
          details: error.message
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
