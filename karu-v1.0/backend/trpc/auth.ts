/**
 * Authentication utilities for tRPC procedures
 */
import { TRPCError } from '@trpc/server';
import { middleware, publicProcedure } from './index';
import { clerk } from '../config/clerk';
import { UserRepository } from '../repositories';

// Define the authenticated context with user property
export interface AuthenticatedContext {
  user: any;
  clerkUserId: string;
}

/**
 * Middleware to check if user is authenticated
 */
export const isAuthenticated = middleware(async ({ ctx, next }: { ctx: any; next: any }) => {
  // Get the authorization token from headers
  const authHeader = ctx.req?.headers?.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Missing or invalid authentication token',
    });
  }

  // Get the token
  const token = authHeader.split(' ')[1];

  if (!token) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Missing authentication token',
    });
  }

  try {
    // Verify token with Clerk
    const sessionClaims = await clerk.verifyToken(token);
    
    if (!sessionClaims || !sessionClaims.sub) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid authentication token',
      });
    }
    
    // Get clerk user ID from claims
    const clerkUserId = sessionClaims.sub;
    
    // Get user from database
    const user = await UserRepository.findByClerkId(clerkUserId);
    
    if (!user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User not found',
      });
    }
    
    // Return context with user
    return next({
      ctx: {
        ...ctx,
        user,
        clerkUserId,
      },
    });
  } catch (error) {
    console.error('Authentication error:', error);
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication failed',
    });
  }
});

/**
 * Middleware to check if user is an admin
 */
export const isAdmin = middleware(async ({ ctx, next }: { ctx: any; next: any }) => {
  // Check if user is authenticated first
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'User is not authenticated',
    });
  }
  
  // Check if user is an admin
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'User does not have admin privileges',
    });
  }
  
  return next({ ctx });
});

/**
 * Protected procedure that requires authentication
 */
export const protectedProcedure = publicProcedure.use(isAuthenticated);

/**
 * Admin procedure that requires admin privileges
 */
export const adminProcedure = protectedProcedure.use(isAdmin);
