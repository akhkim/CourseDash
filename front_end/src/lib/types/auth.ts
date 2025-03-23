export interface IJwtPayload {
    googleUid: string;
    email: string;
    exp?: number;
}

export interface IAuthResponse {
    user: IUser;
    token: string;
}

export interface IGoogleUser {
    sub: string; // This is the googleUid
    email: string;
    name?: string;
    picture?: string;
    email_verified: boolean;
} 