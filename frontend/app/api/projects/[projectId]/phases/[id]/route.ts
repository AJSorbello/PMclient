import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/projects/[projectId]/phases/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string; id: string } }
) {
  try {
    const phase = await prisma.projectPhase.findUnique({
      where: {
        id: params.id,
        projectId: params.projectId,
      },
      include: {
        tasks: true,
        documents: true,
      },
    });

    if (!phase) {
      return NextResponse.json(
        { error: 'Phase not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(phase);
  } catch (error) {
    console.error('Error fetching phase:', error);
    return NextResponse.json(
      { error: 'Failed to fetch phase' },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[projectId]/phases/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { projectId: string; id: string } }
) {
  try {
    const body = await request.json();
    const phase = await prisma.projectPhase.update({
      where: {
        id: params.id,
        projectId: params.projectId,
      },
      data: {
        name: body.name,
        description: body.description,
        status: body.status,
        startDate: body.startDate,
        endDate: body.endDate,
      },
      include: {
        tasks: true,
        documents: true,
      },
    });

    return NextResponse.json(phase);
  } catch (error) {
    console.error('Error updating phase:', error);
    return NextResponse.json(
      { error: 'Failed to update phase' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[projectId]/phases/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string; id: string } }
) {
  try {
    await prisma.projectPhase.delete({
      where: {
        id: params.id,
        projectId: params.projectId,
      },
    });

    // Reorder remaining phases
    const remainingPhases = await prisma.projectPhase.findMany({
      where: {
        projectId: params.projectId,
      },
      orderBy: {
        order: 'asc',
      },
    });

    await prisma.$transaction(
      remainingPhases.map((phase, index) =>
        prisma.projectPhase.update({
          where: { id: phase.id },
          data: { order: index },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting phase:', error);
    return NextResponse.json(
      { error: 'Failed to delete phase' },
      { status: 500 }
    );
  }
}
