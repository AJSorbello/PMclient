import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const tasks = await prisma.task.findMany({
      where: {
        projectId: params.projectId,
      },
      include: {
        assignee: {
          select: {
            name: true,
            email: true,
          },
        },
        milestone: {
          select: {
            id: true,
            name: true,
            dueDate: true,
            status: true,
          },
        },
      },
      orderBy: [
        {
          milestone: {
            dueDate: 'asc',
          },
        },
        {
          endDate: 'asc',
        },
      ],
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
