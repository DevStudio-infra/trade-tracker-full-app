import { inferAsyncReturnType } from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";
import { db } from "../db";

// Define our custom context interface to include user property
export interface TRPCContext {
  db: typeof db;
  req?: any;
  res?: any;
  user?: any;
  clerkUserId?: string;
}

/**
 * Creates context for tRPC requests
 * This is where we can pass:
 * - Database connection
 * - Authentication info
 * - Anything else that should be available in all procedures
 */
export const createContext = ({ req, res }: trpcExpress.CreateExpressContextOptions) => {
  return {
    db,
    req,
    res,
    // user and clerkUserId will be populated by auth middleware when needed
  };
};

// Export type for inferring in other files
export type Context = inferAsyncReturnType<typeof createContext>;
