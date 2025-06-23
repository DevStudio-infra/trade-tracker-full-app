import { pgTable, text, serial, timestamp, integer, varchar, date, pgEnum, boolean, real } from "drizzle-orm/pg-core";
import { users } from "./user";

export const shiftStatusEnum = pgEnum("shift_status_type", ["pending", "approved", "rejected"]);
export const staffPositionEnum = pgEnum("staff_position", ["chef", "cook", "prep_cook", "server", "bartender", "host", "dishwasher", "manager"]);

export const schedules = pgTable("schedules", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  isPublished: boolean("is_published").default(false),
  createdBy: integer("created_by")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const shifts = pgTable("shifts", {
  id: serial("id").primaryKey(),
  scheduleId: integer("schedule_id")
    .references(() => schedules.id)
    .notNull(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  position: staffPositionEnum("position").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  isRecurring: boolean("is_recurring").default(false),
  recurringPattern: varchar("recurring_pattern", { length: 100 }),
  hourlyRate: real("hourly_rate"),
  notes: text("notes"),
  status: shiftStatusEnum("status").notNull().default("pending"),
});

export const timeOffRequests = pgTable("time_off_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  reason: text("reason"),
  requestType: varchar("request_type", { length: 50 }),
  status: shiftStatusEnum("status").notNull().default("pending"),
  approvedBy: integer("approved_by").references(() => users.id),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const scheduleTemplates = pgTable("schedule_templates", {
  id: serial("id").primaryKey(),
  organizationId: varchar("organization_id", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  templateData: text("template_data").notNull(),
  fileUrl: text("file_url"),
  aiPrompt: text("ai_prompt"),
  isActive: boolean("is_active").default(true),
  createdBy: integer("created_by")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const staffAvailability = pgTable("staff_availability", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  dayOfWeek: integer("day_of_week").notNull(),
  startTime: varchar("start_time", { length: 10 }).notNull(),
  endTime: varchar("end_time", { length: 10 }).notNull(),
  isAvailable: boolean("is_available").default(true),
  minHours: integer("min_hours"),
  maxHours: integer("max_hours"),
  preferredPosition: staffPositionEnum("preferred_position"),
});
