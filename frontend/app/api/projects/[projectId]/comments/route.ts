import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/projects/[projectId]/comments
export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const comments = await prisma.comment.findMany({
      where: {
        projectId: params.projectId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// POST /api/projects/[projectId]/comments
export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const body = await request.json();
    const comment = await prisma.comment.create({
      data: {
        ...body,
        projectId: params.projectId,
      },
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[projectId]/comments/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { projectId: string; id: string } }
) {
  try {
    const body = await request.json();
    const comment = await prisma.comment.update({
      where: {
        id: params.id,
        projectId: params.projectId,
      },
      data: {
        content: body.content,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[projectId]/comments/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string; id: string } }
) {
  try {
    await prisma.comment.delete({
      where: {
        id: params.id,
        projectId: params.projectId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}
