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
    // Using Object.assign to ensure all fields from body are added to the course document
    // This handles both existing and non-existing fields
    Object.assign(course, body);
    
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