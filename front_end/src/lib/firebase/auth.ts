import { 
    GoogleAuthProvider, 
    signInWithPopup, 
    onAuthStateChanged,
    getAuth 
} from 'firebase/auth';
import { auth } from './config';
import { findUserByGoogleId, insertUser } from '../api';
import { IUser } from '../types/user';
import Cookies from 'js-cookie';

const TOKEN_COOKIE_NAME = 'auth_token';

export const setAuthCookie = async () => {
    const token = await auth.currentUser?.getIdToken();
    if (token) {
        Cookies.set(TOKEN_COOKIE_NAME, token, {
            expires: 7, // 7 days
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
    }
};

export const removeAuthCookie = () => {
    Cookies.remove(TOKEN_COOKIE_NAME);
};

export const getAuthToken = () => {
    return Cookies.get(TOKEN_COOKIE_NAME);
};

export const signInWithGoogle = async (): Promise<IUser> => {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const { user: firebaseUser } = result;

        // Set the JWT cookie
        await setAuthCookie();

        // Check if user exists in database through API
        let dbUser = await findUserByGoogleId(firebaseUser.uid);
        
        // If not, create new user through API
        if (!dbUser) {
            const newUserId = await insertUser({
                googleUid: firebaseUser.uid,
                email: firebaseUser.email!,
                displayName: firebaseUser.displayName || undefined,
                photoURL: firebaseUser.photoURL || undefined,
            });
            
            dbUser = await findUserByGoogleId(firebaseUser.uid);
            if (!dbUser) throw new Error('Failed to create user');
        }

        return dbUser;
    } catch (error) {
        console.error('Error signing in with Google:', error);
        throw error;
    }
};

export const signOut = async () => {
    try {
        await auth.signOut();
        removeAuthCookie();
    } catch (error) {
        console.error('Error signing out:', error);
        throw error;
    }
};

export const useAuth = (callback: (user: IUser | null) => void) => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
            const dbUser = await findUserByGoogleId(firebaseUser.uid);
            callback(dbUser);
        } else {
            callback(null);
        }
    });
};

export const getCurrentUser = async (): Promise<IUser | null> => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return null;
    
    return await findUserByGoogleId(firebaseUser.uid);
}; 