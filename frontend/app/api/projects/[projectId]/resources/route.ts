import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/projects/[projectId]/resources
export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const resources = await prisma.resource.findMany({
      where: {
        projectId: params.projectId,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(resources);
  } catch (error) {
    console.error('Error fetching resources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    );
  }
}

// POST /api/projects/[projectId]/resources
export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const body = await request.json();
    const resource = await prisma.resource.create({
      data: {
        ...body,
        projectId: params.projectId,
      },
    });

    return NextResponse.json(resource);
  } catch (error) {
    console.error('Error creating resource:', error);
    return NextResponse.json(
      { error: 'Failed to create resource' },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[projectId]/resources/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { projectId: string; id: string } }
) {
  try {
    const body = await request.json();
    const resource = await prisma.resource.update({
      where: {
        id: params.id,
        projectId: params.projectId,
      },
      data: body,
    });

    return NextResponse.json(resource);
  } catch (error) {
    console.error('Error updating resource:', error);
    return NextResponse.json(
      { error: 'Failed to update resource' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[projectId]/resources/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string; id: string } }
) {
  try {
    await prisma.resource.delete({
      where: {
        id: params.id,
        projectId: params.projectId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting resource:', error);
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    );
  }
}
