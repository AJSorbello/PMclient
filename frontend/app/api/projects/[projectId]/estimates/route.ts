import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Estimate from '@/models/Estimate';

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    await dbConnect();

    const estimates = await Estimate.find({ projectId: params.projectId })
      .sort({ createdAt: -1 });

    return NextResponse.json(estimates);
  } catch (error) {
    console.error('Error fetching estimates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch estimates' },
      { status: 500 }
    );
  }
}

// Add endpoint to create estimate revision
export async function POST(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    await dbConnect();

    const body = await request.json();
    const { estimateId, items, notes } = body;

    if (!estimateId || !items) {
      return NextResponse.json(
        { error: 'Estimate ID and items are required' },
        { status: 400 }
      );
    }

    const estimate = await Estimate.findOne({
      _id: estimateId,
      projectId: params.projectId,
    });

    if (!estimate) {
      return NextResponse.json(
        { error: 'Estimate not found' },
        { status: 404 }
      );
    }

    // Calculate total for the revision
    const revisionTotal = items.reduce(
      (sum: number, item: any) => sum + (item.quantity * item.unitPrice),
      0
    );

    // Add the revision
    estimate.revisions.push({
      version: estimate.revisions.length + 1,
      amount: revisionTotal,
      items,
      notes,
    });

    // Update the current estimate with new items
    estimate.items = items;
    estimate.amount = revisionTotal;
    estimate.notes = notes;
    estimate.status = 'draft'; // Reset status when revised

    await estimate.save();

    return NextResponse.json(estimate);
  } catch (error) {
    console.error('Error creating estimate revision:', error);
    return NextResponse.json(
      { error: 'Failed to create estimate revision' },
      { status: 500 }
    );
  }
}
