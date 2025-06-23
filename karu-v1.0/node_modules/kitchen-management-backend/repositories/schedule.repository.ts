/**
 * Schedule repository
 * Handles all database operations related to schedules and shifts
 */
import { db } from "../db";
import { schedules, shifts, timeOffRequests, scheduleTemplates, staffAvailability, users } from "../db/schema";
import { eq, and, desc, between } from "drizzle-orm";

export interface CreateScheduleData {
  organizationId: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  isPublished?: boolean;
  createdBy: number;
}

export interface CreateShiftData {
  scheduleId: number;
  userId: number;
  position: "chef" | "cook" | "prep_cook" | "server" | "bartender" | "host" | "dishwasher" | "manager";
  startTime: Date;
  endTime: Date;
  isRecurring?: boolean;
  recurringPattern?: string;
  hourlyRate?: number;
  notes?: string;
}

export interface CreateTimeOffRequestData {
  userId: number;
  startDate: string;
  endDate: string;
  startTime?: Date;
  endTime?: Date;
  reason?: string;
  requestType?: string;
}

export type Schedule = typeof schedules.$inferSelect;
export type Shift = typeof shifts.$inferSelect;
export type TimeOffRequest = typeof timeOffRequests.$inferSelect;

export class ScheduleRepository {
  /**
   * Get all schedules for an organization
   */
  static async findAll(organizationId: string): Promise<Schedule[]> {
    try {
      return await db.select().from(schedules).where(eq(schedules.organizationId, organizationId)).orderBy(desc(schedules.startDate));
    } catch (error) {
      console.error("Error finding schedules:", error);
      throw new Error("Failed to fetch schedules");
    }
  }

  /**
   * Get schedule by ID with shifts
   */
  static async findById(id: number): Promise<any> {
    try {
      const schedule = await db.select().from(schedules).where(eq(schedules.id, id)).limit(1);

      if (!schedule[0]) return null;

      // Get shifts for this schedule
      const shiftsData = await db
        .select({
          id: shifts.id,
          scheduleId: shifts.scheduleId,
          position: shifts.position,
          startTime: shifts.startTime,
          endTime: shifts.endTime,
          isRecurring: shifts.isRecurring,
          recurringPattern: shifts.recurringPattern,
          hourlyRate: shifts.hourlyRate,
          notes: shifts.notes,
          status: shifts.status,
          user: {
            id: users.id,
            name: users.name,
            email: users.email,
          },
        })
        .from(shifts)
        .leftJoin(users, eq(shifts.userId, users.id))
        .where(eq(shifts.scheduleId, id));

      return {
        ...schedule[0],
        shifts: shiftsData,
      };
    } catch (error) {
      console.error("Error finding schedule by ID:", error);
      throw new Error("Failed to fetch schedule");
    }
  }

  /**
   * Create a new schedule
   */
  static async create(data: CreateScheduleData): Promise<Schedule> {
    try {
      const result = await db
        .insert(schedules)
        .values({
          organizationId: data.organizationId,
          name: data.name,
          description: data.description,
          startDate: data.startDate,
          endDate: data.endDate,
          isPublished: data.isPublished || false,
          createdBy: data.createdBy,
        })
        .returning();

      return result[0];
    } catch (error) {
      console.error("Error creating schedule:", error);
      throw new Error("Failed to create schedule");
    }
  }

  /**
   * Add shift to schedule
   */
  static async addShift(data: CreateShiftData): Promise<Shift> {
    try {
      const result = await db
        .insert(shifts)
        .values({
          scheduleId: data.scheduleId,
          userId: data.userId,
          position: data.position,
          startTime: data.startTime,
          endTime: data.endTime,
          isRecurring: data.isRecurring || false,
          recurringPattern: data.recurringPattern,
          hourlyRate: data.hourlyRate,
          notes: data.notes,
          status: "pending",
        })
        .returning();

      return result[0];
    } catch (error) {
      console.error("Error adding shift:", error);
      throw new Error("Failed to add shift");
    }
  }

  /**
   * Update shift status
   */
  static async updateShiftStatus(shiftId: number, status: "pending" | "approved" | "rejected"): Promise<Shift> {
    try {
      const result = await db.update(shifts).set({ status }).where(eq(shifts.id, shiftId)).returning();

      if (result.length === 0) {
        throw new Error("Shift not found");
      }

      return result[0];
    } catch (error) {
      console.error("Error updating shift status:", error);
      throw new Error("Failed to update shift status");
    }
  }

