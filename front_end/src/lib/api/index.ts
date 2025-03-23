import axios from 'axios';
import { IUser } from '../types/user';

const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Chat API endpoint (still using Python backend)
export * from './endpoints/chat';

// User API operations
export const insertUser = async (userData: IUser): Promise<string> => {
    try {
        const response = await axios.post(`${API_BASE_URL}/users`, userData);
        return response.data.id;
    } catch (error) {
        console.error('Error inserting user:', error);
        throw error;
    }
};

export const findUserByGoogleId = async (googleUid: string): Promise<IUser | null> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/users/google/${googleUid}`);
        return response.data;
    } catch (error) {
        console.error('Error finding user:', error);
        throw error;
    }
};

export const findUsersByCriteria = async (criteria: Partial<IUser>, limit: number = 10): Promise<IUser[]> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/users`, {
            params: { criteria, limit }
        });
        return response.data;
    } catch (error) {
        console.error('Error finding users:', error);
        throw error;
    }
}; 