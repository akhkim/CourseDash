import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from './lib/utils/auth';

// Add routes that don't require authentication
const publicRoutes = [
    '/login',
    '/api/auth/google',
    '/_next',
    '/favicon.ico'
];

export async function middleware(request: NextRequest) {
    // Check if the route is public
    if (publicRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // Get token from cookie
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
        // Verify JWT
        await verifyJWT(token);
        return NextResponse.next();
    } catch (error) {
        // Invalid token, redirect to login
        return NextResponse.redirect(new URL('/login', request.url));
    }
} 