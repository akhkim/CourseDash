import { NextRequest, NextResponse } from 'next/server';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import { generateRandomString } from '@/lib/utils/random';

export async function POST(request: NextRequest) {
  try {
    // Handle multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    // Read the file as ArrayBuffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Generate a unique filename
    const fileName = `${generateRandomString(8)}_${file.name}`;
    
    // For now, we'll create a simple data URL to demonstrate storage
    // In a production environment, you'd upload to a storage service like S3
    const base64 = buffer.toString('base64');
    const url = `data:${file.type};base64,${base64}`;
    
    // Return the URL of the stored document
    return NextResponse.json({
      url,
      fileName,
      message: 'File uploaded successfully'
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ 
      error: 'Failed to upload file',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 