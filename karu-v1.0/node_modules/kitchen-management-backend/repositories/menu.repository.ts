/**
 * Menu repository
 * Handles all database operations related to menus
 */
import { db } from "../db";
import { menus, menuItems, menuNotes, recipes, users } from "../db/schema";
import { eq, and, desc } from "drizzle-orm";

export interface CreateMenuData {
  organizationId: string;
  name: string;
  description?: string;
  menuType?: string;
  season?: string;
  isActive?: boolean;
  createdBy: number;
}

export interface UpdateMenuData {
  name?: string;
  description?: string;
  menuType?: string;
  season?: string;
  isActive?: boolean;
}

export interface CreateMenuItemData {
  name: string;
  description?: string;
  price: number;
  category?: string;
  recipeId?: number;
  dietaryInfo?: string;
  allergens?: string;
  spiceLevel?: number;
  isAvailable?: boolean;
  preparationTime?: number;
  imageUrl?: string;
}

export type Menu = typeof menus.$inferSelect;
export type MenuItem = typeof menuItems.$inferSelect;

export class MenuRepository {
  /**
   * Get all menus for an organization
   */
  static async findAll(organizationId: string, includeInactive: boolean = false): Promise<any[]> {
    try {
      const whereCondition = includeInactive ? eq(menus.organizationId, organizationId) : and(eq(menus.organizationId, organizationId), eq(menus.isActive, true));

      const menusData = await db
        .select({
          id: menus.id,
          organizationId: menus.organizationId,
          name: menus.name,
          description: menus.description,
          menuType: menus.menuType,
          season: menus.season,
          isActive: menus.isActive,
          createdAt: menus.createdAt,
          updatedAt: menus.updatedAt,
          createdBy: menus.createdBy,
          creator: {
            id: users.id,
            name: users.name,
            email: users.email,
          },
        })
        .from(menus)
        .leftJoin(users, eq(menus.createdBy, users.id))
        .where(whereCondition)
        .orderBy(desc(menus.createdAt));

      return menusData;
    } catch (error) {
      console.error("Error finding all menus:", error);
      throw new Error("Failed to fetch menus");
    }
  }

  /**
   * Get menu by ID with all related data
   */
  static async findById(id: number): Promise<any> {
    try {
      const menuData = await db.select().from(menus).where(eq(menus.id, id)).limit(1);

      if (!menuData[0]) return null;

      return menuData[0];
    } catch (error) {
      console.error("Error finding menu by ID:", error);
      throw new Error("Failed to fetch menu");
    }
  }

  /**
   * Create a new menu
   */
  static async create(data: CreateMenuData): Promise<Menu> {
    try {
      const result = await db
        .insert(menus)
        .values({
          organizationId: data.organizationId,
          name: data.name,
          description: data.description,
          menuType: data.menuType,
          season: data.season,
          isActive: data.isActive ?? true,
          createdBy: data.createdBy,
        })
        .returning();

      return result[0];
    } catch (error) {
      console.error("Error creating menu:", error);
      throw new Error("Failed to create menu");
    }
  }

  /**
   * Update menu
   */
  static async update(id: number, data: UpdateMenuData): Promise<Menu> {
    try {
      const result = await db
        .update(menus)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(menus.id, id))
        .returning();

      if (result.length === 0) {
        throw new Error("Menu not found");
      }

      return result[0];
    } catch (error) {
      console.error("Error updating menu:", error);
      throw new Error("Failed to update menu");
    }
  }

  /**
   * Delete menu
   */
  static async delete(id: number): Promise<Menu> {
    try {
      // Delete associated records first
      await db.delete(menuNotes).where(eq(menuNotes.menuId, id));
      await db.delete(menuItems).where(eq(menuItems.menuId, id));

      const result = await db.delete(menus).where(eq(menus.id, id)).returning();

      if (result.length === 0) {
        throw new Error("Menu not found");
      }

      return result[0];
    } catch (error) {
      console.error("Error deleting menu:", error);
      throw new Error("Failed to delete menu");
    }
  }
}
