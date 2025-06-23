import { pgTable, text, serial, timestamp, integer, varchar, jsonb, boolean, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./user";

export const conversationTypeEnum = pgEnum("conversation_type", ["oracle", "menu_suggestions", "general"]);

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 255 }).notNull(), // Multi-tenancy
  title: varchar("title", { length: 255 }).notNull(),
  type: conversationTypeEnum("type").notNull().default("general"),
  isActive: boolean("is_active").default(true),
  createdBy: integer("created_by")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id")
    .references(() => conversations.id)
    .notNull(),
  userId: integer("user_id").references(() => users.id),
  role: varchar("role", { length: 50 }).notNull(), // 'user', 'system', 'assistant'
  content: text("content").notNull(),
  metadata: jsonb("metadata"), // for storing additional data like citations, confidence scores
  tokens: integer("tokens"), // for tracking API usage
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contextSources = pgTable("context_sources", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 255 }).notNull(), // Multi-tenancy
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  content: text("content").notNull(),
  sourceType: varchar("source_type", { length: 50 }).notNull(), // 'menu', 'recipe', 'note', 'document'
  sourceId: integer("source_id"), // reference to the actual menu, recipe, etc.
  metadata: jsonb("metadata"),
  isActive: boolean("is_active").default(true),
  createdBy: integer("created_by")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const conversationContexts = pgTable("conversation_contexts", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id")
    .references(() => conversations.id)
    .notNull(),
  contextSourceId: integer("context_source_id")
    .references(() => contextSources.id)
    .notNull(),
  relevanceScore: integer("relevance_score"), // 0-100 for ranking context
});

// For storing AI-generated suggestions and lists
export const suggestions = pgTable("suggestions", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 255 }).notNull(),
  conversationId: integer("conversation_id").references(() => conversations.id),
  type: varchar("type", { length: 50 }).notNull(), // 'menu', 'shopping_list', 'prep_list'
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  metadata: jsonb("metadata"), // structured data for lists, ingredients, etc.
  isImplemented: boolean("is_implemented").default(false),
  implementedBy: integer("implemented_by").references(() => users.id),
  createdBy: integer("created_by")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
