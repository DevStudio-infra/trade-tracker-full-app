/**
 * User repository
 * Handles all database operations related to users
 */
import { db } from "../db";
import { users, roleEnum } from "../db/schema";
import { eq, and } from "drizzle-orm";

export interface CreateUserData {
  clerkId: string;
  organizationId: string;
  name: string;
  email: string;
  role?: "admin" | "staff";
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: "admin" | "staff";
}

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export class UserRepository {
  /**
   * Get all users for an organization
   */
  static async findAll(organizationId: string): Promise<User[]> {
    try {
      return await db.select().from(users).where(eq(users.organizationId, organizationId));
    } catch (error) {
      console.error("Error finding all users:", error);
      throw new Error("Failed to fetch users");
    }
  }

  /**
   * Get user by ID
   */
  static async findById(id: number): Promise<User | null> {
    try {
      const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

      return result[0] || null;
    } catch (error) {
      console.error("Error finding user by ID:", error);
      throw new Error("Failed to fetch user");
    }
  }

  /**
   * Get user by email within organization
   */
  static async findByEmail(email: string, organizationId: string): Promise<User | null> {
    try {
      const result = await db
        .select()
        .from(users)
        .where(and(eq(users.email, email), eq(users.organizationId, organizationId)))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      console.error("Error finding user by email:", error);
      throw new Error("Failed to fetch user");
    }
  }

  /**
   * Get user by Clerk ID
   * Used for Clerk webhook integration
   */
  static async findByClerkId(clerkId: string): Promise<User | null> {
    try {
      const result = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);

      return result[0] || null;
    } catch (error) {
      console.error("Error finding user by Clerk ID:", error);
      throw new Error("Failed to fetch user");
    }
  }

  /**
   * Create a new user
   */
  static async create(data: CreateUserData): Promise<User> {
    try {
      const result = await db
        .insert(users)
        .values({
          clerkId: data.clerkId,
          organizationId: data.organizationId,
          name: data.name,
          email: data.email,
          role: data.role || "staff",
        })
        .returning();

      return result[0];
    } catch (error) {
      console.error("Error creating user:", error);
      throw new Error("Failed to create user");
    }
  }

  /**
   * Create user from Clerk webhook data
   * Simplified creation that only requires essential fields
   */
  static async createFromClerk(clerkId: string, organizationId: string, email: string, name: string = ""): Promise<User> {
    try {
      const result = await db
        .insert(users)
        .values({
          clerkId,
          organizationId,
          email,
          name: name || email.split("@")[0], // Use email username if name not provided
          role: "staff", // Default role
        })
        .returning();

      return result[0];
    } catch (error) {
      console.error("Error creating user from Clerk:", error);
      throw new Error("Failed to create user");
    }
  }

  /**
   * Update user
   */
  static async update(id: number, data: UpdateUserData): Promise<User> {
    try {
      const result = await db
        .update(users)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(users.id, id))
        .returning();

      if (result.length === 0) {
        throw new Error("User not found");
      }

      return result[0];
    } catch (error) {
      console.error("Error updating user:", error);
      throw new Error("Failed to update user");
    }
  }

  /**
   * Delete user
   */
  static async delete(id: number): Promise<User> {
    try {
      const result = await db.delete(users).where(eq(users.id, id)).returning();

      if (result.length === 0) {
        throw new Error("User not found");
      }

      return result[0];
    } catch (error) {
      console.error("Error deleting user:", error);
      throw new Error("Failed to delete user");
    }
  }

  /**
   * Get users by organization and role
   */
  static async findByOrganizationAndRole(organizationId: string, role: "admin" | "staff"): Promise<User[]> {
    try {
      return await db
        .select()
        .from(users)
        .where(and(eq(users.organizationId, organizationId), eq(users.role, role)));
    } catch (error) {
      console.error("Error finding users by organization and role:", error);
      throw new Error("Failed to fetch users");
    }
  }
}
