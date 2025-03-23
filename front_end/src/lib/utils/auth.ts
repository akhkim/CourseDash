import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { IGoogleUser, IJwtPayload } from '../types/auth';
import { findUserByGoogleId, insertUser } from '../db/users';
import { IUser } from '../types/user';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
const COOKIE_NAME = 'auth_token';

export async function createJWT(payload: IJwtPayload): Promise<string> {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('24h')
        .sign(JWT_SECRET);
}

export async function verifyJWT(token: string): Promise<IJwtPayload> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as IJwtPayload;
    } catch (error) {
        throw new Error('Invalid token');
    }
}

export async function getAuthToken(): Promise<string | null> {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME);
    return token?.value || null;
}

export async function setAuthCookie(token: string): Promise<void> {
    const cookieStore = cookies();
    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 // 24 hours
    });
}

export async function handleGoogleUser(googleUser: IGoogleUser): Promise<IUser> {
    // Check if user exists
    let user = await findUserByGoogleId(googleUser.sub);
    
    if (!user) {
        // Create new user if doesn't exist
        const userId = await insertUser({
            googleUid: googleUser.sub,
            email: googleUser.email,
            displayName: googleUser.name,
            photoURL: googleUser.picture
        });
        
        user = await findUserByGoogleId(googleUser.sub);
        if (!user) throw new Error('Failed to create user');
    }
    
    return user;
} 