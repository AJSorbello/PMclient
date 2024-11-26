import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/projects/[projectId]/budget
export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const budgetItems = await prisma.budgetItem.findMany({
      where: {
        projectId: params.projectId,
      },
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json(budgetItems);
  } catch (error) {
    console.error('Error fetching budget items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budget items' },
      { status: 500 }
    );
  }
}

// POST /api/projects/[projectId]/budget
export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const body = await request.json();
    const budgetItem = await prisma.budgetItem.create({
      data: {
        ...body,
        projectId: params.projectId,
      },
    });

    return NextResponse.json(budgetItem);
  } catch (error) {
    console.error('Error creating budget item:', error);
    return NextResponse.json(
      { error: 'Failed to create budget item' },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[projectId]/budget/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { projectId: string; id: string } }
) {
  try {
    const body = await request.json();
    const budgetItem = await prisma.budgetItem.update({
      where: {
        id: params.id,
        projectId: params.projectId,
      },
      data: body,
    });

    return NextResponse.json(budgetItem);
  } catch (error) {
    console.error('Error updating budget item:', error);
    return NextResponse.json(
      { error: 'Failed to update budget item' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[projectId]/budget/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string; id: string } }
) {
  try {
    await prisma.budgetItem.delete({
      where: {
        id: params.id,
        projectId: params.projectId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting budget item:', error);
    return NextResponse.json(
      { error: 'Failed to delete budget item' },
      { status: 500 }
    );
  }
}
