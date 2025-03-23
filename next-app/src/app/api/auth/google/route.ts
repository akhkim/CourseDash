import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db/mongodb';
import User from '@/lib/db/models/user';
import { generateToken } from '@/lib/utils/jwt';

export async function POST(request: NextRequest) {
  try {
    // Connect to the database
    await dbConnect();

    // Get the request body
    const body = await request.json();
    const { uid, email, displayName, photoURL } = body;

    // Validate required fields
    if (!uid || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ googleUid: uid });

    if (existingUser) {
      // If user exists, update fields if needed and return existing user
      let needsUpdate = false;
      
      if (existingUser.displayName !== displayName && displayName) {
        existingUser.displayName = displayName;
        needsUpdate = true;
      }
      
      if (existingUser.photoURL !== photoURL && photoURL) {
        existingUser.photoURL = photoURL;
        needsUpdate = true;
      }
      
      if (existingUser.email !== email) {
        existingUser.email = email;
        needsUpdate = true;
      }
      
      // Save updates if needed
      if (needsUpdate) {
        await existingUser.save();
      }

      // Generate token
      const token = generateToken({
        id: existingUser._id.toString(),
        email: existingUser.email,
        googleUid: existingUser.googleUid,
      });

      return NextResponse.json({
        message: 'User logged in successfully',
        user: {
          id: existingUser._id,
          email: existingUser.email,
          displayName: existingUser.displayName,
          photoURL: existingUser.photoURL,
        },
        token,
      });
    }

    // If user doesn't exist, create a new one
    const newUser = new User({
      googleUid: uid,
      email,
      displayName: displayName || email.split('@')[0],
      photoURL,
    });

    await newUser.save();

    // Generate token
    const token = generateToken({
      id: newUser._id.toString(),
      email: newUser.email,
      googleUid: newUser.googleUid,
    });

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: newUser._id,
          email: newUser.email,
          displayName: newUser.displayName,
          photoURL: newUser.photoURL,
        },
        token,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Google authentication error:', error);
    return NextResponse.json(
      { error: 'Failed to authenticate user' },
      { status: 500 }
    );
  }
} 