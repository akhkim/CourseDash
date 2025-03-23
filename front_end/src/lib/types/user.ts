export interface IUser {
    googleUid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    createdAt?: Date;
    lastLoginAt?: Date;
}

export interface IUserResponse {
    message: string;
    userId: string;
}

export interface IUserError {
    error: string;
} 