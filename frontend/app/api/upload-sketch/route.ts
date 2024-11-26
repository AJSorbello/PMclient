import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import dbConnect from '@/lib/db';
import Sketch from '@/models/Sketch';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  try {
    await dbConnect();

    const formData = await request.formData();
    const file = formData.get('sketch') as File;
    const projectId = formData.get('projectId') as string;
    const title = formData.get('title') as string;

    if (!file || !projectId || !title) {
      return NextResponse.json(
        { error: 'Sketch, project ID, and title are required' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const key = `projects/${projectId}/sketches/${uuidv4()}-${file.name}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: file.type,
        Metadata: {
          title: title,
        },
      })
    );

    const sketchUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    // Save sketch to database
    const sketch = await Sketch.create({
      projectId,
      title,
      url: sketchUrl,
      s3Key: key,
    });

    return NextResponse.json(sketch);
  } catch (error) {
    console.error('Error uploading sketch:', error);
    return NextResponse.json(
      { error: 'Failed to upload sketch' },
      { status: 500 }
    );
  }
}
