import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db/mongodb';
import Course from '@/lib/db/models/course';
import mongoose from 'mongoose';

/**
 * GET /api/courses/[id]
 * Retrieve a specific course by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid course ID format' },
        { status: 400 }
      );
    }

    await dbConnect();
    
    const course = await Course.findById(id);
    
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ course }, { status: 200 });
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/courses/[id]
 * Update a course by ID
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid course ID format' },
        { status: 400 }
      );
    }

    await dbConnect();
    
    const course = await Course.findById(id);
    
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }
    
    // Update the course with the new data
    // Handle lecture notes specifically to ensure all fields are preserved
    if (body.lectureNotes && Array.isArray(body.lectureNotes)) {
      // If course doesn't have lectureNotes yet, initialize it
      if (!course.lectureNotes) {
        (course as any).lectureNotes = [];
      }
      
      // Ensure each lecture note has all its fields preserved
      body.lectureNotes.forEach((note: any) => {
        // Check if this note already exists (by id)
        const existingNoteIndex = ((course as any).lectureNotes || []).findIndex(
          (n: any) => n.id === note.id || (n._id && n._id.toString() === note._id)
        );
        
        if (existingNoteIndex >= 0) {
          // Update existing note with all fields
          (course as any).lectureNotes[existingNoteIndex] = {
            ...(course as any).lectureNotes[existingNoteIndex],
            ...note
          };
        } else {
          // Add new note with all fields intact
          ((course as any).lectureNotes).push(note);
        }
      });
    }
    
    // Update all other fields
    Object.keys(body).forEach(key => {
      if (key !== 'lectureNotes') {
        (course as any)[key] = body[key];
      }
    });
    
    await course.save();
    
    return NextResponse.json({ course }, { status: 200 });
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/courses/[id]
 * Delete a course by ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid course ID format' },
        { status: 400 }
      );
    }

    await dbConnect();
    
    const course = await Course.findByIdAndDelete(id);
    
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'Course deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    );
  }
} 