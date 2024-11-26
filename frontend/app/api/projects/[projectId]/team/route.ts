import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/projects/[projectId]/team
export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const team = await prisma.teamMember.findMany({
      where: {
        projectId: params.projectId,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(team);
  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team' },
      { status: 500 }
    );
  }
}

// POST /api/projects/[projectId]/team
export async function POST(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const body = await request.json();
    const member = await prisma.teamMember.create({
      data: {
        ...body,
        projectId: params.projectId,
      },
    });

    return NextResponse.json(member);
  } catch (error) {
    console.error('Error creating team member:', error);
    return NextResponse.json(
      { error: 'Failed to create team member' },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[projectId]/team/[memberId]
export async function PUT(
  request: Request,
  { params }: { params: { projectId: string; memberId: string } }
) {
  try {
    const body = await request.json();
    const member = await prisma.teamMember.update({
      where: {
        id: params.memberId,
        projectId: params.projectId,
      },
      data: body,
    });

    return NextResponse.json(member);
  } catch (error) {
    console.error('Error updating team member:', error);
    return NextResponse.json(
      { error: 'Failed to update team member' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[projectId]/team/[memberId]
export async function DELETE(
  request: Request,
  { params }: { params: { projectId: string; memberId: string } }
) {
  try {
    await prisma.teamMember.delete({
      where: {
        id: params.memberId,
        projectId: params.projectId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting team member:', error);
    return NextResponse.json(
      { error: 'Failed to delete team member' },
      { status: 500 }
    );
  }
}
