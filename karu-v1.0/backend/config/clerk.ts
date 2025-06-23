/**
 * Clerk Configuration
 */
import { createClerkClient } from "@clerk/clerk-sdk-node";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Clerk keys
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

if (!CLERK_SECRET_KEY) {
  throw new Error("CLERK_SECRET_KEY is required in environment variables");
}

// Initialize Clerk
export const clerk = createClerkClient({ secretKey: CLERK_SECRET_KEY });

// Export validation functions
export default clerk;
