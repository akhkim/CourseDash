import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db/mongodb';
import Course from '@/lib/db/models/course';
import { verifyToken } from '@/lib/utils/jwt';

// Get all courses for the current user
export async function GET(request: NextRequest) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    await dbConnect();
    
    // Get all courses for this user
    const courses = await Course.find({ googleUid: decoded.googleUid });
    
    return NextResponse.json({ courses });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

// Add a new course
export async function POST(request: NextRequest) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { courseName, syllabusPDF, lectureNotes, times, profName, courseDescription } = body;
    
    // Validate required fields
    if (!courseName) {
      return NextResponse.json(
        { error: 'Course name is required' },
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    // Create new course
    const newCourse = new Course({
      googleUid: decoded.googleUid,
      courseName,
      syllabusPDF: syllabusPDF || '',
      lectureNotes: lectureNotes || [],
      times: times || [],
      profName: profName || '',
      courseDescription: courseDescription || '',
    });
    
    await newCourse.save();
    
    return NextResponse.json(
      { 
        message: 'Course created successfully',
        course: newCourse 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
} 