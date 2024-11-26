import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Sketch from '@/models/Sketch';

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    await dbConnect();

    const sketches = await Sketch.find({ projectId: params.projectId })
      .sort({ createdAt: -1 });

    return NextResponse.json(sketches);
  } catch (error) {
    console.error('Error fetching sketches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sketches' },
      { status: 500 }
    );
  }
}

// Add endpoint to update sketch approval status
export async function PATCH(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    await dbConnect();

    const body = await request.json();
    const { sketchId, approved, userId } = body;

    if (!sketchId) {
      return NextResponse.json(
        { error: 'Sketch ID is required' },
        { status: 400 }
      );
    }

    const sketch = await Sketch.findOneAndUpdate(
      { _id: sketchId, projectId: params.projectId },
      {
        approved,
        ...(approved ? {
          approvedBy: userId,
          approvedAt: new Date(),
        } : {
          approvedBy: null,
          approvedAt: null,
        }),
      },
      { new: true }
    );

    if (!sketch) {
      return NextResponse.json(
        { error: 'Sketch not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(sketch);
  } catch (error) {
    console.error('Error updating sketch:', error);
    return NextResponse.json(
      { error: 'Failed to update sketch' },
      { status: 500 }
    );
  }
}
