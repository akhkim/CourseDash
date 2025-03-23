import { NextRequest, NextResponse } from 'next/server';
import { createJWT, handleGoogleUser, setAuthCookie } from '@/lib/utils/auth';
import { IGoogleUser } from '@/lib/types/auth';

export async function POST(request: NextRequest) {
    try {
        const googleUser: IGoogleUser = await request.json();
        
        // Validate required fields
        if (!googleUser.sub || !googleUser.email) {
            return NextResponse.json(
                { error: 'Missing required user information' },
                { status: 400 }
            );
        }

        // Handle user creation/retrieval
        const user = await handleGoogleUser(googleUser);

        // Create JWT
        const token = await createJWT({
            googleUid: user.googleUid,
            email: user.email
        });

        // Set JWT cookie
        await setAuthCookie(token);

        return NextResponse.json({ user });
    } catch (error) {
        console.error('Authentication error:', error);
        return NextResponse.json(
            { error: 'Authentication failed' },
            { status: 500 }
        );
    }
} 