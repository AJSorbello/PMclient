import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/projects/[projectId]/tasks
export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const tasks = await prisma.task.findMany({
      where: {
        projectId: params.projectId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST /api/projects/[projectId]/tasks
export async function POST(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const body = await request.json();
    const task = await prisma.task.create({
      data: {
        ...body,
        projectId: params.projectId,
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[projectId]/tasks/[taskId]
export async function PUT(
  request: Request,
  { params }: { params: { projectId: string; taskId: string } }
) {
  try {
    const body = await request.json();
    const task = await prisma.task.update({
      where: {
        id: params.taskId,
        projectId: params.projectId,
      },
      data: body,
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[projectId]/tasks/[taskId]
export async function DELETE(
  request: Request,
  { params }: { params: { projectId: string; taskId: string } }
) {
  try {
    await prisma.task.delete({
      where: {
        id: params.taskId,
        projectId: params.projectId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}
