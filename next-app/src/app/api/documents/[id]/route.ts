import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
    }
    
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();
    
    // Retrieve the file from MongoDB
    const filesCollection = db.collection('files');
    let objectId;
    
    try {
      objectId = new ObjectId(id);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid file ID format' }, { status: 400 });
    }
    
    const file = await filesCollection.findOne({ _id: objectId });
    
    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    
    // Convert the base64 content back to Buffer
    const buffer = Buffer.from(file.content, 'base64');
    
    // Set appropriate headers for the file download
    const headers = new Headers();
    headers.set('Content-Type', file.mimeType || 'application/octet-stream');
    headers.set('Content-Disposition', `attachment; filename="${file.originalName}"`);
    headers.set('Content-Length', buffer.length.toString());
    
    // Return the file content
    return new Response(buffer, {
      headers
    });
  } catch (error) {
    console.error('Error retrieving file:', error);
    return NextResponse.json({ 
      error: 'Failed to retrieve file',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 