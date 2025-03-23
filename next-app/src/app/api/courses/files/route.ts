import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { generateRandomString } from '@/lib/utils/random';
import { ObjectId } from 'mongodb';

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
    
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();
    
    // Generate a unique filename
    const fileName = `${generateRandomString(8)}_${file.name}`;
    
    // Store the file in MongoDB files collection
    const filesCollection = db.collection('files');
    const fileDoc = {
      fileName,
      originalName: file.name,
      mimeType: file.type,
      size: buffer.length,
      content: buffer.toString('base64'),
      uploadDate: new Date(),
    };
    
    const result = await filesCollection.insertOne(fileDoc);
    const fileId = result.insertedId.toString();
    
    console.log('File stored in MongoDB successfully with ID:', fileId);
    
    // Try to index with ChromaDB if available
    try {
      await fetch('http://127.0.0.1:5000/api/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });
      console.log('File indexed in ChromaDB successfully');
    } catch (chromaError) {
      console.warn('Failed to index in ChromaDB:', chromaError);
      // Continue even if ChromaDB indexing fails
    }
    
    // Return the ID and name of the stored file
    return NextResponse.json({
      fileId,
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