  /**
   * Get time off requests for organization
   */
  static async getTimeOffRequests(organizationId: string): Promise<any[]> {
    try {
      return await db
        .select({
          id: timeOffRequests.id,
          startDate: timeOffRequests.startDate,
          endDate: timeOffRequests.endDate,
          startTime: timeOffRequests.startTime,
          endTime: timeOffRequests.endTime,
          reason: timeOffRequests.reason,
          requestType: timeOffRequests.requestType,
          status: timeOffRequests.status,
          rejectionReason: timeOffRequests.rejectionReason,
          createdAt: timeOffRequests.createdAt,
          user: {
            id: users.id,
            name: users.name,
            email: users.email,
          },
        })
        .from(timeOffRequests)
        .leftJoin(users, eq(timeOffRequests.userId, users.id))
        .where(eq(users.organizationId, organizationId))
        .orderBy(desc(timeOffRequests.createdAt));
    } catch (error) {
      console.error("Error getting time off requests:", error);
      throw new Error("Failed to fetch time off requests");
    }
  }

  /**
   * Create time off request
   */
  static async createTimeOffRequest(data: CreateTimeOffRequestData): Promise<TimeOffRequest> {
    try {
      const result = await db
        .insert(timeOffRequests)
        .values({
          userId: data.userId,
          startDate: data.startDate,
          endDate: data.endDate,
          startTime: data.startTime,
          endTime: data.endTime,
          reason: data.reason,
          requestType: data.requestType,
          status: "pending",
        })
        .returning();

      return result[0];
    } catch (error) {
      console.error("Error creating time off request:", error);
      throw new Error("Failed to create time off request");
    }
  }

  /**
   * Update time off request status
   */
  static async updateTimeOffRequestStatus(requestId: number, status: "pending" | "approved" | "rejected", approvedBy: number, rejectionReason?: string): Promise<TimeOffRequest> {
    try {
      const result = await db
        .update(timeOffRequests)
        .set({
          status,
          approvedBy,
          rejectionReason,
          updatedAt: new Date(),
        })
        .where(eq(timeOffRequests.id, requestId))
        .returning();

      if (result.length === 0) {
        throw new Error("Time off request not found");
      }

      return result[0];
    } catch (error) {
      console.error("Error updating time off request:", error);
      throw new Error("Failed to update time off request");
    }
  }

  /**
   * Get staff availability
   */
  static async getStaffAvailability(userId: number): Promise<any[]> {
    try {
      return await db.select().from(staffAvailability).where(eq(staffAvailability.userId, userId));
    } catch (error) {
      console.error("Error getting staff availability:", error);
      throw new Error("Failed to fetch staff availability");
    }
  }

  /**
   * Set staff availability
   */
  static async setStaffAvailability(
    userId: number,
    availabilityData: Array<{
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      isAvailable: boolean;
    }>
  ) {
    try {
      // Delete existing availability
      await db.delete(staffAvailability).where(eq(staffAvailability.userId, userId));

      // Insert new availability
      if (availabilityData.length > 0) {
        await db.insert(staffAvailability).values(
          availabilityData.map((data) => ({
            userId,
            dayOfWeek: data.dayOfWeek,
            startTime: data.startTime,
            endTime: data.endTime,
            isAvailable: data.isAvailable,
          }))
        );
      }

      return true;
    } catch (error) {
      console.error("Error setting staff availability:", error);
      throw new Error("Failed to set staff availability");
    }
  }

  /**
   * Get schedule templates for organization
   */
  static async getScheduleTemplates(organizationId: string) {
    try {
      return await db
        .select()
        .from(scheduleTemplates)
        .where(and(eq(scheduleTemplates.organizationId, organizationId), eq(scheduleTemplates.isActive, true)))
        .orderBy(desc(scheduleTemplates.createdAt));
    } catch (error) {
      console.error("Error getting schedule templates:", error);
      throw new Error("Failed to fetch schedule templates");
    }
  }

  /**
   * Create schedule template
   */
  static async createScheduleTemplate(data: {
    organizationId: string;
    name: string;
    description?: string;
    templateData: string;
    fileUrl?: string;
    aiPrompt?: string;
    createdBy: number;
  }) {
    try {
      const result = await db
        .insert(scheduleTemplates)
        .values({
          organizationId: data.organizationId,
          name: data.name,
          description: data.description,
          templateData: data.templateData,
          fileUrl: data.fileUrl,
          aiPrompt: data.aiPrompt,
          createdBy: data.createdBy,
        })
        .returning();

      return result[0];
    } catch (error) {
      console.error("Error creating schedule template:", error);
      throw new Error("Failed to create schedule template");
    }
  }
}
