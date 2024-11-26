import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Estimate from '@/models/Estimate';

export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { projectId, title, amount, description, items } = body;

    if (!projectId || !title || !amount || !description) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Create estimate with line items if provided
    const estimate = await Estimate.create({
      projectId,
      title,
      amount,
      description,
      items: items || [{
        description: 'Project Total',
        quantity: 1,
        unitPrice: amount,
        total: amount,
      }],
      status: 'draft',
    });

    return NextResponse.json(estimate);
  } catch (error) {
    console.error('Error creating estimate:', error);
    return NextResponse.json(
      { error: 'Failed to create estimate' },
      { status: 500 }
    );
  }
}

// Add endpoint to update estimate status
export async function PATCH(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { estimateId, status, rejectionReason, userId } = body;

    if (!estimateId || !status) {
      return NextResponse.json(
        { error: 'Estimate ID and status are required' },
        { status: 400 }
      );
    }

    const updateData: any = { status };

    if (status === 'approved') {
      updateData.approvedBy = userId;
      updateData.approvedAt = new Date();
    } else if (status === 'rejected') {
      updateData.rejectionReason = rejectionReason;
    }

    const estimate = await Estimate.findByIdAndUpdate(
      estimateId,
      updateData,
      { new: true }
    );

    if (!estimate) {
      return NextResponse.json(
        { error: 'Estimate not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(estimate);
  } catch (error) {
    console.error('Error updating estimate:', error);
    return NextResponse.json(
      { error: 'Failed to update estimate' },
      { status: 500 }
    );
  }
}
