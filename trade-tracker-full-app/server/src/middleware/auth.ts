import { Request, Response, NextFunction } from "express";
import { getToken } from "next-auth/jwt";
import { jwtVerify, createRemoteJWKSet } from "jose";

// Define UserRole enum to match NextAuth roles
export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
        // Add other user properties as needed
      };
    }
  }
}

const TEST_TOKEN = "test-token";
const TEST_USER_ID = "test-user-123";

// Extended Request interface for both auth patterns
export interface AuthenticatedRequest extends Request {
  auth?: {
    userId: string;
    email: string;
    role: UserRole;
    isAuthenticated: boolean;
  };
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
}

/**
 * Middleware to authenticate user requests
 * This implementation supports both test token and real authentication
 */
export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "No authorization header" });
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Invalid authorization format" });
    }

    // For testing: accept test token
    if (process.env.NODE_ENV !== "production" && token === TEST_TOKEN) {
      req.user = {
        id: TEST_USER_ID,
      };
      return next();
    }

    // TODO: Implement real authentication here
    // This would typically involve:
    // 1. Verifying JWT token
    // 2. Fetching user data
    // 3. Setting up req.user

    // For now, reject non-test tokens in non-production
    if (process.env.NODE_ENV !== "production") {
      return res.status(401).json({ error: "Only test token is accepted in development" });
    }

    return res.status(401).json({ error: "Invalid token" });
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ error: "Authentication failed" });
  }
};

// Main auth middleware for new routes
export const verifyAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET);

    try {
      const { payload } = await jwtVerify(token, secret);

      // Set auth information from the verified token
      req.auth = {
        userId: payload.sub as string,
        email: payload.email as string,
        role: (payload.role as UserRole) || UserRole.USER,
        isAuthenticated: true,
      };

      // Also set user property for backward compatibility
      req.user = {
        id: payload.sub as string,
        email: payload.email as string,
        role: (payload.role as UserRole) || UserRole.USER,
      };

      next();
    } catch (error) {
      console.error("Token verification failed:", error);
      return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Legacy middleware for existing routes
export const authenticateUserLegacy = verifyAuth;
