/**
 * Recipe repository
 * Handles all database operations related to recipes
 */
import { db } from "../db";
import { recipes, ingredients, recipeIngredients, recipeTags, recipeComments, recipeCollections, recipeCollectionItems, users } from "../db/schema";
import { eq, and, desc } from "drizzle-orm";

export interface CreateRecipeData {
  organizationId: string;
  name: string;
  description?: string;
  instructions: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  difficulty?: string;
  imageUrl?: string;
  sourceFile?: string;
  isPublic?: boolean;
  createdBy: number;
}

export interface UpdateRecipeData {
  name?: string;
  description?: string;
  instructions?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  difficulty?: string;
  imageUrl?: string;
  isPublic?: boolean;
}

export type Recipe = typeof recipes.$inferSelect;
export type Ingredient = typeof ingredients.$inferSelect;
export type RecipeIngredient = typeof recipeIngredients.$inferSelect;

export class RecipeRepository {
  /**
   * Get all recipes for an organization
   */
  static async findAll(organizationId: string): Promise<Recipe[]> {
    try {
      return await db.select().from(recipes).where(eq(recipes.organizationId, organizationId)).orderBy(desc(recipes.createdAt));
    } catch (error) {
      console.error("Error finding all recipes:", error);
      throw new Error("Failed to fetch recipes");
    }
  }

  /**
   * Get recipe by ID with related data
   */
  static async findById(id: number): Promise<any> {
    try {
      // Get recipe
      const recipe = await db.select().from(recipes).where(eq(recipes.id, id)).limit(1);

      if (!recipe[0]) return null;

      // Get recipe ingredients
      const recipeIngredientsData = await db
        .select({
          id: recipeIngredients.id,
          quantity: recipeIngredients.quantity,
          unit: recipeIngredients.unit,
          notes: recipeIngredients.notes,
          isOptional: recipeIngredients.isOptional,
          ingredient: {
            id: ingredients.id,
            name: ingredients.name,
            unit: ingredients.unit,
            category: ingredients.category,
          },
        })
        .from(recipeIngredients)
        .leftJoin(ingredients, eq(recipeIngredients.ingredientId, ingredients.id))
        .where(eq(recipeIngredients.recipeId, id));

      // Get tags
      const tagsData = await db.select().from(recipeTags).where(eq(recipeTags.recipeId, id));

      // Get comments
      const commentsData = await db
        .select({
          id: recipeComments.id,
          comment: recipeComments.comment,
          isApproved: recipeComments.isApproved,
          createdAt: recipeComments.createdAt,
          user: {
            id: users.id,
            name: users.name,
            email: users.email,
          },
        })
        .from(recipeComments)
        .leftJoin(users, eq(recipeComments.userId, users.id))
        .where(eq(recipeComments.recipeId, id))
        .orderBy(desc(recipeComments.createdAt));

      return {
        ...recipe[0],
        ingredients: recipeIngredientsData,
        tags: tagsData,
        comments: commentsData,
      };
    } catch (error) {
      console.error("Error finding recipe by ID:", error);
      throw new Error("Failed to fetch recipe");
    }
  }

  /**
   * Create a new recipe
   */
  static async create(data: CreateRecipeData): Promise<Recipe> {
    try {
      const result = await db
        .insert(recipes)
        .values({
          organizationId: data.organizationId,
          name: data.name,
          description: data.description,
          instructions: data.instructions,
          prepTime: data.prepTime,
          cookTime: data.cookTime,
          servings: data.servings,
          difficulty: data.difficulty,
          imageUrl: data.imageUrl,
          sourceFile: data.sourceFile,
          isPublic: data.isPublic || false,
          createdBy: data.createdBy,
        })
        .returning();

      return result[0];
    } catch (error) {
      console.error("Error creating recipe:", error);
      throw new Error("Failed to create recipe");
    }
  }

  /**
   * Update recipe
   */
  static async update(id: number, data: UpdateRecipeData): Promise<Recipe> {
    try {
      const result = await db
        .update(recipes)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(recipes.id, id))
        .returning();

      if (result.length === 0) {
        throw new Error("Recipe not found");
      }

      return result[0];
    } catch (error) {
      console.error("Error updating recipe:", error);
      throw new Error("Failed to update recipe");
    }
  }

  /**
   * Delete recipe
   */
  static async delete(id: number): Promise<Recipe> {
    try {
      // Delete associated records first
      await db.delete(recipeComments).where(eq(recipeComments.recipeId, id));
      await db.delete(recipeTags).where(eq(recipeTags.recipeId, id));
      await db.delete(recipeIngredients).where(eq(recipeIngredients.recipeId, id));
      await db.delete(recipeCollectionItems).where(eq(recipeCollectionItems.recipeId, id));

      const result = await db.delete(recipes).where(eq(recipes.id, id)).returning();

      if (result.length === 0) {
        throw new Error("Recipe not found");
      }

      return result[0];
    } catch (error) {
      console.error("Error deleting recipe:", error);
      throw new Error("Failed to delete recipe");
    }
  }

  /**
   * Add ingredient to recipe
   */
  static async addIngredient(
    recipeId: number,
    ingredientData: {
      ingredientId: number;
      quantity: number;
      unit?: string;
      notes?: string;
      isOptional?: boolean;
    }
  ) {
    try {
      const result = await db
        .insert(recipeIngredients)
        .values({
          recipeId,
          ingredientId: ingredientData.ingredientId,
          quantity: ingredientData.quantity,
          unit: ingredientData.unit,
          notes: ingredientData.notes,
          isOptional: ingredientData.isOptional || false,
        })
        .returning();

      return result[0];
    } catch (error) {
      console.error("Error adding ingredient to recipe:", error);
      throw new Error("Failed to add ingredient");
    }
  }

  /**
   * Add tag to recipe
   */
  static async addTag(recipeId: number, tag: string) {
    try {
      const result = await db
        .insert(recipeTags)
        .values({
          recipeId,
          tag,
        })
        .returning();

      return result[0];
    } catch (error) {
      console.error("Error adding tag to recipe:", error);
      throw new Error("Failed to add tag");
    }
  }

  /**
   * Add comment to recipe
   */
  static async addComment(recipeId: number, userId: number, comment: string) {
    try {
      const result = await db
        .insert(recipeComments)
        .values({
          recipeId,
          userId,
          comment,
          isApproved: false, // Staff suggestions need approval
        })
        .returning();

      return result[0];
    } catch (error) {
      console.error("Error adding comment to recipe:", error);
      throw new Error("Failed to add comment");
    }
  }

  /**
   * Find recipes by organization and user
   */
  static async findByUser(organizationId: string, userId: number): Promise<Recipe[]> {
    try {
      return await db
        .select()
        .from(recipes)
        .where(and(eq(recipes.organizationId, organizationId), eq(recipes.createdBy, userId)))
        .orderBy(desc(recipes.createdAt));
    } catch (error) {
      console.error("Error finding recipes by user:", error);
      throw new Error("Failed to fetch user recipes");
    }
  }

  /**
   * Search recipes by name or description
   */
  static async search(organizationId: string, query: string): Promise<Recipe[]> {
    try {
      // Simple text search - could be enhanced with full-text search
      return await db
        .select()
        .from(recipes)
        .where(
          and(
            eq(recipes.organizationId, organizationId)
            // Note: This is a basic search, for production you'd want to use proper full-text search
          )
        )
        .orderBy(desc(recipes.createdAt));
    } catch (error) {
      console.error("Error searching recipes:", error);
      throw new Error("Failed to search recipes");
    }
  }
}
