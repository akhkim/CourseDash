import { NextRequest, NextResponse } from 'next/server';
import { generateRandomString } from '@/lib/utils/random';
import clientPromise from '@/lib/mongodb';
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
    
    // Generate a unique filename
    const fileName = `${generateRandomString(8)}_${file.name}`;
    
    // For now, we'll store directly in MongoDB
    let fileId;
    try {
      const client = await clientPromise;
      const db = client.db();
      
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
      fileId = result.insertedId.toString();
      
      console.log('File stored in MongoDB successfully with ID:', fileId);
    } catch (mongoError) {
      console.error('Error storing file in MongoDB:', mongoError);
      return NextResponse.json({ 
        error: 'Failed to store file in database',
        details: mongoError instanceof Error ? mongoError.message : String(mongoError)
      }, { status: 500 });
    }
    
    // Try to upload to ChromaDB if available
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
      // Log the error but continue - this ensures local uploads still work if ChromaDB is unavailable
      console.warn('Failed to index in ChromaDB, continuing with file storage:', chromaError);
    }
    
    // Generate a URL for retrieving the file
    const url = `/api/documents/${fileId}`;
    
    // Return the URL of the stored document
    return NextResponse.json({
      url,
      fileName,
      fileId,
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