/**
 * Authentication middleware for validating Clerk tokens
 */
import { Request, Response, NextFunction } from 'express';
import { clerk } from '../config/clerk';
import { UserRepository } from '../repositories';

/**
 * Validates Clerk session token and attaches user to request
 */
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        status: 'error',
        message: 'Unauthorized: Missing or invalid token' 
      });
    }
    
    // Extract token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        status: 'error',
        message: 'Unauthorized: Missing token' 
      });
    }
    
    // Verify token with Clerk
    try {
      const sessionClaims = await clerk.verifyToken(token);
      
      if (!sessionClaims || !sessionClaims.sub) {
        return res.status(401).json({ 
          status: 'error',
          message: 'Unauthorized: Invalid token' 
        });
      }
      
      // Get clerk user ID from claims
      const clerkUserId = sessionClaims.sub;
      
      // Get user from database
      const user = await UserRepository.findByClerkId(clerkUserId);
      
      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'Unauthorized: User not found'
        });
      }
      
      // Attach user to request
      (req as any).user = user;
      (req as any).clerkUserId = clerkUserId;
      
      // Continue to next middleware
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ 
        status: 'error',
        message: 'Unauthorized: Invalid token'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

/**
 * Validates that user has admin role
 * Must be used after requireAuth middleware
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  // Get user from request (attached by requireAuth)
  const user = (req as any).user;
  
  if (!user) {
    return res.status(401).json({
      status: 'error',
      message: 'Unauthorized: Authentication required'
    });
  }
  
  if (user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Forbidden: Admin access required'
    });
  }
  
  // User is an admin, proceed
  next();
};
