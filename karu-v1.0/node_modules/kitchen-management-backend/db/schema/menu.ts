import { pgTable, text, serial, timestamp, varchar, integer, real, boolean } from "drizzle-orm/pg-core";
import { users } from "./user";
import { recipes } from "./recipe";

export const menus = pgTable("menus", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  menuType: varchar("menu_type", { length: 100 }),
  season: varchar("season", { length: 50 }),
  isActive: boolean("is_active").notNull().default(true),
  createdBy: integer("created_by")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  menuId: integer("menu_id")
    .references(() => menus.id)
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: real("price").notNull(),
  category: varchar("category", { length: 100 }),
  recipeId: integer("recipe_id").references(() => recipes.id),
  dietaryInfo: text("dietary_info"),
  allergens: text("allergens"),
  spiceLevel: integer("spice_level"),
  isAvailable: boolean("is_available").notNull().default(true),
  preparationTime: integer("preparation_time"),
  imageUrl: text("image_url"),
});

export const menuNotes = pgTable("menu_notes", {
  id: serial("id").primaryKey(),
  menuId: integer("menu_id")
    .references(() => menus.id)
    .notNull(),
  menuItemId: integer("menu_item_id").references(() => menuItems.id),
  note: text("note").notNull(),
  noteType: varchar("note_type", { length: 50 }),
  isPublic: boolean("is_public").default(true),
  createdBy: integer("created_by")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
