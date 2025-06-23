import { pgTable, text, serial, timestamp, varchar, pgEnum } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role_type", ["admin", "staff"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  clerkId: varchar("clerk_id", { length: 255 }).notNull().unique(),
  organizationId: varchar("organization_id", { length: 255 }).notNull(), // Clerk organization ID for multi-tenancy
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  role: roleEnum("role").notNull().default("staff"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
