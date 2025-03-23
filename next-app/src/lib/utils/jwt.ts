import jwt from 'jsonwebtoken';

// Load JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET;

// Set token expiration time (15 days)
const TOKEN_EXPIRATION = 60 * 60 * 24 * 15; // 15 days in seconds

// Interface for token data
export interface TokenData {
  id: string;
  email: string;
  googleUid: string;
}

/**
 * Generate a JWT token for a user
 * @param payload User data to include in token
 * @returns JWT token string
 */
export const generateToken = (payload: TokenData): string => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not defined');
  }

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRATION,
  });
};

/**
 * Verify and decode a JWT token
 * @param token JWT token to verify
 * @returns Decoded token data or null if invalid
 */
export const verifyToken = (token: string): TokenData | null => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not defined');
  }

  try {
    return jwt.verify(token, JWT_SECRET) as TokenData;
  } catch (error) {
    return null;
  }
};

/**
 * Extract user ID from token
 * @param token JWT token
 * @returns User ID or null if token is invalid
 */
export const getUserIdFromToken = (token: string): string | null => {
  const decoded = verifyToken(token);
  return decoded ? decoded.id : null;
}; 