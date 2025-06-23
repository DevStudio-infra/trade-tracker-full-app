/**
 * Orders repository
 * Handles all database operations related to orders, shopping lists, and production lists
 */
import { db } from "../db";
import { orders, orderItems, shoppingLists, shoppingListItems, productionLists, productionListItems, recipes, users } from "../db/schema";
import { eq, and, desc } from "drizzle-orm";

export interface CreateOrderData {
  organizationId: string;
  name: string;
  description?: string;
  eventDate?: string;
  totalGuests?: number;
  createdBy: number;
}

export interface CreateOrderItemData {
  orderId: number;
  recipeId: number;
  servings: number;
  multiplier?: number;
  notes?: string;
}

export interface CreateShoppingListData {
  organizationId: string;
  orderId?: number;
  name: string;
  description?: string;
  createdBy: number;
}

export interface CreateProductionListData {
  organizationId: string;
  orderId?: number;
  name: string;
  description?: string;
  productionDate: string;
  createdBy: number;
}

export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type ShoppingList = typeof shoppingLists.$inferSelect;
export type ProductionList = typeof productionLists.$inferSelect;

export class OrdersRepository {
  /**
   * Get all orders for an organization
   */
  static async findAllOrders(organizationId: string): Promise<any[]> {
    try {
      return await db
        .select({
          id: orders.id,
          organizationId: orders.organizationId,
          name: orders.name,
          description: orders.description,
          eventDate: orders.eventDate,
          totalGuests: orders.totalGuests,
          status: orders.status,
          totalCost: orders.totalCost,
          createdAt: orders.createdAt,
          updatedAt: orders.updatedAt,
          creator: {
            id: users.id,
            name: users.name,
            email: users.email,
          },
        })
        .from(orders)
        .leftJoin(users, eq(orders.createdBy, users.id))
        .where(eq(orders.organizationId, organizationId))
        .orderBy(desc(orders.createdAt));
    } catch (error) {
      console.error("Error finding orders:", error);
      throw new Error("Failed to fetch orders");
    }
  }

  /**
   * Get order by ID with items
   */
  static async findOrderById(id: number): Promise<any> {
    try {
      const order = await db.select().from(orders).where(eq(orders.id, id)).limit(1);

      if (!order[0]) return null;

      // Get order items with recipe details
      const items = await db
        .select({
          id: orderItems.id,
          orderId: orderItems.orderId,
          servings: orderItems.servings,
          multiplier: orderItems.multiplier,
          notes: orderItems.notes,
          recipe: {
            id: recipes.id,
            name: recipes.name,
            description: recipes.description,
            servings: recipes.servings,
            prepTime: recipes.prepTime,
            cookTime: recipes.cookTime,
          },
        })
        .from(orderItems)
        .leftJoin(recipes, eq(orderItems.recipeId, recipes.id))
        .where(eq(orderItems.orderId, id));

      return {
        ...order[0],
        items,
      };
    } catch (error) {
      console.error("Error finding order by ID:", error);
      throw new Error("Failed to fetch order");
    }
  }

  /**
   * Create a new order
   */
  static async createOrder(data: CreateOrderData): Promise<Order> {
    try {
      const result = await db
        .insert(orders)
        .values({
          organizationId: data.organizationId,
          name: data.name,
          description: data.description,
          eventDate: data.eventDate,
          totalGuests: data.totalGuests,
          status: "draft",
          createdBy: data.createdBy,
        })
        .returning();

      return result[0];
    } catch (error) {
      console.error("Error creating order:", error);
      throw new Error("Failed to create order");
    }
  }

  /**
   * Add item to order
   */
  static async addOrderItem(data: CreateOrderItemData): Promise<OrderItem> {
    try {
      const result = await db
        .insert(orderItems)
        .values({
          orderId: data.orderId,
          recipeId: data.recipeId,
          servings: data.servings,
          multiplier: data.multiplier || 1,
          notes: data.notes,
        })
        .returning();

      return result[0];
    } catch (error) {
      console.error("Error adding order item:", error);
      throw new Error("Failed to add order item");
    }
  }

  /**
   * Update order status
   */
  static async updateOrderStatus(orderId: number, status: "draft" | "confirmed" | "in_production" | "completed" | "cancelled"): Promise<Order> {
    try {
      const result = await db
        .update(orders)
        .set({
          status,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, orderId))
        .returning();

      if (result.length === 0) {
        throw new Error("Order not found");
      }

      return result[0];
    } catch (error) {
      console.error("Error updating order status:", error);
      throw new Error("Failed to update order status");
    }
  }

