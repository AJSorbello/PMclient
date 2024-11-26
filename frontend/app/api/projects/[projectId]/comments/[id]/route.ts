import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/projects/[projectId]/comments/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string; id: string } }
) {
  try {
    const comment = await prisma.comment.findUnique({
      where: {
        id: params.id,
        projectId: params.projectId,
      },
    });

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Error fetching comment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comment' },
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
