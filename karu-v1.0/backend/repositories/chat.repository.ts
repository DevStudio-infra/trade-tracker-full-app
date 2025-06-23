/**
 * Chat repository
 * Handles all database operations related to conversations and Oracle
 */
import { db } from "../db";
import { conversations, messages, contextSources, conversationContexts, suggestions, users } from "../db/schema";
import { eq, and, desc } from "drizzle-orm";

export interface CreateConversationData {
  organizationId: string;
  title: string;
  type: "oracle" | "menu_suggestions" | "general";
  createdBy: number;
}

export interface CreateMessageData {
  conversationId: number;
  userId?: number;
  role: "user" | "assistant" | "system";
  content: string;
  metadata?: any;
  tokens?: number;
}

export interface CreateContextSourceData {
  organizationId: string;
  name: string;
  description?: string;
  content: string;
  sourceType: "menu" | "recipe" | "note" | "document";
  sourceId?: number;
  metadata?: any;
  createdBy: number;
}

export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type ContextSource = typeof contextSources.$inferSelect;

export class ChatRepository {
  /**
   * Get all conversations for an organization
   */
  static async findAllConversations(organizationId: string): Promise<any[]> {
    try {
      return await db
        .select({
          id: conversations.id,
          organizationId: conversations.organizationId,
          title: conversations.title,
          type: conversations.type,
          isActive: conversations.isActive,
          createdAt: conversations.createdAt,
          updatedAt: conversations.updatedAt,
          creator: {
            id: users.id,
            name: users.name,
            email: users.email,
          },
        })
        .from(conversations)
        .leftJoin(users, eq(conversations.createdBy, users.id))
        .where(and(eq(conversations.organizationId, organizationId), eq(conversations.isActive, true)))
        .orderBy(desc(conversations.updatedAt));
    } catch (error) {
      console.error("Error finding conversations:", error);
      throw new Error("Failed to fetch conversations");
    }
  }

  /**
   * Get conversation by ID with messages
   */
  static async findConversationById(id: number): Promise<any> {
    try {
      const conversation = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1);

      if (!conversation[0]) return null;

      // Get messages for this conversation
      const messagesData = await db
        .select({
          id: messages.id,
          conversationId: messages.conversationId,
          role: messages.role,
          content: messages.content,
          metadata: messages.metadata,
          tokens: messages.tokens,
          createdAt: messages.createdAt,
          user: {
            id: users.id,
            name: users.name,
            email: users.email,
          },
        })
        .from(messages)
        .leftJoin(users, eq(messages.userId, users.id))
        .where(eq(messages.conversationId, id))
        .orderBy(messages.createdAt);

      return {
        ...conversation[0],
        messages: messagesData,
      };
    } catch (error) {
      console.error("Error finding conversation by ID:", error);
      throw new Error("Failed to fetch conversation");
    }
  }

  /**
   * Create a new conversation
   */
  static async createConversation(data: CreateConversationData): Promise<Conversation> {
    try {
      const result = await db
        .insert(conversations)
        .values({
          organizationId: data.organizationId,
          title: data.title,
          type: data.type,
          isActive: true,
          createdBy: data.createdBy,
        })
        .returning();

      return result[0];
    } catch (error) {
      console.error("Error creating conversation:", error);
      throw new Error("Failed to create conversation");
    }
  }

  /**
   * Add message to conversation
   */
  static async addMessage(data: CreateMessageData): Promise<Message> {
    try {
      const result = await db
        .insert(messages)
        .values({
          conversationId: data.conversationId,
          userId: data.userId,
          role: data.role,
          content: data.content,
          metadata: data.metadata,
          tokens: data.tokens,
        })
        .returning();

      // Update conversation updated timestamp
      await db.update(conversations).set({ updatedAt: new Date() }).where(eq(conversations.id, data.conversationId));

      return result[0];
    } catch (error) {
      console.error("Error adding message:", error);
      throw new Error("Failed to add message");
    }
  }

  /**
   * Get context sources for organization
   */
  static async getContextSources(organizationId: string): Promise<ContextSource[]> {
    try {
      return await db
        .select()
        .from(contextSources)
        .where(and(eq(contextSources.organizationId, organizationId), eq(contextSources.isActive, true)))
        .orderBy(desc(contextSources.updatedAt));
    } catch (error) {
      console.error("Error getting context sources:", error);
      throw new Error("Failed to fetch context sources");
    }
  }

  /**
   * Create context source
   */
  static async createContextSource(data: CreateContextSourceData): Promise<ContextSource> {
    try {
      const result = await db
        .insert(contextSources)
        .values({
          organizationId: data.organizationId,
          name: data.name,
          description: data.description,
          content: data.content,
          sourceType: data.sourceType,
          sourceId: data.sourceId,
          metadata: data.metadata,
          isActive: true,
          createdBy: data.createdBy,
        })
        .returning();

      return result[0];
    } catch (error) {
      console.error("Error creating context source:", error);
      throw new Error("Failed to create context source");
    }
  }

  /**
   * Link context source to conversation
   */
  static async linkContextToConversation(conversationId: number, contextSourceId: number, relevanceScore?: number) {
    try {
      const result = await db
        .insert(conversationContexts)
        .values({
          conversationId,
          contextSourceId,
          relevanceScore,
        })
        .returning();

      return result[0];
    } catch (error) {
      console.error("Error linking context to conversation:", error);
      throw new Error("Failed to link context");
    }
  }

  /**
   * Save AI suggestion
   */
  static async saveSuggestion(data: {
    organizationId: string;
    conversationId?: number;
    type: "menu" | "shopping_list" | "prep_list";
    title: string;
    content: string;
    metadata?: any;
    createdBy: number;
  }) {
    try {
      const result = await db
        .insert(suggestions)
        .values({
          organizationId: data.organizationId,
          conversationId: data.conversationId,
          type: data.type,
          title: data.title,
          content: data.content,
          metadata: data.metadata,
          isImplemented: false,
          createdBy: data.createdBy,
        })
        .returning();

      return result[0];
    } catch (error) {
      console.error("Error saving suggestion:", error);
      throw new Error("Failed to save suggestion");
    }
  }

  /**
   * Get suggestions for organization
   */
  static async getSuggestions(organizationId: string) {
    try {
      return await db
        .select({
          id: suggestions.id,
          organizationId: suggestions.organizationId,
          conversationId: suggestions.conversationId,
          type: suggestions.type,
          title: suggestions.title,
          content: suggestions.content,
          metadata: suggestions.metadata,
          isImplemented: suggestions.isImplemented,
          createdAt: suggestions.createdAt,
          creator: {
            id: users.id,
            name: users.name,
            email: users.email,
          },
        })
        .from(suggestions)
        .leftJoin(users, eq(suggestions.createdBy, users.id))
        .where(eq(suggestions.organizationId, organizationId))
        .orderBy(desc(suggestions.createdAt));
    } catch (error) {
      console.error("Error getting suggestions:", error);
      throw new Error("Failed to fetch suggestions");
    }
  }

  /**
   * Mark suggestion as implemented
   */
  static async markSuggestionImplemented(suggestionId: number, implementedBy: number) {
    try {
      const result = await db
        .update(suggestions)
        .set({
          isImplemented: true,
          implementedBy,
        })
        .where(eq(suggestions.id, suggestionId))
        .returning();

      if (result.length === 0) {
        throw new Error("Suggestion not found");
      }

      return result[0];
    } catch (error) {
      console.error("Error marking suggestion as implemented:", error);
      throw new Error("Failed to update suggestion");
    }
  }
}
