import { NextRequest, NextResponse } from 'next/server';
  
  export async function POST(request: NextRequest) {
    try {
      const { formData } = await request.json()
      const response = await fetch('http://127.0.0.1:5000/api/upload', {
        method: 'POST',
        body: formData
      });
      
      return NextResponse.json({
        message: (await response.json()).message,
      }, { status: 200 });
    } catch (error) {
      console.error('Error uploading file to ChromaDB:', error);
      throw new Error('Failed to upload file to ChromaDB');
    }
  } 