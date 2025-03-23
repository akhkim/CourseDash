import { NextRequest, NextResponse } from 'next/server';

// URL of the Flask API server - update this with your actual Flask server URL
const FLASK_API_URL = 'http://localhost:5000';

export async function POST(request: NextRequest) {
  try {
    // Get the FormData from the request
    const formData = await request.formData();
    const file = formData.get('file') as File;

    // Check if file exists
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Log file details (for debugging)
    console.log(`File received for title extraction: ${file.name}, type: ${file.type}`);

    try {
      // Forward the request to the Flask API
      const flaskResponse = await fetch(`${FLASK_API_URL}/api/lecture-info`, {
        method: 'POST',
        body: formData,
      });

      if (!flaskResponse.ok) {
        // If Flask returns an error, fall back to the filename
        const errorText = await flaskResponse.text();
        console.error(`Flask API error (${flaskResponse.status}): ${errorText}`);
        throw new Error(`Flask API error: ${flaskResponse.status}`);
      }

      // If successful, return the Flask response
      const data = await flaskResponse.json();
      console.log("Flask response:", data);
      return NextResponse.json(data);
    } catch (flaskError) {
      console.error('Error calling Flask API:', flaskError);
      
      // Extract filename as fallback title
      const fileName = file.name;
      const title = fileName.split('.')[0];
      
      // Return the filename as the title
      return NextResponse.json({
        title: title,
        source: 'filename',
        message: 'Title extracted from filename due to Flask API unavailability'
      });
    }
  } catch (error) {
    console.error('Error in lecture-info API route:', error);
    return NextResponse.json(
      { error: 'Failed to process title extraction request' },
      { status: 500 }
    );
  }
}

// Increase the body size limit for file uploads
export const config = {
  api: {
    bodyParser: false,
    responseLimit: '8mb',
  },
}; 