  /**
   * Get shopping lists for organization
   */
  static async findAllShoppingLists(organizationId: string): Promise<any[]> {
    try {
      return await db
        .select({
          id: shoppingLists.id,
          organizationId: shoppingLists.organizationId,
          orderId: shoppingLists.orderId,
          name: shoppingLists.name,
          description: shoppingLists.description,
          totalCost: shoppingLists.totalCost,
          isCompleted: shoppingLists.isCompleted,
          createdAt: shoppingLists.createdAt,
          updatedAt: shoppingLists.updatedAt,
          creator: {
            id: users.id,
            name: users.name,
            email: users.email,
          },
        })
        .from(shoppingLists)
        .leftJoin(users, eq(shoppingLists.createdBy, users.id))
        .where(eq(shoppingLists.organizationId, organizationId))
        .orderBy(desc(shoppingLists.createdAt));
    } catch (error) {
      console.error("Error finding shopping lists:", error);
      throw new Error("Failed to fetch shopping lists");
    }
  }

  /**
   * Create shopping list
   */
  static async createShoppingList(data: CreateShoppingListData): Promise<ShoppingList> {
    try {
      const result = await db
        .insert(shoppingLists)
        .values({
          organizationId: data.organizationId,
          orderId: data.orderId,
          name: data.name,
          description: data.description,
          isCompleted: false,
          createdBy: data.createdBy,
        })
        .returning();

      return result[0];
    } catch (error) {
      console.error("Error creating shopping list:", error);
      throw new Error("Failed to create shopping list");
    }
  }

  /**
   * Add item to shopping list
   */
  static async addShoppingListItem(data: {
    shoppingListId: number;
    ingredientName: string;
    quantity: number;
    unit: string;
    estimatedCost?: number;
    supplier?: string;
    notes?: string;
  }) {
    try {
      const result = await db
        .insert(shoppingListItems)
        .values({
          shoppingListId: data.shoppingListId,
          ingredientName: data.ingredientName,
          quantity: data.quantity,
          unit: data.unit,
          estimatedCost: data.estimatedCost,
          supplier: data.supplier,
          notes: data.notes,
          isPurchased: false,
        })
        .returning();

      return result[0];
    } catch (error) {
      console.error("Error adding shopping list item:", error);
      throw new Error("Failed to add shopping list item");
    }
  }

  /**
   * Get production lists for organization
   */
  static async findAllProductionLists(organizationId: string): Promise<any[]> {
    try {
      return await db
        .select({
          id: productionLists.id,
          organizationId: productionLists.organizationId,
          orderId: productionLists.orderId,
          name: productionLists.name,
          description: productionLists.description,
          productionDate: productionLists.productionDate,
          isCompleted: productionLists.isCompleted,
          createdAt: productionLists.createdAt,
          updatedAt: productionLists.updatedAt,
          creator: {
            id: users.id,
            name: users.name,
            email: users.email,
          },
        })
        .from(productionLists)
        .leftJoin(users, eq(productionLists.createdBy, users.id))
        .where(eq(productionLists.organizationId, organizationId))
        .orderBy(desc(productionLists.createdAt));
    } catch (error) {
      console.error("Error finding production lists:", error);
      throw new Error("Failed to fetch production lists");
    }
  }

  /**
   * Create production list
   */
  static async createProductionList(data: CreateProductionListData): Promise<ProductionList> {
    try {
      const result = await db
        .insert(productionLists)
        .values({
          organizationId: data.organizationId,
          orderId: data.orderId,
          name: data.name,
          description: data.description,
          productionDate: data.productionDate,
          isCompleted: false,
          createdBy: data.createdBy,
        })
        .returning();

      return result[0];
    } catch (error) {
      console.error("Error creating production list:", error);
      throw new Error("Failed to create production list");
    }
  }

  /**
   * Add item to production list
   */
  static async addProductionListItem(data: {
    productionListId: number;
    recipeId: number;
    servings: number;
    estimatedTime?: number;
    assignedTo?: number;
    priority?: number;
    notes?: string;
  }) {
    try {
      const result = await db
        .insert(productionListItems)
        .values({
          productionListId: data.productionListId,
          recipeId: data.recipeId,
          servings: data.servings,
          estimatedTime: data.estimatedTime,
          assignedTo: data.assignedTo,
          priority: data.priority || 0,
          notes: data.notes,
          isCompleted: false,
        })
        .returning();

      return result[0];
    } catch (error) {
      console.error("Error adding production list item:", error);
      throw new Error("Failed to add production list item");
    }
  }

  /**
   * Mark production item as completed
   */
  static async markProductionItemCompleted(itemId: number) {
    try {
      const result = await db
        .update(productionListItems)
        .set({
          isCompleted: true,
          completedAt: new Date(),
        })
        .where(eq(productionListItems.id, itemId))
        .returning();

      if (result.length === 0) {
        throw new Error("Production item not found");
      }

      return result[0];
    } catch (error) {
      console.error("Error marking production item as completed:", error);
      throw new Error("Failed to update production item");
    }
  }
}
