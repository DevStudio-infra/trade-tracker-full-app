import { pgTable, text, serial, timestamp, varchar, integer, real, boolean } from "drizzle-orm/pg-core";
import { users } from "./user";

export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  instructions: text("instructions").notNull(),
  prepTime: integer("prep_time"),
  cookTime: integer("cook_time"),
  servings: integer("servings"),
  difficulty: varchar("difficulty", { length: 50 }),
  imageUrl: text("image_url"),
  sourceFile: text("source_file"),
  isPublic: boolean("is_public").default(false),
  createdBy: integer("created_by")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const ingredients = pgTable("ingredients", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  unit: varchar("unit", { length: 50 }),
  category: varchar("category", { length: 100 }),
  costPerUnit: real("cost_per_unit"),
  supplier: varchar("supplier", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const recipeIngredients = pgTable("recipe_ingredients", {
  id: serial("id").primaryKey(),
  recipeId: integer("recipe_id")
    .references(() => recipes.id)
    .notNull(),
  ingredientId: integer("ingredient_id")
    .references(() => ingredients.id)
    .notNull(),
  quantity: real("quantity").notNull(),
  unit: varchar("unit", { length: 50 }),
  notes: text("notes"),
  isOptional: boolean("is_optional").default(false),
});

export const recipeTags = pgTable("recipe_tags", {
  id: serial("id").primaryKey(),
  recipeId: integer("recipe_id")
    .references(() => recipes.id)
    .notNull(),
  tag: varchar("tag", { length: 100 }).notNull(),
});

export const recipeComments = pgTable("recipe_comments", {
  id: serial("id").primaryKey(),
  recipeId: integer("recipe_id")
    .references(() => recipes.id)
    .notNull(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  comment: text("comment").notNull(),
  isApproved: boolean("is_approved").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const recipeCollections = pgTable("recipe_collections", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdBy: integer("created_by")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const recipeCollectionItems = pgTable("recipe_collection_items", {
  id: serial("id").primaryKey(),
  collectionId: integer("collection_id")
    .references(() => recipeCollections.id)
    .notNull(),
  recipeId: integer("recipe_id")
    .references(() => recipes.id)
    .notNull(),
  order: integer("order").default(0),
});
