import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db/mongodb';
import User from '@/lib/db/models/user';

export async function GET() {
  try {
    await dbConnect();
    
    // This endpoint would normally be protected and filtered
    // For demo purposes we're returning all users
    const users = await User.find({});
    
    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { googleUid, email, displayName, photoURL } = body;
    
    // Validate required fields
    if (!googleUid || !email) {
      return NextResponse.json(
        { error: 'Google UID and email are required' },
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    // Check if user already exists
    const existingUser = await User.findOne({ googleUid });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists', userId: existingUser._id },
        { status: 409 }
      );
    }
    
    // Create new user
    const newUser = new User({
      googleUid,
      email,
      displayName: displayName || '',
      photoURL: photoURL || '',
    });
    
    await newUser.save();
    
    return NextResponse.json(
      { 
        message: 'User created successfully',
        userId: newUser._id 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
} 