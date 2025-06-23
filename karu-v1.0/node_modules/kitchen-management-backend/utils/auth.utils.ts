/**
 * Authentication utilities for token validation and user information retrieval
 */
import { Request } from 'express';
import { clerk } from '../config/clerk';
import { UserRepository } from '../repositories';
import { User } from '@prisma/client';

/**
 * Interface for authentication result
 */
interface AuthResult {
  isAuthenticated: boolean;
  user?: User;
  clerkId?: string;
  error?: string;
}

/**
 * Extract token from request
 * @param req Express request
 * @returns Token if found, otherwise null
 */
export function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.split(' ')[1];
  
  if (!token) {
    return null;
  }
  
  return token;
}

/**
 * Validate Clerk token and get user
 * @param token JWT token from Clerk
 * @returns AuthResult with authentication status and user info
 */
export async function validateClerkToken(token: string): Promise<AuthResult> {
  try {
    // Verify token with Clerk
    const sessionClaims = await clerk.verifyToken(token);
    
    if (!sessionClaims || !sessionClaims.sub) {
      return {
        isAuthenticated: false,
        error: 'Invalid token'
      };
    }
    
    // Get clerk user ID from claims
    const clerkId = sessionClaims.sub;
    
    // Get user from database
    const user = await UserRepository.findByClerkId(clerkId);
    
    if (!user) {
      return {
        isAuthenticated: false,
        clerkId,
        error: 'User not found in database'
      };
    }
    
    return {
      isAuthenticated: true,
      user,
      clerkId
    };
  } catch (error) {
    console.error('Token validation error:', error);
    return {
      isAuthenticated: false,
      error: 'Token validation failed'
    };
  }
}

/**
 * Check if a user has admin role
 * @param user User object
 * @returns True if user is an admin
 */
export function isAdmin(user: User): boolean {
  return user.role === 'admin';
}

/**
 * Get user information from request
 * @param req Express request
 * @returns Promise with AuthResult
 */
export async function getUserFromRequest(req: Request): Promise<AuthResult> {
  const token = extractToken(req);
  
  if (!token) {
    return {
      isAuthenticated: false,
      error: 'No token provided'
    };
  }
  
  return validateClerkToken(token);
}
