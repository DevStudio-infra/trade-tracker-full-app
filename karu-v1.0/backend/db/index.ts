import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Check for database URL
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

// Create postgres client
const client = postgres(databaseUrl);

// Create drizzle database instance with all schema tables
export const db = drizzle(client, { schema });
