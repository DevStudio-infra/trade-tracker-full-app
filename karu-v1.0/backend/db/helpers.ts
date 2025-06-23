/**
 * Database helper functions for common Prisma operations
 */
import { db } from './prisma';
import { PrismaClient, Prisma } from '@prisma/client';

/**
 * Transaction wrapper function
 * @param fn Function to execute within transaction
 * @returns Result of the transaction
 */
export async function withTransaction<T>(
  fn: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  return db.$transaction(fn);
}

/**
 * Error handler for Prisma operations
 * @param error Error to handle
 * @param entityName Name of the entity being operated on
 * @returns Error with appropriate message
 */
export function handleDbError(error: unknown, entityName: string): Error {
  console.error(`Database error for ${entityName}:`, error);
  
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle known Prisma errors
    if (error.code === 'P2002') {
      return new Error(`A ${entityName} with this unique constraint already exists.`);
    }
    if (error.code === 'P2025') {
      return new Error(`${entityName} not found.`);
    }
  }
  
  // Default error
  return new Error(`An error occurred while processing ${entityName}.`);
}

/**
 * Check if database is connected
 * @returns True if connected
 */
export async function isDatabaseConnected(): Promise<boolean> {
  try {
    await db.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}
