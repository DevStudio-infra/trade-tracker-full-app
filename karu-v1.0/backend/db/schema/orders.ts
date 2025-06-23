import { pgTable, text, serial, timestamp, integer, varchar, real, boolean, pgEnum, date } from "drizzle-orm/pg-core";
import { users } from "./user";
import { recipes } from "./recipe";

export const orderStatusEnum = pgEnum("order_status", ["draft", "confirmed", "in_production", "completed", "cancelled"]);
export const listTypeEnum = pgEnum("list_type", ["shopping", "production", "prep"]);

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 255 }).notNull(), // Multi-tenancy
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  eventDate: date("event_date"),
  totalGuests: integer("total_guests"),
  status: orderStatusEnum("status").notNull().default("draft"),
  totalCost: real("total_cost"),
  createdBy: integer("created_by")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .references(() => orders.id)
    .notNull(),
  recipeId: integer("recipe_id")
    .references(() => recipes.id)
    .notNull(),
  servings: integer("servings").notNull(),
  multiplier: real("multiplier").default(1), // for scaling recipes
  notes: text("notes"),
});

export const shoppingLists = pgTable("shopping_lists", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 255 }).notNull(),
  orderId: integer("order_id").references(() => orders.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  totalCost: real("total_cost"),
  isCompleted: boolean("is_completed").default(false),
  createdBy: integer("created_by")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const shoppingListItems = pgTable("shopping_list_items", {
  id: serial("id").primaryKey(),
  shoppingListId: integer("shopping_list_id")
    .references(() => shoppingLists.id)
    .notNull(),
  ingredientName: varchar("ingredient_name", { length: 255 }).notNull(),
  quantity: real("quantity").notNull(),
  unit: varchar("unit", { length: 50 }).notNull(),
  estimatedCost: real("estimated_cost"),
  actualCost: real("actual_cost"),
  supplier: varchar("supplier", { length: 255 }),
  isPurchased: boolean("is_purchased").default(false),
  notes: text("notes"),
});

export const productionLists = pgTable("production_lists", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 255 }).notNull(),
  orderId: integer("order_id").references(() => orders.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  productionDate: date("production_date").notNull(),
  isCompleted: boolean("is_completed").default(false),
  createdBy: integer("created_by")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const productionListItems = pgTable("production_list_items", {
  id: serial("id").primaryKey(),
  productionListId: integer("production_list_id")
    .references(() => productionLists.id)
    .notNull(),
  recipeId: integer("recipe_id")
    .references(() => recipes.id)
    .notNull(),
  servings: integer("servings").notNull(),
  estimatedTime: integer("estimated_time"), // in minutes
  actualTime: integer("actual_time"), // in minutes
  assignedTo: integer("assigned_to").references(() => users.id),
  priority: integer("priority").default(0), // 0-10 priority scale
  isCompleted: boolean("is_completed").default(false),
  notes: text("notes"),
  completedAt: timestamp("completed_at"),
});
