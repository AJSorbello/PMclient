import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/projects/[projectId]/phases
export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const phases = await prisma.projectPhase.findMany({
      where: {
        projectId: params.projectId,
      },
      include: {
        tasks: true,
        documents: true,
      },
      orderBy: {
        order: 'asc',
      },
    });

    return NextResponse.json(phases);
  } catch (error) {
    console.error('Error fetching phases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch phases' },
      { status: 500 }
    );
  }
}

// POST /api/projects/[projectId]/phases
export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const body = await request.json();
    
    // Get the current highest order number
    const highestOrder = await prisma.projectPhase.findFirst({
      where: { projectId: params.projectId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const phase = await prisma.projectPhase.create({
      data: {
        ...body,
        projectId: params.projectId,
        order: (highestOrder?.order ?? -1) + 1,
      },
      include: {
        tasks: true,
        documents: true,
      },
    });

    return NextResponse.json(phase);
  } catch (error) {
    console.error('Error creating phase:', error);
    return NextResponse.json(
      { error: 'Failed to create phase' },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[projectId]/phases/reorder
export async function PUT(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const body = await request.json();
    const { phases } = body;

    // Update the order of all phases in a transaction
    await prisma.$transaction(
      phases.map((phase: { id: string; order: number }) =>
        prisma.projectPhase.update({
          where: { id: phase.id },
          data: { order: phase.order },
        })
      )
    );

    const updatedPhases = await prisma.projectPhase.findMany({
      where: {
        projectId: params.projectId,
      },
      include: {
        tasks: true,
        documents: true,
      },
      orderBy: {
        order: 'asc',
      },
    });

    return NextResponse.json(updatedPhases);
  } catch (error) {
    console.error('Error reordering phases:', error);
    return NextResponse.json(
      { error: 'Failed to reorder phases' },
      { status: 500 }
    );
  }
}
