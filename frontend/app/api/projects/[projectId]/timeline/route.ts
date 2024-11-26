import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/projects/[projectId]/timeline
export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const events = await prisma.timelineEvent.findMany({
      where: {
        projectId: params.projectId,
      },
      orderBy: {
        date: 'asc',
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching timeline events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch timeline events' },
      { status: 500 }
    );
  }
}

// POST /api/projects/[projectId]/timeline
export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const body = await request.json();
    const event = await prisma.timelineEvent.create({
      data: {
        ...body,
        projectId: params.projectId,
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error creating timeline event:', error);
    return NextResponse.json(
      { error: 'Failed to create timeline event' },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[projectId]/timeline/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { projectId: string; id: string } }
) {
  try {
    const body = await request.json();
    const event = await prisma.timelineEvent.update({
      where: {
        id: params.id,
        projectId: params.projectId,
      },
      data: body,
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error updating timeline event:', error);
    return NextResponse.json(
      { error: 'Failed to update timeline event' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[projectId]/timeline/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string; id: string } }
) {
  try {
    await prisma.timelineEvent.delete({
      where: {
        id: params.id,
        projectId: params.projectId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting timeline event:', error);
    return NextResponse.json(
      { error: 'Failed to delete timeline event' },
      { status: 500 }
    );
  }
}
